// frontend/src/services/api.ts - CON CANCELACIÓN DE RESERVAS

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

// ✅ CORRECTO: Puerto 5004 del API Gateway
const API_BASE_URL = 'http://localhost:5004';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
    // Log para debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Solo redirigir si no estamos ya en login/register
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/debug')) {
        window.location.href = '/login';
      }
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
      console.log('[API] Enviando registro:', { name: data.name, email: data.email });
      const response: AxiosResponse = await api.post('/api/v0/auth/register', data);
      console.log('[API] Respuesta registro exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error en registro:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error en el registro';
      throw new Error(errorMessage);
    }
  },

  // Login de usuario
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('[API] Enviando login:', { username: loginData.username });
      
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
      
      console.log('[API] Login exitoso:', { token_type: response.data.token_type });
      return response.data;
    } catch (error: any) {
      console.error('[API] Error en login:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error en el login';
      throw new Error(errorMessage);
    }
  },

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    try {
      console.log('[API] Obteniendo perfil...');
      const response: AxiosResponse<User> = await api.get('/api/v0/auth/profile');
      console.log('[API] Perfil obtenido:', { id: response.data.id, email: response.data.email });
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener perfil:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener el perfil';
      throw new Error(errorMessage);
    }
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse = await api.post('/api/v0/auth/logout');
      console.log('[API] Logout exitoso');
      return response.data;
    } catch (error: any) {
      console.error('[API] Error en logout:', error.response?.data);
      // No lanzar error en logout, es mejor limpiar el estado local
      return { message: 'Logout local exitoso' };
    }
  },

  // Test de conectividad
  async testConnection(): Promise<any> {
    try {
      const response = await api.get('/api/v0/hello');
      console.log('[API] Test de conexión exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error de conexión:', error);
      throw error;
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
      console.log('[API] Obteniendo talleres...');
      const response: AxiosResponse<Workshop[]> = await api.get('/api/v0/workshops');
      console.log('[API] Talleres obtenidos:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener talleres:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener talleres';
      throw new Error(errorMessage);
    }
  },

  // Crear un nuevo taller
  async createWorkshop(data: WorkshopCreate): Promise<Workshop> {
    try {
      console.log('[API] Creando taller:', data.title);
      const response: AxiosResponse<Workshop> = await api.post('/api/v0/workshops', data);
      console.log('[API] Taller creado:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al crear taller:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al crear taller';
      throw new Error(errorMessage);
    }
  },

  // Buscar talleres
  async searchWorkshops(categoria?: string, palabra?: string): Promise<Workshop[]> {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (palabra) params.append('palabra', palabra);
      
      console.log('[API] Buscando talleres...', { categoria, palabra });
      const response: AxiosResponse<Workshop[]> = await api.get(
        `/api/v0/workshops/buscar?${params.toString()}`
      );
      console.log('[API] Talleres encontrados:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error en la búsqueda:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error en la búsqueda';
      throw new Error(errorMessage);
    }
  }
};

// ================================
// SERVICIOS DE RESERVAS (MEJORADO)
// ================================

export const bookingService = {
  // Hacer una reserva
  async createBooking(data: BookingRequest): Promise<Booking> {
    try {
      console.log('[API] Creando reserva:', data);
      const response: AxiosResponse<Booking> = await api.post('/api/v0/booking/reservar', data);
      console.log('[API] Reserva creada:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al hacer la reserva:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al hacer la reserva';
      throw new Error(errorMessage);
    }
  },

  // Obtener reservas del usuario
  async getUserBookings(email: string): Promise<Booking[]> {
    try {
      console.log('[API] Obteniendo reservas para:', email);
      const response: AxiosResponse<Booking[]> = await api.get(`/api/v0/booking/usuario/${email}`);
      console.log('[API] Reservas obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener reservas:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener reservas';
      throw new Error(errorMessage);
    }
  },

  // ✅ NUEVO: Cancelar una reserva
  async cancelBooking(bookingId: number, reason?: string): Promise<{ message: string; booking: Booking }> {
    try {
      console.log('[API] Cancelando reserva:', bookingId);
      
      const requestData = {
        booking_id: bookingId,
        reason: reason || 'Usuario solicitó cancelación'
      };
      
      const response: AxiosResponse<{ message: string; booking: Booking }> = await api.post(
        `/api/v0/booking/cancelar/${bookingId}`, 
        requestData
      );
      
      console.log('[API] Reserva cancelada:', response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al cancelar reserva:', error.response?.data);
      
      // Manejo de errores específicos
      let errorMessage = 'Error al cancelar la reserva';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Personalizar mensajes de error comunes
      if (errorMessage.includes('404')) {
        errorMessage = 'La reserva no existe o no se encuentra';
      } else if (errorMessage.includes('400')) {
        if (errorMessage.includes('ya está cancelada')) {
          errorMessage = 'Esta reserva ya ha sido cancelada';
        } else if (errorMessage.includes('pagadas')) {
          errorMessage = 'No se pueden cancelar reservas que ya han sido pagadas';
        } else if (errorMessage.includes('una semana')) {
          errorMessage = 'Solo se pueden cancelar reservas hasta una semana antes del taller';
        } else if (errorMessage.includes('finalizado')) {
          errorMessage = 'No se pueden cancelar talleres que ya han finalizado';
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // ✅ NUEVO: Obtener detalles de una reserva específica
  async getBookingDetails(bookingId: number): Promise<Booking> {
    try {
      console.log('[API] Obteniendo detalles de reserva:', bookingId);
      const response: AxiosResponse<Booking> = await api.get(`/api/v0/booking/reserva/${bookingId}`);
      console.log('[API] Detalles de reserva obtenidos:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener detalles de reserva:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener detalles de la reserva';
      throw new Error(errorMessage);
    }
  },

  // ✅ NUEVO: Obtener estadísticas de reservas del usuario
  async getUserBookingStats(email: string): Promise<{
    total_reservas: number;
    reservas_activas: number;
    reservas_completadas: number;
    pagos_pendientes: number;
  }> {
    try {
      console.log('[API] Obteniendo estadísticas de reservas para:', email);
      const response = await api.get(`/api/v0/booking/estadisticas/${email}`);
      console.log('[API] Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener estadísticas:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener estadísticas';
      throw new Error(errorMessage);
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
      console.log('[API] Procesando pago...');
      const response: AxiosResponse<PaymentResponse> = await api.post('/api/v0/payment/process', data);
      console.log('[API] Pago procesado:', response.data.status);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al procesar el pago:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al procesar el pago';
      throw new Error(errorMessage);
    }
  },

  // Obtener estado de pago
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response: AxiosResponse = await api.get(`/api/v0/payment/status/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener estado del pago:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener estado del pago';
      throw new Error(errorMessage);
    }
  },

  // Obtener métodos de pago
  async getPaymentMethods(): Promise<any> {
    try {
      const response: AxiosResponse = await api.get('/api/v0/payment/methods');
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener métodos de pago:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener métodos de pago';
      throw new Error(errorMessage);
    }
  },

  // Obtener historial de pagos
  async getPaymentHistory(email: string): Promise<any> {
    try {
      const response: AxiosResponse = await api.get(`/api/v0/payment/history/${email}`);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al obtener historial:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al obtener historial';
      throw new Error(errorMessage);
    }
  },

  // ✅ NUEVO: Verificar estado de pago de una reserva específica
  async getBookingPaymentStatus(email: string, workshopId: number): Promise<any> {
    try {
      console.log('[API] Verificando estado de pago de reserva:', { email, workshopId });
      const response = await api.get(`/api/v0/payment/booking/${email}/${workshopId}`);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al verificar estado de pago:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al verificar estado de pago';
      throw new Error(errorMessage);
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
      console.error('[API] Error en health check:', error);
      throw new Error('API Gateway no disponible');
    }
  },

  // ✅ NUEVO: Debug completo de todos los servicios
  async debugServices(): Promise<any> {
    try {
      console.log('[API] Obteniendo información de debug de servicios...');
      const response = await api.get('/api/v0/debug/services');
      console.log('[API] Debug info obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error en debug de servicios:', error);
      throw new Error('Error al obtener información de debug');
    }
  }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Función helper para formatear errores de API
export const formatApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.message) {
    // Personalizar mensajes comunes
    if (error.message.includes('Network Error')) {
      return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
    }
    if (error.message.includes('timeout')) {
      return 'La solicitud tardó demasiado. Intenta nuevamente.';
    }
    if (error.message.includes('500')) {
      return 'Error del servidor. Intenta nuevamente en unos minutos.';
    }
    return error.message;
  }
  
  return 'Error desconocido. Intenta nuevamente.';
};

// Función helper para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Función helper para obtener el token actual
export const getCurrentToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Función helper para obtener el usuario actual
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export default api;