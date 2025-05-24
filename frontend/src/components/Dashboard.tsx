// frontend/src/components/Dashboard.tsx - DISEÑO MASTERCOOK ACADEMY ACTUALIZADO
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: 'Explorar Talleres',
      description: 'Descubre nuestros talleres de cocina disponibles',
      icon: (
        <svg className="icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <Navbar />
      
      {/* Contenido principal con padding para navbar fija */}
      <div className="main-content">
        <div className="container-centered py-8">
          
          {/* Hero Section */}
          <div className="hero-section mb-8">
            <div className="hero-content text-center">
              <h1 className="text-4xl font-bold mb-4">
                ¡Bienvenido de vuelta, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-lg text-red-100 mb-6 max-w-2xl mx-auto">
                Estamos emocionados de tenerte aquí. Explora nuestros talleres de cocina y descubre nuevas habilidades culinarias en un ambiente profesional y acogedor.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center">
                  <svg className="icon-sm mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instructores Expertos
                </div>
                <div className="flex items-center">
                  <svg className="icon-sm mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                  Clases Prácticas
                </div>
                <div className="flex items-center">
                  <svg className="icon-sm mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                  </svg>
                  Ambiente Acogedor
                </div>
              </div>
            </div>
          </div>

          {/* Navegación principal con nueva paleta */}
          <div className="workshops-grid mb-8">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log(`🔄 [DASHBOARD] Navegando a: ${item.path}`);
                  navigate(item.path);
                }}
                className="workshop-card text-left p-8 group"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-red-100 rounded-xl p-4 mr-4 group-hover:bg-red-200 transition-colors duration-300">
                    <div className="text-red-600">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{item.emoji}</span>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          {/* Panel de acciones rápidas */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">⚡</span>
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button
                onClick={() => navigate('/workshops')}
                className="category-card text-center py-6"
              >
                <span className="text-3xl mb-3 block">🍳</span>
                <span className="text-sm font-medium">Explorar Talleres</span>
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="category-card text-center py-6"
              >
                <span className="text-3xl mb-3 block">📅</span>
                <span className="text-sm font-medium">Mis Reservas</span>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="category-card text-center py-6"
              >
                <span className="text-3xl mb-3 block">💳</span>
                <span className="text-sm font-medium">Pagos</span>
              </button>
              <button
                onClick={() => navigate('/debug')}
                className="category-card text-center py-6"
              >
                <span className="text-3xl mb-3 block">🔧</span>
                <span className="text-sm font-medium">Debug</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="category-card text-center py-6"
              >
                <span className="text-3xl mb-3 block">🔄</span>
                <span className="text-sm font-medium">Recargar</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de usuario */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Tu Actividad en MasterCook
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-2">0</div>
                <div className="text-sm text-red-800 font-medium">Talleres Reservados</div>
                <div className="text-xs text-red-600 mt-1">Este mes</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">0</div>
                <div className="text-sm text-green-800 font-medium">Talleres Completados</div>
                <div className="text-xs text-green-600 mt-1">Total</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-4xl font-bold text-yellow-600 mb-2">0</div>
                <div className="text-sm text-yellow-800 font-medium">Certificados Obtenidos</div>
                <div className="text-xs text-yellow-600 mt-1">Disponibles próximamente</div>
              </div>
            </div>
          </div>

          {/* Información de estado del sistema */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              Estado del Sistema
            </h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>• <strong>Usuario:</strong> {user?.email} (ID: {user?.id})</p>
              <p>• <strong>Token:</strong> {localStorage.getItem('authToken') ? '✅ Activo' : '❌ No disponible'}</p>
              <p>• <strong>Debug Panel:</strong> <button onClick={() => navigate('/debug')} className="underline hover:text-blue-900 transition-colors">Ir al panel de debug</button></p>
              <p>• <strong>Soporte:</strong> Si tienes problemas con reservas, usa el panel de debug para diagnosticar</p>
            </div>
          </div>

          {/* Información de ayuda */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
              <span className="mr-2">🆘</span>
              ¿Necesitas Ayuda?
            </h3>
            <p className="text-orange-700 mb-4">
              Si experimentas problemas técnicos con las reservas o pagos, tenemos herramientas de diagnóstico disponibles:
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/debug')}
                className="btn-secondary"
              >
                🔧 Panel de Debug
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-outline"
              >
                🔄 Recargar Página
              </button>
              <button 
                onClick={() => navigate('/workshops')}
                className="btn-primary"
              >
                🍳 Ver Talleres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;