import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Importaciones básicas
import Login from './components/Login';
import Register from './components/Register';

// Importaciones de páginas principales
import Dashboard from './components/Dashboard'; // ✅ IMPORTAR EL DASHBOARD CORRECTO
import WorkshopsPage from './components/WorkshopsPage';
import BookingPage from './components/BookingPage';

// IMPORTAR PaymentPage
import PaymentPage from './components/PaymentPage';

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
          
          {/* DASHBOARD */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* TALLERES REALES */}
          <Route 
            path="/workshops" 
            element={
              <ProtectedRoute>
                <WorkshopsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* RESERVAS REALES */}
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } 
          />

          {/* PÁGINA DE PAGOS */}
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