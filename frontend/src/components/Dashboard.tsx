// frontend/src/components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      title: 'Explorar Talleres',
      description: 'Descubre nuestros talleres de cocina disponibles',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      path: '/workshops'
    },
    {
      title: 'Mis Reservas',
      description: 'Gestiona tus reservas de talleres',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/bookings'
    },
    {
      title: 'Historial de Pagos',
      description: 'Revisa tus pagos y transacciones',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      path: '/payments'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenido, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de bienvenida */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            ¡Hola de nuevo, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-indigo-100">
            Estamos emocionados de tenerte aquí. Explora nuestros talleres de cocina y descubre nuevas habilidades culinarias.
          </p>
        </div>

        {/* Navegación principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`${item.color} ${item.hoverColor} text-white rounded-lg shadow-lg p-6 transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tu Actividad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Talleres Reservados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Talleres Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Certificados Obtenidos</div>
            </div>
          </div>
        </div>

        

        {/* Información de ayuda */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-blue-700 mb-4">
            Si tienes alguna pregunta sobre nuestros talleres o necesitas asistencia, estamos aquí para ayudarte.
          </p>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200">
              Contactar Soporte
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm border border-blue-600 hover:bg-blue-50 transition-colors duration-200">
              FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;