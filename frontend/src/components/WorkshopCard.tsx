// frontend/src/components/WorkshopCard.tsx - CON CONFIRMACIÓN DE PAGO INTEGRADA
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

interface WorkshopCardProps {
  workshop: Workshop;
  onBookingSuccess?: () => void;
  onMessage?: (message: string, type: 'success' | 'error') => void;
  autoRefresh?: boolean; // 🆕 Nueva prop opcional
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ 
  workshop, 
  onBookingSuccess, 
  onMessage,
  autoRefresh = false // 🆕 Por defecto false (sin refresh)
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  // Estilos inline para el botón (FIX TEMPORAL)
  const buttonStyles = {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    minHeight: '44px',
    lineHeight: '1.2'
  };

  const buttonConfirmationStyles = {
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '600',
    minHeight: '38px',
    lineHeight: '1.2'
  };

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

  // Función para mostrar confirmación de reserva
  const handleShowConfirmation = () => {
    const userEmail = user?.email || null;
    
    if (!user || !userEmail) {
      onMessage?.('Debes estar autenticado para hacer una reserva', 'error');
      return;
    }

    if (isFullyBooked) {
      onMessage?.('Este taller ya no tiene cupos disponibles', 'error');
      return;
    }

    setShowConfirmation(true);
    setShowPaymentChoice(false);
    setLocalError(null);
  };

