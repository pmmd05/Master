// frontend/src/App.tsx - ACTUALIZADO CON HISTORIAL DE PAGOS
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkshopsProvider } from './context/WorkshopsContext';

// Importar componentes
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkshopsPage from './components/WorkshopsPage';
import BookingsPage from './components/BookingPage';
import PaymentPage from './components/PaymentPage';
import PaymentHistoryPage from './components/PaymentHistoryPage'; // ✅ NUEVO

// Importar estilos base
import './components/estilos/base.css';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#FAFAFA'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #E5E7EB',
            borderTop: '3px solid #D94F4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '0.5rem'
          }}>
            Cargando MasterCook Academy...
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#666666'
          }}>
            Preparando tu experiencia culinaria
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas (solo para usuarios no autenticados)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#FAFAFA'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #E5E7EB',
            borderTop: '3px solid #D94F4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#333333'
          }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas - Solo para usuarios no autenticados */}
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

        {/* Rutas protegidas - Solo para usuarios autenticados */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/workshops" 
          element={
            <ProtectedRoute>
              <WorkshopsProvider>
                <WorkshopsPage />
              </WorkshopsProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } 
        />
        
        {/* ✅ NUEVA RUTA: Historial de Pagos */}
        <Route 
          path="/payment-history" 
          element={
            <ProtectedRoute>
              <PaymentHistoryPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta por defecto */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        {/* Ruta 404 - Página no encontrada */}
        <Route 
          path="*" 
          element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              backgroundColor: '#FAFAFA',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '3rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(217, 79, 79, 0.1)',
                maxWidth: '500px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1rem'
                }}>
                  🍳
                </div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#D94F4F',
                  marginBottom: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  ¡Ups! Página no encontrada
                </h1>
                <p style={{
                  fontSize: '1rem',
                  color: '#666666',
                  marginBottom: '2rem',
                  lineHeight: '1.6'
                }}>
                  Parece que esta receta no existe en nuestro libro de cocina. 
                  Te ayudamos a volver a la cocina principal.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    style={{
                      background: 'linear-gradient(135deg, #D94F4F, #C62828)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    🏠 Ir al Dashboard
                  </button>
                  <button
                    onClick={() => window.location.href = '/workshops'}
                    style={{
                      background: 'white',
                      color: '#D94F4F',
                      border: '2px solid #D94F4F',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#D94F4F';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#D94F4F';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    🍳 Ver Talleres
                  </button>
                </div>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

// Componente App principal con proveedores
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;