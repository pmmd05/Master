// frontend/src/components/Dashboard.tsx - CON LOGOUT FUNCIONANDO
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🚪 [DASHBOARD] Iniciando logout...');
      await logout();
      console.log('✅ [DASHBOARD] Logout completado, redirigiendo...');
      navigate('/login');
    } catch (error) {
      console.error('❌ [DASHBOARD] Error en logout:', error);
      // Forzar logout local si hay error
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
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
      path: '/workshops',
      emoji: '🍳'
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
      path: '/bookings',
      emoji: '📅'
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
      path: '/payments',
      emoji: '💳'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado con logout prominente */}
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
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              
              {/* Botón de Debug (solo en desarrollo) */}
              <button
                onClick={() => navigate('/debug')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200"
                title="Panel de Debug"
              >
                🔧 Debug
              </button>
              
              {/* Botón de Logout PROMINENTE */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
          <p className="text-indigo-100 mb-4">
            Estamos emocionados de tenerte aquí. Explora nuestros talleres de cocina y descubre nuevas habilidades culinarias.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instructores Expertos
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
              </svg>
              Clases Prácticas
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
              </svg>
              Ambiente Acogedor
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                console.log(`🔄 [DASHBOARD] Navegando a: ${item.path}`);
                navigate(item.path);
              }}
              className={`${item.color} ${item.hoverColor} text-white rounded-lg shadow-lg p-6 transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{item.emoji}</span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Panel de acciones rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => navigate('/workshops')}
              className="flex flex-col items-center justify-center py-4 px-4 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">🍳</span>
              <span className="text-sm font-medium">Explorar Talleres</span>
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="flex flex-col items-center justify-center py-4 px-4 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">📅</span>
              <span className="text-sm font-medium">Mis Reservas</span>
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="flex flex-col items-center justify-center py-4 px-4 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">💳</span>
              <span className="text-sm font-medium">Pagos</span>
            </button>
            <button
              onClick={() => navigate('/debug')}
              className="flex flex-col items-center justify-center py-4 px-4 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">🔧</span>
              <span className="text-sm font-medium">Debug</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-4 px-4 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">🚪</span>
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Tu Actividad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
              <div className="text-sm text-indigo-800">Talleres Reservados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm text-green-800">Talleres Completados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
              <div className="text-sm text-yellow-800">Certificados Obtenidos</div>
            </div>
          </div>
        </div>

        {/* Información de estado del sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            ℹ️ Estado del Sistema
          </h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p>• <strong>Usuario:</strong> {user?.email} (ID: {user?.id})</p>
            <p>• <strong>Token:</strong> {localStorage.getItem('authToken') ? 'Activo' : 'No disponible'}</p>
            <p>• <strong>Debug Panel:</strong> <button onClick={() => navigate('/debug')} className="underline">Ir al panel de debug</button></p>
            <p>• <strong>Problemas con reservas:</strong> Usa el panel de debug para diagnosticar</p>
          </div>
        </div>

        {/* Información de ayuda */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            🆘 ¿Problemas Técnicos?
          </h3>
          <p className="text-orange-700 mb-4">
            Si las reservas no funcionan o hay errores, usa estas herramientas:
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/debug')}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors duration-200"
            >
              🔧 Panel de Debug
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              🔄 Recargar Página
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors duration-200"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;