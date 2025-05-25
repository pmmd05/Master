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
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Ir a pagar ahora
  const handlePayNow = () => {
    console.log('💳 [PAYMENT_MODAL] Usuario eligió pagar ahora');
    
    // Navegar a la página de pagos con los datos de la reserva
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
    onClose();
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-container">
        {/* Header con gradiente de éxito */}
        <div className="payment-modal-header">
          <div className="payment-modal-header-icon">
            <svg className="payment-modal-success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="payment-modal-header-content">
            <h3 className="payment-modal-title">¡Reserva Confirmada!</h3>
            <p className="payment-modal-subtitle">Tu cupo ha sido asegurado exitosamente</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="payment-modal-content">
          {/* Información de la reserva */}
          <div className="payment-modal-booking-info">
            <h4 className="payment-modal-section-title">Detalles de tu Reserva</h4>
            
            <div className="payment-modal-booking-card">
              <div className="payment-modal-booking-detail">
                <span className="payment-modal-detail-label">🍳 Taller:</span>
                <span className="payment-modal-detail-value">{booking.workshop_title}</span>
              </div>
              
              <div className="payment-modal-booking-detail">
                <span className="payment-modal-detail-label">📧 Participante:</span>
                <span className="payment-modal-detail-value">{booking.user_email}</span>
              </div>
              
              <div className="payment-modal-booking-detail">
                <span className="payment-modal-detail-label">#️⃣ Reserva:</span>
                <span className="payment-modal-detail-value">#{booking.id}</span>
              </div>
              
              <div className="payment-modal-booking-detail">
                <span className="payment-modal-detail-label">📊 Estado:</span>
                <span className="payment-modal-status-confirmed">✅ Confirmada</span>
              </div>
              
              <div className="payment-modal-booking-detail">
                <span className="payment-modal-detail-label">💳 Pago:</span>
                <span className="payment-modal-status-pending">⏰ Pendiente</span>
              </div>
              
              <div className="payment-modal-booking-detail payment-modal-price-detail">
                <span className="payment-modal-detail-label">💰 Total:</span>
                <span className="payment-modal-price-amount">{formatPrice(booking.workshop_price)}</span>
              </div>
            </div>
          </div>

          {/* Pregunta principal */}
          <div className="payment-modal-question">
            <div className="payment-modal-question-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="payment-modal-question-title">¿Deseas completar el pago ahora?</h4>
              <p className="payment-modal-question-subtitle">
                Puedes pagar ahora para confirmar completamente tu reserva, o hacerlo más tarde desde "Mis Reservas"
              </p>
            </div>
          </div>

          {/* Ventajas de pagar ahora */}
          <div className="payment-modal-benefits">
            <h5 className="payment-modal-benefits-title">✨ Ventajas de pagar ahora:</h5>
            <div className="payment-modal-benefits-grid">
              <div className="payment-modal-benefit">
                <svg className="payment-modal-benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Reserva 100% confirmada</span>
              </div>
              
              <div className="payment-modal-benefit">
                <svg className="payment-modal-benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Proceso rápido y seguro</span>
              </div>
              
              <div className="payment-modal-benefit">
                <svg className="payment-modal-benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                <span>Recibo inmediato por email</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="payment-modal-actions">
            <button
              onClick={handlePayNow}
              className="payment-modal-button payment-modal-button-primary"
            >
              <svg className="payment-modal-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Sí, Pagar Ahora - {formatPrice(booking.workshop_price)}
            </button>

            <button
              onClick={handlePayLater}
              className="payment-modal-button payment-modal-button-secondary"
            >
              <svg className="payment-modal-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar Más Tarde
            </button>
          </div>

          {/* Información adicional */}
          <div className="payment-modal-footer-info">
            <div className="payment-modal-footer-note">
              <svg className="payment-modal-footer-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>
                Si eliges pagar más tarde, podrás hacerlo desde{' '}
                <button
                  onClick={() => {
                    navigate('/bookings');
                    onClose();
                  }}
                  className="payment-modal-link"
                >
                  "Mis Reservas"
                </button>
                {' '}en cualquier momento antes del taller.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;