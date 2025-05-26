// frontend/src/components/Navbar.tsx - VERSIÓN CORREGIDA CON SCROLL DETECTION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './estilos/navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ NUEVO: Detectar scroll para cambiar la apariencia de la navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al hacer clic fuera o al presionar Escape
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // ✅ NUEVO: Bloquear scroll del body cuando hay overlay
  useEffect(() => {
    if (isMenuOpen || isProfileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isProfileMenuOpen]);

  // Manejar logout
  const handleLogout = async () => {
    try {
      console.log('🚪 [NAVBAR] Iniciando logout...');
      await logout();
      navigate('/login');
      console.log('✅ [NAVBAR] Logout exitoso');
    } catch (error) {
      console.error('❌ [NAVBAR] Error en logout:', error);
      // Forzar navegación incluso si hay error
      navigate('/login');
    }
  };

  // Verificar si una ruta está activa
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Obtener solo el primer nombre del usuario
  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  // Elementos de navegación principales
  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Principal',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2M8 5a2 2 0 002 2h4a2 2 0 002-2M8 5v4h8V5" />
        </svg>
      ),
    },
    {
      path: '/workshops',
      label: 'Talleres',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      path: '/bookings',
      label: 'Mis Reservas',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: '/payment-history',
      label: 'Historial de Pagos',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    }
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          
          {/* Logo y marca */}
          <div className="navbar-brand">
            <button
              onClick={() => navigate('/dashboard')}
              className="navbar-logo-button"
              aria-label="Ir al dashboard"
            >
              <img 
                src="/Logo.png.png" 
                alt="MasterCook Academy" 
                className="navbar-logo"
              />
              <div className="navbar-brand-text">
                <span className="navbar-brand-name">MasterCook</span>
                <span className="navbar-brand-subtitle">Academy</span>
              </div>
            </button>
          </div>

          {/* Navegación principal - Desktop */}
          <div className="navbar-nav-desktop">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`navbar-nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                aria-label={`Ir a ${item.label}`}
              >
                {item.icon}
                <span className="navbar-nav-label">{item.label}</span>
                {isActiveRoute(item.path) && (
                  <div className="navbar-nav-active-indicator" />
                )}
              </button>
            ))}
          </div>

          {/* Perfil de usuario */}
          <div className="navbar-user">
            <div className="navbar-user-info">
              <span className="navbar-user-greeting">Hola, </span>
              <span className="navbar-user-name">{firstName}</span>
            </div>
            
            <div className="navbar-profile-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsMenuOpen(false); // Cerrar menú móvil si está abierto
                }}
                className="navbar-profile-button"
                aria-label="Menú de perfil"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="navbar-avatar">
                  <span className="navbar-avatar-text">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <svg 
                  className={`navbar-dropdown-icon ${isProfileMenuOpen ? 'open' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable de perfil */}
              {isProfileMenuOpen && (
                <div className="navbar-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="navbar-profile-header">
                    <div className="navbar-profile-avatar">
                      <span>{firstName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="navbar-profile-info">
                      <div className="navbar-profile-name">{user?.name}</div>
                      <div className="navbar-profile-email">{user?.email}</div>
                    </div>
                  </div>

                  <div className="navbar-profile-divider" />

                  <button
                    onClick={handleLogout}
                    className="navbar-profile-logout"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-profile-action-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
                setIsProfileMenuOpen(false); // Cerrar menú de perfil si está abierto
              }}
              className="navbar-mobile-menu-button"
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
            >
              <svg 
                className={`navbar-hamburger ${isMenuOpen ? 'open' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="navbar-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="navbar-mobile-header">
              <div className="navbar-mobile-user">
                <div className="navbar-mobile-avatar">
                  <span>{firstName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="navbar-mobile-user-info">
                  <div className="navbar-mobile-user-name">{user?.name}</div>
                  <div className="navbar-mobile-user-email">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="navbar-mobile-nav">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`navbar-mobile-nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                >
                  <div className="navbar-mobile-nav-icon">
                    {item.icon}
                  </div>
                  <span className="navbar-mobile-nav-label">{item.label}</span>
                  {isActiveRoute(item.path) && (
                    <div className="navbar-mobile-nav-active" />
                  )}
                </button>
              ))}
            </div>

            <div className="navbar-mobile-footer">
              <button
                onClick={handleLogout}
                className="navbar-mobile-logout"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="navbar-mobile-logout-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

   
      {(isMenuOpen || isProfileMenuOpen) && (
        <div 
          className="navbar-overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;