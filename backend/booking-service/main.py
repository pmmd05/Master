from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import mysql.connector
import time

app = FastAPI(title="Booking Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BookingRequest(BaseModel):
    user_email: EmailStr
    workshop_id: int = Field(..., gt=0)

class BookingResponse(BaseModel):
    id: int
    user_email: EmailStr
    workshop_id: int
    status: str
    payment_status: str

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
            print(f"[booking-service] Intento {attempt+1} fallido, esperando...")
            time.sleep(3)
    raise Exception("No se pudo conectar a la base de datos.")

@app.on_event("startup")
def create_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(100),
            workshop_id INT,
            status ENUM('Confirmada', 'Cancelada', 'Completada') DEFAULT 'Confirmada',
            payment_status ENUM('Pendiente', 'Pagado') DEFAULT 'Pendiente',
            UNIQUE(user_email, workshop_id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()
    print("[booking-service] Tabla 'bookings' verificada/creada")

# ✅ RUTAS SIMPLES - Coinciden con lo que envía el API Gateway proxy

@app.post("/reservar", summary="Reservar un taller con validación completa")
def reservar_taller(data: BookingRequest):
    try:
        print(f"[booking-service] Nueva reserva: {data.user_email} -> taller {data.workshop_id}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (data.user_email,))
        usuario = cursor.fetchone()
        if not usuario:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="El usuario no está registrado")

        cursor.execute("SELECT * FROM workshops WHERE id = %s", (data.workshop_id,))
        taller = cursor.fetchone()
        if not taller:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Taller no encontrado")
        if taller["current_participants"] >= taller["max_participants"]:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="No hay cupos disponibles para este taller")

        cursor.execute("SELECT * FROM bookings WHERE user_email = %s AND workshop_id = %s", 
                       (data.user_email, data.workshop_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Ya tienes una reserva para este taller")

        cursor.execute("""
            INSERT INTO bookings (user_email, workshop_id)
            VALUES (%s, %s)
        """, (data.user_email, data.workshop_id))

        cursor.execute("""
            UPDATE workshops
            SET current_participants = current_participants + 1
            WHERE id = %s
        """, (data.workshop_id,))

        conn.commit()
        cursor.execute("SELECT * FROM bookings WHERE user_email = %s AND workshop_id = %s",
                       (data.user_email, data.workshop_id))
        reserva = cursor.fetchone()
        cursor.close()
        conn.close()
        
        print(f"[booking-service] Reserva creada exitosamente: ID {reserva['id']}")
        return reserva
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[booking-service] Error en reserva: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/usuario/{email}", response_model=list[BookingResponse], summary="Listar reservas por usuario")
def listar_reservas(email: EmailStr):
    try:
        print(f"[booking-service] Obteniendo reservas para: {email}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM bookings WHERE user_email = %s", (email,))
        reservas = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not reservas:
            raise HTTPException(status_code=404, detail="No se encontraron reservas")
        
        print(f"[booking-service] Encontradas {len(reservas)} reservas para {email}")
        return reservas
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[booking-service] Error obteniendo reservas: {e}")
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
        return {"status": "booking-service ok", "database": "connected"}
    except Exception as e:
        return {"status": "booking-service error", "database": "disconnected", "error": str(e)}

@app.get("/debug")
def debug_info():
    return {
        "service": "booking-service",
        "approach": "Enfoque 2 - Rutas simples",
        "routes": [
            "/reservar (POST)",
            "/usuario/{email} (GET)",
            "/health (GET)",
            "/debug (GET)"
        ],
        "proxy_info": "API Gateway: /api/v0/booking/{path} → /{path}",
        "database": {"host": "db", "name": "users_db"}
    }