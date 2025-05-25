// frontend/src/components/WorkshopCard.tsx - CON CONFIRMACIÓN INTEGRADA MODERNA OPTIMIZADA
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import './estilos/workshops.css';

interface Workshop {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  max_participants: number;
  current_participants: number;
  price: number;
}

interface Booking {
  id: number;
  user_email: string;
  workshop_id: number;
  status: "Confirmada" | "Cancelada" | "Completada";
  payment_status: "Pendiente" | "Pagado";
}

interface WorkshopCardProps {
  workshop: Workshop;
  onBookingSuccess?: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onBookingSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Estados para el flujo de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Formatear fecha corta
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear fecha completa para confirmación
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Calcular disponibilidad
  const availableSpots = workshop.max_participants - workshop.current_participants;
  const isFullyBooked = availableSpots <= 0;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;

  // Determinar categoría con emoji
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

  const categoryInfo = getCategoryInfo(workshop.category);

  // Verificar si la fecha ya pasó
  const isWorkshopPast = () => {
    const workshopDate = new Date(workshop.date);
    const today = new Date();
    return workshopDate < today;
  };

  const isPastWorkshop = isWorkshopPast();

  // Función para mostrar confirmación integrada
  const handleShowConfirmation = () => {
    const userEmail = user?.email || null;
    
    if (!user || !userEmail) {
      setMessage('Debes estar autenticado para hacer una reserva');
      setMessageType('error');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (isFullyBooked) {
      setMessage('Este taller ya no tiene cupos disponibles');
      setMessageType('error');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setShowConfirmation(true);
  };

  // Función para cancelar confirmación
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setMessage(null);
  };

  // Función principal para hacer la reserva
  const handleConfirmBooking = async () => {
    const userEmail = user?.email || null;
    
    if (!user || !userEmail) {
      setMessage('Error: Usuario no autenticado correctamente');
      setMessageType('error');
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);
      
      console.log('🎯 [WORKSHOP_CARD] Iniciando reserva:', {
        user: userEmail,
        workshop: workshop.title,
        workshop_id: workshop.id,
        userObject: user
      });

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const bookingData = {
        user_email: userEmail,
        workshop_id: workshop.id
      };

      console.log('📡 [WORKSHOP_CARD] Enviando solicitud:', bookingData);

      const response = await fetch('http://localhost:5004/api/v0/booking/reservar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const booking = await response.json();
      console.log('✅ [WORKSHOP_CARD] Reserva exitosa:', booking);

      const bookingWithEmail = {
        ...booking,
        user_email: userEmail
      };

      setCurrentBooking(bookingWithEmail);
      setShowConfirmation(false);
      setShowPaymentModal(true);

      if (onBookingSuccess) {
        setTimeout(onBookingSuccess, 1000);
      }

    } catch (error: any) {
      console.error('❌ [WORKSHOP_CARD] Error en reserva:', error);
      
      let errorMessage = 'Error desconocido al hacer la reserva';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('ya tienes una reserva')) {
        errorMessage = `Ya tienes una reserva para "${workshop.title}". Ve a "Mis Reservas" para verla.`;
      } else if (errorMessage.includes('401')) {
        errorMessage = 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'El taller ya no está disponible.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos minutos.';
      }

      setMessage(errorMessage);
      setMessageType('error');
      
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar "pagar más tarde"
  const handlePayLater = () => {
    setShowPaymentModal(false);
    setMessage(`¡Reserva confirmada para "${workshop.title}"! Puedes pagar más tarde desde "Mis Reservas".`);
    setMessageType('success');
    setTimeout(() => setMessage(null), 5000);
  };

  // Manejar cierre del modal de pago
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setMessage(`Reserva confirmada para "${workshop.title}". Puedes completar el pago desde "Mis Reservas".`);
    setMessageType('success');
    setTimeout(() => setMessage(null), 5000);
  };

  // Determinar clases CSS dinámicas
  const cardClasses = [
    'workshop-card',
    isPastWorkshop && 'opacity-75 grayscale',
    showConfirmation && 'workshop-card-expanded'
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Card Principal con confirmación integrada */}
      <div className={cardClasses}>
        
        {/* Header con indicador de estado */}
        <div className="workshop-card-header">
          {/* Categoría */}
          <div className="workshop-card-category">
            <span>{categoryInfo.emoji}</span>
            {workshop.category}
          </div>

          {/* Indicador de disponibilidad */}
          <div className="workshop-card-status-container">
            {isFullyBooked ? (
              <span className="workshop-card-status full">
                Agotado
              </span>
            ) : isAlmostFull ? (
              <span className="workshop-card-status almost-full">
                ¡Últimos cupos!
              </span>
            ) : (
              <span className="workshop-card-status available">
                Disponible
              </span>
            )}
          </div>
        </div>

        {/* Título del taller */}
        <h3 className="workshop-card-title">
          {workshop.title}
        </h3>

        {/* Descripción - Se oculta cuando se muestra confirmación */}
        {!showConfirmation && (
          <p className="workshop-card-description">
            {workshop.description}
          </p>
        )}

        {/* Información clave */}
        <div className="workshop-card-info">
          {/* Fecha */}
          <div className="workshop-card-info-item">
            <div className="workshop-card-info-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="workshop-card-info-content">
              <div className="workshop-card-info-main">
                {formatDate(workshop.date)}
              </div>
              {isPastWorkshop && (
                <div className="workshop-card-info-sub text-error">
                  Taller finalizado
                </div>
              )}
            </div>
          </div>

          {/* Participantes y Precio */}
          <div className="workshop-card-info-item">
            <div className="workshop-card-info-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="workshop-card-info-content">
              <div className="workshop-card-info-main">
                {workshop.current_participants}/{workshop.max_participants}
              </div>
              <div className="workshop-card-info-sub">
                {availableSpots} disponibles
              </div>
            </div>
            
            {/* Precio */}
            <div className="workshop-card-info-price">
              <div className="workshop-card-info-price-amount">
                {formatPrice(workshop.price)}
              </div>
              <div className="workshop-card-info-price-label">por persona</div>
            </div>
          </div>
        </div>

        {/* Sección de confirmación integrada */}
        {showConfirmation && (
          <div className="workshop-card-confirmation">
            <div className="workshop-card-confirmation-header">
              <div className="workshop-card-confirmation-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="workshop-card-confirmation-title">¿Deseas reservar este taller de cocina?</h4>
            </div>

            <div className="workshop-card-confirmation-details">
              <div className="workshop-card-confirmation-detail">
                <span className="workshop-card-confirmation-label">📅 Fecha:</span>
                <span className="workshop-card-confirmation-value">{formatFullDate(workshop.date)}</span>
              </div>
              <div className="workshop-card-confirmation-detail">
                <span className="workshop-card-confirmation-label">💰 Precio:</span>
                <span className="workshop-card-confirmation-value workshop-card-confirmation-price">{formatPrice(workshop.price)}</span>
              </div>
              <div className="workshop-card-confirmation-detail">
                <span className="workshop-card-confirmation-label">🏷️ Categoría:</span>
                <span className="workshop-card-confirmation-value">{workshop.category}</span>
              </div>
              <div className="workshop-card-confirmation-detail">
                <span className="workshop-card-confirmation-label">👥 Disponibles:</span>
                <span className="workshop-card-confirmation-value workshop-card-confirmation-available">{availableSpots} cupos</span>
              </div>
            </div>

            {/* Información sobre el pago */}
            <div className="workshop-card-confirmation-note">
              <div className="workshop-card-confirmation-note-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Después de confirmar, podrás elegir pagar ahora o más tarde</span>
            </div>

            {/* Mostrar error si existe */}
            {message && messageType === 'error' && (
              <div className="workshop-card-confirmation-error">
                <div className="workshop-card-confirmation-error-icon">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>{message}</p>
              </div>
            )}
          </div>
        )}

        {/* Barra de progreso - Se oculta cuando se muestra confirmación */}
        {!showConfirmation && (
          <div className="workshop-card-progress">
            <div className="workshop-card-progress-bar">
              <div 
                className={`workshop-card-progress-fill ${
                  isFullyBooked ? 'full' : 
                  isAlmostFull ? 'almost-full' : 
                  'available'
                }`}
                style={{ 
                  width: `${Math.min((workshop.current_participants / workshop.max_participants) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        {!showConfirmation ? (
          /* Botón de reserva normal */
          <button
            onClick={handleShowConfirmation}
            disabled={isFullyBooked || isLoading || isPastWorkshop}
            className={`workshop-card-button ${
              isFullyBooked || isPastWorkshop ? 'disabled' : 'primary'
            }`}
          >
            {isLoading ? (
              <div className="workshops-loading-content">
                <div className="workshops-loading-spinner"></div>
                Reservando...
              </div>
            ) : isFullyBooked ? (
              <>
                <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Sin Cupos
              </>
            ) : isPastWorkshop ? (
              <>
                <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Finalizado
              </>
            ) : (
              <>
                <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Reservar {formatPrice(workshop.price)}
              </>
            )}
          </button>
        ) : (
          /* Botones de confirmación */
          <div className="workshop-card-confirmation-buttons">
            <button
              onClick={handleCancelConfirmation}
              disabled={isLoading}
              className="workshop-card-button outline"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isLoading}
              className="workshop-card-button primary"
            >
              {isLoading ? (
                <div className="workshops-loading-content">
                  <div className="workshops-loading-spinner"></div>
                  Confirmando...
                </div>
              ) : (
                <>
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  ✨ Confirmar
                </>
              )}
            </button>
          </div>
        )}

        {/* ID del taller */}
        <div className="workshop-card-id">
          <span>ID: #{workshop.id}</span>
        </div>
      </div>

      {/* Modal de confirmación de pago */}
      {showPaymentModal && currentBooking && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          booking={{
            id: currentBooking.id,
            workshop_id: workshop.id,
            workshop_title: workshop.title,
            workshop_price: workshop.price,
            user_email: currentBooking.user_email || user?.email || ''
          }}
          onClose={handleClosePaymentModal}
          onPayLater={handlePayLater}
        />
      )}

      {/* Notificación de mensaje con estilos premium */}
      {message && (
        <div className={`fixed top-20 right-4 max-w-sm rounded-xl shadow-2xl z-50 transform transition-all duration-500 p-4 backdrop-filter backdrop-blur-lg border ${
          messageType === 'success' 
            ? 'bg-green-500 bg-opacity-95 text-white border-green-400' 
            : 'bg-red-500 bg-opacity-95 text-white border-red-400'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {messageType === 'success' ? (
                <svg className="icon-md" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="icon-md" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium whitespace-pre-line">{message}</p>
              {messageType === 'success' && message.includes('confirmada') && (
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
              onClick={() => setMessage(null)}
              className="ml-2 hover:opacity-75 transition-opacity duration-200"
            >
              <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkshopCard;