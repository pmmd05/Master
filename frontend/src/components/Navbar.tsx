import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './estilos/navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/workshops', label: 'Talleres', icon: '🍳' },
    { path: '/bookings', label: 'Reservas', icon: '📅' },
    { path: '/payments', label: 'Pagos', icon: '💳' }
  ];

  const closeMobileMenu = () => setShowMobileMenu(false);
  const closeUserMenu = () => setShowUserMenu(false);

  return (
    <>
      <nav className="navbar-mastercook">
        <div className="navbar-content">
          
          {/* Logo y Brand */}
          <div 
            className="navbar-logo"
            onClick={() => navigate('/dashboard')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/dashboard');
              }
            }}
          >
            <img 
              src="/Logo.png.png" 
              alt="MasterCook Academy Logo" 
              className="navbar-logo-img"
            />
            <div className="navbar-brand">MasterCook Academy</div>
          </div>

          {/* Navegación Desktop */}
          <div className="navbar-nav">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`navbar-link ${isActivePath(link.path) ? 'active' : ''}`}
                aria-label={`Ir a ${link.label}`}
              >
                <span className="icon-sm" role="img" aria-label={link.label}>
                  {link.icon}
                </span>
                {link.label}
              </button>
            ))}
          </div>

          {/* Usuario y Acciones */}
          <div className="navbar-user">
            {/* Información del usuario - Desktop */}
            <div className="navbar-user-info">
              <div className="navbar-user-details">
                <div className="navbar-user-name">
                  {user?.name}
                </div>
                <div className="navbar-user-email">
                  {user?.email}
                </div>
              </div>
              <div className="navbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="navbar-user-menu-button"
                aria-label="Menú de usuario"
                aria-expanded={showUserMenu}
              >
                <svg 
                  className="icon-md" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </button>

              {/* Dropdown del usuario */}
              {showUserMenu && (
                <div className="navbar-user-dropdown">
                  <div className="navbar-dropdown-user-info md:hidden">
                    <div className="navbar-user-name">{user?.name}</div>
                    <div className="navbar-user-email">{user?.email}</div>
                  </div>                  
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      closeUserMenu();
                    }}
                    className="navbar-dropdown-item danger"
                  >
                    <span className="icon-sm" role="img" aria-label="Cerrar sesión">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón móvil de menú */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="navbar-mobile-button"
              aria-label="Menú de navegación móvil"
              aria-expanded={showMobileMenu}
            >
              <svg 
                className="icon-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {showMobileMenu && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    closeMobileMenu();
                  }}
                  className={`navbar-mobile-link ${
                    isActivePath(link.path) ? 'active' : ''
                  }`}
                  aria-label={`Ir a ${link.label}`}
                >
                  <span className="icon-md" role="img" aria-label={link.label}>
                    {link.icon}
                  </span>
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="navbar-mobile-logout">
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="navbar-mobile-logout-button"
                aria-label="Cerrar sesión"
              >
                <span className="icon-md" role="img" aria-label="Cerrar sesión">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay para cerrar menús */}
      {(showMobileMenu || showUserMenu) && (
        <div 
          className="navbar-overlay" 
          onClick={() => {
            closeMobileMenu();
            closeUserMenu();
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;