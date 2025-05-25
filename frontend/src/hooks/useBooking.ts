// frontend/src/hooks/useBooking.ts - VERSIÓN MEJORADA CON API COMPLETA
import { useState, useCallback, useEffect } from 'react';
import { Workshop } from '../types';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UseBookingReturn {
  // Estado
  selectedWorkshop: Workshop | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  
  // Acciones
  initiateBooking: (workshop: Workshop) => void;
  confirmBooking: () => Promise<boolean>;
  cancelBooking: () => void;
  clearMessages: () => void;
  closeSuccessMessage: () => void;
}

export const useBooking = (onBookingSuccess?: () => Promise<void>): UseBookingReturn => {
  const { user } = useAuth();
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpiar mensajes automáticamente después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000); // 10 segundos
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 7000); // 7 segundos
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Iniciar proceso de reserva
  const initiateBooking = useCallback((workshop: Workshop) => {
    console.log('🎯 [USE_BOOKING] Iniciando reserva para:', workshop.title);
    setSelectedWorkshop(workshop);
    setError(null);
    setSuccess(null);
  }, []);

  // Confirmar la reserva con validaciones robustas
  const confirmBooking = useCallback(async (): Promise<boolean> => {
    if (!selectedWorkshop || !user) {
      console.error('❌ [USE_BOOKING] No hay taller o usuario para reservar');
      setError('Error: No hay taller seleccionado o usuario no autenticado');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 [USE_BOOKING] Procesando reserva...');
      console.log('📝 [USE_BOOKING] Datos:', {
        user_email: user.email,
        workshop_id: selectedWorkshop.id,
        workshop_title: selectedWorkshop.title
      });

      // Validaciones previas mejoradas
      if (!user.email) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      if (selectedWorkshop.current_participants >= selectedWorkshop.max_participants) {
        throw new Error('Este taller ya no tiene cupos disponibles.');
      }

      // Verificar que la fecha no haya pasado (con mejor manejo de fechas)
      try {
        const workshopDate = new Date(selectedWorkshop.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(workshopDate.getTime())) {
          console.warn('⚠️ [USE_BOOKING] Fecha del taller inválida, continuando...');
        } else if (workshopDate < today) {
          throw new Error('No se puede reservar un taller que ya ha finalizado.');
        }
      } catch (dateError) {
        console.warn('⚠️ [USE_BOOKING] Error verificando fecha:', dateError);
        // Continuar con la reserva si hay problemas con la fecha
      }

      // Crear la reserva
      const bookingData = {
        user_email: user.email,
        workshop_id: selectedWorkshop.id
      };

      console.log('📡 [USE_BOOKING] Enviando solicitud de reserva...');
      const booking = await bookingService.createBooking(bookingData);
      
      console.log('✅ [USE_BOOKING] Reserva creada exitosamente:', {
        booking_id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status
      });
      
      // Mensaje de éxito personalizado y detallado
      const successMessage = `🎉 ¡Reserva confirmada exitosamente!

📝 Detalles:
• Taller: "${selectedWorkshop.title}"
• Reserva ID: #${booking.id}
• Estado: ${booking.status}
• Pago: ${booking.payment_status}

✅ Próximos pasos:
${booking.payment_status === 'Pendiente' 
  ? '• Completa tu pago desde "Mis Reservas"\n• Recibirás confirmación por email' 
  : '• Recibirás los detalles por email\n• Revisa "Mis Reservas" para más info'
}`;

      setSuccess(successMessage);
      setSelectedWorkshop(null);
      
      // Callback de éxito (para refrescar listas, etc.)
      if (onBookingSuccess) {
        console.log('🔄 [USE_BOOKING] Ejecutando callback de éxito...');
        setTimeout(async () => {
          try {
            await onBookingSuccess();
            console.log('✅ [USE_BOOKING] Callback ejecutado correctamente');
          } catch (callbackError) {
            console.error('⚠️ [USE_BOOKING] Error en callback:', callbackError);
          }
        }, 1000);
      }

      return true;

    } catch (error: any) {
      console.error('❌ [USE_BOOKING] Error creando reserva:', error);
      
      // Mejorar y personalizar mensajes de error con contexto
      let errorMessage = 'Error desconocido al procesar la reserva.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mensajes más específicos y útiles con sugerencias
      if (errorMessage.includes('ya tienes una reserva') || errorMessage.includes('UNIQUE constraint')) {
        errorMessage = `Ya tienes una reserva para "${selectedWorkshop.title}". 

💡 Sugerencia: Revisa tu sección "Mis Reservas" para gestionar esta reserva existente.`;
      } else if (errorMessage.includes('Usuario no encontrado') || errorMessage.includes('not found')) {
        errorMessage = `Tu sesión de usuario no es válida. 

🔧 Solución: Cierra sesión e inicia sesión nuevamente para actualizar tu estado.`;
      } else if (errorMessage.includes('cupos') || errorMessage.includes('participants')) {
        errorMessage = `"${selectedWorkshop.title}" ya no tiene cupos disponibles. 

😞 Lo sentimos: El taller se llenó mientras procesábamos tu solicitud. Te sugerimos revisar otros talleres similares.`;
      } else if (errorMessage.includes('Taller no encontrado')) {
        errorMessage = `El taller "${selectedWorkshop.title}" ya no está disponible. 

ℹ️ Posible causa: El taller puede haber sido cancelado o modificado. Te sugerimos explorar otros talleres.`;
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorMessage = `Error de conexión con el servidor. 

🌐 Solución: Verifica tu conexión a internet e intenta nuevamente. Si persiste, intenta más tarde.`;
      } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
        errorMessage = `Error interno del servidor. 

🔧 Estado: Nuestro equipo técnico ha sido notificado automáticamente. Intenta nuevamente en unos minutos.`;
      }
      
      setError(errorMessage);
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, [selectedWorkshop, user, onBookingSuccess]);

  // Cancelar reserva
  const cancelBooking = useCallback(() => {
    console.log('❌ [USE_BOOKING] Usuario canceló la reserva');
    setSelectedWorkshop(null);
    setError(null);
  }, []);

  // Limpiar mensajes
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Cerrar mensaje de éxito
  const closeSuccessMessage = useCallback(() => {
    setSuccess(null);
  }, []);

  return {
    // Estado
    selectedWorkshop,
    isLoading,
    error,
    success,
    
    // Acciones
    initiateBooking,
    confirmBooking,
    cancelBooking,
    clearMessages,
    closeSuccessMessage,
  };
};

