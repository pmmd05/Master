// frontend/src/components/BookingCard.tsx - DISEÑO MASTERCOOK ACADEMY
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

  // Determinar color del estado
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'Confirmada': { 
        color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200', 
        icon: '✅',
        bgGlow: 'shadow-green-200'
      },
      'Cancelada': { 
        color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200', 
        icon: '❌',
        bgGlow: 'shadow-red-200'
      },
      'Completada': { 
        color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200', 
        icon: '🎉',
        bgGlow: 'shadow-blue-200'
      }
    };
    return statusMap[status as keyof typeof statusMap] || { 
      color: 'bg-gray-100 text-gray-800 border border-gray-200', 
      icon: '⏳',
      bgGlow: 'shadow-gray-200'
    };
  };

  // Determinar color del estado de pago
  const getPaymentStatusInfo = (paymentStatus: string) => {
    const paymentMap = {
      'Pendiente': { 
        color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200', 
        icon: '⏰',
        pulse: 'animate-pulse'
      },
      'Pagado': { 
        color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200', 
        icon: '💳',
        pulse: ''
      }
    };
    return paymentMap[paymentStatus as keyof typeof paymentMap] || { 
      color: 'bg-gray-100 text-gray-800 border border-gray-200', 
      icon: '❓',
      pulse: ''
    };
  };

  // Determinar color de la categoría
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { color: string, icon: string } } = {
      'Italiana': { color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200', icon: '🍝' },
      'Panadería': { color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200', icon: '🥖' },
      'Repostería': { color: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200', icon: '🧁' },
      'Japonesa': { color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200', icon: '🍣' },
      'Vegana': { color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200', icon: '🥬' },
      'Mexicana': { color: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200', icon: '🌮' },
      'Francesa': { color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200', icon: '🥐' },
      'Española': { color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200', icon: '🥘' },
      'Barbacoa': { color: 'bg-gradient-to-r from-gray-100 to-stone-100 text-gray-700 border border-gray-200', icon: '🔥' },
      'Tailandesa': { color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200', icon: '🍜' },
      'Bebidas': { color: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200', icon: '🥤' }
    };
    return categories[category] || { color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200', icon: '🍽️' };
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
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-500 transform
      bg-gradient-to-br from-white via-orange-50 to-amber-50
      border-2 border-amber-200 hover:border-orange-300
      shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
      ${statusInfo.bgGlow}
      ${isPastWorkshop ? 'opacity-80' : ''}
    `}>
      
      {/* Indicador de estado visual superior */}
      <div className={`h-2 w-full ${
        booking.status === 'Confirmada' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
        booking.status === 'Cancelada' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
        booking.status === 'Completada' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
        'bg-gradient-to-r from-gray-400 to-slate-500'
      }`}></div>

      <div className="p-6 space-y-4">
        
        {/* Header con badges de estado */}
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${paymentInfo.pulse}`}>
              <span className="mr-1">{statusInfo.icon}</span>
              {booking.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentInfo.color} ${paymentInfo.pulse}`}>
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
                <span className={`px-3 py-2 rounded-full text-sm font-semibold ${categoryInfo.color} shadow-sm`}>
                  <span className="mr-2">{categoryInfo.icon}</span>
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
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-3 border border-blue-200">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-semibold ${isPastWorkshop ? 'text-gray-500' : 'text-blue-800'}`}>
                  {formatDate(booking.workshop.date)}
                </div>
                {isPastWorkshop && (
                  <div className="text-xs text-red-600 font-medium flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Taller finalizado
                  </div>
                )}
              </div>
            </div>

            {/* Participantes */}
            <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4 py-3 border border-green-200">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="space-y-3 pt-4 border-t border-amber-200">
          
          {/* Botón de pago destacado (si está pendiente) */}
          {canPay && (
            <button
              onClick={() => onPayment && onPayment(booking)}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-sm font-semibold hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 border border-blue-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              👁️ Ver Detalles
            </button>

            {/* Botón cancelar (si es posible) */}
            {canCancel ? (
              <button
                onClick={() => onCancel && onCancel(booking)}
                className="py-3 px-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl text-sm font-semibold hover:from-red-100 hover:to-pink-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 border border-red-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-gradient-to-r from-gray-50 to-stone-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Email de contacto:</span>
              <span className="text-gray-800">{booking.user_email}</span>
            </div>
            
            {booking.payment_status === 'Pagado' && (
              <div className="flex items-center justify-center bg-green-100 rounded-lg py-2 px-3 border border-green-200">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-semibold text-sm">✅ Pago confirmado y procesado</span>
              </div>
            )}
            
            {isPastWorkshop && booking.status === 'Confirmada' && (
              <div className="flex items-center justify-center bg-blue-100 rounded-lg py-2 px-3 border border-blue-200">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-700 font-medium text-sm">Este taller ya ha terminado</span>
              </div>
            )}

            {canPay && (
              <div className="flex items-center justify-center bg-amber-100 rounded-lg py-2 px-3 border border-amber-200">
                <svg className="w-4 h-4 text-amber-600 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-amber-700 font-medium text-sm">⏰ Recuerda completar tu pago antes del taller</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;