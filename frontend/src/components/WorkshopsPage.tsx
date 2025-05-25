// frontend/src/components/WorkshopsPage.tsx - CON ESTILOS MASTERCOOK ACADEMY
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WorkshopsProvider } from '../context/WorkshopsContext';
import WorkshopsSearch from './WorkshopsSearch';
import WorkshopsList from './WorkshopsList';
import './estilos/workshops.css';
import Navbar from './Navbar';

const WorkshopsPageContent: React.FC = () => {
  const { user } = useAuth();

  return (
    
    <div className="workshops-container">
      <Navbar />
      <div className="workshops-main-content">
        
        {/* Header de Workshops */}
        <div className="workshops-header">
          <div className="workshops-header-content">
            <h1 className="workshops-header-title">
              Explora Nuestros Talleres
            </h1>
            <div className="workshops-header-actions">
              <span className="workshops-header-user-info">
                Hola, <span className="workshops-header-user-name">{user?.name}</span>
              </span>
              
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="workshops-hero">
          <div className="workshops-hero-content">
            <h2 className="workshops-hero-title">
              ¡Hola {user?.name?.split(' ')[0]}! Descubre Experiencias Culinarias Únicas
            </h2>
            <p className="workshops-hero-subtitle">
              Como miembro de nuestra comunidad, tienes acceso completo a todos nuestros talleres. 
              Desde pasta italiana hasta sushi japonés, encuentra el taller perfecto para expandir tus habilidades culinarias.
            </p>
            <div className="workshops-hero-features">
              <div className="workshops-hero-feature">
                <svg className="workshops-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instructores Expertos
              </div>
              <div className="workshops-hero-feature">
                <svg className="workshops-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                Clases Prácticas
              </div>
              <div className="workshops-hero-feature">
                <svg className="workshops-hero-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
                Ambiente Acogedor
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <WorkshopsSearch />

        {/* Lista de talleres */}
        <div className="workshops-list-container">
          <WorkshopsList />
        </div>

        {/* Información adicional */}
        <div className="workshops-info-section">
          <h3 className="workshops-info-title">
            ¿Cómo funciona?
          </h3>
          <div className="workshops-info-grid">
            <div className="workshops-info-item">
              <div className="workshops-info-item-icon">
                <span>1</span>
              </div>
              <h4 className="workshops-info-item-title">Elige tu Taller</h4>
              <p className="workshops-info-item-description">
                Navega por nuestros talleres y encuentra el que más te interese
              </p>
            </div>
            <div className="workshops-info-item">
              <div className="workshops-info-item-icon">
                <span>2</span>
              </div>
              <h4 className="workshops-info-item-title">Haz tu Reserva</h4>
              <p className="workshops-info-item-description">
                Reserva tu cupo con un solo click. ¡Los cupos son limitados!
              </p>
            </div>
            <div className="workshops-info-item">
              <div className="workshops-info-item-icon">
                <span>3</span>
              </div>
              <h4 className="workshops-info-item-title">Disfruta y Aprende</h4>
              <p className="workshops-info-item-description">
                Asiste al taller y disfruta de una experiencia culinaria única
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action personalizada */}
        <div className="workshops-cta-section">
          <h3 className="workshops-cta-title">
            ¡Todo listo para reservar!
          </h3>
          <p className="workshops-cta-description">
            Como usuario registrado, puedes reservar cualquier taller disponible con un solo click. 
            Recuerda revisar tus reservas en el dashboard.
          </p>
          <div className="workshops-cta-buttons">
            <button
              onClick={() => window.location.href = '/bookings'}
              className="workshops-cta-button primary"
            >
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver Mis Reservas
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="workshops-cta-button secondary"
            >
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal que provee el contexto
const WorkshopsPage: React.FC = () => {
  return (
    <WorkshopsProvider>
      <WorkshopsPageContent />
    </WorkshopsProvider>
  );
};

export default WorkshopsPage;