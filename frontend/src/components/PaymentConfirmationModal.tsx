
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-lg p-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center">¡Reserva Confirmada!</h3>
          <p className="text-green-100 text-center text-sm mt-1">
            Tu cupo ha sido asegurado
          </p>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Información de la reserva */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Detalles de tu Reserva</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taller:</span>
                <span className="font-medium text-gray-900">{booking.workshop_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reserva #:</span>
                <span className="font-medium text-gray-900">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-green-600">Confirmada ✅</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pago:</span>
                <span className="font-medium text-yellow-600">Pendiente 🟡</span>
              </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="font-bold text-lg text-gray-900">{formatPrice(booking.workshop_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pregunta principal */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Deseas pagar tu reserva ahora?
            </h4>
            <p className="text-gray-600 text-sm">
              Puedes pagar ahora para completar tu reserva o hacerlo más tarde desde "Mis Reservas"
            </p>
          </div>

          {/* Ventajas de pagar ahora */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <h5 className="font-medium text-blue-900 mb-2">✨ Ventajas de pagar ahora:</h5>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Reserva completamente confirmada</li>
              <li>• Recibo inmediato por email</li>
              <li>• Proceso rápido y seguro</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePayNow}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Sí, Pagar Ahora - {formatPrice(booking.workshop_price)}
            </button>

            <button
              onClick={handlePayLater}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar Más Tarde
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Si eliges pagar más tarde, podrás hacerlo desde{' '}
              <button
                onClick={() => {
                  navigate('/bookings');
                  onClose();
                }}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                "Mis Reservas"
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;