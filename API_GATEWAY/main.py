# API_GATEWAY/main.py - VERSIÓN COMPLETA Y CORREGIDA

import os
import logging
import time
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway", version="2.1")

# CORS más permisivo para desarrollo y producción
origins = [
    "http://localhost:3000",
    "http://localhost:5004", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5004",
    # Agregar más orígenes según sea necesario
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Más permisivo para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# URLs de los microservicios con configuración mejorada
AUTH_URL = os.getenv("AUTH_URL", "http://auth-service:5000")
BOOKING_URL = os.getenv("BOOKING_URL", "http://booking-service:5000")
PAYMENT_URL = os.getenv("PAYMENT_URL", "http://payment-service:5000")
WORKSHOPS_URL = os.getenv("WORKSHOPS_URL", "http://workshops-service:5000")

logger.info(f"🔧 Configuración de servicios:")
logger.info(f"  AUTH_URL: {AUTH_URL}")
logger.info(f"  BOOKING_URL: {BOOKING_URL}")
logger.info(f"  PAYMENT_URL: {PAYMENT_URL}")
logger.info(f"  WORKSHOPS_URL: {WORKSHOPS_URL}")

# Cliente HTTP reutilizable con configuración mejorada
client = httpx.AsyncClient(
    timeout=30.0,
    limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
)

# Middleware para logging de requests mejorado
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request details con mejor formato
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"🔵 {request.method} {request.url.path} from {client_ip}")
    
    # Log headers importantes (sin datos sensibles)
    important_headers = {
        "content-type": request.headers.get("content-type"),
        "user-agent": request.headers.get("user-agent", "")[:50] + "..." if len(request.headers.get("user-agent", "")) > 50 else request.headers.get("user-agent", ""),
        "authorization": "Bearer ***" if request.headers.get("authorization") else None
    }
    filtered_headers = {k: v for k, v in important_headers.items() if v}
    if filtered_headers:
        logger.info(f"📋 Headers: {filtered_headers}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    status_emoji = "✅" if response.status_code < 400 else "❌" if response.status_code >= 500 else "⚠️"
    logger.info(f"{status_emoji} {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}s")
    
    return response

# FUNCIÓN PROXY MEJORADA
async def proxy(request: Request, target_base: str, strip_prefix: str, add_prefix: str = ""):
    try:
        # Construir la URL destino
        path = request.url.path.removeprefix(strip_prefix)
        
        # Agregar prefijo específico para cada servicio si es necesario
        if add_prefix and not path.startswith(add_prefix):
            path = add_prefix + path
        
        # Construir URL completa
        target_url = f"{target_base}{path}"
        
        logger.info(f"🔄 Proxying: {request.method} {request.url.path} -> {target_url}")
        
        # Construir query parameters
        params = dict(request.query_params) if request.query_params else {}
        if params:
            logger.info(f"🔍 Query params: {params}")
        
        # Leer body del request
        body = await request.body()
        if body:
            try:
                body_json = json.loads(body.decode())
                # No logear datos sensibles como passwords
                safe_body = {k: "***" if k in ["password", "card_number", "cvv"] else v 
                           for k, v in body_json.items()}
                logger.info(f"📦 Request body: {safe_body}")
            except:
                logger.info(f"📦 Request body (raw): {len(body)} bytes")
        
        # Preparar headers (excluir host y otros problemáticos)
        headers = {key: value for key, value in request.headers.items() 
                  if key.lower() not in ["host", "content-length", "connection"]}
        
        # Hacer la petición al microservicio
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=params
        )
        
        logger.info(f"✅ Response from {target_base}: {response.status_code}")
        
        # Log response body for debugging (primeros 300 chars)
        try:
            response_preview = response.text[:300]
            if len(response.text) > 300:
                response_preview += "..."
            logger.info(f"📥 Response preview: {response_preview}")
        except:
            logger.info("📥 Response body not readable")
        
        # Preparar headers de respuesta
        response_headers = {key: value for key, value in response.headers.items() 
                          if key.lower() not in ["content-length", "content-encoding", "transfer-encoding"]}
        
        # Retornar respuesta
        try:
            # Intentar parsear como JSON
            response_data = response.json()
            return JSONResponse(
                content=response_data,
                status_code=response.status_code,
                headers=response_headers
            )
        except:
            # Si no es JSON válido, retornar como texto
            return JSONResponse(
                content={"data": response.text},
                status_code=response.status_code,
                headers=response_headers
            )
        
    except httpx.TimeoutException:
        logger.error(f"⏰ Timeout al conectar con {target_base}")
        raise HTTPException(
            status_code=504, 
            detail=f"Timeout connecting to service. Please try again."
        )
    except httpx.ConnectError:
        logger.error(f"🔌 Error de conexión con {target_base}")
        raise HTTPException(
            status_code=503, 
            detail=f"Service temporarily unavailable. Please try again later."
        )
    except Exception as e:
        logger.error(f"❌ Error proxying to {target_base}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal gateway error. Please contact support."
        )

