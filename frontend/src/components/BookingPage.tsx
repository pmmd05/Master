import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { BookingsProvider, useBookings } from '../context/BookingsContext';
import BookingCard from './BookingCard';
import { Booking, Workshop } from '../types';

interface BookingWithWorkshop extends Booking {
  workshop?: Workshop;
}

const BookingsPageContent: React.FC = () => {
  const { user } = useAuth();
  const { bookings, loading, error, refreshBookings } = useBookings();
  const navigate = useNavigate(); 
  const [selectedBooking, setSelectedBooking] = useState<BookingWithWorkshop | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'past' | 'pending'>('all');

  // Filtrar reservas según el filtro seleccionado
  const filteredBookings = bookings.filter(booking => {
    const today = new Date();
    const workshopDate = booking.workshop?.date ? new Date(booking.workshop.date) : null;
    const isPast = workshopDate && workshopDate < today;

    switch (filter) {
      case 'active':
        return booking.status === 'Confirmada' && !isPast;
      case 'past':
        return isPast || booking.status === 'Completada';
      case 'pending':
        return booking.payment_status === 'Pendiente';
      default:
        return true;
    }
  });

  // Manejar pago
  const handlePayment = (booking: BookingWithWorkshop) => {
    console.log('🔄 [BOOKINGS] Iniciando pago para reserva:', booking.id);
    
    if (!booking.workshop) {
      alert('No se pueden cargar los detalles del taller para procesar el pago');
      return;
    }
    
    // Navegar a la página de pagos con los datos de la reserva
    navigate('/paymentpage', {
      state: {
        bookingId: booking.id,
        workshopId: booking.workshop_id,
        workshopTitle: booking.workshop.title,
        amount: booking.workshop.price,
        userEmail: booking.user_email
      }
    });
  };

  // Manejar cancelación
  const handleCancel = (booking: BookingWithWorkshop) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  // Confirmar cancelación
  const confirmCancel = async () => {
    if (!selectedBooking) return;
    
    console.log('🗑️ [BOOKINGS] Cancelando reserva:', selectedBooking.id);
    // Aquí implementarías la lógica de cancelación
    alert(`Reserva #${selectedBooking.id} cancelada`);
    setShowCancelModal(false);
    setSelectedBooking(null);
    await refreshBookings();
  };

  // Manejar ver detalles
  const handleViewDetails = (booking: BookingWithWorkshop) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Obtener estadísticas
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'Confirmada' && 
      (!b.workshop?.date || new Date(b.workshop.date) >= new Date())).length,
    completed: bookings.filter(b => b.status === 'Completada').length,
    pending: bookings.filter(b => b.payment_status === 'Pendiente').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800">Error al cargar reservas</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Reservas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reservas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.active}</div>
            <div className="text-sm text-gray-600">Activas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pago Pendiente</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
              Filtrar Reservas
            </h3>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todas', count: stats.total },
                { key: 'active', label: 'Activas', count: stats.active },
                { key: 'pending', label: 'Pago Pendiente', count: stats.pending },
                { key: 'past', label: 'Pasadas', count: stats.completed }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    filter === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {filter === 'all' ? (
              // Mensaje para cuando no tiene reservas en absoluto
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aún no tienes reservas
                </h3>
                <p className="text-gray-600 mb-6">
                  ¡Explora nuestros increíbles talleres de cocina y haz tu primera reserva!<br />
                  Tenemos talleres para todos los niveles y gustos culinarios.
                </p>
                <button
                  onClick={() => navigate('/workshops')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium"
                >
                  🍳 Explorar Talleres Disponibles
                </button>
              </div>
            ) : (
              // Mensaje para filtros específicos
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes reservas {
                    filter === 'active' ? 'activas' : 
                    filter === 'pending' ? 'con pago pendiente' : 
                    'pasadas'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'active' && 'Todas tus reservas activas aparecerán aquí.'}
                  {filter === 'pending' && 'Las reservas con pagos pendientes aparecerán aquí.'}
                  {filter === 'past' && 'Tu historial de talleres completados aparecerá aquí.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setFilter('all')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Ver Todas las Reservas
                  </button>
                  <button
                    onClick={() => navigate('/workshops')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Explorar Talleres
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPayment={handlePayment}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            💡 Información sobre tus reservas
          </h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p>• Las reservas se pueden cancelar hasta 24 horas antes del taller</p>
            <p>• Los pagos pendientes deben completarse antes de la fecha del taller</p>
            <p>• Recibirás un recordatorio por email 1 día antes de cada taller</p>
            <p>• Si tienes algún problema, contacta nuestro soporte</p>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">
                Detalles de la Reserva #{selectedBooking.id}
              </h3>
              <div className="space-y-3 text-sm">
                <div><strong>Estado:</strong> {selectedBooking.status}</div>
                <div><strong>Pago:</strong> {selectedBooking.payment_status}</div>
                <div><strong>Email:</strong> {selectedBooking.user_email}</div>
                {selectedBooking.workshop && (
                  <>
                    <div><strong>Taller:</strong> {selectedBooking.workshop.title}</div>
                    <div><strong>Categoría:</strong> {selectedBooking.workshop.category}</div>
                    <div><strong>Fecha:</strong> {new Date(selectedBooking.workshop.date).toLocaleDateString('es-ES')}</div>
                    <div><strong>Precio:</strong> {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedBooking.workshop.price)}</div>
                    <div><strong>Descripción:</strong> {selectedBooking.workshop.description}</div>
                  </>
                )}
              </div>
              <div className="items-center px-4 py-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Cancelar Reserva
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  ¿Estás seguro de que quieres cancelar la reserva para:
                </p>
                <p className="text-base font-semibold text-gray-900 mb-2">
                  "{selectedBooking.workshop?.title || `Taller ${selectedBooking.workshop_id}`}"
                </p>
                <p className="text-sm text-red-600">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    No, mantener
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Sí, cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal que provee el contexto
const BookingsPage: React.FC = () => {
  return (
    <BookingsProvider>
      <BookingsPageContent />
    </BookingsProvider>
  );
};

export default BookingsPage;