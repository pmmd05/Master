# API_GATEWAY/main.py - VERSIÓN MEJORADA CON MEJOR LOGGING Y CORS

import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway", version="2.0")

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

# URLs de los microservicios
AUTH_URL = os.getenv("AUTH_URL", "http://auth-service:5000")
BOOKING_URL = os.getenv("BOOKING_URL", "http://booking-service:5000")
PAYMENT_URL = os.getenv("PAYMENT_URL", "http://payment-service:5000")
WORKSHOPS_URL = os.getenv("WORKSHOPS_URL", "http://workshops-service:5000")

logger.info(f"🔧 Configuración de servicios:")
logger.info(f"  AUTH_URL: {AUTH_URL}")
logger.info(f"  BOOKING_URL: {BOOKING_URL}")
logger.info(f"  PAYMENT_URL: {PAYMENT_URL}")
logger.info(f"  WORKSHOPS_URL: {WORKSHOPS_URL}")

# Cliente HTTP reutilizable
client = httpx.AsyncClient(timeout=30.0)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request details
    logger.info(f"{request.method} {request.url.path} - Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}s")
    
    return response

# FUNCIÓN PROXY 
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
            logger.info(f"📋 Query params: {params}")
        
        # Leer body del request
        body = await request.body()
        if body:
            try:
                body_json = json.loads(body.decode())
                logger.info(f"📦 Request body: {body_json}")
            except:
                logger.info(f"📦 Request body (raw): {body[:200]}...")
        
        # Preparar headers (excluir host)
        headers = {key: value for key, value in request.headers.items() 
                  if key.lower() not in ["host", "content-length"]}
        
        logger.info(f"📨 Forwarding headers: {headers}")
        
        # Hacer la petición al microservicio
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=params
        )
        
        logger.info(f"✅ Response from {target_base}: {response.status_code}")
        
        # Log response body for debugging (first 500 chars)
        try:
            response_text = response.text[:500]
            logger.info(f"📥 Response preview: {response_text}")
        except:
            logger.info("📥 Response body not readable")
        
        # Retornar respuesta
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
            status_code=response.status_code,
            headers={key: value for key, value in response.headers.items() 
                    if key.lower() not in ["content-length", "content-encoding", "transfer-encoding"]}
        )
        
    except httpx.TimeoutException:
        logger.error(f"⏰ Timeout al conectar con {target_base}")
        raise HTTPException(status_code=504, detail=f"Timeout connecting to {target_base}")
    except httpx.ConnectError:
        logger.error(f"🔌 Error de conexión con {target_base}")
        raise HTTPException(status_code=503, detail=f"Cannot connect to {target_base}")
    except Exception as e:
        logger.error(f"❌ Error proxying to {target_base}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

# Rutas proxy con logging mejorado
@app.api_route("/api/v0/auth/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_auth(request: Request, path: str):
    logger.info(f"🔐 Auth request: {request.method} /api/v0/auth/{path}")
    return await proxy(request, AUTH_URL, "/api/v0/auth", "")

@app.api_route("/api/v0/booking/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_booking(request: Request, path: str):
    logger.info(f"📅 Booking request: {request.method} /api/v0/booking/{path}")
    return await proxy(request, BOOKING_URL, "/api/v0/booking", "")

@app.api_route("/api/v0/payment/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_payment(request: Request, path: str):
    logger.info(f"💳 Payment request: {request.method} /api/v0/payment/{path}")
    return await proxy(request, PAYMENT_URL, "/api/v0/payment", "")

@app.api_route("/api/v0/workshops/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_workshops(request: Request, path: str):
    logger.info(f"🎓 Workshops request: {request.method} /api/v0/workshops/{path}")
    return await proxy(request, WORKSHOPS_URL, "/api/v0/workshops", "")

# Ruta de sanity-check del gateway
@app.get("/api/v0/hello")
async def hello_world():
    logger.info("👋 Hello endpoint called")
    return {"message": "Hello desde el API Gateway", "port": "5004", "status": "OK"}

# Endpoint de debugging mejorado
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
    
    debug_info = {
        "gateway_status": "OK",
        "timestamp": datetime.now().isoformat(),
        "services": results,
        "environment": {
            "AUTH_URL": AUTH_URL,
            "BOOKING_URL": BOOKING_URL, 
            "PAYMENT_URL": PAYMENT_URL,
            "WORKSHOPS_URL": WORKSHOPS_URL
        },
        "version": "2.0 - Enhanced logging"
    }
    
    logger.info(f"🔍 Debug results: {len([s for s in results.values() if s['status'] == 'OK'])}/{len(results)} services healthy")
    return debug_info

# Health check del gateway
@app.get("/health")
async def gateway_health():
    logger.info("🏥 Gateway health check")
    return {"status": "API Gateway OK", "port": 5004, "timestamp": datetime.now().isoformat()}

# Endpoint para probar conectividad básica
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
                "response_code": response.status_code
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
        "total_services": len(tests)
    }

# Importar datetime para timestamps
from datetime import datetime
import time