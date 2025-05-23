from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, validator
import mysql.connector
import bcrypt
import time
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Auth Service", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterData(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    
    @validator("password")
    def password_strength(cls, v):
        if not any(c.isupper() for c in v) or not any(c.islower() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos una mayúscula, una minúscula y un número.")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

# ✅ CORREGIDO: tokenUrl ahora coincide con la ruta proxy
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_connection():
    for attempt in range(20):
        try:
            return mysql.connector.connect(
                host="db",
                user="root",
                password="12345",
                database="users_db"
            )
        except mysql.connector.Error as e:
            print(f"[auth-service] Intento {attempt+1} fallido: {e}, esperando...")
            time.sleep(3)
    raise Exception("No se pudo conectar a la base de datos.")

@app.on_event("startup")
def create_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()
    print("[auth-service] Tabla 'users' verificada/creada")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ✅ RUTAS SIMPLES - Coinciden con lo que envía el API Gateway proxy

@app.post("/register")
def register_user(data: RegisterData):
    try:
        print(f"[auth-service] Registrando usuario: {data.email}")
        hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (data.email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Correo ya registrado")
        
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                       (data.name, data.email, hashed))
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"[auth-service] Usuario registrado exitosamente: {data.email}")
        return {"message": "Usuario registrado exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth-service] Error en registro: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        print(f"[auth-service] Intento de login: {form_data.username}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user or not bcrypt.checkpw(form_data.password.encode(), user["password"].encode()):
            print(f"[auth-service] Login fallido para: {form_data.username}")
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        token = create_access_token({"sub": user["email"]})
        print(f"[auth-service] Login exitoso: {form_data.username}")
        return {"access_token": token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth-service] Error en login: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/logout")
def logout():
    return {"message": "Logout exitoso. Elimina el token en el cliente."}

@app.get("/profile", response_model=UserOut)
def get_profile(token_data=Depends(verify_token)):
    try:
        print(f"[auth-service] Obteniendo perfil para: {token_data['sub']}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users WHERE email = %s", (token_data["sub"],))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth-service] Error obteniendo perfil: {e}")
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
        return {"status": "auth-service ok", "database": "connected"}
    except Exception as e:
        return {"status": "auth-service error", "database": "disconnected", "error": str(e)}

@app.get("/debug")
def debug_info():
    return {
        "service": "auth-service",
        "approach": "Enfoque 2 - Rutas simples",
        "routes": [
            "/register (POST)",
            "/login (POST)", 
            "/logout (POST)",
            "/profile (GET)",
            "/health (GET)",
            "/debug (GET)"
        ],
        "proxy_info": "API Gateway: /api/v0/auth/{path} → /{path}",
        "database": {"host": "db", "name": "users_db"}
    }