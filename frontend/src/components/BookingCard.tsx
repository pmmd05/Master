// frontend/src/components/BookingCard.tsx - DISEÑO MASTERCOOK ACADEMY ACTUALIZADO
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

  // Determinar color del estado
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'Confirmada': { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: '✅',
        bgColor: 'bg-green-500'
      },
      'Cancelada': { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        icon: '❌',
        bgColor: 'bg-red-500'
      },
      'Completada': { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: '🎉',
        bgColor: 'bg-blue-500'
      }
    };
    return statusMap[status as keyof typeof statusMap] || { 
      color: 'bg-gray-50 text-gray-700 border-gray-200', 
      icon: '⏳',
      bgColor: 'bg-gray-500'
    };
  };

  // Determinar color del estado de pago
  const getPaymentStatusInfo = (paymentStatus: string) => {
    const paymentMap = {
      'Pendiente': { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: '⏰',
        pulse: 'animate-pulse'
      },
      'Pagado': { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: '💳',
        pulse: ''
      }
    };
    return paymentMap[paymentStatus as keyof typeof paymentMap] || { 
      color: 'bg-gray-50 text-gray-700 border-gray-200', 
      icon: '❓',
      pulse: ''
    };
  };

  // Determinar color de la categoría
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { color: string, emoji: string } } = {
      'Italiana': { color: 'bg-red-50 text-red-700 border-red-200', emoji: '🍝' },
      'Panadería': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', emoji: '🥖' },
      'Repostería': { color: 'bg-pink-50 text-pink-700 border-pink-200', emoji: '🧁' },
      'Japonesa': { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', emoji: '🍣' },
      'Vegana': { color: 'bg-green-50 text-green-700 border-green-200', emoji: '🥬' },
      'Mexicana': { color: 'bg-orange-50 text-orange-700 border-orange-200', emoji: '🌮' },
      'Francesa': { color: 'bg-blue-50 text-blue-700 border-blue-200', emoji: '🥐' },
      'Española': { color: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '🥘' },
      'Barbacoa': { color: 'bg-gray-50 text-gray-700 border-gray-200', emoji: '🔥' },
      'Tailandesa': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', emoji: '🍜' },
      'Bebidas': { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', emoji: '🥤' }
    };
    return categories[category] || { color: 'bg-gray-50 text-gray-700 border-gray-200', emoji: '🍽️' };
  };

  // Verificar si la fecha ya pasó
  const isWorkshopPast = () => {
    if (!booking.workshop?.date) return false;
    const workshopDate = new Date(booking.workshop.date);
    const today = new Date();
    return workshopDate < today;
  };

  const isPastWorkshop = isWorkshopPast();
  const statusInfo = getStatusInfo(booking.status);
  const paymentInfo = getPaymentStatusInfo(booking.payment_status);
  const categoryInfo = booking.workshop ? getCategoryInfo(booking.workshop.category) : null;

  const canPay = booking.payment_status === 'Pendiente' && booking.status === 'Confirmada' && !isPastWorkshop;
  const canCancel = booking.status === 'Confirmada' && !isPastWorkshop;

  return (
    <div className={`booking-card ${isPastWorkshop ? 'opacity-80' : ''}`}>
      
      {/* Indicador de estado visual superior */}
      <div className={`h-1 w-full rounded-t-2xl ${statusInfo.bgColor} mb-4`}></div>

      <div className="space-y-4">
        
        {/* Header con badges de estado */}
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
              <span className="mr-1">{statusInfo.icon}</span>
              {booking.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${paymentInfo.color} ${paymentInfo.pulse}`}>
              <span className="mr-1">{paymentInfo.icon}</span>
              {booking.payment_status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: #{booking.id}
            </div>
          </div>
        </div>

        {/* Información del taller */}
        {booking.workshop ? (
          <>
            {/* Categoría y precio */}
            <div className="flex justify-between items-start">
              {categoryInfo && (
                <span className={`px-3 py-2 rounded-xl text-sm font-semibold border ${categoryInfo.color}`}>
                  <span className="mr-2">{categoryInfo.emoji}</span>
                  {booking.workshop.category}
                </span>
              )}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(booking.workshop.price)}
                </div>
                <div className="text-xs text-gray-500">precio del taller</div>
              </div>
            </div>

            {/* Título del taller */}
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {booking.workshop.title}
            </h3>

            {/* Descripción */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 bg-gray-50 rounded-lg p-3">
              {booking.workshop.description}
            </p>

            {/* Fecha del taller */}
            <div className="flex items-center bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <svg className="icon-sm text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-semibold ${isPastWorkshop ? 'text-gray-500' : 'text-blue-800'}`}>
                  {formatDate(booking.workshop.date)}
                </div>
                {isPastWorkshop && (
                  <div className="text-xs text-red-600 font-medium flex items-center mt-1">
                    <svg className="icon-sm mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Taller finalizado
                  </div>
                )}
              </div>
            </div>

            {/* Participantes */}
            <div className="flex items-center bg-green-50 rounded-lg px-4 py-3 border border-green-200">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <svg className="icon-sm text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-800">
                  {booking.workshop.current_participants}/{booking.workshop.max_participants} participantes
                </div>
                <div className="text-xs text-green-600">
                  Grupo reducido para mejor aprendizaje
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Información mínima cuando no se pudo cargar el taller */
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="icon-sm text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Taller ID: {booking.workshop_id}
            </h3>
            <p className="text-gray-500 text-sm">
              No se pudieron cargar los detalles del taller. Contacta soporte si persiste el problema.
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          
          {/* Botón de pago destacado (si está pendiente) */}
          {canPay && (
            <button
              onClick={() => onPayment && onPayment(booking)}
              className="w-full py-4 px-6 btn-primary text-base font-bold flex items-center justify-center"
            >
              <svg className="icon-md mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              💳 Pagar Ahora - {booking.workshop && formatPrice(booking.workshop.price)}
            </button>
          )}

          {/* Botones secundarios */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Botón ver detalles */}
            <button
              onClick={() => onViewDetails && onViewDetails(booking)}
              className="py-3 px-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 border border-blue-200 transition-all duration-300 flex items-center justify-center"
            >
              <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              👁️ Ver Detalles
            </button>

            {/* Botón cancelar (si es posible) */}
            {canCancel ? (
              <button
                onClick={() => onCancel && onCancel(booking)}
                className="py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 border border-red-200 transition-all duration-300 flex items-center justify-center"
              >
                <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                ❌ Cancelar
              </button>
            ) : (
              <div className="py-3 px-4 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium text-center border border-gray-200">
                {booking.status === 'Cancelada' ? '🚫 Cancelada' :
                 booking.status === 'Completada' ? '🎉 Completada' :
                 isPastWorkshop ? '⏰ Finalizada' : '🔒 No cancelable'}
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Email de contacto:</span>
              <span className="text-gray-800">{booking.user_email}</span>
            </div>
            
            {booking.payment_status === 'Pagado' && (
              <div className="flex items-center justify-center bg-green-100 rounded-lg py-2 px-3 border border-green-200 mt-3">
                <svg className="icon-sm text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-semibold text-sm">✅ Pago confirmado y procesado</span>
              </div>
            )}
            
            {isPastWorkshop && booking.status === 'Confirmada' && (
              <div className="flex items-center justify-center bg-blue-100 rounded-lg py-2 px-3 border border-blue-200 mt-3">
                <svg className="icon-sm text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-700 font-medium text-sm">Este taller ya ha terminado</span>
              </div>
            )}

            {canPay && (
              <div className="flex items-center justify-center bg-yellow-100 rounded-lg py-2 px-3 border border-yellow-200 mt-3">
                <svg className="icon-sm text-yellow-600 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-700 font-medium text-sm">⏰ Recuerda completar tu pago antes del taller</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;