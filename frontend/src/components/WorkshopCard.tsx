// frontend/src/components/WorkshopCard.tsx - DISEÑO MASTERCOOK ACADEMY
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PaymentConfirmationModal from './PaymentConfirmationModal';

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
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Estados para el flujo de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Formatear fecha
  const formatDate = (dateString: string) => {
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

  // Determinar color de la categoría con paleta MasterCook
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { color: string, icon: string, bgGradient: string } } = {
      'Italiana': { 
        color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200', 
        icon: '🍝',
        bgGradient: 'from-red-50 to-pink-50'
      },
      'Panadería': { 
        color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200', 
        icon: '🥖',
        bgGradient: 'from-amber-50 to-yellow-50'
      },
      'Repostería': { 
        color: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200', 
        icon: '🧁',
        bgGradient: 'from-pink-50 to-rose-50'
      },
      'Japonesa': { 
        color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200', 
        icon: '🍣',
        bgGradient: 'from-purple-50 to-indigo-50'
      },
      'Vegana': { 
        color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200', 
        icon: '🥬',
        bgGradient: 'from-green-50 to-emerald-50'
      },
      'Mexicana': { 
        color: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200', 
        icon: '🌮',
        bgGradient: 'from-orange-50 to-red-50'
      },
      'Francesa': { 
        color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200', 
        icon: '🥐',
        bgGradient: 'from-blue-50 to-indigo-50'
      },
      'Española': { 
        color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200', 
        icon: '🥘',
        bgGradient: 'from-yellow-50 to-orange-50'
      },
      'Barbacoa': { 
        color: 'bg-gradient-to-r from-gray-100 to-stone-100 text-gray-700 border border-gray-200', 
        icon: '🔥',
        bgGradient: 'from-gray-50 to-stone-50'
      },
      'Tailandesa': { 
        color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200', 
        icon: '🍜',
        bgGradient: 'from-emerald-50 to-teal-50'
      },
      'Bebidas': { 
        color: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200', 
        icon: '🥤',
        bgGradient: 'from-cyan-50 to-blue-50'
      }
    };
    return categories[category] || { 
      color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200', 
      icon: '🍽️',
      bgGradient: 'from-gray-50 to-slate-50'
    };
  };

  const categoryInfo = getCategoryInfo(workshop.category);

  // Verificar si la fecha ya pasó
  const isWorkshopPast = () => {
    const workshopDate = new Date(workshop.date);
    const today = new Date();
    return workshopDate < today;
  };

  const isPastWorkshop = isWorkshopPast();

  // Función principal para hacer la reserva
  const handleBooking = async () => {
    if (!user?.email) {
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

    try {
      setIsLoading(true);
      setMessage(null);
      
      console.log('🎯 [WORKSHOP_CARD] Iniciando reserva:', {
        user: user.email,
        workshop: workshop.title,
        workshop_id: workshop.id
      });

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const bookingData = {
        user_email: user.email,
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

      setCurrentBooking(booking);
      setShowModal(false);
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

  // Manejar cierre del modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setMessage(`Reserva confirmada para "${workshop.title}". Puedes completar el pago desde "Mis Reservas".`);
    setMessageType('success');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <>
      {/* Card Principal con Diseño MasterCook */}
      <div className={`
        relative overflow-hidden rounded-2xl transition-all duration-500 transform
        bg-gradient-to-br from-white via-orange-50 to-amber-50
        border-2 border-amber-100 hover:border-amber-200
        shadow-lg hover:shadow-2xl
        hover:-translate-y-2 hover:scale-[1.02]
        group cursor-pointer
        ${isPastWorkshop ? 'opacity-75 grayscale' : ''}
      `}>
        
        {/* Indicador de estado visual */}
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -top-12 -right-1 text-white text-xs font-bold transform rotate-45">
            {isFullyBooked ? 'LLENO' : isAlmostFull ? '¡ÚLTIMOS!' : 'DISPONIBLE'}
          </div>
        </div>

        {/* Gradient overlay superior */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 via-orange-400 to-amber-400"></div>

        <div className="p-6 space-y-4">
          {/* Header con categoría y precio */}
          <div className="flex justify-between items-start">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${categoryInfo.color} shadow-sm`}>
              <span className="mr-2">{categoryInfo.icon}</span>
              {workshop.category}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatPrice(workshop.price)}
              </div>
              <div className="text-xs text-gray-500">por persona</div>
            </div>
          </div>

          {/* Título del taller */}
          <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-red-600 transition-colors duration-300">
            {workshop.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {workshop.description}
          </p>

          {/* Información de fecha y capacidad */}
          <div className="space-y-3">
            {/* Fecha */}
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {formatDate(workshop.date)}
                </div>
                {isPastWorkshop && (
                  <div className="text-xs text-red-500 font-medium">
                    (Taller finalizado)
                  </div>
                )}
              </div>
            </div>

            {/* Participantes */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {workshop.current_participants}/{workshop.max_participants} participantes
                  </div>
                  <div className="text-xs text-gray-500">
                    {availableSpots} cupos disponibles
                  </div>
                </div>
              </div>
              
              {isAlmostFull && (
                <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  ¡Últimos cupos!
                </div>
              )}
            </div>
          </div>

          {/* Barra de progreso de ocupación */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                isFullyBooked ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                isAlmostFull ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                'bg-gradient-to-r from-green-400 to-emerald-500'
              }`}
              style={{ 
                width: `${Math.min((workshop.current_participants / workshop.max_participants) * 100, 100)}%` 
              }}
            ></div>
          </div>

          {/* Botón de reserva mejorado */}
          <button
            onClick={() => setShowModal(true)}
            disabled={isFullyBooked || isLoading || isPastWorkshop}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg
              transition-all duration-300 transform
              ${isFullyBooked || isPastWorkshop
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `
                  bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700
                  text-white shadow-lg hover:shadow-xl
                  hover:-translate-y-1 hover:scale-[1.02]
                  active:scale-[0.98]
                  focus:outline-none focus:ring-4 focus:ring-red-200
                `
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Reservando...
              </div>
            ) : isFullyBooked ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Sin Cupos Disponibles
              </div>
            ) : isPastWorkshop ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Taller Finalizado
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Reservar por {formatPrice(workshop.price)}
              </div>
            )}
          </button>

          {/* Información adicional */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center text-sm text-amber-700">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Reserva ahora y elige pagar inmediatamente o más tarde</span>
            </div>
          </div>

          {/* ID del taller para debug */}
          <div className="text-center pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Taller ID: #{workshop.id}</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de reserva */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Header del modal */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirmar Reserva
                </h3>
                <p className="text-gray-600">
                  ¿Deseas reservar este increíble taller de cocina?
                </p>
              </div>
              
              {/* Información del taller */}
              <div className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                <div className="flex items-start">
                  <div className="mr-3 text-2xl">{categoryInfo.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{workshop.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>📅 Fecha:</span>
                        <span className="font-medium">{formatDate(workshop.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💰 Precio:</span>
                        <span className="font-bold text-red-600">{formatPrice(workshop.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🏷️ Categoría:</span>
                        <span className="font-medium">{workshop.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👥 Disponibles:</span>
                        <span className="font-medium text-green-600">{availableSpots} cupos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información sobre el pago */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Después de confirmar, podrás elegir pagar ahora o más tarde desde "Mis Reservas"</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    '✨ Confirmar Reserva'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de pago */}
      {showPaymentModal && currentBooking && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          booking={{
            id: currentBooking.id,
            workshop_id: workshop.id,
            workshop_title: workshop.title,
            workshop_price: workshop.price,
            user_email: currentBooking.user_email
          }}
          onClose={handleClosePaymentModal}
          onPayLater={handlePayLater}
        />
      )}

      {/* Notificación de mensaje */}
      {message && (
        <div className={`fixed top-4 right-4 max-w-sm rounded-xl shadow-2xl z-50 transform transition-all duration-500 ${
          messageType === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
                    >
                      Ver Mis Reservas →
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMessage(null)}
                className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkshopCard;