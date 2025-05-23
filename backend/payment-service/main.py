# backend/payment-service/main.py - ENFOQUE 2: RUTAS SIMPLES

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import mysql.connector
import time
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="Payment Mock Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class PaymentRequest(BaseModel):
    user_email: EmailStr
    workshop_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    payment_method: str
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    cvv: Optional[str] = None

class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    transaction_id: str
    amount: float
    timestamp: datetime
    message: str

class RefundRequest(BaseModel):
    payment_id: str
    reason: Optional[str] = None

def get_connection():
    for attempt in range(20):
        try:
            return mysql.connector.connect(
                host="db",
                user="root",
                password="12345",
                database="users_db"
            )
        except mysql.connector.Error:
            print(f"[payment-service] Intento {attempt+1} fallido, esperando...")
            time.sleep(3)
    raise Exception("No se pudo conectar a la base de datos.")

def validate_booking(user_email: str, workshop_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM bookings WHERE user_email = %s AND workshop_id = %s",
            (user_email, workshop_id)
        )
        booking = cursor.fetchone()
        return booking
    finally:
        cursor.close()
        conn.close()

def update_payment_status(user_email: str, workshop_id: int, status: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE bookings SET payment_status = %s WHERE user_email = %s AND workshop_id = %s",
            (status, user_email, workshop_id)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

# ✅ RUTAS SIMPLES - Coinciden con lo que envía el API Gateway proxy

@app.get("/hello")
async def hello_world():
    return {"message": "Hello World - Payment Mock Service"}

@app.post("/process", response_model=PaymentResponse, summary="Procesar pago de reserva")
async def process_payment(payment_request: PaymentRequest):
    try:
        print(f"[payment-service] Procesando pago: {payment_request.user_email} -> taller {payment_request.workshop_id}")
        
        # Validar que existe la reserva
        booking = validate_booking(payment_request.user_email, payment_request.workshop_id)
        if not booking:
            raise HTTPException(
                status_code=404, 
                detail="Booking not found for this user and workshop"
            )
        
        # Verificar si ya está pagado
        if booking['payment_status'] == 'Pagado':
            raise HTTPException(
                status_code=400, 
                detail="This booking is already paid"
            )
        
        # Generar IDs únicos
        payment_id = str(uuid.uuid4())
        transaction_id = f"TXN_{random.randint(100000, 999999)}"
        
        # Simular diferentes escenarios de pago
        payment_status = "approved"
        message = "Payment processed successfully"
        
        # Simular fallos basados en ciertos patrones (para testing)
        if payment_request.card_number and payment_request.card_number.endswith("0000"):
            payment_status = "declined"
            message = "Insufficient funds"
        elif payment_request.card_number and payment_request.card_number.endswith("1111"):
            payment_status = "declined" 
            message = "Card expired"
        elif payment_request.card_number and payment_request.card_number.endswith("2222"):
            payment_status = "pending"
            message = "Payment under review"
        elif payment_request.amount > 1000:
            if random.random() < 0.3:
                payment_status = "pending"
                message = "High amount payment under review"
        elif random.random() < 0.05:
            payment_status = "declined"
            message = "Transaction declined by bank"
        
        # Actualizar el estado en la base de datos
        if payment_status == "approved":
            update_payment_status(payment_request.user_email, payment_request.workshop_id, "Pagado")
        
        response = PaymentResponse(
            payment_id=payment_id,
            status=payment_status,
            transaction_id=transaction_id,
            amount=payment_request.amount,
            timestamp=datetime.now(),
            message=message
        )
        
        print(f"[payment-service] Pago procesado: {payment_status} - {payment_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[payment-service] Error procesando pago: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/status/{payment_id}", summary="Consultar estado de pago")
async def get_payment_status(payment_id: str):
    try:
        print(f"[payment-service] Consultando estado de pago: {payment_id}")
        
        if len(payment_id) < 10:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Simular diferentes estados basados en el último dígito del UUID
        last_char = payment_id[-1]
        if last_char in ['0', '1', '2']:
            status = "declined"
            message = "Payment was declined"
        elif last_char in ['3', '4']:
            status = "pending"
            message = "Payment is being processed"
        else:
            status = "approved"
            message = "Payment completed successfully"
        
        return {
            "payment_id": payment_id,
            "status": status,
            "message": message,
            "timestamp": datetime.now() - timedelta(hours=random.randint(1, 48))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[payment-service] Error consultando estado: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/refund", summary="Procesar reembolso")
async def process_refund(refund_request: RefundRequest):
    try:
        print(f"[payment-service] Procesando reembolso: {refund_request.payment_id}")
        
        refund_id = str(uuid.uuid4())
        
        if random.random() < 0.9:  # 90% de éxito
            status = "approved"
            message = "Refund processed successfully"
        else:
            status = "declined"
            message = "Refund cannot be processed at this time"
        
        return {
            "refund_id": refund_id,
            "original_payment_id": refund_request.payment_id,
            "status": status,
            "message": message,
            "processed_at": datetime.now(),
            "reason": refund_request.reason or "Customer request"
        }
        
    except Exception as e:
        print(f"[payment-service] Error en reembolso: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/methods", summary="Obtener métodos de pago disponibles")
async def get_payment_methods():
    return {
        "methods": [
            {
                "id": "credit_card",
                "name": "Credit Card",
                "supported_brands": ["visa", "mastercard", "amex"],
                "fees": 2.9
            },
            {
                "id": "debit_card", 
                "name": "Debit Card",
                "supported_brands": ["visa", "mastercard"],
                "fees": 1.5
            },
            {
                "id": "paypal",
                "name": "PayPal",
                "fees": 3.4
            },
            {
                "id": "bank_transfer",
                "name": "Bank Transfer",
                "fees": 0.5
            }
        ]
    }

@app.post("/validate-card", summary="Validar datos de tarjeta")
async def validate_card(card_data: dict):
    card_number = card_data.get("card_number", "")
    
    if len(card_number) < 13:
        return {"valid": False, "message": "Card number too short"}
    
    if card_number.startswith("4"):
        brand = "visa"
    elif card_number.startswith("5"):
        brand = "mastercard"
    elif card_number.startswith("3"):
        brand = "amex"
    else:
        brand = "unknown"
    
    if card_number.endswith("9999"):
        return {"valid": False, "message": "Invalid card number"}
    
    return {
        "valid": True,
        "brand": brand,
        "message": "Card is valid"
    }

@app.get("/history/{user_email}", summary="Obtener historial de pagos")
async def get_payment_history(user_email: EmailStr):
    try:
        print(f"[payment-service] Obteniendo historial de: {user_email}")
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT b.*, w.title as workshop_title, w.date as workshop_date 
            FROM bookings b 
            JOIN workshops w ON b.workshop_id = w.id 
            WHERE b.user_email = %s
        """, (user_email,))
        bookings = cursor.fetchall()
        
        # Simular datos de pago para cada reserva
        payment_history = []
        for booking in bookings:
            if booking['payment_status'] == 'Pagado':
                payment_history.append({
                    "booking_id": booking['id'],
                    "workshop_title": booking['workshop_title'],
                    "workshop_date": booking['workshop_date'],
                    "amount": random.uniform(50, 200),  # Monto simulado
                    "payment_date": booking['workshop_date'] - timedelta(days=random.randint(1, 30)),
                    "status": "completed",
                    "payment_method": random.choice(["credit_card", "debit_card", "paypal"])
                })
        
        cursor.close()
        conn.close()
        return {"payments": payment_history}
        
    except Exception as e:
        print(f"[payment-service] Error obteniendo historial: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/booking/{user_email}/{workshop_id}", summary="Verificar estado de pago de reserva")
async def get_booking_payment_status(user_email: EmailStr, workshop_id: int):
    try:
        booking = validate_booking(user_email, workshop_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            "booking_id": booking['id'],
            "user_email": booking['user_email'],
            "workshop_id": booking['workshop_id'],
            "booking_status": booking['status'],
            "payment_status": booking['payment_status'],
            "can_pay": booking['payment_status'] == 'Pendiente'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[payment-service] Error verificando estado: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/health")
def health():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return {"status": "payment-service ok", "database": "connected"}
    except Exception as e:
        return {"status": "payment-service error", "database": "disconnected", "error": str(e)}

@app.get("/debug")
def debug_info():
    return {
        "service": "payment-service",
        "approach": "Enfoque 2 - Rutas simples",
        "routes": [
            "/hello (GET)",
            "/process (POST)",
            "/status/{payment_id} (GET)",
            "/refund (POST)",
            "/methods (GET)",
            "/validate-card (POST)",
            "/history/{user_email} (GET)",
            "/booking/{user_email}/{workshop_id} (GET)",
            "/health (GET)",
            "/debug (GET)"
        ],
        "proxy_info": "API Gateway: /api/v0/payment/{path} → /{path}",
        "database": {"host": "db", "name": "users_db"}
    }