# API_GATEWAY/main.py - HTTPX CORREGIDO

import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx

app = FastAPI(title="API Gateway", version="1.0")

# CORS más permisivo para desarrollo
origins = ["http://localhost:3000", "http://localhost:5004"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de los microservicios
AUTH_URL      = os.getenv("AUTH_URL",      "http://auth-service:5000")
BOOKING_URL   = os.getenv("BOOKING_URL",   "http://booking-service:5000")
PAYMENT_URL   = os.getenv("PAYMENT_URL",   "http://payment-service:5000")
WORKSHOPS_URL = os.getenv("WORKSHOPS_URL", "http://workshops-service:5000")

# Cliente HTTP reutilizable
client = httpx.AsyncClient(timeout=30.0)

# ✅ FUNCIÓN PROXY CORREGIDA - Sintaxis correcta de httpx
async def proxy(request: Request, target_base: str, strip_prefix: str, add_prefix: str = ""):
    try:
        # Construir la URL destino
        path = request.url.path.removeprefix(strip_prefix)
        
        # Agregar prefijo específico para cada servicio si es necesario
        if add_prefix and not path.startswith(add_prefix):
            path = add_prefix + path
        
        # ✅ CORREGIDO: Sintaxis correcta para httpx URL
        base_url = target_base + path
        
        print(f"[API Gateway] Proxying: {request.method} {request.url.path} -> {base_url}")
        
        # Construir query parameters correctamente
        params = dict(request.query_params) if request.query_params else {}
        
        # Copio método, cabeceras y body
        req = client.build_request(
            request.method,
            base_url,
            headers={key: value for key, value in request.headers.items() if key.lower() != "host"},
            content=await request.body(),
            params=params  # ✅ CORREGIDO: usar params en lugar de include_query_params
        )
        
        resp = await client.send(req, stream=True)
        print(f"[API Gateway] Response: {resp.status_code} from {base_url}")
        
        # Stream de vuelta al cliente
        return StreamingResponse(
            resp.aiter_raw(),
            status_code=resp.status_code,
            headers=resp.headers,
            media_type=resp.headers.get("content-type")
        )
        
    except Exception as e:
        print(f"[API Gateway] Error proxying to {target_base + path}: {e}")
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

# Rutas proxy con prefijos apropiados para cada servicio (Enfoque 2)
@app.api_route("/api/v0/auth/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_auth(request: Request, path: str):
    return await proxy(request, AUTH_URL, "/api/v0/auth", "")  # Sin prefijo adicional para Enfoque 2

@app.api_route("/api/v0/booking/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_booking(request: Request, path: str):
    return await proxy(request, BOOKING_URL, "/api/v0/booking", "")

@app.api_route("/api/v0/payment/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_payment(request: Request, path: str):
    return await proxy(request, PAYMENT_URL, "/api/v0/payment", "")

@app.api_route("/api/v0/workshops/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_workshops(request: Request, path: str):
    return await proxy(request, WORKSHOPS_URL, "/api/v0/workshops", "")

# Ruta de sanity-check del gateway
@app.get("/api/v0/hello")
async def hello_world():
    return {"message": "Hello desde el API Gateway", "port": "5004", "status": "OK"}

# Endpoint de debugging
@app.get("/api/v0/debug/services")
async def debug_services():
    """Endpoint para verificar conectividad con todos los servicios"""
    results = {}
    
    services = {
        "auth": AUTH_URL + "/health",
        "booking": BOOKING_URL + "/health", 
        "payment": PAYMENT_URL + "/health",
        "workshops": WORKSHOPS_URL + "/health"
    }
    
    for name, url in services.items():
        try:
            response = await client.get(url, timeout=5.0)
            results[name] = {
                "status": "OK",
                "url": url,
                "response_code": response.status_code,
                "response": response.json() if response.status_code == 200 else None
            }
        except Exception as e:
            results[name] = {
                "status": "ERROR", 
                "url": url,
                "error": str(e)
            }
    
    return {
        "gateway_status": "OK",
        "services": results,
        "environment": {
            "AUTH_URL": AUTH_URL,
            "BOOKING_URL": BOOKING_URL, 
            "PAYMENT_URL": PAYMENT_URL,
            "WORKSHOPS_URL": WORKSHOPS_URL
        },
        "httpx_version": "Fixed - using params instead of include_query_params"
    }

# Health check del gateway
@app.get("/health")
async def gateway_health():
    return {"status": "API Gateway OK", "port": 5004}