// frontend/src/components/BookingCard.tsx - COMPLETAMENTE REESCRITO CON NUEVOS ESTILOS
import React from 'react';
import { Booking, Workshop } from '../types';

interface BookingWithWorkshop extends Booking {
  workshop?: Workshop;
}

interface BookingCardProps {
  booking: BookingWithWorkshop;
  onPayment?: (booking: BookingWithWorkshop) => void;
  onCancel?: (booking: BookingWithWorkshop) => void;
  onViewDetails?: (booking: BookingWithWorkshop) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onPayment, 
  onCancel, 
  onViewDetails 
}) => {
  
  // ====================================================
  // FUNCIONES DE UTILIDAD
  // ====================================================
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Determinar info del estado de la reserva
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'Confirmada': { 
        icon: '✅',
        className: 'confirmed'
      },
      'Cancelada': { 
        icon: '❌',
        className: 'cancelled'
      },
      'Completada': { 
        icon: '🎉',
        className: 'completed'
      }
    };
    return statusMap[status as keyof typeof statusMap] || { 
      icon: '⏳',
      className: 'pending'
    };
  };

  // Determinar info del estado de pago
  const getPaymentStatusInfo = (paymentStatus: string) => {
    const paymentMap = {
      'Pendiente': { 
        icon: '⏰',
        className: 'pending'
      },
      'Pagado': { 
        icon: '💳',
        className: 'paid'
      }
    };
    return paymentMap[paymentStatus as keyof typeof paymentMap] || { 
      icon: '❓',
      className: 'pending'
    };
  };

  // Determinar info de la categoría
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { emoji: string } } = {
      'Italiana': { emoji: '🍝' },
      'Panadería': { emoji: '🥖' },
      'Repostería': { emoji: '🧁' },
      'Japonesa': { emoji: '🍣' },
      'Vegana': { emoji: '🥬' },
      'Mexicana': { emoji: '🌮' },
      'Francesa': { emoji: '🥐' },
      'Española': { emoji: '🥘' },
      'Barbacoa': { emoji: '🔥' },
      'Tailandesa': { emoji: '🍜' },
      'Bebidas': { emoji: '🥤' }
    };
    return categories[category] || { emoji: '🍽️' };
  };

  // Verificar si el taller ya pasó
  const isWorkshopPast = () => {
    if (!booking.workshop?.date) return false;
    const workshopDate = new Date(booking.workshop.date);
    const today = new Date();
    return workshopDate < today;
  };

  // 🔥 FUNCIÓN MEJORADA PARA VERIFICAR SI SE PUEDE CANCELAR
  const canCancel = () => {
    // No se puede cancelar si no está confirmada
    if (booking.status !== 'Confirmada') return false;
    
    // 🔥 NO se pueden cancelar reservas pagadas
    if (booking.payment_status === 'Pagado') return false;
    
    // No se puede cancelar si no hay fecha del taller
    if (!booking.workshop?.date) return false;
    
    // No se puede cancelar talleres ya finalizados
    const workshopDate = new Date(booking.workshop.date);
    const today = new Date();
    if (workshopDate < today) return false;
    
    // 🔥 Solo se puede cancelar hasta UNA SEMANA ANTES
    const oneWeekBefore = new Date();
    oneWeekBefore.setDate(oneWeekBefore.getDate() + 7);
    
    return workshopDate > oneWeekBefore;
  };

  // Estados calculados
  const isPastWorkshop = isWorkshopPast();
  const statusInfo = getStatusInfo(booking.status);
  const paymentInfo = getPaymentStatusInfo(booking.payment_status);
  const categoryInfo = booking.workshop ? getCategoryInfo(booking.workshop.category) : null;
  
  const canPay = booking.payment_status === 'Pendiente' && booking.status === 'Confirmada' && !isPastWorkshop;
  const canCancelBooking = canCancel();

  // ====================================================
  // RENDER DEL COMPONENTE
  // ====================================================

  return (
    <div className={`booking-card ${isPastWorkshop ? 'past' : ''} ${booking.status === 'Cancelada' ? 'cancelled' : ''}`}>
      
      {/* Header con badges de estado */}
      <div className="booking-card-header">
        <div className="booking-card-badges">
          <span className={`booking-card-badge ${statusInfo.className}`}>
            <span>{statusInfo.icon}</span>
            {booking.status}
          </span>
          <span className={`booking-card-badge ${paymentInfo.className}`}>
            <span>{paymentInfo.icon}</span>
            {booking.payment_status}
          </span>
        </div>
        <div className="booking-card-id">
          ID: #{booking.id}
        </div>
      </div>

      {/* Información del taller */}
      {booking.workshop ? (
        <div className="booking-card-workshop-info">
          
          {/* Categoría */}
          {categoryInfo && (
            <div className="booking-card-category">
              <span className="booking-card-category-emoji">{categoryInfo.emoji}</span>
              {booking.workshop.category}
            </div>
          )}

          {/* Título del taller */}
          <h3 className="booking-card-title">
            {booking.workshop.title}
          </h3>

          {/* Descripción */}
          <p className="booking-card-description">
            {booking.workshop.description}
          </p>

          {/* Detalles del taller */}
          <div className="booking-card-details">
            
            {/* Fecha del taller */}
            <div className={`booking-card-detail-item ${isPastWorkshop ? 'past' : ''}`}>
              <div className="booking-card-detail-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="booking-card-detail-content">
                <div className="booking-card-detail-main">
                  {formatDate(booking.workshop.date)}
                </div>
                {isPastWorkshop ? (
                  <div className="booking-card-detail-sub">
                    Taller finalizado
                  </div>
                ) : (
                  <div className="booking-card-detail-sub">
                    Próximo taller
                  </div>
                )}
              </div>
            </div>

            {/* Participantes */}
            <div className="booking-card-detail-item">
              <div className="booking-card-detail-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="booking-card-detail-content">
                <div className="booking-card-detail-main">
                  {booking.workshop.current_participants}/{booking.workshop.max_participants} participantes
                </div>
                <div className="booking-card-detail-sub">
                  Grupo reducido para mejor aprendizaje
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="booking-card-detail-item">
              <div className="booking-card-detail-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="booking-card-detail-content">
                <div className="booking-card-detail-main">
                  Precio del taller
                </div>
                <div className="booking-card-detail-sub">
                  Incluye materiales
                </div>
              </div>
              <div className="booking-card-detail-price">
                <div className="booking-card-detail-price-amount">
                  {formatPrice(booking.workshop.price)}
                </div>
                <div className="booking-card-detail-price-label">
                  precio total
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Información mínima cuando no se pudo cargar el taller */
        <div className="booking-card-workshop-info">
          <h3 className="booking-card-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Taller ID: {booking.workshop_id}
          </h3>
          <p className="booking-card-description">
            No se pudieron cargar los detalles del taller. Contacta soporte si persiste el problema.
          </p>
        </div>
      )}

      {/* Alertas contextuales */}
      {canPay && (
        <div className="booking-card-alert payment-reminder">
          <svg className="booking-card-alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Recuerda completar tu pago antes del taller
        </div>
      )}

      {isPastWorkshop && booking.status === 'Confirmada' && (
        <div className="booking-card-alert workshop-finished">
          <svg className="booking-card-alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Este taller ya ha terminado
        </div>
      )}

      {booking.payment_status === 'Pagado' && (
        <div className="booking-card-alert payment-confirmed">
          <svg className="booking-card-alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Pago confirmado y procesado
        </div>
      )}

      {/* Acciones */}
      <div className="booking-card-actions">
        
        {/* Botón de pago destacado (si está pendiente) */}
        {canPay && (
          <button
            onClick={() => onPayment && onPayment(booking)}
            className="booking-card-primary-action pay"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pagar Ahora - {booking.workshop && formatPrice(booking.workshop.price)}
          </button>
        )}

        {/* Botones secundarios */}
        <div className="booking-card-secondary-actions">
          
          {/* Botón ver detalles */}
          <button
            onClick={() => onViewDetails && onViewDetails(booking)}
            className="booking-card-secondary-button view"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Detalles
          </button>

          {/* Botón cancelar (con lógica mejorada) */}
          {canCancelBooking ? (
            <button
              onClick={() => onCancel && onCancel(booking)}
              className="booking-card-secondary-button cancel"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          ) : (
            <div className="booking-card-secondary-button disabled">
              {booking.status === 'Cancelada' ? (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelada
                </>
              ) : booking.status === 'Completada' ? (
                <>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completada
                </>
              ) : isPastWorkshop ? (
                <>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Finalizada
                </>
              ) : booking.payment_status === 'Pagado' ? (
                <>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  No cancelable (Pagado)
                </>
              ) : (
                <>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Muy próximo
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer con información de contacto */}
      <div className="booking-card-footer">
        <div className="booking-card-contact-info">
          <span className="booking-card-contact-label">Email de contacto:</span>
          <span className="booking-card-contact-value">{booking.user_email}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;