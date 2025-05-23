// frontend/src/components/WorkshopCard.tsx
import React from 'react';
import { Workshop } from '../types';

interface WorkshopCardProps {
  workshop: Workshop;
  onBook?: (workshop: Workshop) => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onBook }) => {
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

  const handleBookClick = () => {
    if (onBook && !isFullyBooked) {
      onBook(workshop);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header con categoría */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(workshop.category)}`}>
            {workshop.category}
          </span>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(workshop.price)}
            </div>
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {workshop.title}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {workshop.description}
        </p>
      </div>

      {/* Información del taller */}
      <div className="px-4 pb-4">
        {/* Fecha */}
        <div className="flex items-center mb-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-600 capitalize">
            {formatDate(workshop.date)}
          </span>
        </div>

        {/* Participantes */}
        <div className="flex items-center mb-4">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm text-gray-600">
            {workshop.current_participants}/{workshop.max_participants} participantes
          </span>
          {isAlmostFull && !isFullyBooked && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              ¡Últimos cupos!
            </span>
          )}
        </div>

        {/* Barra de progreso de ocupación */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFullyBooked ? 'bg-red-500' : 
                isAlmostFull ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ 
                width: `${(workshop.current_participants / workshop.max_participants) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Botón de reserva */}
        <button
          onClick={handleBookClick}
          disabled={isFullyBooked}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            isFullyBooked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }`}
        >
          {isFullyBooked 
            ? 'Agotado' 
            : `Reservar - ${formatPrice(workshop.price)}`
          }
        </button>

        {/* Información adicional */}
        {availableSpots > 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {availableSpots} {availableSpots === 1 ? 'cupo disponible' : 'cupos disponibles'}
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkshopCard;