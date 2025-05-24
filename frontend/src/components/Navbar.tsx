import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
    { path: '/bookings', label: 'Mis Reservas', icon: '📅' },
    { path: '/payments', label: 'Pagos', icon: '💳' }
  ];

  return (
    <nav className="navbar-mastercook">
      <div className="navbar-content">
        
        {/* Logo y Brand */}
        <div className="navbar-logo">
          <img 
            src="/Logo.png.png" 
            alt="MasterCook Academy Logo" 
            className="navbar-logo img"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
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
            >
              <span className="icon-sm mr-2">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>

        {/* Usuario y Acciones */}
        <div className="navbar-user">
          {/* Información del usuario */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500">
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
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="icon-md text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown del usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="md:hidden px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <span className="icon-sm mr-3">🏠</span>
                  Dashboard
                </button>
                
                <button
                  onClick={() => navigate('/debug')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <span className="icon-sm mr-3">🔧</span>
                  Debug Panel
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <span className="icon-sm mr-3">🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Botón móvil de menú */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="icon-lg text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="py-4 px-6 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center ${
                  isActivePath(link.path) 
                    ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="icon-md mr-3">{link.icon}</span>
                {link.label}
              </button>
            ))}
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left p-3 rounded-lg text-red-600 hover:bg-red-50 flex items-center"
              >
                <span className="icon-md mr-3">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar menús */}
      {(showMobileMenu || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowMobileMenu(false);
            setShowUserMenu(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;