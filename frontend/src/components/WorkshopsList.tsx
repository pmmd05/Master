// frontend/src/components/WorkshopsList.tsx - VERSION MEJORADA
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


  // Confirmar reserva
  const confirmBooking = async () => {
    if (!bookingWorkshop || !user) {
      console.error('❌ [WORKSHOPS] No hay taller o usuario para reservar');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      console.log('🔄 [WORKSHOPS] Iniciando proceso de reserva...');
      console.log('📝 [WORKSHOPS] Datos de reserva:', {
        user_email: user.email,
        workshop_id: bookingWorkshop.id,
        workshop_title: bookingWorkshop.title
      });

      // Verificar que el usuario esté autenticado
      if (!user.email) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el taller tenga cupos
      if (bookingWorkshop.current_participants >= bookingWorkshop.max_participants) {
        throw new Error('No hay cupos disponibles para este taller');
      }

      // Crear la reserva
      const bookingData = {
        user_email: user.email,
        workshop_id: bookingWorkshop.id
      };

      console.log('📡 [WORKSHOPS] Enviando solicitud de reserva...');
      const booking = await bookingService.createBooking(bookingData);
      
      console.log('✅ [WORKSHOPS] Reserva creada exitosamente:', {
        booking_id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status
      });
      
      // Mostrar mensaje de éxito
      setBookingSuccess(`¡Reserva confirmada para "${bookingWorkshop.title}"!`);
      setBookingWorkshop(null);
      
      // Refrescar la lista de talleres para actualizar current_participants
      console.log('🔄 [WORKSHOPS] Refrescando lista de talleres...');
      setTimeout(async () => {
        try {
          await refreshWorkshops();
          console.log('✅ [WORKSHOPS] Lista de talleres actualizada');
        } catch (refreshError) {
          console.error('⚠️ [WORKSHOPS] Error refrescando talleres:', refreshError);
          // Si el refresh falla, al menos la reserva se creó
        }
      }, 1000);

      // Auto-ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setBookingSuccess(null);
      }, 5000);

    } catch (error: any) {
      console.error('❌ [WORKSHOPS] Error creando reserva:', error);
      
      // Mejorar mensajes de error
      let errorMessage = 'Error desconocido al hacer la reserva';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      // Mensajes más específicos
      if (errorMessage.includes('ya tienes una reserva')) {
        errorMessage = 'Ya tienes una reserva para este taller. Revisa tu sección "Mis Reservas".';
      } else if (errorMessage.includes('no encontrado') || errorMessage.includes('not found')) {
        errorMessage = 'El taller no está disponible en este momento.';
      } else if (errorMessage.includes('cupos') || errorMessage.includes('participants')) {
        errorMessage = 'No hay cupos disponibles para este taller.';
      } else if (errorMessage.includes('usuario') || errorMessage.includes('user')) {
        errorMessage = 'Problema con tu sesión de usuario. Intenta hacer login nuevamente.';
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      setBookingError(errorMessage);
      
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancelar reserva
  const cancelBooking = () => {
    console.log('❌ [WORKSHOPS] Usuario canceló la reserva');
    setBookingWorkshop(null);
    setBookingError(null);
  };

  // Cerrar notificación de éxito
  const closeSuccessNotification = () => {
    setBookingSuccess(null);
  };

  // Estados de carga y error del listado
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando talleres disponibles...</p>
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
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/debug'}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Panel Debug
          </button>
        </div>
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
        <p className="text-gray-600 mb-4">No se encontraron talleres que coincidan con tu búsqueda.</p>
        <button
          onClick={() => window.location.href = '/debug'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Revisar en Panel Debug
        </button>
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
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    "{bookingWorkshop.title}"
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    📅 {new Date(bookingWorkshop.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    💰 {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(bookingWorkshop.price)}
                  </p>
                  <p className="text-sm text-gray-600">
                    👥 {bookingWorkshop.current_participants}/{bookingWorkshop.max_participants} participantes
                  </p>
                </div>
                
                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600">{bookingError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-600">
                    💡 Después de reservar, el pago quedará pendiente. Podrás completarlo desde "Mis Reservas".
                  </p>
                </div>
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
                      '✅ Confirmar Reserva'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito (mejorada) */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{bookingSuccess}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => window.location.href = '/bookings'}
                  className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                >
                  Ver Reservas
                </button>
                <button
                  onClick={closeSuccessNotification}
                  className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información útil al final */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">
          ℹ️ Información sobre reservas
        </h3>
        <div className="text-indigo-700 space-y-1 text-sm">
          <p>• Al reservar, el cupo queda asegurado pero el pago queda pendiente</p>
          <p>• Puedes completar el pago desde la sección "Mis Reservas"</p>
          <p>• Las reservas se pueden cancelar hasta 24 horas antes del taller</p>
          <p>• Si tienes problemas, usa el <a href="/debug" className="underline font-medium">Panel de Debug</a></p>
        </div>
      </div>
    </>
  );
};

export default WorkshopsList;