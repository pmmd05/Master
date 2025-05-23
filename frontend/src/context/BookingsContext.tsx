// frontend/src/context/BookingsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  loadBookings: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  cancelBooking?: (bookingId: number) => Promise<void>;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

interface BookingsProviderProps {
  children: ReactNode;
}

export const BookingsProvider: React.FC<BookingsProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<BookingWithWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cargar reservas del usuario autenticado
  const loadBookings = async () => {
    if (!user?.email) {
      console.log('ℹ️ [BOOKINGS] No hay usuario autenticado');
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [BOOKINGS] Cargando reservas para usuario:', user.email);
      
      // Obtener reservas del usuario autenticado actual
      const userBookings = await bookingService.getUserBookings(user.email);
      console.log(`✅ [BOOKINGS] ${userBookings.length} reservas encontradas para ${user.email}`);

      if (userBookings.length === 0) {
        console.log('ℹ️ [BOOKINGS] Usuario no tiene reservas aún');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Obtener detalles de los talleres para cada reserva
      const bookingsWithWorkshops: BookingWithWorkshop[] = [];
      
      // Obtener todos los talleres una sola vez para optimizar
      const allWorkshops = await workshopsService.getAllWorkshops();
      console.log(`📚 [BOOKINGS] ${allWorkshops.length} talleres disponibles para matching`);
      
      for (const booking of userBookings) {
        try {
          console.log(`🔍 [BOOKINGS] Procesando reserva #${booking.id} para taller ${booking.workshop_id}`);
          
          // Buscar el taller correspondiente
          const workshop = allWorkshops.find(w => w.id === booking.workshop_id);
          
          if (workshop) {
            console.log(`✅ [BOOKINGS] Taller encontrado: "${workshop.title}"`);
          } else {
            console.warn(`⚠️ [BOOKINGS] Taller ${booking.workshop_id} no encontrado en talleres activos`);
          }
          
          bookingsWithWorkshops.push({
            ...booking,
            workshop: workshop
          });
        } catch (workshopError) {
          console.error(`❌ [BOOKINGS] Error procesando taller ${booking.workshop_id}:`, workshopError);
          // Agregar la reserva sin los detalles del taller
          bookingsWithWorkshops.push(booking);
        }
      }

      setBookings(bookingsWithWorkshops);
      console.log(`✅ [BOOKINGS] ${bookingsWithWorkshops.length} reservas cargadas con detalles para ${user.email}`);
      
    } catch (err: any) {
      console.error('❌ [BOOKINGS] Error cargando reservas:', err);
      
      // Manejar errores específicos
      if (err.message.includes('404') || err.message.includes('not found')) {
        console.log('ℹ️ [BOOKINGS] Usuario no tiene reservas (404)');
        setBookings([]);
        setError(null); // No es un error real, solo no tiene reservas
      } else {
        setError(err.message || 'Error al cargar las reservas');
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Refrescar reservas
  const refreshBookings = async () => {
    await loadBookings();
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    if (user?.email) {
      loadBookings();
    }
  }, [user?.email]);

  const value: BookingsContextType = {
    bookings,
    loading,
    error,
    loadBookings,
    refreshBookings,
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useBookings = (): BookingsContextType => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings debe ser usado dentro de un BookingsProvider');
  }
  return context;
};