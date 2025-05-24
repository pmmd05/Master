import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './estilos/login.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Fondo con efecto de traslucidez mejorado */}
      <div className="login-background"></div>

      {/* Contenido principal */}
      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-card fade-in">
            {/* Logo Mastercook */}
            <img
              src="/Logo.png.png"
              alt="Logo Mastercook"
              className="login-logo"
            />
            
            {/* Título de login */}
            <h2 className="login-title">Iniciar sesión</h2>

            {/* Mensaje de error */}
            {error && (
              <div className="login-error slide-in">
                <span className="login-error-icon">❌</span>
                <p>{error}</p>
              </div>
            )}

            {/* Formulario de login */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Campo Email */}
              <div className="login-field-group">
                <label className="label-field">
                  <span>📧</span>
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* Campo Contraseña */}
              <div className="login-field-group">
                <label className="label-field">
                  <span>🔒</span>
                  Contraseña
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  disabled={loading}
                  required
                />
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                className={`btn-primary login-button ${loading ? 'login-loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Entrar'}
              </button>
            </form>

            {/* Texto de ayuda */}
            <p className="login-help-text">
              ¿No tienes cuenta?{' '}
              <a href="/register" className="link-primary">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;