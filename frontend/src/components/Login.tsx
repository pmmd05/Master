import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import './estilos/login.css';

const Login: React.FC = () => {
  const { login: setAuthState } = useAuth(); // Solo para actualizar estado
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (emailError) setEmailError('');
    } else {
      setPassword(value);
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError('');
    setDebugInfo(null);
    setLoading(true);

    try {
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Por favor, completa todos los campos');
      }

      if (!email.includes('@')) {
        throw new Error('Por favor, ingresa un email válido');
      }

      console.log('🔄 [LOGIN] Iniciando login directo con API...');

      // PASO 1: Intentar login directo con API para obtener errores específicos
      const authResponse = await authService.login({
        username: email, // La API espera 'username' pero es el email
        password
      });

      console.log('✅ [LOGIN] Login directo exitoso:', authResponse.token_type);

      // PASO 2: Guardar token INMEDIATAMENTE para que el interceptor lo use
      console.log('💾 [LOGIN] Guardando token en localStorage...');
      localStorage.setItem('authToken', authResponse.access_token);

      // PASO 3: Ahora obtener perfil del usuario (con token ya disponible)
      console.log('👤 [LOGIN] Obteniendo perfil del usuario...');
      const userProfile = await authService.getProfile();

      // PASO 4: Guardar datos del usuario
      console.log('💾 [LOGIN] Guardando datos del usuario...');
      localStorage.setItem('user', JSON.stringify(userProfile));

      // PASO 4: Intentar actualizar AuthContext (opcional, si falla no importa)
      try {
        console.log('🔄 [LOGIN] Actualizando AuthContext...');
        await setAuthState(email, password);
      } catch (contextError) {
        console.warn('⚠️ [LOGIN] Error actualizando contexto, pero login fue exitoso');
      }

      console.log('✅ [LOGIN] Login completado exitosamente');
      setDebugInfo({ 
        step: 'login_success', 
        user: userProfile.email,
        timestamp: new Date().toLocaleTimeString() 
      });

      // PASO 5: Redirigir al dashboard
      navigate('/dashboard');

    } catch (err: any) {
      console.error('❌ [LOGIN] Error en login:', err);
      console.log('📋 [LOGIN] Mensaje de error completo:', err.message);

      let msg = err.message || 'Error desconocido';
      
      // Debugging: mostrar el mensaje completo
      console.log('🔍 [LOGIN] Analizando mensaje:', msg);
      
      // ✅ REGEX MEJORADO para detectar errores de credenciales inválidas
      const isCredentialsError = 
        /credenciales.*inválid|invalid.*credentials|401|unauthorized|incorrect|wrong|authentication.*failed|login.*failed|not.*authenticated|correo.*contraseña.*inválid|email.*password.*invalid|invalid.*login|bad.*credentials|login.*incorrect|access.*denied/i.test(msg);
      
      console.log('🎯 [LOGIN] ¿Es error de credenciales?', isCredentialsError);
      
      if (isCredentialsError) {
        console.log('🔐 [LOGIN] Mostrando error de credenciales inválidas');
        setEmailError('Tu correo o contraseña son inválidos, intenta de nuevo');
        setDebugInfo({ 
          step: 'credentials_error', 
          error: err, 
          originalMessage: msg,
          detectedAs: 'Credenciales inválidas', 
          timestamp: new Date().toLocaleTimeString() 
        });
      } else {
        console.log('⚠️ [LOGIN] Mostrando error general');
        // Otros errores van al error general
        if (/connection|network/i.test(msg)) {
          msg = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else if (/timeout/i.test(msg)) {
          msg = 'El servidor tardó demasiado en responder. Intenta nuevamente.';
        } else if (/500|internal server/i.test(msg)) {
          msg = 'Error del servidor. Intenta nuevamente en unos minutos.';
        }
        
        setError(msg);
        setDebugInfo({ 
          step: 'general_error', 
          error: err, 
          originalMessage: err.message,
          processedMessage: msg, 
          timestamp: new Date().toLocaleTimeString() 
        });
      }

    } finally {
      setLoading(false);
      console.log('🏁 [LOGIN] Proceso completado');
    }
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
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  required
                />
                
                {/* Error específico de credenciales debajo del email */}
                {emailError && (
                  <div className="email-error-message slide-in">
                    <span className="email-error-icon">❌</span>
                    <span className="email-error-text">{emailError}</span>
                  </div>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="login-field-group">
                <label className="label-field">
                  <span>🔒</span>
                  Contraseña
                </label>
                <div className="password-field-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    value={password}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="Escribe tu contraseña"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? 
                      <EyeSlashIcon className="password-toggle-icon"/> : 
                      <EyeIcon className="password-toggle-icon"/>
                    }
                  </button>
                </div>
              </div>

              {/* Mensajes de error general */}
              {error && (
                <div className="login-message login-message-error slide-in">
                  <span className="login-message-icon">❌</span>
                  <div className="login-message-content">
                    <p className="login-message-title">Error en el login:</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Botón de login */}
              <button
                type="submit"
                className={`btn-primary login-button ${loading ? 'login-loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </form>

            {/* Texto de ayuda */}
            <p className="login-help-text">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="link-primary">
                Regístrate aquí
              </Link>
            </p>

           
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;