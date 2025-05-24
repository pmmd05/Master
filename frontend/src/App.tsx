import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Importaciones básicas
import Login from './components/Login';
import Register from './components/Register';

// Importaciones de páginas principales
import WorkshopsPage from './components/WorkshopsPage';
import BookingPage from './components/BookingPage';

// IMPORTAR PaymentPage
import PaymentPage from './components/PaymentPage';

// Dashboard mejorado
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navigationItems = [
    {
      title: 'Explorar Talleres',
      description: 'Descubre nuestros talleres de cocina disponibles',
      emoji: '🍳',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      path: '/workshops'
    },
    {
      title: 'Mis Reservas',
      description: 'Gestiona tus reservas de talleres',
      emoji: '📅',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/bookings'
    },
    {
      title: 'Panel de Debug',
      description: 'Herramientas de diagnóstico',
      emoji: '🔧',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      path: '/debug'
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
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
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
                window.location.href = item.path;
              }}
              className={`${item.color} ${item.hoverColor} text-white rounded-lg shadow-lg p-6 transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
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
              onClick={() => window.location.href = '/workshops'}
              className="flex flex-col items-center justify-center py-4 px-4 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">🍳</span>
              <span className="text-sm font-medium">Explorar Talleres</span>
            </button>
            <button
              onClick={() => window.location.href = '/bookings'}
              className="flex flex-col items-center justify-center py-4 px-4 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">📅</span>
              <span className="text-sm font-medium">Mis Reservas</span>
            </button>
            <button
              onClick={() => window.location.href = '/payments'}
              className="flex flex-col items-center justify-center py-4 px-4 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors duration-200"
            >
              <span className="text-2xl mb-2">💳</span>
              <span className="text-sm font-medium">Pagos</span>
            </button>
            <button
              onClick={() => window.location.href = '/debug'}
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

        {/* Estado del sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            ℹ️ Estado del Sistema
          </h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• <strong>Usuario:</strong> {user?.email} (ID: {user?.id})</p>
            <p>• <strong>Token:</strong> {localStorage.getItem('authToken') ? 'Activo ✅' : 'No disponible ❌'}</p>
            <p>• <strong>Dashboard:</strong> Funcionando ✅</p>
            <p>• <strong>Talleres:</strong> <a href="/workshops" className="underline">Ir a talleres</a></p>
            <p>• <strong>Reservas:</strong> <a href="/bookings" className="underline">Ver mis reservas</a></p>
            <p>• <strong>Pagos:</strong> <a href="/payment" className="underline">Sistema de pagos</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Panel de Debug básico
const DebugPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔧 Panel de Debug Básico
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Estado de Auth</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p>Token: {localStorage.getItem('authToken') ? 'Presente' : 'Ausente'}</p>
              <p>Usuario: {localStorage.getItem('user') ? 'Guardado' : 'No guardado'}</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Tests Básicos</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  fetch('http://localhost:5004/api/v0/hello')
                    .then(r => r.json())
                    .then(d => alert(`Gateway OK: ${JSON.stringify(d)}`))
                    .catch(e => alert(`Error: ${e.message}`));
                }}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Test API Gateway
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('authToken');
                  fetch('http://localhost:5004/api/v0/workshops', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                    .then(r => r.json())
                    .then(d => alert(`Talleres: ${Array.isArray(d) ? d.length : 'Error'}`))
                    .catch(e => alert(`Error: ${e.message}`));
                }}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Test Talleres
              </button>
              <button
                onClick={() => window.location.href = '/payment'}
                className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
              >
                Test Página de Pago
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            ← Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/workshops'}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
          >
            Talleres
          </button>
          <button
            onClick={() => window.location.href = '/bookings'}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Reservas
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Componente temporal para páginas no implementadas
const TempPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-4">Funcionalidad próximamente</p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        ← Volver al Dashboard
      </button>
    </div>
  </div>
);

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('[PROTECTED_ROUTE] Usuario:', user?.email, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED_ROUTE] No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    console.log('[PUBLIC_ROUTE] Usuario ya autenticado, redirigiendo a dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente principal
function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas públicas */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Dashboard mejorado */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ TALLERES REALES */}
          <Route 
            path="/workshops" 
            element={
              <ProtectedRoute>
                <WorkshopsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ RESERVAS REALES */}
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } 
          />

          {/* ✅ PÁGINA DE PAGOS */}
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />

          {/* ALIAS PARA RESERVAS */}
          <Route 
            path="/my-bookings" 
            element={<Navigate to="/bookings" replace />} 
          />
          
          {/* Panel de Debug básico */}
          <Route 
            path="/debug" 
            element={<DebugPage />} 
          />
          
          {/* Páginas temporales */}
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <TempPage title="💳 Historial de Pagos" />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 mejorado */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 mb-3"><strong>Rutas disponibles:</strong></p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <a href="/dashboard" className="text-indigo-600 hover:underline">📊 Dashboard</a>
                      <a href="/workshops" className="text-indigo-600 hover:underline">🍳 Talleres</a>
                      <a href="/bookings" className="text-indigo-600 hover:underline">📅 Reservas</a>
                      <a href="/payment" className="text-indigo-600 hover:underline">💳 Pagos</a>
                      <a href="/debug" className="text-indigo-600 hover:underline">🔧 Debug</a>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 mr-3"
                    >
                      🏠 Ir al Dashboard
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      ← Volver
                    </button>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

// App principal
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;