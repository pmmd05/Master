# backend/booking-service/main.py - ELIMINA FÍSICAMENTE LAS RESERVAS CANCELADAS

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import mysql.connector
import time
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="Booking Service", version="1.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# MODELOS PYDANTIC
# ================================

class BookingRequest(BaseModel):
    user_email: EmailStr
    workshop_id: int = Field(..., gt=0)

class BookingResponse(BaseModel):
    id: int
    user_email: EmailStr
    workshop_id: int
    status: str
    payment_status: str

class CancelBookingRequest(BaseModel):
    reason: Optional[str] = "Usuario solicitó cancelación"

# ================================
# FUNCIONES DE BASE DE DATOS
# ================================

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
    
    # Tabla original - sin modificaciones
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
    
    # ✅ NUEVA: Tabla para auditoría de cancelaciones
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cancelled_bookings_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            original_booking_id INT,
            user_email VARCHAR(100),
            workshop_id INT,
            original_status VARCHAR(50),
            original_payment_status VARCHAR(50),
            cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            cancel_reason TEXT,
            INDEX(user_email),
            INDEX(workshop_id)
        )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("[booking-service] Tablas verificadas/creadas: bookings + cancelled_bookings_log")

# ================================
# RUTAS PRINCIPALES
# ================================

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

        # ✅ MEJORADO: Ya no hay problema con reservas canceladas porque fueron eliminadas
        cursor.execute("SELECT * FROM bookings WHERE user_email = %s AND workshop_id = %s", 
                       (data.user_email, data.workshop_id))
        existing_booking = cursor.fetchone()
        if existing_booking:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Ya tienes una reserva activa para este taller")

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
    """
    Lista todas las reservas activas del usuario.
    Las canceladas ya no existen en la tabla.
    """
    try:
        print(f"[booking-service] Obteniendo reservas para: {email}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM bookings WHERE user_email = %s ORDER BY id DESC", (email,))
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

# ================================
# ✅ NUEVA FUNCIONALIDAD: CANCELACIÓN CON ELIMINACIÓN
# ================================

@app.post("/cancelar/{booking_id}", summary="Cancelar y eliminar una reserva")
def cancelar_reserva(booking_id: int, cancel_data: CancelBookingRequest):
    """
    Cancela una reserva ELIMINÁNDOLA físicamente de la tabla.
    Esto permite al usuario hacer una nueva reserva para el mismo taller.
    Se guarda un log en cancelled_bookings_log para auditoría.
    """
    try:
        print(f"[booking-service] 🗑️ Cancelando y eliminando reserva ID: {booking_id}")
        print(f"[booking-service] Razón: {cancel_data.reason}")
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Verificar que la reserva existe
        cursor.execute("SELECT * FROM bookings WHERE id = %s", (booking_id,))
        reserva = cursor.fetchone()
        
        if not reserva:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada")

        # 2. Verificar que no esté pagada (regla de negocio)
        if reserva['payment_status'] == 'Pagado':
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400, 
                detail="No se pueden cancelar reservas que ya han sido pagadas"
            )

        # 3. Verificar restricciones de tiempo (una semana antes)
        cursor.execute("SELECT * FROM workshops WHERE id = %s", (reserva['workshop_id'],))
        taller = cursor.fetchone()
        
        if taller and taller['date']:
            fecha_taller = taller['date']
            fecha_limite = fecha_taller - timedelta(days=7)
            fecha_actual = datetime.now().date()
            
            if fecha_actual > fecha_limite:
                cursor.close()
                conn.close()
                raise HTTPException(
                    status_code=400,
                    detail="Solo se pueden cancelar reservas hasta una semana antes del taller"
                )
            
            # Verificar que el taller no haya pasado
            if fecha_actual >= fecha_taller:
                cursor.close()
                conn.close()
                raise HTTPException(
                    status_code=400,
                    detail="No se pueden cancelar talleres que ya han finalizado"
                )

        # 4. ✅ GUARDAR LOG DE AUDITORÍA ANTES DE ELIMINAR
        cursor.execute("""
            INSERT INTO cancelled_bookings_log 
            (original_booking_id, user_email, workshop_id, original_status, original_payment_status, cancel_reason)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            reserva['id'],
            reserva['user_email'], 
            reserva['workshop_id'],
            reserva['status'],
            reserva['payment_status'],
            cancel_data.reason
        ))

        # 5. ✅ ELIMINAR FÍSICAMENTE LA RESERVA
        cursor.execute("DELETE FROM bookings WHERE id = %s", (booking_id,))
        
        print(f"[booking-service] 🗑️ Reserva {booking_id} ELIMINADA físicamente de la tabla")

        # 6. Decrementar el contador de participantes del taller
        if taller:
            cursor.execute("""
                UPDATE workshops 
                SET current_participants = GREATEST(0, current_participants - 1)
                WHERE id = %s
            """, (reserva['workshop_id'],))

        conn.commit()
        cursor.close()
        conn.close()

        print(f"[booking-service] ✅ Cancelación completada para reserva {booking_id}")
        
        return {
            "message": f"Reserva #{booking_id} cancelada y eliminada exitosamente",
            "booking_id": booking_id,
            "user_email": reserva['user_email'],
            "workshop_id": reserva['workshop_id'],
            "cancelled_at": datetime.now().isoformat(),
            "reason": cancel_data.reason,
            "action": "deleted_from_bookings_table",
            "note": "Ahora puedes hacer una nueva reserva para este taller si hay cupos disponibles",
            "audit_log": "Cancelación guardada en cancelled_bookings_log para auditoría"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[booking-service] ❌ Error cancelando reserva: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# ================================
# ✅ NUEVA RUTA: HISTORIAL DE CANCELACIONES
# ================================

@app.get("/usuario/{email}/canceladas", summary="Ver historial de cancelaciones del usuario")
def historial_cancelaciones(email: EmailStr):
    """
    Muestra el historial de reservas canceladas del usuario.
    """
    try:
        print(f"[booking-service] Obteniendo historial de cancelaciones para: {email}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM cancelled_bookings_log 
            WHERE user_email = %s 
            ORDER BY cancelled_at DESC
        """, (email,))
        
        cancelaciones = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "user_email": email,
            "total_cancelaciones": len(cancelaciones),
            "cancelaciones": cancelaciones
        }
        
    except Exception as e:
        print(f"[booking-service] Error obteniendo historial de cancelaciones: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/usuario/{email}/estadisticas", summary="Estadísticas completas del usuario")
