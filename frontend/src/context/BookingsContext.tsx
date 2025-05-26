// frontend/src/context/BookingsContext.tsx - VERSIÓN MEJORADA CON API REAL
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking, Workshop } from '../types';
import { bookingService, workshopsService } from '../services/api';
import { useAuth } from './AuthContext';

interface BookingWithWorkshop extends Booking {
  workshop?: Workshop;
}

interface BookingsContextType {
  bookings: BookingWithWorkshop[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  cancelBooking: (bookingId: number, reason?: string) => Promise<boolean>;
  retryConnection: () => Promise<void>;
  isOnline: boolean;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

interface BookingsProviderProps {
  children: React.ReactNode;
}

export const BookingsProvider: React.FC<BookingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ====================================================
  // FUNCIONES DE CONEXIÓN Y ESTADO
  // ====================================================

  // Detectar cambios en la conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [BOOKINGS_CONTEXT] Conexión restaurada');
      setIsOnline(true);
      // Auto-refrescar cuando se restaure la conexión
      if (user?.email) {
        refreshBookings();
      }
    };

    const handleOffline = () => {
      console.log('🚫 [BOOKINGS_CONTEXT] Conexión perdida');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.email]);

  // ====================================================
  // FUNCIONES DE CARGA DE DATOS
  // ====================================================

  // Cargar talleres disponibles (para combinar con reservas)
  const loadWorkshops = useCallback(async (): Promise<Workshop[]> => {
    try {
      console.log('🔄 [BOOKINGS_CONTEXT] Cargando talleres...');
      const workshopsData = await workshopsService.getAllWorkshops();
      setWorkshops(workshopsData);
      console.log(`✅ [BOOKINGS_CONTEXT] ${workshopsData.length} talleres cargados`);
      return workshopsData;
    } catch (error: any) {
      console.error('❌ [BOOKINGS_CONTEXT] Error cargando talleres:', error);
      // No es crítico si fallan los talleres, las reservas pueden mostrarse sin detalles completos
      return workshops; // Retornar talleres existentes
    }
  }, [workshops]);

  // Cargar reservas del usuario con manejo robusto de errores
  const loadBookings = useCallback(async (workshopsData?: Workshop[]) => {
    if (!user?.email) {
      console.log('ℹ️ [BOOKINGS_CONTEXT] No hay usuario autenticado');
      setBookings([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [BOOKINGS_CONTEXT] Cargando reservas para:', user.email);
      
      // Usar talleres pasados como parámetro o los existentes
      const currentWorkshops = workshopsData || workshops;
      
      // Cargar reservas del usuario
      const userBookings = await bookingService.getUserBookings(user.email);
      
      // Combinar reservas con información de talleres
      const bookingsWithWorkshops = userBookings.map(booking => {
        const workshop = currentWorkshops.find(w => w.id === booking.workshop_id);
        return {
          ...booking,
          workshop
        };
      });

      setBookings(bookingsWithWorkshops);
      console.log(`✅ [BOOKINGS_CONTEXT] ${bookingsWithWorkshops.length} reservas cargadas`);
      
    } catch (error: any) {
      console.error('❌ [BOOKINGS_CONTEXT] Error cargando reservas:', error);
      
      // Manejo específico de errores
      if (error.message.includes('404') || error.message.includes('No se encontraron reservas')) {
        console.log('ℹ️ [BOOKINGS_CONTEXT] Usuario no tiene reservas');
        setBookings([]);
        setError(null);
      } else if (error.message.includes('Network Error') || error.message.includes('timeout')) {
        setError('Error de conexión.Todo estaba listo para reservar... pero el chef de los microservicios dijo ‘Hoy no cocino’. Vuelve cuando recupere el ánimo.');
        setIsOnline(false);
      } else if (error.message.includes('500')) {
        setError('Error del servidor. Todo estaba listo para reservar... pero el chef de los microservicios dijo ‘Hoy no cocino’. Vuelve cuando recupere el ánimo.');
      } else {
        setError('Error al conectar con el servidor. Todo estaba listo para reservar... pero el chef de los microservicios dijo ‘Hoy no cocino’. Vuelve cuando recupere el ánimo..');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email, workshops]);

  // ====================================================
  // FUNCIONES PÚBLICAS
  // ====================================================

  // Refrescar reservas con carga inteligente
  const refreshBookings = useCallback(async () => {
    console.log('🔄 [BOOKINGS_CONTEXT] Refrescando reservas...');
    
    try {
      // Cargar talleres primero si no están cargados o hay pocos
      let currentWorkshops = workshops;
      if (workshops.length === 0) {
        currentWorkshops = await loadWorkshops();
      }
      
      // Cargar reservas con los talleres actualizados
      await loadBookings(currentWorkshops);
      
    } catch (error: any) {
      console.error('❌ [BOOKINGS_CONTEXT] Error en refresh:', error);
      setError('Error al refrescar datos. Intenta nuevamente.');
    }
  }, [loadBookings, loadWorkshops, workshops]);

  // Cancelar reserva con la API real
  const cancelBooking = useCallback(async (bookingId: number, reason?: string): Promise<boolean> => {
    try {
      console.log('🗑️ [BOOKINGS_CONTEXT] Cancelando reserva:', bookingId);
      
      // Encontrar la reserva para validaciones locales
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada en el estado local');
      }

      // Validaciones previas (duplicar las del backend para mejor UX)
      if (booking.status === 'Cancelada') {
        throw new Error('Esta reserva ya está cancelada');
      }
      
      if (booking.payment_status === 'Pagado') {
        throw new Error('No se pueden cancelar reservas que ya han sido pagadas');
      }

      // Llamada real a la API
      const result = await bookingService.cancelBooking(bookingId, reason);
      
      // Actualizar estado local con la respuesta del servidor
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId 
            ? { ...b, ...result.booking, status: 'Cancelada' as any }
            : b
        )
      );
      
      console.log('✅ [BOOKINGS_CONTEXT] Reserva cancelada exitosamente:', result.message);
      return true;
      
    } catch (error: any) {
      console.error('❌ [BOOKINGS_CONTEXT] Error cancelando reserva:', error);
      
      // Re-throw el error para que el componente lo maneje
      throw new Error(error.message || 'Error al cancelar la reserva');
    }
  }, [bookings]);

  // Reintentar conexión
  const retryConnection = useCallback(async () => {
    console.log('🔄 [BOOKINGS_CONTEXT] Reintentando conexión...');
    setError(null);
    await refreshBookings();
  }, [refreshBookings]);

  // ====================================================
  // EFECTOS
  // ====================================================

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.email) {
      // Cargar talleres y reservas en paralelo al montar
      const initializeData = async () => {
        try {
          const workshopsData = await loadWorkshops();
          await loadBookings(workshopsData);
        } catch (error) {
          console.error('❌ [BOOKINGS_CONTEXT] Error en inicialización:', error);
        }
      };
      
      initializeData();
    } else {
      // Limpiar estado si no hay usuario
      setBookings([]);
      setWorkshops([]);
      setError(null);
      setLoading(false);
    }
  }, [user?.email]); // Solo depender del email del usuario

  // Auto-refresh periódico (cada 5 minutos si hay usuario activo)
  useEffect(() => {
    if (!user?.email || !isOnline) return;

    const intervalId = setInterval(() => {
      console.log('⏰ [BOOKINGS_CONTEXT] Auto-refresh periódico');
      refreshBookings();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalId);
  }, [user?.email, isOnline, refreshBookings]);

  // ====================================================
  // CONTEXTO VALUE
  // ====================================================

  const value: BookingsContextType = {
    bookings,
    loading,
    error,
    refreshBookings,
    cancelBooking,
    retryConnection,
    isOnline
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};