// frontend/src/components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './estilos/dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: 'Explorar Talleres',
      description: 'Descubre nuestros talleres de cocina disponibles y reserva tu lugar en clases exclusivas',
      icon: (
        <svg className="dashboard-nav-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: '/workshops',
      emoji: '🍳'
    },
    {
      title: 'Mis Reservas',
      description: 'Gestiona tus reservas de talleres, revisa horarios y mantente al día con tus clases',
      icon: (
        <svg className="dashboard-nav-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/bookings',
      emoji: '📅'
    },
    {
      title: 'Historial de Pagos',
      description: 'Revisa tus pagos, transacciones y mantén un control de tus inversiones culinarias',
      icon: (
        <svg className="dashboard-nav-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      path: '/payments',
      emoji: '💳'
    },
  ];

  const quickActions = [
    { emoji: '🍳', text: 'Explorar Talleres', action: () => navigate('/workshops') },
    { emoji: '📅', text: 'Mis Reservas', action: () => navigate('/bookings') },
    { emoji: '💳', text: 'Pagos', action: () => navigate('/payments') },
    { emoji: '🔧', text: 'Debug', action: () => navigate('/debug') },
    { emoji: '🔄', text: 'Recargar', action: () => window.location.reload() },
  ];

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main-content">
        
        {/* Hero Section */}
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <h1 className="dashboard-hero-title">
              ¡Bienvenido de vuelta, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="dashboard-hero-subtitle">
              Estamos emocionados de tenerte aquí. Explora nuestros talleres de cocina y descubre nuevas habilidades culinarias en un ambiente profesional y acogedor.
            </p>
            <div className="dashboard-hero-features">
              <div className="dashboard-hero-feature">
                <svg className="dashboard-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instructores Expertos
              </div>
              <div className="dashboard-hero-feature">
                <svg className="dashboard-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                Clases Prácticas
              </div>
              <div className="dashboard-hero-feature">
                <svg className="dashboard-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
                Ambiente Acogedor
              </div>
            </div>
          </div>
        </section>

        {/* Navegación principal */}
        <section className="dashboard-navigation-grid">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                console.log(`🔄 [DASHBOARD] Navegando a: ${item.path}`);
                navigate(item.path);
              }}
              className="dashboard-nav-card"
            >
              <div className="dashboard-nav-card-header">
                <div className="dashboard-nav-card-icon-container">
                  {item.icon}
                </div>
                <div className="dashboard-nav-card-title-container">
                  <span className="dashboard-nav-card-emoji">{item.emoji}</span>
                  <h3 className="dashboard-nav-card-title">{item.title}</h3>
                </div>
              </div>
              <p className="dashboard-nav-card-description">{item.description}</p>
            </button>
          ))}
        </section>

        {/* Acciones rápidas */}
        <section className="dashboard-quick-actions">
          <h3 className="dashboard-section-title">
            <span className="dashboard-section-title-emoji">⚡</span>
            Acciones Rápidas
          </h3>
          <div className="dashboard-quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.action}
                className="dashboard-quick-action-button"
              >
                <span className="dashboard-quick-action-emoji">{action.emoji}</span>
                <span className="dashboard-quick-action-text">{action.text}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Estadísticas de usuario */}
        <section className="dashboard-stats">
          <h3 className="dashboard-section-title">
            <span className="dashboard-section-title-emoji">📊</span>
            Tu Actividad en MasterCook
          </h3>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card dashboard-stat-card-red">
              <div className="dashboard-stat-number dashboard-stat-number-red">0</div>
              <div className="dashboard-stat-label dashboard-stat-label-red">Talleres Reservados</div>
              <div className="dashboard-stat-sublabel dashboard-stat-sublabel-red">Este mes</div>
            </div>
            <div className="dashboard-stat-card dashboard-stat-card-green">
              <div className="dashboard-stat-number dashboard-stat-number-green">0</div>
              <div className="dashboard-stat-label dashboard-stat-label-green">Talleres Completados</div>
              <div className="dashboard-stat-sublabel dashboard-stat-sublabel-green">Total</div>
            </div>
            <div className="dashboard-stat-card dashboard-stat-card-yellow">
              <div className="dashboard-stat-number dashboard-stat-number-yellow">0</div>
              <div className="dashboard-stat-label dashboard-stat-label-yellow">Certificados Obtenidos</div>
              <div className="dashboard-stat-sublabel dashboard-stat-sublabel-yellow">Disponibles próximamente</div>
            </div>
          </div>
        </section>

        {/* Información de estado del sistema */}
        <section className="dashboard-system-info">
          <h3 className="dashboard-system-info-title">
            <span className="dashboard-system-info-title-emoji">ℹ️</span>
            Estado del Sistema
          </h3>
          <div className="dashboard-system-info-content">
            <div className="dashboard-system-info-item">
              <span className="dashboard-system-info-bullet">•</span>
              <span><strong>Usuario:</strong> {user?.email} (ID: {user?.id})</span>
            </div>
            <div className="dashboard-system-info-item">
              <span className="dashboard-system-info-bullet">•</span>
              <span><strong>Token:</strong> {localStorage.getItem('authToken') ? '✅ Activo' : '❌ No disponible'}</span>
            </div>
            <div className="dashboard-system-info-item">
              <span className="dashboard-system-info-bullet">•</span>
              <span>
                <strong>Debug Panel:</strong>{' '}
                <button
                  type="button"
                  onClick={() => navigate('/debug')}
                  className="dashboard-system-info-link"
                >
                  Ir al panel de debug
                </button>
              </span>
            </div>
            <div className="dashboard-system-info-item">
              <span className="dashboard-system-info-bullet">•</span>
              <span><strong>Soporte:</strong> Si tienes problemas con reservas, usa el panel de debug para diagnosticar</span>
            </div>
          </div>
        </section>

        {/* Información de ayuda */}
        <section className="dashboard-help-info">
          <h3 className="dashboard-help-info-title">
            <span className="dashboard-help-info-title-emoji">🆘</span>
            ¿Necesitas Ayuda?
          </h3>
          <p className="dashboard-help-info-description">
            Si experimentas problemas técnicos con las reservas o pagos, tenemos herramientas de diagnóstico disponibles:
          </p>
          <div className="dashboard-help-buttons">
            <button 
              type="button"
              onClick={() => navigate('/debug')}
              className="dashboard-help-button dashboard-help-button-secondary"
            >
              🔧 Panel de Debug
            </button>
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="dashboard-help-button dashboard-help-button-outline"
            >
              🔄 Recargar Página
            </button>
            <button 
              type="button"
              onClick={() => navigate('/workshops')}
              className="dashboard-help-button dashboard-help-button-primary"
            >
              🍳 Ver Talleres
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