def estadisticas_usuario(email: EmailStr):
    """
    Estadísticas completas: reservas activas + historial de cancelaciones
    """
    try:
        print(f"[booking-service] Obteniendo estadísticas completas para: {email}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Reservas activas
        cursor.execute("SELECT COUNT(*) as activas FROM bookings WHERE user_email = %s", (email,))
        activas = cursor.fetchone()['activas']
        
        # Cancelaciones totales
        cursor.execute("SELECT COUNT(*) as canceladas FROM cancelled_bookings_log WHERE user_email = %s", (email,))
        canceladas = cursor.fetchone()['canceladas']
        
        # Pagos pendientes
        cursor.execute("""
            SELECT COUNT(*) as pendientes 
            FROM bookings 
            WHERE user_email = %s AND payment_status = 'Pendiente'
        """, (email,))
        pendientes = cursor.fetchone()['pendientes']
        
        cursor.close()
        conn.close()
        
        return {
            "user_email": email,
            "reservas_activas": activas,
            "reservas_canceladas": canceladas,
            "pagos_pendientes": pendientes,
            "total_actividad": activas + canceladas
        }
        
    except Exception as e:
        print(f"[booking-service] Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ================================
# RUTAS DE UTILIDAD
# ================================

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
        "version": "1.2 - Elimina reservas canceladas",
        "routes": [
            "/reservar (POST) - Crear nueva reserva",
            "/usuario/{email} (GET) - Listar reservas activas", 
            "/cancelar/{booking_id} (POST) - Cancelar y ELIMINAR reserva ✅ MEJORADO",
            "/usuario/{email}/canceladas (GET) - Historial de cancelaciones ✅ NUEVO",
            "/usuario/{email}/estadisticas (GET) - Estadísticas completas ✅ NUEVO",
            "/health (GET) - Health check",
            "/debug (GET) - Esta información"
        ],
        "database": {
            "host": "db", 
            "name": "users_db",
            "tables": ["bookings", "cancelled_bookings_log"]
        },
        "cancellation_behavior": {
            "action": "DELETE FROM bookings - Eliminación física",
            "audit": "Guardado en cancelled_bookings_log",
            "unique_constraint": "Ya no interfiere - permite nuevas reservas",
            "user_experience": "Puede reservar el mismo taller de nuevo"
        },
        "features": [
            "✅ Cancelación con eliminación física",
            "✅ Permite nueva reserva del mismo taller",
            "✅ Log de auditoría de cancelaciones", 
            "✅ Historial de cancelaciones por usuario",
            "✅ Estadísticas completas",
            "✅ Compatible con tabla original"
        ]
    }