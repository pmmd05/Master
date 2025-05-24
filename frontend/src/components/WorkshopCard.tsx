// frontend/src/components/WorkshopCard.tsx - VERSIÓN SIMPLE QUE FUNCIONA
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onBookingSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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

      // Obtener el token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Preparar datos de reserva
      const bookingData = {
        user_email: user.email,
        workshop_id: workshop.id
      };

      console.log('📡 [WORKSHOP_CARD] Enviando solicitud:', bookingData);

      // Hacer la solicitud
      const response = await fetch('http://localhost:5004/api/v0/booking/reservar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      console.log('📊 [WORKSHOP_CARD] Respuesta status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [WORKSHOP_CARD] Error response:', errorData);
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const booking = await response.json();
      console.log('✅ [WORKSHOP_CARD] Reserva exitosa:', booking);

      setMessage(`¡Reserva confirmada para "${workshop.title}"! ID: ${booking.id}`);
      setMessageType('success');
      setShowModal(false);

      // Callback de éxito
      if (onBookingSuccess) {
        setTimeout(onBookingSuccess, 1000);
      }

      // Auto ocultar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);

    } catch (error: any) {
      console.error('❌ [WORKSHOP_CARD] Error en reserva:', error);
      
      let errorMessage = 'Error desconocido al hacer la reserva';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Mejorar mensajes de error
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(workshop.category)}`}>
              {workshop.category}
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(workshop.price)}
              </div>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {workshop.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-3">
            {workshop.description}
          </p>

          {/* Fecha */}
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 capitalize">
              {formatDate(workshop.date)}
            </span>
          </div>

          {/* Participantes */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm text-gray-600">
                {workshop.current_participants}/{workshop.max_participants}
              </span>
            </div>
            
            {availableSpots <= 3 && availableSpots > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                ¡Últimos {availableSpots} cupos!
              </span>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full ${
                isFullyBooked ? 'bg-red-500' : 
                availableSpots <= 3 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min((workshop.current_participants / workshop.max_participants) * 100, 100)}%` 
              }}
            ></div>
          </div>

          {/* Botón de reserva */}
          <button
            onClick={() => setShowModal(true)}
            disabled={isFullyBooked || isLoading}
            className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              isFullyBooked
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Reservando...
              </div>
            ) : isFullyBooked ? (
              'Sin Cupos Disponibles'
            ) : (
              `Reservar - ${formatPrice(workshop.price)}`
            )}
          </button>

          {/* Info adicional */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              💡 Pago pendiente después de reservar
            </p>
          </div>

          {/* ID del taller para debug */}
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-400">ID: #{workshop.id}</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Reserva
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <p className="font-semibold text-gray-900 mb-2">{workshop.title}</p>
                <p className="text-sm text-gray-600 mb-1">📅 {formatDate(workshop.date)}</p>
                <p className="text-sm text-gray-600 mb-1">💰 {formatPrice(workshop.price)}</p>
                <p className="text-sm text-gray-600 mb-1">🏷️ {workshop.category}</p>
                <p className="text-sm text-gray-600">👥 {availableSpots} cupos disponibles</p>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                ¿Confirmas que quieres reservar este taller?<br/>
                El pago quedará pendiente y podrás completarlo desde "Mis Reservas".
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Reservando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de notificación */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
          messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {messageType === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium whitespace-pre-line">{message}</p>
              {messageType === 'success' && (
                <div className="mt-2">
                  <button
                    onClick={() => window.location.href = '/bookings'}
                    className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
                  >
                    Ver Mis Reservas
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkshopCard;