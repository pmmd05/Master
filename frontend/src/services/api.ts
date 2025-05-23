import axios, { AxiosResponse } from 'axios';
import { 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  User, 
  Workshop, 
  WorkshopCreate,
  Booking,
  BookingRequest,
  PaymentRequest,
  PaymentResponse 
} from '../types';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:5004'; // Puerto del API Gateway

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en todas las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================================
// SERVICIOS DE AUTENTICACIÓN
// ================================

export const authService = {
  // Registro de usuario
  async register(data: RegisterData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse = await api.post('/api/v0/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en el registro');
    }
  },

  // Login de usuario
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // La API espera FormData para el login
      const formData = new FormData();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const response: AxiosResponse<AuthResponse> = await api.post(
        '/api/v0/auth/login', 
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en el login');
    }
  },

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get('/api/v0/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener el perfil');
    }
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse = await api.post('/api/v0/auth/logout');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en el logout');
    }
  },

  // Verificar salud del servicio
  async health(): Promise<{ status: string }> {
    try {
      const response: AxiosResponse = await api.get('/api/v0/auth/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Servicio no disponible');
    }
  }
};

// ================================
// SERVICIOS DE TALLERES
// ================================

export const workshopsService = {
  // Obtener todos los talleres
  async getAllWorkshops(): Promise<Workshop[]> {
    try {
      const response: AxiosResponse<Workshop[]> = await api.get('/api/v0/workshops');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener talleres');
    }
  },

  // Crear un nuevo taller
  async createWorkshop(data: WorkshopCreate): Promise<Workshop> {
    try {
      const response: AxiosResponse<Workshop> = await api.post('/api/v0/workshops', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear taller');
    }
  },

  // Buscar talleres
  async searchWorkshops(categoria?: string, palabra?: string): Promise<Workshop[]> {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (palabra) params.append('palabra', palabra);
      
      const response: AxiosResponse<Workshop[]> = await api.get(
        `/api/v0/workshops/buscar?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en la búsqueda');
    }
  }
};

// ================================
// SERVICIOS DE RESERVAS
// ================================

export const bookingService = {
  // Hacer una reserva
  async createBooking(data: BookingRequest): Promise<Booking> {
    try {
      const response: AxiosResponse<Booking> = await api.post('/api/v0/booking/reservar', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al hacer la reserva');
    }
  },

  // Obtener reservas del usuario
  async getUserBookings(email: string): Promise<Booking[]> {
    try {
      const response: AxiosResponse<Booking[]> = await api.get(`/api/v0/booking/usuario/${email}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener reservas');
    }
  }
};

// ================================
// SERVICIOS DE PAGOS
// ================================

export const paymentService = {
  // Procesar pago
  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response: AxiosResponse<PaymentResponse> = await api.post('/api/v0/payment/process', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al procesar el pago');
    }
  },

  // Obtener estado de pago
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response: AxiosResponse = await api.get(`/api/v0/payment/status/${paymentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener estado del pago');
    }
  },

  // Obtener métodos de pago
  async getPaymentMethods(): Promise<any> {
    try {
      const response: AxiosResponse = await api.get('/api/v0/payment/methods');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener métodos de pago');
    }
  },

  // Obtener historial de pagos
  async getPaymentHistory(email: string): Promise<any> {
    try {
      const response: AxiosResponse = await api.get(`/api/v0/payment/history/${email}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener historial');
    }
  }
};

// ================================
// SERVICIO GENERAL
// ================================

export const generalService = {
  // Health check del API Gateway
  async healthCheck(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse = await api.get('/api/v0/hello');
      return response.data;
    } catch (error: any) {
      throw new Error('API Gateway no disponible');
    }
  }
};

export default api;