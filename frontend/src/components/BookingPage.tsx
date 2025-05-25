// frontend/src/components/BookingPage.tsx - COMPLETAMENTE REESCRITO CON NUEVOS ESTILOS
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { BookingsProvider, useBookings } from '../context/BookingsContext';
import BookingCard from './BookingCard';
import './styles/bookings.css'; // Nuevo estilo para la página de reservas
import { Booking, Workshop } from '../types';
import Navbar from './Navbar';
interface BookingWithWorkshop extends Booking {
  workshop?: Workshop;
}

const BookingsPageContent: React.FC = () => {
  const { user } = useAuth();
  const { bookings, loading, error, refreshBookings } = useBookings();
  const navigate = useNavigate(); 
  const [selectedBooking, setSelectedBooking] = useState<BookingWithWorkshop | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'past' | 'pending'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // ====================================================
  // FUNCIONES DE UTILIDAD Y CÁLCULOS
  // ====================================================

  // Filtrar reservas según el filtro seleccionado
  const filteredBookings = bookings.filter(booking => {
    const today = new Date();
    const workshopDate = booking.workshop?.date ? new Date(booking.workshop.date) : null;
    const isPast = workshopDate && workshopDate < today;

    switch (filter) {
      case 'active':
        return booking.status === 'Confirmada' && !isPast;
      case 'past':
        return isPast || booking.status === 'Completada';
      case 'pending':
        return booking.payment_status === 'Pendiente';
      default:
        return true;
    }
  });

  // Obtener estadísticas
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'Confirmada' && 
      (!b.workshop?.date || new Date(b.workshop.date) >= new Date())).length,
    completed: bookings.filter(b => b.status === 'Completada' || 
      (b.workshop?.date && new Date(b.workshop.date) < new Date())).length,
    pending: bookings.filter(b => b.payment_status === 'Pendiente').length
  };

  // ====================================================
  // MANEJADORES DE EVENTOS MEJORADOS
  // ====================================================

  //  Manejar pago con navegación corregida
  const handlePayment = (booking: BookingWithWorkshop) => {
    console.log('🔄 [BOOKINGS] Iniciando pago para reserva:', booking.id);
    
    if (!booking.workshop) {
      alert('No se pueden cargar los detalles del taller para procesar el pago');
      return;
    }
    
    //  NAVEGACIÓN CORREGIDA - '/payments' en lugar de '/PaymentPage'
    navigate('/payments', {
      state: {
        bookingId: booking.id,
        workshopId: booking.workshop_id,
        workshopTitle: booking.workshop.title,
        amount: booking.workshop.price,
        userEmail: booking.user_email,
        category: booking.workshop.category,
        date: booking.workshop.date,
        fromBookings: true // Para identificar que viene de reservas
      }
    });
  };

  // 🔥 Manejar cancelación con validaciones mejoradas
  const handleCancel = (booking: BookingWithWorkshop) => {
    console.log('🔍 [BOOKINGS] Verificando cancelación para reserva:', booking.id);
    
    // Verificar si se puede cancelar (reservas pagadas)
    if (booking.payment_status === 'Pagado') {
      alert('❌ No se pueden cancelar reservas que ya han sido pagadas.');
      return;
    }
    
    // Verificar fecha del taller
    if (!booking.workshop?.date) {
      alert('❌ No se puede determinar la fecha del taller.');
      return;
    }
    
    // Verificar tiempo restante (una semana antes)
    const workshopDate = new Date(booking.workshop.date);
    const oneWeekBefore = new Date();
    oneWeekBefore.setDate(oneWeekBefore.getDate() + 7);
    
    if (workshopDate <= oneWeekBefore) {
      alert('⏰ Solo se pueden cancelar reservas hasta una semana antes del taller.');
      return;
    }
    
    // Si todo está OK, mostrar modal de confirmación
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  // 🔥 Confirmar cancelación con manejo de errores
  const confirmCancel = async () => {
    if (!selectedBooking) return;
    
    setIsProcessing(true);
    
    try {
      console.log('🗑️ [BOOKINGS] Cancelando reserva:', selectedBooking.id);
      
      // 🔥 AQUÍ IMPLEMENTAR LA LLAMADA AL API REAL
      // const response = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });
      
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Error al cancelar la reserva');
      // }
      
      // 🔥 SIMULACIÓN TEMPORAL (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay
      
      console.log('✅ [BOOKINGS] Reserva cancelada exitosamente');
      alert(`✅ Reserva #${selectedBooking.id} cancelada exitosamente`);
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      await refreshBookings(); // Recargar las reservas
      
    } catch (error) {
      console.error('❌ [BOOKINGS] Error al cancelar reserva:', error);
      alert(`❌ Error al cancelar la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar ver detalles
  const handleViewDetails = (booking: BookingWithWorkshop) => {
    console.log('👁️ [BOOKINGS] Mostrando detalles de reserva:', booking.id);
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // ====================================================
  // RENDERIZADO CONDICIONAL
  // ====================================================

  // Estado de carga
  if (loading) {
    return (
      <div className="bookings-container">
        <div className="bookings-main-content">
          <div className="bookings-loading">
            <div className="bookings-loading-content">
              <div className="bookings-loading-spinner"></div>
              <p className="bookings-loading-text">Cargando tus reservas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bookings-container">
        <div className="bookings-main-content">
          <div className="bookings-error">
            <svg className="bookings-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="bookings-error-title">Error al cargar reservas</h3>
            <p className="bookings-error-message">
              Error al conectar con tus reservas. Todo estaba listo para reservar... pero el chef de los microservicios dijo 'Hoy no cocino'. Vuelve cuando recupere el ánimo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bookings-error-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDERIZADO PRINCIPAL
  // ====================================================

  return (
    <div className="bookings-container">
      
      {/* Header con nuevo diseño */}
      <div className="bookings-header">
        <div className="bookings-header-content">
          <h1 className="bookings-header-title">
            Mis Reservas
          </h1>
          <div className="bookings-header-actions">
            <div className="bookings-header-user-info">
              Hola, <span className="bookings-header-user-name">{user?.name}</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bookings-header-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="bookings-main-content">
        
        {/* Estadísticas con nuevo diseño */}
        <div className="bookings-stats">
          <div className="bookings-stat-card">
            <div className="bookings-stat-number total">{stats.total}</div>
            <div className="bookings-stat-label">Total Reservas</div>
          </div>
          <div className="bookings-stat-card">
            <div className="bookings-stat-number active">{stats.active}</div>
            <div className="bookings-stat-label">Activas</div>
          </div>
          <div className="bookings-stat-card">
            <div className="bookings-stat-number completed">{stats.completed}</div>
            <div className="bookings-stat-label">Completadas</div>
          </div>
          <div className="bookings-stat-card">
            <div className="bookings-stat-number pending">{stats.pending}</div>
            <div className="bookings-stat-label">Pago Pendiente</div>
          </div>
        </div>

        {/* Filtros con nuevo diseño */}
        <div className="bookings-filters">
          <div className="bookings-filters-header">
            <h3 className="bookings-filters-title">
              Filtrar Reservas
            </h3>
            <div className="bookings-filters-buttons">
              {[
                { key: 'all', label: 'Todas', count: stats.total },
                { key: 'active', label: 'Activas', count: stats.active },
                { key: 'pending', label: 'Pago Pendiente', count: stats.pending },
                { key: 'past', label: 'Pasadas', count: stats.completed }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`bookings-filter-button ${filter === key ? 'active' : ''}`}
                >
                  {label}
                  <span className="bookings-filter-count">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de reservas o estado vacío */}
        {filteredBookings.length === 0 ? (
          <div className="bookings-empty">
            <svg className="bookings-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {filter === 'all' ? (
              <>
                <h3 className="bookings-empty-title">
                  Aún no tienes reservas
                </h3>
                <p className="bookings-empty-message">
                  ¡Explora nuestros increíbles talleres de cocina y haz tu primera reserva!<br />
                  Tenemos talleres para todos los niveles y gustos culinarios.
                </p>
                <div className="bookings-empty-actions">
                  <button
                    onClick={() => navigate('/workshops')}
                    className="bookings-empty-button primary"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Explorar Talleres
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="bookings-empty-title">
                  No tienes reservas {
                    filter === 'active' ? 'activas' : 
                    filter === 'pending' ? 'con pago pendiente' : 
                    'pasadas'
                  }
                </h3>
                <p className="bookings-empty-message">
                  {filter === 'active' && 'Todas tus reservas activas aparecerán aquí.'}
                  {filter === 'pending' && 'Las reservas con pagos pendientes aparecerán aquí.'}
                  {filter === 'past' && 'Tu historial de talleres completados aparecerá aquí.'}
                </p>
                <div className="bookings-empty-actions">
                  <button
                    onClick={() => setFilter('all')}
                    className="bookings-empty-button secondary"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ver Todas las Reservas
                  </button>
                  <button
                    onClick={() => navigate('/workshops')}
                    className="bookings-empty-button primary"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Explorar Talleres
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPayment={handlePayment}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Información adicional con nuevo diseño */}
        <div className="bookings-info">
          <h3 className="bookings-info-title">
            Información sobre tus reservas
          </h3>
          <div className="bookings-info-list">
            <div className="bookings-info-item">
              Las reservas solo se pueden cancelar hasta una semana antes del taller
            </div>
            <div className="bookings-info-item">
              No se pueden cancelar reservas que ya han sido pagadas
            </div>
            <div className="bookings-info-item">
              Los pagos pendientes deben completarse antes de la fecha del taller
            </div>
            <div className="bookings-info-item">
              Recibirás un recordatorio por email 1 día antes de cada taller
            </div>
            <div className="bookings-info-item">
              Si tienes algún problema, contacta nuestro soporte
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          MODAL DE DETALLES ELEGANTE Y PROFESIONAL
          ======================================================= */}
      {showDetailsModal && selectedBooking && (
        <div className="booking-details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="booking-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-details-modal-header">
              <div className="booking-details-modal-info-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="booking-details-modal-header-content">
                <h3 className="booking-details-modal-title">
                  Detalles de la Reserva
                </h3>
                <p className="booking-details-modal-subtitle">
                  Reserva #{selectedBooking.id}
                </p>
              </div>
            </div>
            
            <div className="booking-details-modal-content">
              
              {/* Estado de la reserva */}
              <div className="booking-details-section">
                <h4 className="booking-details-section-title">Estado de la Reserva</h4>
                <div className="booking-details-list">
                  <div className="booking-details-item">
                    <span className="booking-details-item-label">Estado:</span>
                    <span className="booking-details-item-value">{selectedBooking.status}</span>
                  </div>
                  <div className="booking-details-item">
                    <span className="booking-details-item-label">Pago:</span>
                    <span className="booking-details-item-value">{selectedBooking.payment_status}</span>
                  </div>
                  <div className="booking-details-item">
                    <span className="booking-details-item-label">Email:</span>
                    <span className="booking-details-item-value">{selectedBooking.user_email}</span>
                  </div>
                </div>
              </div>

              {/* Información del taller */}
              {selectedBooking.workshop && (
                <div className="booking-details-section">
                  <h4 className="booking-details-section-title">Información del Taller</h4>
                  <div className="booking-details-list">
                    <div className="booking-details-item">
                      <span className="booking-details-item-label">Taller:</span>
                      <span className="booking-details-item-value">{selectedBooking.workshop.title}</span>
                    </div>
                    <div className="booking-details-item">
                      <span className="booking-details-item-label">Categoría:</span>
                      <span className="booking-details-item-value">{selectedBooking.workshop.category}</span>
                    </div>
                    <div className="booking-details-item">
                      <span className="booking-details-item-label">Fecha:</span>
                      <span className="booking-details-item-value">
                        {new Date(selectedBooking.workshop.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="booking-details-item">
                      <span className="booking-details-item-label">Precio:</span>
                      <span className="booking-details-item-value">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedBooking.workshop.price)}
                      </span>
                    </div>
                    <div className="booking-details-item">
                      <span className="booking-details-item-label">Participantes:</span>
                      <span className="booking-details-item-value">
                        {selectedBooking.workshop.current_participants}/{selectedBooking.workshop.max_participants}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDetailsModal(false)}
                className="booking-details-modal-close"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL DE CANCELACIÓN ELEGANTE Y PROFESIONAL
          ======================================================= */}
      {showCancelModal && selectedBooking && (
        <div className="booking-cancel-modal-overlay" onClick={() => !isProcessing && setShowCancelModal(false)}>
          <div className="booking-cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-cancel-modal-header">
              <div className="booking-cancel-modal-warning-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="booking-cancel-modal-header-content">
                <h3 className="booking-cancel-modal-title">
                  Cancelar Reserva
                </h3>
                <p className="booking-cancel-modal-subtitle">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <div className="booking-cancel-modal-content">
              
              {/* Información del taller a cancelar */}
              <div className="booking-cancel-modal-workshop-info">
                <h4 className="booking-cancel-modal-workshop-title">
                  Estás a punto de cancelar:
                </h4>
                <div className="booking-cancel-modal-workshop-details">
                  <div className="booking-cancel-modal-workshop-detail">
                    <span className="booking-cancel-modal-detail-label">Taller:</span>
                    <span className="booking-cancel-modal-detail-value">
                      {selectedBooking.workshop?.title || `Taller ${selectedBooking.workshop_id}`}
                    </span>
                  </div>
                  {selectedBooking.workshop && (
                    <>
                      <div className="booking-cancel-modal-workshop-detail">
                        <span className="booking-cancel-modal-detail-label">Fecha:</span>
                        <span className="booking-cancel-modal-detail-value">
                          {new Date(selectedBooking.workshop.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="booking-cancel-modal-workshop-detail">
                        <span className="booking-cancel-modal-detail-label">Precio:</span>
                        <span className="booking-cancel-modal-detail-value">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedBooking.workshop.price)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="booking-cancel-modal-workshop-detail">
                    <span className="booking-cancel-modal-detail-label">Reserva ID:</span>
                    <span className="booking-cancel-modal-detail-value">#{selectedBooking.id}</span>
                  </div>
                </div>
              </div>

              {/* Advertencia */}
              <div className="booking-cancel-modal-warning">
                <div className="booking-cancel-modal-warning-content">
                  <svg className="booking-cancel-modal-warning-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="booking-cancel-modal-warning-text">
                    <h5 className="booking-cancel-modal-warning-title">
                      ¿Estás seguro?
                    </h5>
                    <p className="booking-cancel-modal-warning-description">
                      Una vez cancelada, no podrás recuperar esta reserva. Tendrás que hacer una nueva reserva si cambias de opinión.
                    </p>
                  </div>
                </div>
              </div>

              <div className="booking-cancel-modal-actions">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isProcessing}
                  className="booking-cancel-modal-button keep"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No, mantener reserva
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isProcessing}
                  className="booking-cancel-modal-button confirm"
                >
                  {isProcessing ? (
                    <>
                      <div className="booking-loading-spinner-large" style={{width: '1rem', height: '1rem'}}></div>
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sí, cancelar reserva
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ====================================================
// COMPONENTE PRINCIPAL CON PROVEEDOR DE CONTEXTO
// ====================================================

const BookingsPage: React.FC = () => {
  return (
    <BookingsProvider>
      <BookingsPageContent />
    </BookingsProvider>
  );
};

export default BookingsPage;