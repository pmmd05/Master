// frontend/src/hooks/useBooking.ts
import { useState, useCallback } from 'react';
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

  // Iniciar proceso de reserva
  const initiateBooking = useCallback((workshop: Workshop) => {
    console.log('🎯 [USE_BOOKING] Iniciando reserva para:', workshop.title);
    setSelectedWorkshop(workshop);
    setError(null);
    setSuccess(null);
  }, []);

  // Confirmar la reserva
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

      // Validaciones previas
      if (!user.email) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      if (selectedWorkshop.current_participants >= selectedWorkshop.max_participants) {
        throw new Error('Este taller ya no tiene cupos disponibles.');
      }

      // Verificar que la fecha no haya pasado
      const workshopDate = new Date(selectedWorkshop.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (workshopDate < today) {
        throw new Error('No se puede reservar un taller que ya ha finalizado.');
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
      
      // Mensaje de éxito personalizado
      const successMessage = `🎉 ¡Reserva confirmada!
      
Taller: "${selectedWorkshop.title}"
Estado: ${booking.status}
Pago: ${booking.payment_status}

Puedes gestionar tu reserva desde "Mis Reservas".`;

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

      // Auto-ocultar mensaje después de 7 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 7000);

      return true;

    } catch (error: any) {
      console.error('❌ [USE_BOOKING] Error creando reserva:', error);
      
      // Mejorar y personalizar mensajes de error
      let errorMessage = 'Error desconocido al procesar la reserva. Intenta nuevamente.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mensajes más específicos y útiles
      if (errorMessage.includes('ya tienes una reserva') || errorMessage.includes('UNIQUE constraint')) {
        errorMessage = `Ya tienes una reserva para "${selectedWorkshop.title}". 
        
Revisa tu sección "Mis Reservas" para gestionar esta reserva.`;
      } else if (errorMessage.includes('Usuario no encontrado') || errorMessage.includes('not found')) {
        errorMessage = `Tu sesión de usuario no es válida. 
        
Por favor, cierra sesión e inicia sesión nuevamente.`;
      } else if (errorMessage.includes('cupos') || errorMessage.includes('participants')) {
        errorMessage = `"${selectedWorkshop.title}" ya no tiene cupos disponibles. 
        
El taller se llenó mientras procesábamos tu solicitud.`;
      } else if (errorMessage.includes('Taller no encontrado')) {
        errorMessage = `El taller "${selectedWorkshop.title}" ya no está disponible. 
        
Puede haber sido cancelado o modificado.`;
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorMessage = `Error de conexión con el servidor. 
        
Verifica tu conexión a internet e intenta nuevamente.`;
      } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
        errorMessage = `Error interno del servidor. 
        
Nuestro equipo técnico ha sido notificado. Intenta nuevamente en unos minutos.`;
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

// Hook adicional para manejar el estado de reservas del usuario
export const useUserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user?.email) {
      console.log('ℹ️ [USER_BOOKINGS] No hay usuario autenticado');
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

  return {
    bookings,
    loading,
    error,
    loadBookings,
    refreshBookings
  };
};