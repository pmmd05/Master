// frontend/src/components/WorkshopsList.tsx - ACTUALIZADO SIN MODAL DE PAGO
import React, { useState } from 'react';
import { useWorkshops } from '../context/WorkshopsContext';
import { useAuth } from '../context/AuthContext';
import WorkshopCard from './WorkshopCard';
import { Workshop } from '../types';
import { bookingService } from '../services/api';
import './estilos/workshops.css';

const WorkshopsList: React.FC = () => {
  const { workshops, loading, error, refreshWorkshops } = useWorkshops();
  const { user } = useAuth();
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // Estado global para mensajes de todas las cards
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [globalMessageType, setGlobalMessageType] = useState<'success' | 'error'>('success');

  // Función para manejar mensajes globales desde las WorkshopCards
  const handleGlobalMessage = (message: string, type: 'success' | 'error') => {
    setGlobalMessage(message);
    setGlobalMessageType(type);
    
    // Auto-ocultar mensaje después de unos segundos
    setTimeout(() => {
      setGlobalMessage(null);
    }, type === 'success' ? 5000 : 7000);
  };

  // Función para cerrar el mensaje global manualmente
  const closeGlobalMessage = () => {
    setGlobalMessage(null);
  };

  // Función callback para cuando una card actualiza exitosamente
  const handleCardBookingSuccess = () => {
    // Refrescar la lista de talleres para actualizar current_participants
    console.log('🔄 [WORKSHOPS] Refrescando lista de talleres...');
    setTimeout(async () => {
      try {
        await refreshWorkshops();
        console.log('✅ [WORKSHOPS] Lista de talleres actualizada');
      } catch (refreshError) {
        console.error('⚠️ [WORKSHOPS] Error refrescando talleres:', refreshError);
      }
    }, 1000);
  };

  // Confirmar reserva (para el modal viejo, mantenemos por compatibilidad)
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
      <div className="workshops-loading">
        <div className="workshops-loading-content">
          <div className="workshops-loading-spinner"></div>
          <p className="workshops-loading-text">Cargando talleres disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workshops-error">
        <svg className="workshops-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="workshops-error-title">Error al cargar talleres</h3>
        <p className="workshops-error-message">No fue posible conectar con el servidor. No es que no haya talleres… es que el microservicio se fue a moler pimienta y no volvió</p>
        <div className="workshops-error-actions">
          <button
            onClick={() => window.location.reload()}
            className="workshops-error-button primary"
          >
            Reintentar
          </button>
          
        </div>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="workshops-empty">
        <svg className="workshops-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="workshops-empty-title">No hay talleres disponibles</h3>
        <p className="workshops-empty-message">No se encontraron talleres que coincidan con tu búsqueda.</p>
        <button
          onClick={() => window.location.href = '/debug'}
          className="workshops-empty-button"
        >
          Revisar en Panel Debug
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Lista de talleres */}
      <div className="workshops-grid">
        {workshops.map((workshop) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            onBookingSuccess={handleCardBookingSuccess}
            onMessage={handleGlobalMessage}
          />
        ))}
      </div>

      {/* Notificación de mensaje GLOBAL con estilos premium */}
      {globalMessage && (
        <div className={`fixed top-20 right-4 max-w-sm rounded-xl shadow-2xl z-50 transform transition-all duration-500 p-4 backdrop-filter backdrop-blur-lg border ${
          globalMessageType === 'success' 
            ? 'bg-green-500 bg-opacity-95 text-white border-green-400' 
            : 'bg-red-500 bg-opacity-95 text-white border-red-400'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {globalMessageType === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium whitespace-pre-line">{globalMessage}</p>
              {globalMessageType === 'success' && globalMessage.includes('confirmada') && (
                <div className="mt-3">
                  <button
                    onClick={() => window.location.href = '/bookings'}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 border border-white border-opacity-30"
                  >
                    Ver Mis Reservas →
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={closeGlobalMessage}
              className="ml-2 hover:opacity-75 transition-opacity duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de reserva PREMIUM (para compatibilidad con código viejo - pero ya no se usa) */}
      {bookingWorkshop && (
        <div className="booking-modal-overlay" onClick={(e) => e.target === e.currentTarget && cancelBooking()}>
          <div className="booking-modal-container">
            <div className="booking-modal-content">
              {/* Icono principal */}
              <div className="booking-modal-icon-container">
                <svg className="booking-modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Título */}
              <h3 className="booking-modal-title">
                Confirmar Reserva
              </h3>

              {/* Descripción */}
              <p className="booking-modal-description">
                ¿Estás seguro de que quieres reservar este increíble taller? 
                Tu cupo quedará asegurado inmediatamente.
              </p>

              {/* Card de información del taller */}
              <div className="booking-modal-workshop-card">
                <h4 className="booking-modal-workshop-title">
                  "{bookingWorkshop.title}"
                </h4>
                
                <div className="booking-modal-workshop-details">
                  <div className="booking-modal-workshop-detail">
                    <span className="booking-modal-workshop-detail-label">
                      📅 Fecha
                    </span>
                    <span className="booking-modal-workshop-detail-value">
                      {new Date(bookingWorkshop.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="booking-modal-workshop-detail">
                    <span className="booking-modal-workshop-detail-label">
                      💰 Precio
                    </span>
                    <span className="booking-modal-workshop-detail-value">
                      {new Intl.NumberFormat('es-GT', {
                        style: 'currency',
                        currency: 'GTQ'
                      }).format(bookingWorkshop.price)}
                    </span>
                  </div>

                  <div className="booking-modal-workshop-detail">
                    <span className="booking-modal-workshop-detail-label">
                      👥 Disponibilidad
                    </span>
                    <span className="booking-modal-workshop-detail-value">
                      {bookingWorkshop.current_participants}/{bookingWorkshop.max_participants} participantes
                    </span>
                  </div>
                </div>
              </div>

              {/* Error si existe */}
              {bookingError && (
                <div className="booking-modal-error">
                  <div className="booking-modal-error-content">
                    <svg className="booking-modal-error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="booking-modal-error-text">{bookingError}</p>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="booking-modal-info">
                <div className="booking-modal-info-content">
                  <svg className="booking-modal-info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="booking-modal-info-text">
                    💡 Después de reservar, el pago quedará pendiente. Podrás completarlo desde "Mis Reservas".
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="booking-modal-actions">
                <button
                  onClick={cancelBooking}
                  disabled={bookingLoading}
                  className="booking-modal-button cancel"
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmBooking}
                  disabled={bookingLoading}
                  className="booking-modal-button confirm"
                >
                  {bookingLoading ? (
                    <>
                      <div className="booking-modal-loading-spinner"></div>
                      Reservando...
                    </>
                  ) : (
                    <>
                      ✅ Confirmar Reserva
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito PREMIUM (para compatibilidad con código viejo) */}
      {bookingSuccess && (
        <div className="booking-success-notification">
          <div className="booking-success-content">
            <div className="booking-success-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="booking-success-text">
              <p className="booking-success-message">{bookingSuccess}</p>
              
              <div className="booking-success-actions">
                <button
                  onClick={() => window.location.href = '/bookings'}
                  className="booking-success-button primary"
                >
                  Ver Reservas
                </button>
                <button
                  onClick={closeSuccessNotification}
                  className="booking-success-button secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información útil al final */}
      <div className="workshops-info-section">
        <h3 className="workshops-info-title">
          ℹ️ Información sobre reservas
        </h3>
        <div className="text-sm leading-relaxed space-y-2">
          <p>• Al reservar, el cupo queda asegurado pero el pago queda pendiente</p>
          <p>• Puedes completar el pago desde la sección "Mis Reservas"</p>
          <p>• Las reservas se pueden cancelar hasta 24 horas antes del taller</p>
          <p>• Si tienes problemas, usa el <a href="/debug" className="link-primary">Panel de Debug</a></p>
        </div>
      </div>
    </>
  );
};

export default WorkshopsList;