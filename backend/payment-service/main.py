# backend/payment-service/main.py - CON TABLA PAYMENTS COMO ENTIDAD

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import mysql.connector
import time
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="Payment Mock Service", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic (SIN CAMBIOS)
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

@app.on_event("startup")
def create_payments_table():
    """Asegurar que la tabla payments existe"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Crear tabla payments si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id_pago INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            monto DECIMAL(10,2) NOT NULL,
            ultimos_4_digitos_tarjeta VARCHAR(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
            id_workshop INT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE,
            transaction_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
            status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
            payment_method VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'credit_card',
            FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
            FOREIGN KEY (id_workshop) REFERENCES workshops(id) ON DELETE CASCADE,
            INDEX idx_email (email),
            INDEX idx_workshop (id_workshop),
            INDEX idx_fecha (fecha)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("[payment-service] Tabla payments verificada/creada")

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

def save_payment_to_database(payment_data: dict):
    """ NUEVA FUNCIÓN: Guardar pago en la tabla payments"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO payments (
                email, 
                monto, 
                ultimos_4_digitos_tarjeta, 
                id_workshop, 
                payment_id, 
                transaction_id, 
                status, 
                payment_method
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            payment_data['email'],
            payment_data['monto'],
            payment_data['ultimos_4_digitos_tarjeta'],
            payment_data['id_workshop'],
            payment_data['payment_id'],
            payment_data['transaction_id'],
            payment_data['status'],
            payment_data['payment_method']
        ))
        
        conn.commit()
        print(f"[payment-service] Pago guardado en BD: {payment_data['payment_id']}")
        
    except Exception as e:
        print(f"[payment-service]  Error guardando pago: {e}")
        # No lanzamos excepción para no afectar la respuesta al usuario
    finally:
        cursor.close()
        conn.close()

def get_last_4_digits(card_number: str) -> str:
    """Extraer los últimos 4 dígitos de la tarjeta"""
    if not card_number:
        return "****"
    
    # Remover espacios y caracteres no numéricos
    clean_number = ''.join(filter(str.isdigit, card_number))
    
    if len(clean_number) >= 4:
        return clean_number[-4:]
    else:
        return "****"



@app.get("/hello")
async def hello_world():
    return {"message": "Hello World - Payment Mock Service"}

@app.post("/process", response_model=PaymentResponse, summary="Procesar pago de reserva")
async def process_payment(payment_request: PaymentRequest):
    try:
        print(f"[payment-service] Procesando pago: {payment_request.user_email} -> taller {payment_request.workshop_id}")
        
        # Validar que existe la reserva (SIN CAMBIOS)
        booking = validate_booking(payment_request.user_email, payment_request.workshop_id)
        if not booking:
            raise HTTPException(
                status_code=404, 
                detail="Booking not found for this user and workshop"
            )
        
        # Verificar si ya está pagado (SIN CAMBIOS)
        if booking['payment_status'] == 'Pagado':
            raise HTTPException(
                status_code=400, 
                detail="This booking is already paid"
            )
        
        # Generar IDs únicos (SIN CAMBIOS)
        payment_id = str(uuid.uuid4())
        transaction_id = f"TXN_{random.randint(100000, 999999)}"
        
        # Simular diferentes escenarios de pago (SIN CAMBIOS)
        payment_status = "approved"
        message = "Payment processed successfully"
        
        # Simular fallos basados en ciertos patrones (SIN CAMBIOS)
        if payment_request.card_number and payment_request.card_number.endswith("0000"):
            payment_status = "declined"
            message = "Fondos Insuficientes"
        elif payment_request.card_number and payment_request.card_number.endswith("1111"):
            payment_status = "declined" 
            message = "Tarjeta Expirada"
        elif payment_request.card_number and payment_request.card_number.endswith("2222"):
            payment_status = "pending"
            message = "Pago en revisión"
        elif payment_request.amount > 1000:
            if random.random() < 0.3:
                payment_status = "pending"
                message = "Monto excesivo, revisión manual"
        elif random.random() < 0.05:
            payment_status = "declined"
            message = "Transacción rechazada por el banco"
        
        #  NUEVA LÓGICA: Si el pago es exitoso, guardarlo en ambas tablas
        if payment_status == "approved":
            # 1. Actualizar tabla bookings (LÓGICA EXISTENTE)
            update_payment_status(payment_request.user_email, payment_request.workshop_id, "Pagado")
            
            # 2.  NUEVO: Guardar en tabla payments
            payment_data = {
                'email': payment_request.user_email,
                'monto': payment_request.amount,
                'ultimos_4_digitos_tarjeta': get_last_4_digits(payment_request.card_number),
                'id_workshop': payment_request.workshop_id,
                'payment_id': payment_id,
                'transaction_id': transaction_id,
                'status': payment_status,
                'payment_method': payment_request.payment_method
            }
            
            save_payment_to_database(payment_data)
        
        # Respuesta IDÉNTICA a la anterior (SIN CAMBIOS)
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
        
        #  MEJORADO: Intentar buscar en la tabla payments primero
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT * FROM payments WHERE payment_id = %s", (payment_id,))
            payment = cursor.fetchone()
            
            if payment:
                # Si encontramos el pago en la BD, usar datos reales
                return {
                    "payment_id": payment_id,
                    "status": payment['status'],
                    "message": "Payment found in database",
                    "timestamp": payment['fecha'],
                    "amount": float(payment['monto']),
                    "workshop_id": payment['id_workshop']
                }
        except Exception as db_error:
            print(f"[payment-service] Error consultando BD: {db_error}")
        finally:
            cursor.close()
            conn.close()
        
        # FALLBACK: Lógica de simulación original (SIN CAMBIOS)
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
    """ MEJORADO: Usar datos reales de la tabla payments"""
    try:
        print(f"[payment-service] Obteniendo historial de: {user_email}")
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        #  NUEVA QUERY: Usar tabla payments con JOIN a workshops
        cursor.execute("""
            SELECT 
                p.id_pago,
                p.email,
                p.monto,
                p.ultimos_4_digitos_tarjeta,
                p.fecha,
                p.payment_id,
                p.transaction_id,
                p.status,
                p.payment_method,
                w.title as workshop_title,
                w.date as workshop_date,
                w.category as workshop_category,
                b.id as booking_id
            FROM payments p
            JOIN workshops w ON p.id_workshop = w.id
            LEFT JOIN bookings b ON b.user_email = p.email AND b.workshop_id = p.id_workshop
            WHERE p.email = %s 
            ORDER BY p.fecha DESC
        """, (user_email,))
        
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Formatear respuesta para mantener compatibilidad con frontend
        payment_history = []
        for payment in payments:
            payment_history.append({
                "payment_id": payment['payment_id'],
                "booking_id": payment['booking_id'],
                "workshop_title": payment['workshop_title'],
                "workshop_date": payment['workshop_date'],
                "workshop_category": payment['workshop_category'],
                "amount": float(payment['monto']),
                "payment_date": payment['fecha'],
                "status": "completed" if payment['status'] == 'approved' else payment['status'],
                "payment_method": payment['payment_method'],
                "transaction_id": payment['transaction_id'],
                "last_4_digits": payment['ultimos_4_digitos_tarjeta']
            })
        
        return {
            "user_email": user_email,
            "total_payments": len(payment_history),
            "payments": payment_history
        }
        
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