// ================================
// HOOK PARA MANEJAR ESTADO DE RESERVAS DEL USUARIO
// ================================

export const useUserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user?.email) {
      console.log('ℹ️ [USER_BOOKINGS] No hay usuario autenticado');
      setBookings([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [USER_BOOKINGS] Cargando reservas para:', user.email);
      
      const userBookings = await bookingService.getUserBookings(user.email);
      setBookings(userBookings);
      console.log(`✅ [USER_BOOKINGS] ${userBookings.length} reservas cargadas`);
      
    } catch (err: any) {
      console.error('❌ [USER_BOOKINGS] Error:', err);
      
      if (err.message.includes('404')) {
        console.log('ℹ️ [USER_BOOKINGS] Usuario no tiene reservas');
        setBookings([]);
        setError(null);
      } else {
        setError(err.message || 'Error al cargar reservas');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const refreshBookings = useCallback(async () => {
    await loadBookings();
  }, [loadBookings]);

  // Auto-cargar reservas cuando cambie el usuario
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    loading,
    error,
    loadBookings,
    refreshBookings
  };
};

// ================================
// HOOK PARA VALIDACIONES DE RESERVAS
// ================================

export const useBookingValidation = () => {
  // Validar si se puede reservar un taller
  const canBookWorkshop = useCallback((workshop: Workshop, userEmail?: string): { canBook: boolean; reason?: string } => {
    if (!userEmail) {
      return { canBook: false, reason: 'Usuario no autenticado' };
    }

    if (workshop.current_participants >= workshop.max_participants) {
      return { canBook: false, reason: 'Sin cupos disponibles' };
    }

    try {
      const workshopDate = new Date(workshop.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (workshopDate < today) {
        return { canBook: false, reason: 'Taller ya finalizado' };
      }
    } catch (error) {
      console.warn('⚠️ Error validando fecha del taller:', error);
      // Permitir reserva si no se puede validar la fecha
    }

    return { canBook: true };
  }, []);

  // Validar si se puede cancelar una reserva
  const canCancelBooking = useCallback((booking: any): { canCancel: boolean; reason?: string } => {
    if (booking.status !== 'Confirmada') {
      return { canCancel: false, reason: 'Solo se pueden cancelar reservas confirmadas' };
    }

    if (booking.payment_status === 'Pagado') {
      return { canCancel: false, reason: 'No se pueden cancelar reservas pagadas' };
    }

    if (!booking.workshop?.date) {
      return { canCancel: false, reason: 'No se puede determinar la fecha del taller' };
    }

    try {
      const workshopDate = new Date(booking.workshop.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (workshopDate < today) {
        return { canCancel: false, reason: 'Taller ya finalizado' };
      }
      
      const oneWeekBefore = new Date();
      oneWeekBefore.setDate(oneWeekBefore.getDate() + 7);
      
      if (workshopDate <= oneWeekBefore) {
        return { canCancel: false, reason: 'Solo hasta una semana antes' };
      }
    } catch (error) {
      console.error('Error validando fecha para cancelación:', error);
      return { canCancel: false, reason: 'Error validando fecha' };
    }

    return { canCancel: true };
  }, []);

  // Validar si se puede pagar una reserva
  const canPayBooking = useCallback((booking: any): { canPay: boolean; reason?: string } => {
    if (booking.payment_status === 'Pagado') {
      return { canPay: false, reason: 'Ya está pagado' };
    }

    if (booking.status !== 'Confirmada') {
      return { canPay: false, reason: 'Solo reservas confirmadas' };
    }

    if (!booking.workshop?.date) {
      return { canPay: true }; // Permitir pago si no hay fecha
    }

    try {
      const workshopDate = new Date(booking.workshop.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (workshopDate < today) {
        return { canPay: false, reason: 'Taller ya finalizado' };
      }
    } catch (error) {
      console.warn('⚠️ Error validando fecha para pago:', error);
      // Permitir pago si no se puede validar la fecha
    }

    return { canPay: true };
  }, []);

  return {
    canBookWorkshop,
    canCancelBooking,
    canPayBooking
  };
};

// ================================
// HOOK PARA ESTADO DE CONEXIÓN
// ================================

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [CONNECTION] Conexión restaurada');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('🚫 [CONNECTION] Conexión perdida');
      setIsOnline(false);
      setHasBeenOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    hasBeenOffline,
    connectionStatus: isOnline ? 'online' : 'offline'
  };
};