  // Función para cancelar confirmación
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setShowPaymentChoice(false);
    setLocalError(null);
  };

  // Función principal para hacer la reserva
  const handleConfirmBooking = async () => {
    const userEmail = user?.email || null;
    
    if (!user || !userEmail) {
      setLocalError('Error: Usuario no autenticado correctamente');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      
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

      // Guardar información de la reserva
      setCurrentBooking({
        id: booking.id,
        workshop_id: workshop.id,
        workshop_title: workshop.title,
        workshop_price: workshop.price,
        user_email: userEmail
      });

      // Cambiar a mostrar la elección de pago
      setShowConfirmation(false);
      setShowPaymentChoice(true);

      // Refrescar la lista después de un tiempo
      

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
      } else if (errorMessage.includes('500')|| errorMessage.includes('failed to fetch')) {
        errorMessage = 'Error del servidor. Pronto podremos encender el horno para ti. Intenta nuevamente en unos minutos';
      }

      setLocalError(errorMessage);
      
      
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar "pagar ahora"
  const handlePayNow = () => {
  console.log('💳 [WORKSHOP_CARD] Usuario eligió pagar ahora');
  
  if (!currentBooking) {
    onMessage?.('Error: No se encontraron los datos de la reserva', 'error');
    return;
  }
  
  // Navegar a la página de pagos con los datos de la reserva
  navigate('/payment', {
    state: {
      bookingId: currentBooking.id,
      workshopId: currentBooking.workshop_id,
      workshopTitle: currentBooking.workshop_title,
      amount: currentBooking.workshop_price,
      userEmail: currentBooking.user_email
    }
  });
  
  // ❌ NO refrescar aquí - solo cerrar modal
  setShowPaymentChoice(false);
};

// 4. También modificar handleClosePaymentModal para que NO refresque:
const handleClosePaymentModal = () => {
  console.log('❌ [WORKSHOP_CARD] Usuario cerró el modal de pago');
  setShowPaymentChoice(false);
  
  // Mostrar mensaje informativo
  onMessage?.(`Reserva confirmada para "${workshop.title}". Recuerda completar el pago antes del taller desde "Mis Reservas".`, 'success');
  
  // ❌ REMOVER: No refrescar cuando cierra el modal manualmente
  // if (onBookingSuccess) {
  //   onBookingSuccess();
  // }
};

  // Manejar "pagar más tarde"
  const handlePayLater = () => {
  console.log('⏰ [WORKSHOP_CARD] Usuario eligió pagar más tarde');
  setShowPaymentChoice(false);
  
  // Mostrar mensaje de éxito
  onMessage?.(`¡Reserva confirmada para "${workshop.title}"! Puedes completar el pago desde "Mis Reservas" cuando gustes.`, 'success');
  
  // 🆕 AGREGAR: Refrescar solo cuando el usuario elige pagar más tarde
  if (onBookingSuccess) {
    setTimeout(onBookingSuccess, 1000);
  }
};

  // Nueva función para cerrar manualmente la confirmación de pago
  const handleClosePaymentChoice = () => {
    setShowPaymentChoice(false);
    setShowConfirmation(false);
    setCurrentBooking(null);
  };

  // Determinar clases CSS dinámicas
  const cardClasses = [
    'workshop-card',
    isPastWorkshop && 'opacity-75 grayscale',
    (showConfirmation || showPaymentChoice) && 'workshop-card-expanded'
  ].filter(Boolean).join(' ');

  return (
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
      {!showConfirmation && !showPaymentChoice && (
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

      {/* Sección de confirmación de reserva integrada */}
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

          {/* Mostrar error LOCAL si existe */}
          {localError && (
            <div className="workshop-card-confirmation-error">
              <div className="workshop-card-confirmation-error-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p>{localError}</p>
            </div>
          )}
        </div>
      )}

      {/* 🆕 NUEVA SECCIÓN: Confirmación de pago integrada */}
      {showPaymentChoice && currentBooking && (
        <div className="workshop-card-payment-choice">
          {/* Header más moderno */}
          <div className="workshop-card-payment-header">
            <div className="workshop-card-payment-success-badge">
              <svg 
                className="icon-sm" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ width: '1rem', height: '1rem', flexShrink: 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>¡Reserva Confirmada!</span>
            </div>
            
          </div>

          {/* Información del taller en formato compacto */}
          <div className="workshop-card-payment-summary">
            <div className="workshop-card-payment-workshop-info">
              <h5 className="workshop-card-payment-workshop-title">{currentBooking.workshop_title}</h5>
              <div className="workshop-card-payment-price-display">{formatPrice(currentBooking.workshop_price)}</div>
            </div>
            <div className="workshop-card-payment-status">
              <span className="workshop-card-payment-confirmed">✅ Confirmada</span>
              <span className="workshop-card-payment-pending">⏰ Pago pendiente</span>
            </div>
          </div>

          {/* Pregunta principal más moderna */}
          <div className="workshop-card-payment-question">
            <h4>¿Completar el pago ahora?</h4>
            <p>Puedes pagar ahora o hacerlo más tarde desde "Mis Reservas"</p>
          </div>

          {/* Botones usando los estilos existentes de la card */}
          <div className="workshop-card-payment-actions">
            <button
              onClick={handlePayLater}
              className="workshop-card-button outline"
              style={buttonConfirmationStyles}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar más tarde
            </button>
            <button
              onClick={handlePayNow}
              className="workshop-card-button primary"
              style={buttonConfirmationStyles}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagar ahora
            </button>
          </div>

          {/* Información adicional más sutil */}
          <div className="workshop-card-confirmation-note">
            <div className="workshop-card-confirmation-note-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Tu lugar está asegurado, pero recuerda pagar antes de iniciar el taller</span>
          </div>
        </div>
      )}

      {/* Barra de progreso - Se oculta cuando se muestra confirmación */}
      {!showConfirmation && !showPaymentChoice && (
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
      {!showConfirmation && !showPaymentChoice ? (
        /* Botón de reserva normal CON ESTILO INLINE */
        <button
          onClick={handleShowConfirmation}
          disabled={isFullyBooked || isLoading || isPastWorkshop}
          className={`workshop-card-button ${
            isFullyBooked || isPastWorkshop ? 'disabled' : 'primary'
          }`}
          style={buttonStyles}
        >
          {isLoading ? (
            <div className="workshops-loading-content">
              <div className="workshops-loading-spinner"></div>
              Reservando...
            </div>
          ) : isFullyBooked ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Sin Cupos
            </>
          ) : isPastWorkshop ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Finalizado
            </>
          ) : (
            <>
               <svg 
                className="icon-sm" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ width: '1rem', height: '1rem', flexShrink: 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Reservar {formatPrice(workshop.price)}
            </>
          )}
        </button>
      ) : showConfirmation ? (
        /* Botones de confirmación de reserva CON ESTILO INLINE */
        <div className="workshop-card-confirmation-buttons">
          <button
            onClick={handleCancelConfirmation}
            disabled={isLoading}
            className="workshop-card-button outline"
            style={buttonConfirmationStyles}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={isLoading}
            className="workshop-card-button primary"
            style={buttonConfirmationStyles}
            type="button"
          >
            {isLoading ? (
              <div className="workshops-loading-content">
                <div className="workshops-loading-spinner"></div>
                Confirmando...
              </div>
            ) : (
              <>
                <svg className="workshop-card-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                ✨ Confirmar
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* ID del taller */}
      <div className="workshop-card-id">
        <span>ID: #{workshop.id}</span>
      </div>
    </div>
  );
};

export default WorkshopCard;