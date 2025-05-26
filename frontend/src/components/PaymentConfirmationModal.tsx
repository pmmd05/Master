import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  booking: {
    id: number;
    workshop_id: number;
    workshop_title: string;
    workshop_price: number;
    user_email: string;
  };
  onClose: () => void;
  onPayLater: () => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  booking,
  onClose,
  onPayLater
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(price);
  };

  // Ir a pagar ahora
  const handlePayNow = () => {
    console.log('💳 [PAYMENT_MODAL] Usuario eligió pagar ahora');
    
    navigate('/payment', {
      state: {
        bookingId: booking.id,
        workshopId: booking.workshop_id,
        workshopTitle: booking.workshop_title,
        amount: booking.workshop_price,
        userEmail: booking.user_email
      }
    });
    
    onClose();
  };

  // Pagar más tarde
  const handlePayLater = () => {
    console.log('⏰ [PAYMENT_MODAL] Usuario eligió pagar más tarde');
    onPayLater();
  };

  return (
    <div className="simple-payment-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="simple-payment-modal">
        {/* Header con ícono de éxito pequeño */}
        <div className="simple-payment-modal-header">
          <div className="simple-payment-modal-success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="simple-payment-modal-header-text">
            <h3 className="simple-payment-modal-title">¡Reserva Confirmada!</h3>
            <p className="simple-payment-modal-subtitle">Tu lugar está asegurado</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="simple-payment-modal-content">
          {/* Información básica */}
          <div className="simple-payment-modal-info">
            <div className="simple-payment-modal-workshop">
              <span className="simple-payment-modal-label">🍳 Taller:</span>
              <span className="simple-payment-modal-value">{booking.workshop_title}</span>
            </div>
            <div className="simple-payment-modal-price">
              <span className="simple-payment-modal-label">💰 Total:</span>
              <span className="simple-payment-modal-price-value">{formatPrice(booking.workshop_price)}</span>
            </div>
          </div>

          {/* Pregunta principal */}
          <div className="simple-payment-modal-question">
            <p>¿Deseas completar el pago ahora?</p>
            <small>También puedes pagarlo más tarde desde "Mis Reservas"</small>
          </div>

          {/* Botones de acción */}
          <div className="simple-payment-modal-actions">
            <button
              onClick={handlePayLater}
              className="simple-payment-modal-button simple-payment-modal-button-secondary"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar más tarde
            </button>
            <button
              onClick={handlePayNow}
              className="simple-payment-modal-button simple-payment-modal-button-primary"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagar ahora
            </button>
          </div>

          {/* Información adicional pequeña */}
          <div className="simple-payment-modal-footer">
            <p>
              💡 Al pagar ahora tu reserva queda 100% confirmada. Si pagas más tarde, 
              puedes hacerlo desde <strong>"Mis Reservas"</strong> en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;