# ================================
# RUTAS PROXY CON LOGGING MEJORADO
# ================================

@app.api_route("/api/v0/auth/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_auth(request: Request, path: str):
    logger.info(f"🔐 Auth request: {request.method} /api/v0/auth/{path}")
    return await proxy(request, AUTH_URL, "/api/v0/auth", "")

@app.api_route("/api/v0/booking/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_booking(request: Request, path: str):
    logger.info(f"📅 Booking request: {request.method} /api/v0/booking/{path}")
    
    # Log especial para cancelaciones y restauraciones
    if "cancelar" in path:
        logger.info(f"🗑️ CANCELACIÓN DETECTADA: {path}")
    elif "restaurar" in path:
        logger.info(f"🔄 RESTAURACIÓN DETECTADA: {path}")
    
    return await proxy(request, BOOKING_URL, "/api/v0/booking", "")

@app.api_route("/api/v0/payment/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_payment(request: Request, path: str):
    logger.info(f"💳 Payment request: {request.method} /api/v0/payment/{path}")
    return await proxy(request, PAYMENT_URL, "/api/v0/payment", "")

@app.api_route("/api/v0/workshops/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_workshops(request: Request, path: str):
    logger.info(f"🎓 Workshops request: {request.method} /api/v0/workshops/{path}")
    return await proxy(request, WORKSHOPS_URL, "/api/v0/workshops", "")

# ================================
# RUTAS PROPIAS DEL GATEWAY
# ================================

@app.get("/api/v0/hello")
async def hello_world():
    logger.info("👋 Hello endpoint called")
    return {
        "message": "Hello desde el API Gateway", 
        "port": "5004", 
        "status": "OK",
        "version": "2.1",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Enhanced logging", 
            "Booking cancellation with hiding", 
            "Booking restoration",
            "Improved error handling"
        ]
    }

# Endpoint de debugging mejorado con tests de cancelación
@app.get("/api/v0/debug/services")
async def debug_services():
    """Endpoint para verificar conectividad con todos los servicios"""
    logger.info("🔍 Debug services endpoint called")
    results = {}
    
    services = {
        "auth": f"{AUTH_URL}/health",
        "booking": f"{BOOKING_URL}/health", 
        "payment": f"{PAYMENT_URL}/health",
        "workshops": f"{WORKSHOPS_URL}/health"
    }
    
    for name, url in services.items():
        try:
            logger.info(f"🏥 Checking health of {name} at {url}")
            response = await client.get(url, timeout=5.0)
            results[name] = {
                "status": "OK",
                "url": url,
                "response_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            logger.info(f"✅ {name} service is healthy")
        except Exception as e:
            logger.error(f"❌ {name} service error: {str(e)}")
            results[name] = {
                "status": "ERROR", 
                "url": url,
                "error": str(e)
            }
    
    # Test especial para booking service - verificar nuevas funcionalidades
    booking_features = {}
    try:
        debug_response = await client.get(f"{BOOKING_URL}/debug", timeout=5.0)
        if debug_response.status_code == 200:
            booking_debug = debug_response.json()
            booking_features = {
                "has_cancellation": "/cancelar/" in str(booking_debug.get("routes", [])),
                "has_restoration": "/restaurar/" in str(booking_debug.get("routes", [])),
                "version": booking_debug.get("version", "unknown"),
                "new_features": booking_debug.get("new_features", []),
                "behavior": booking_debug.get("behavior", {})
            }
    except Exception as e:
        booking_features = {"error": str(e)}
    
    debug_info = {
        "gateway_status": "OK",
        "timestamp": datetime.now().isoformat(),
        "services": results,
        "booking_features": booking_features,
        "environment": {
            "AUTH_URL": AUTH_URL,
            "BOOKING_URL": BOOKING_URL, 
            "PAYMENT_URL": PAYMENT_URL,
            "WORKSHOPS_URL": WORKSHOPS_URL
        },
        "version": "2.1 - Complete with booking cancellation/restoration support",
        "proxy_configuration": {
            "auth": "/api/v0/auth/* → AUTH_URL/*",
            "booking": "/api/v0/booking/* → BOOKING_URL/* (includes /cancelar/ and /restaurar/)",
            "payment": "/api/v0/payment/* → PAYMENT_URL/*",
            "workshops": "/api/v0/workshops/* → WORKSHOPS_URL/*"
        }
    }
    
    healthy_services = len([s for s in results.values() if s['status'] == 'OK'])
    logger.info(f"🔍 Debug results: {healthy_services}/{len(results)} services healthy")
    
    return debug_info

# Health check del gateway
@app.get("/health")
async def gateway_health():
    logger.info("🏥 Gateway health check")
    return {
        "status": "API Gateway OK", 
        "port": 5004, 
        "timestamp": datetime.now().isoformat(),
        "uptime": "Available",
        "version": "2.1"
    }

# Nuevo endpoint para probar específicamente las rutas de booking
@app.get("/api/v0/test/booking-routes")
async def test_booking_routes():
    """Endpoint para probar específicamente las rutas de booking incluyendo cancelación"""
    logger.info("🧪 Testing booking routes")
    
    tests = []
    
    # Test 1: Health check del booking service
    try:
        response = await client.get(f"{BOOKING_URL}/health", timeout=3.0)
        tests.append({
            "test": "Booking service health",
            "status": "OK" if response.status_code == 200 else "ERROR",
            "response_code": response.status_code,
            "url": f"{BOOKING_URL}/health"
        })
    except Exception as e:
        tests.append({
            "test": "Booking service health",
            "status": "ERROR",
            "error": str(e),
            "url": f"{BOOKING_URL}/health"
        })
    
    # Test 2: Debug del booking service para verificar rutas
    try:
        response = await client.get(f"{BOOKING_URL}/debug", timeout=3.0)
        if response.status_code == 200:
            debug_data = response.json()
            has_cancel = any("/cancelar/" in route for route in debug_data.get("routes", []))
            has_restore = any("/restaurar/" in route for route in debug_data.get("routes", []))
            tests.append({
                "test": "Booking service has cancellation route",
                "status": "OK" if has_cancel else "MISSING",
                "has_cancellation": has_cancel,
                "has_restoration": has_restore,
                "available_routes": debug_data.get("routes", [])
            })
        else:
            tests.append({
                "test": "Booking service debug",
                "status": "ERROR",
                "response_code": response.status_code
            })
    except Exception as e:
        tests.append({
            "test": "Booking service debug",
            "status": "ERROR",
            "error": str(e)
        })
    
    # Test 3: Proxy path construction
    test_paths = [
        "/api/v0/booking/health",
        "/api/v0/booking/cancelar/123",
        "/api/v0/booking/restaurar/123",
        "/api/v0/booking/usuario/test@example.com",
        "/api/v0/booking/reservar"
    ]
    
    for path in test_paths:
        stripped = path.removeprefix("/api/v0/booking")
        target_url = f"{BOOKING_URL}{stripped}"
        tests.append({
            "test": f"Path construction for {path}",
            "input_path": path,
            "stripped_path": stripped,
            "target_url": target_url,
            "status": "OK"
        })
    
    return {
        "test_summary": "Booking routes connectivity test",
        "timestamp": datetime.now().isoformat(),
        "booking_service_url": BOOKING_URL,
        "tests": tests,
        "recommendations": [
            "Ensure booking-service is running on the correct port",
            "Verify booking-service has /cancelar/{booking_id} route implemented",
            "Verify booking-service has /restaurar/{booking_id} route implemented", 
            "Check docker-compose.yml for correct service URLs",
            "Restart services if routes are missing"
        ]
    }

# Endpoint para probar conectividad básica (existente mejorado)
@app.get("/api/v0/test/connectivity")
async def test_connectivity():
    """Endpoint para probar conectividad básica con todos los servicios"""
    logger.info("🔌 Testing basic connectivity")
    
    tests = []
    services = {
        "auth": AUTH_URL,
        "booking": BOOKING_URL,
        "payment": PAYMENT_URL, 
        "workshops": WORKSHOPS_URL
    }
    
    for name, base_url in services.items():
        try:
            response = await client.get(f"{base_url}/health", timeout=3.0)
            tests.append({
                "service": name,
                "status": "OK" if response.status_code == 200 else "ERROR",
                "url": base_url,
                "response_code": response.status_code,
                "response_time": "< 3s"
            })
        except Exception as e:
            tests.append({
                "service": name,
                "status": "ERROR",
                "url": base_url,
                "error": str(e)
            })
    
    all_healthy = all(test["status"] == "OK" for test in tests)
    
    return {
        "overall_status": "OK" if all_healthy else "DEGRADED",
        "tests": tests,
        "healthy_services": len([t for t in tests if t["status"] == "OK"]),
        "total_services": len(tests),
        "timestamp": datetime.now().isoformat()
    }

# ================================
# NUEVO: ENDPOINTS PARA MANEJO DE CANCELLATION
# ================================

@app.get("/api/v0/gateway/cancellation-info")
async def get_cancellation_info():
    """Endpoint para obtener información sobre las capacidades de cancelación"""
    return {
        "cancellation_support": True,
        "restoration_support": True,
        "soft_delete": True,
        "hard_delete_option": True,
        "policies": {
            "cancellation_deadline": "1 week before workshop",
            "paid_reservations": "Cannot be cancelled",
            "visibility": "Cancelled reservations are hidden from user view",
            "data_retention": "Cancelled reservations kept for audit purposes"
        },
        "endpoints": {
            "cancel": "/api/v0/booking/cancelar/{booking_id}",
            "restore": "/api/v0/booking/restaurar/{booking_id}",
            "list_all": "/api/v0/booking/usuario/{email}?include_cancelled=true",
            "list_visible": "/api/v0/booking/usuario/{email}"
        }
    }

# Cerrar cliente al apagar la aplicación
@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()
    logger.info("🔌 HTTP client closed")