// frontend/src/components/PaymentPage.tsx - MOCK DE PAGOS COMPLETO
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';

interface PaymentData {
  bookingId?: number;
  workshopId?: number;
  workshopTitle?: string;
  amount?: number;
  userEmail?: string;
}

const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Datos del pago desde la navegación
  const paymentData: PaymentData = location.state || {};
  
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: user?.name || '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit_card'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Validar que tenemos los datos necesarios
  useEffect(() => {
    if (!paymentData.workshopId || !paymentData.amount) {
      console.error('❌ [PAYMENT] Datos de pago incompletos:', paymentData);
      navigate('/bookings', { 
        state: { error: 'Datos de pago incompletos. Intenta desde "Mis Reservas".' }
      });
    }
  }, [paymentData, navigate]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Manejar entrada de tarjeta
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardHolder || formData.cardHolder.length < 2) {
      newErrors.cardHolder = 'Nombre del titular requerido';
    }

    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Fecha inválida (MM/YY)';
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      setStep('processing');
      console.log('💳 [PAYMENT] Procesando pago...', paymentData);

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentRequest = {
        user_email: user?.email || paymentData.userEmail || '',
        workshop_id: paymentData.workshopId || 0,
        amount: paymentData.amount || 0,
        payment_method: formData.paymentMethod,
        card_number: formData.cardNumber.replace(/\s/g, ''),
        card_holder: formData.cardHolder,
        expiry_date: formData.expiryDate,
        cvv: formData.cvv
      };

      const result = await paymentService.processPayment(paymentRequest);
      setPaymentResult(result);

      if (result.status === 'approved') {
        setStep('success');
        console.log('✅ [PAYMENT] Pago exitoso:', result);
      } else {
        setStep('error');
        console.log('❌ [PAYMENT] Pago fallido:', result);
      }

    } catch (error: any) {
      console.error('❌ [PAYMENT] Error procesando pago:', error);
      setPaymentResult({ 
        status: 'error',
        message: error.message || 'Error inesperado al procesar el pago'
      });
      setStep('error');
    }
  };

  // Determinar el tipo de tarjeta
  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (step) {
      case 'form':
        return (
          <div className="space-y-6">
            {/* Información del taller */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">Resumen del Pago</h3>
              <div className="space-y-1 text-sm text-indigo-800">
                <p><strong>Taller:</strong> {paymentData.workshopTitle}</p>
                <p><strong>Participante:</strong> {user?.name} ({user?.email})</p>
                <p><strong>Total a pagar:</strong> <span className="text-lg font-bold">{formatPrice(paymentData.amount || 0)}</span></p>
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative cursor-pointer p-3 border rounded-lg transition-colors ${
                  formData.paymentMethod === 'credit_card' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium">Tarjeta</span>
                    </div>
                  </div>
                </label>

                <label className={`relative cursor-pointer p-3 border rounded-lg transition-colors ${
                  formData.paymentMethod === 'paypal' 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium">PayPal</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Formulario de tarjeta */}
            {formData.paymentMethod === 'credit_card' && (
              <div className="space-y-4">
                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formData.cardNumber && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-xs text-gray-500">{getCardType(formData.cardNumber)}</span>
                      </div>
                    )}
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Titular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="Como aparece en la tarjeta"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.cardHolder ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardHolder && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Fecha y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Mock */}
            {formData.paymentMethod === 'paypal' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-600 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                  </svg>
                </div>
                <p className="text-blue-800 font-medium">Serás redirigido a PayPal para completar el pago</p>
                <p className="text-blue-600 text-sm mt-1">Pago seguro con tu cuenta PayPal</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={processPayment}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Pagar {formatPrice(paymentData.amount || 0)}
              </button>
            </div>

            {/* Información de seguridad */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 text-sm">
                  <strong>Pago seguro:</strong> Tus datos están protegidos con encriptación SSL
                </p>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Procesando tu pago...</h3>
            <p className="text-gray-600">Por favor no cierres esta ventana ni actualices la página</p>
            <div className="mt-4 max-w-md mx-auto bg-gray-100 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Pago Exitoso!</h3>
            <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h4 className="font-medium text-green-900 mb-2">Detalles del Pago</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>ID de Transacción:</strong> {paymentResult?.transaction_id}</p>
                <p><strong>Taller:</strong> {paymentData.workshopTitle}</p>
                <p><strong>Monto:</strong> {formatPrice(paymentData.amount || 0)}</p>
                <p><strong>Estado:</strong> Pagado ✅</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/bookings')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Ver Mis Reservas
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error en el Pago</h3>
            <p className="text-gray-600 mb-6">
              {paymentResult?.message || 'No se pudo procesar tu pago'}
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep('form')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Intentar de Nuevo
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Volver a Reservas
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                💳 Procesar Pago
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderCurrentStep()}
        </div>

        {/* Información adicional */}
        {step === 'form' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              ℹ️ Información sobre el pago
            </h3>
            <div className="text-blue-700 space-y-1 text-xs">
              <p>• Este es un simulador de pagos - No se procesarán pagos reales</p>
              <p>• Usa cualquier número de tarjeta para probar (ej: 4111 1111 1111 1111)</p>
              <p>• Tarjetas terminadas en 0000 simularán pagos fallidos</p>
              <p>• El pago quedará registrado en tu historial de reservas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;