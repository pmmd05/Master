// frontend/src/components/WorkshopsList.tsx
import React, { useState } from 'react';
import { useWorkshops } from '../context/WorkshopsContext';
import { useAuth } from '../context/AuthContext';
import WorkshopCard from './WorkshopCard';
import { Workshop } from '../types';
import { bookingService } from '../services/api';

const WorkshopsList: React.FC = () => {
  const { workshops, loading, error, refreshWorkshops } = useWorkshops();
  const { user } = useAuth();
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Manejar reserva de taller
  const handleBookWorkshop = async (workshop: Workshop) => {
    setBookingWorkshop(workshop);
    setBookingError(null);
    setBookingSuccess(null);
  };

  // Confirmar reserva
  const confirmBooking = async () => {
    if (!bookingWorkshop || !user) return;

    try {
      setBookingLoading(true);
      setBookingError(null);

      console.log('🎯 [BOOKING] Haciendo reserva:', {
        user_email: user.email,
        workshop_id: bookingWorkshop.id
      });

      const booking = await bookingService.createBooking({
        user_email: user.email,
        workshop_id: bookingWorkshop.id
      });

      console.log('✅ [BOOKING] Reserva exitosa:', booking);
      
      setBookingSuccess(`¡Reserva confirmada para "${bookingWorkshop.title}"!`);
      setBookingWorkshop(null);
      
      // Refrescar la lista de talleres
      setTimeout(async () => {
        try {
          await refreshWorkshops();
        } catch (error) {
          console.log('Error refrescando talleres, recargando página...');
          window.location.reload();
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ [BOOKING] Error en reserva:', error);
      setBookingError(error.message || 'Error al hacer la reserva');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancelar reserva
  const cancelBooking = () => {
    setBookingWorkshop(null);
    setBookingError(null);
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando talleres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">Error al cargar talleres</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay talleres disponibles</h3>
        <p className="text-gray-600">No se encontraron talleres que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <>
      {/* Lista de talleres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            onBook={handleBookWorkshop}
          />
        ))}
      </div>

      {/* Modal de confirmación de reserva */}
      {bookingWorkshop && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Confirmar Reserva
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  ¿Estás seguro de que quieres reservar el taller:
                </p>
                <p className="text-base font-semibold text-gray-900 mb-2">
                  "{bookingWorkshop.title}"
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Fecha: {new Date(bookingWorkshop.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Precio: {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(bookingWorkshop.price)}
                </p>
                
                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{bookingError}</p>
                  </div>
                )}
              </div>
              
              <div className="items-center px-4 py-3">
                <div className="flex gap-3">
                  <button
                    onClick={cancelBooking}
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Reservando...
                      </>
                    ) : (
                      'Confirmar Reserva'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {bookingSuccess}
          </div>
        </div>
      )}
    </>
  );
};

export default WorkshopsList;