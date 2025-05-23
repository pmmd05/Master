// frontend/src/components/BookingCard.tsx
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
  const getStatusColor = (status: string) => {
    const colors = {
      'Confirmada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800',
      'Completada': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Determinar color del estado de pago
  const getPaymentStatusColor = (paymentStatus: string) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Pagado': 'bg-green-100 text-green-800'
    };
    return colors[paymentStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Determinar color de la categoría
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Italiana': 'bg-red-100 text-red-800',
      'Panadería': 'bg-yellow-100 text-yellow-800',
      'Repostería': 'bg-pink-100 text-pink-800',
      'Japonesa': 'bg-purple-100 text-purple-800',
      'Vegana': 'bg-green-100 text-green-800',
      'Mexicana': 'bg-orange-100 text-orange-800',
      'Francesa': 'bg-blue-100 text-blue-800',
      'Española': 'bg-red-100 text-red-800',
      'Barbacoa': 'bg-gray-100 text-gray-800',
      'Tailandesa': 'bg-emerald-100 text-emerald-800',
      'Bebidas': 'bg-amber-100 text-amber-800',
      'China': 'bg-red-100 text-red-800',
      'India': 'bg-orange-100 text-orange-800',
      'Mediterránea': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Verificar si la fecha ya pasó
  const isWorkshopPast = () => {
    if (!booking.workshop?.date) return false;
    const workshopDate = new Date(booking.workshop.date);
    const today = new Date();
    return workshopDate < today;
  };

  const isPastWorkshop = isWorkshopPast();
  const canPay = booking.payment_status === 'Pendiente' && booking.status === 'Confirmada' && !isPastWorkshop;
  const canCancel = booking.status === 'Confirmada' && !isPastWorkshop;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header con información de la reserva */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
              {booking.payment_status}
            </span>
          </div>
          <div className="text-right text-xs text-gray-500">
            ID: #{booking.id}
          </div>
        </div>

        {/* Información del taller */}
        {booking.workshop ? (
          <>
            {/* Categoría y precio */}
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(booking.workshop.category)}`}>
                {booking.workshop.category}
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(booking.workshop.price)}
                </div>
              </div>
            </div>

            {/* Título del taller */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {booking.workshop.title}
            </h3>

            {/* Descripción */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {booking.workshop.description}
            </p>

            {/* Fecha del taller */}
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-sm capitalize ${isPastWorkshop ? 'text-gray-500' : 'text-gray-600'}`}>
                {formatDate(booking.workshop.date)}
                {isPastWorkshop && (
                  <span className="ml-2 text-xs text-red-600 font-medium">(Pasado)</span>
                )}
              </span>
            </div>

            {/* Participantes */}
            <div className="flex items-center mb-4">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm text-gray-600">
                {booking.workshop.current_participants}/{booking.workshop.max_participants} participantes
              </span>
            </div>
          </>
        ) : (
          /* Información mínima cuando no se pudo cargar el taller */
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Taller ID: {booking.workshop_id}
            </h3>
            <p className="text-gray-500 text-sm">
              No se pudieron cargar los detalles del taller
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          {/* Botón de pago (si está pendiente) */}
          {canPay && (
            <button
              onClick={() => onPayment && onPayment(booking)}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              💳 Pagar Ahora - {booking.workshop && formatPrice(booking.workshop.price)}
            </button>
          )}

          <div className="flex gap-2">
            {/* Botón ver detalles */}
            <button
              onClick={() => onViewDetails && onViewDetails(booking)}
              className="flex-1 py-2 px-4 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              👁️ Ver Detalles
            </button>

            {/* Botón cancelar (si es posible) */}
            {canCancel && (
              <button
                onClick={() => onCancel && onCancel(booking)}
                className="flex-1 py-2 px-4 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Email: {booking.user_email}</div>
            {booking.payment_status === 'Pagado' && (
              <div className="text-green-600 font-medium">✅ Pago confirmado</div>
            )}
            {isPastWorkshop && booking.status === 'Confirmada' && (
              <div className="text-gray-600">
                Este taller ya ha terminado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;