@app.get("/stats/{user_email}", summary="Estadísticas de pagos del usuario")
async def get_payment_stats(user_email: EmailStr):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Total gastado
        cursor.execute("SELECT SUM(monto) as total_gastado FROM payments WHERE email = %s AND status = 'approved'", (user_email,))
        total_result = cursor.fetchone()
        total_gastado = float(total_result['total_gastado']) if total_result['total_gastado'] else 0.0
        
        # Número de pagos
        cursor.execute("SELECT COUNT(*) as total_pagos FROM payments WHERE email = %s", (user_email,))
        total_pagos = cursor.fetchone()['total_pagos']
        
        # Método de pago más usado
        cursor.execute("""
            SELECT payment_method, COUNT(*) as count 
            FROM payments 
            WHERE email = %s 
            GROUP BY payment_method 
            ORDER BY count DESC 
            LIMIT 1
        """, (user_email,))
        metodo_result = cursor.fetchone()
        metodo_favorito = metodo_result['payment_method'] if metodo_result else 'N/A'
        
        cursor.close()
        conn.close()
        
        return {
            "user_email": user_email,
            "total_gastado": total_gastado,
            "total_pagos": total_pagos,
            "metodo_favorito": metodo_favorito,
            "promedio_por_pago": total_gastado / total_pagos if total_pagos > 0 else 0.0
        }
        
    except Exception as e:
        print(f"[payment-service] Error obteniendo estadísticas: {e}")
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
        "version": "1.1 - Con tabla payments como entidad",
        "routes": [
            "/hello (GET)",
            "/process (POST) -  Guarda en tabla payments",
            "/status/{payment_id} (GET) -  Consulta BD real",
            "/refund (POST)",
            "/methods (GET)",
            "/validate-card (POST)",
            "/history/{user_email} (GET) -  Usa tabla payments real",
            "/stats/{user_email} (GET) -  NUEVO: Estadísticas",
            "/booking/{user_email}/{workshop_id} (GET)",
            "/health (GET)",
            "/debug (GET)"
        ],
        "database": {
            "host": "db", 
            "name": "users_db",
            "tables": ["users", "workshops", "bookings", "payments"]
        },
        "new_features": [
            " Tabla payments para historial completo",
            " Guardado automático de pagos exitosos",
            " Últimos 4 dígitos de tarjeta",
            " Historial real vs simulado",
            " Estadísticas de pagos por usuario",
            " Mismas respuestas para frontend - Sin breaking changes"
        ],
        "payments_table_schema": {
            "id_pago": "AUTO_INCREMENT PRIMARY KEY",
            "email": "VARCHAR(100) - FK to users",
            "monto": "DECIMAL(10,2) - Cantidad pagada",
            "ultimos_4_digitos_tarjeta": "VARCHAR(4) - Últimos dígitos",
            "id_workshop": "INT - FK to workshops",
            "fecha": "TIMESTAMP - Cuando se hizo el pago",
            "payment_id": "VARCHAR(255) - UUID único",
            "transaction_id": "VARCHAR(255) - ID de transacción",
            "status": "VARCHAR(50) - approved/declined/pending",
            "payment_method": "VARCHAR(50) - credit_card/paypal/etc"
        }
    }