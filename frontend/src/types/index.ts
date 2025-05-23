// Tipos para autenticación
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginData {
  username: string; // La API espera 'username' pero es el email
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Tipos para talleres
export interface Workshop {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string; // ISO date string
  max_participants: number;
  current_participants: number;
  price: number;
}

export interface WorkshopCreate {
  title: string;
  description: string;
  category: string;
  date: string;
  max_participants: number;
  price: number;
}

// Tipos para reservas
export interface Booking {
  id: number;
  user_email: string;
  workshop_id: number;
  status: 'Confirmada' | 'Cancelada' | 'Completada';
  payment_status: 'Pendiente' | 'Pagado';
}

export interface BookingRequest {
  user_email: string;
  workshop_id: number;
}

// TIPO PARA RESERVAS CON INFORMACIÓN DE TALLERES
export interface BookingWithWorkshop extends Booking {
  workshop?: Workshop;
}

// Tipos para pagos
export interface PaymentRequest {
  user_email: string;
  workshop_id: number;
  amount: number;
  payment_method: string;
  card_number?: string;
  card_holder?: string;
  expiry_date?: string;
  cvv?: string;
}

export interface PaymentResponse {
  payment_id: string;
  status: 'approved' | 'declined' | 'pending';
  transaction_id: string;
  amount: number;
  timestamp: string;
  message: string;
}

// Tipos para respuestas de la API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
}

// Tipos para errores
export interface ApiError {
  detail: string;
  status_code?: number;
}