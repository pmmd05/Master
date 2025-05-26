import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import './estilos/register.css';

// Configuración de textos y placeholders
const TEXTS = {
  title: 'Crea tu cuenta',
  nameLabel: 'Nombre completo',
  namePlaceholder: 'Tu nombre completo',
  emailLabel: 'Email',
  emailPlaceholder: 'tu@email.com',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'Escribe tu contraseña',
  confirmPasswordLabel: 'Confirmar contraseña',
  confirmPasswordPlaceholder: 'Repite tu contraseña',
  registerButton: 'Registrarse',
  registeringButton: 'Registrando...',
  loginLinkText: '¿Ya tienes cuenta? Inicia sesión'
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { login } = useAuth(); // Solo usamos login, no register
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
    if (name === 'email' && emailError) setEmailError('');
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Debe tener al menos una mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Debe tener al menos una minúscula');
    if (!/\d/.test(password)) errors.push('Debe tener al menos un número');
    return errors;
  };

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    if (!password) return { strength: 0, text: '' };
    const level = Math.max(0, 4 - errors.length);
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    return { strength: level, text: labels[level] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setEmailError(''); setDebugInfo(null); setIsLoading(true);
    
    try {
      // Validaciones locales
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Por favor, completa todos los campos');
      }
      if (!formData.email.includes('@')) {
        throw new Error('Por favor, ingresa un email válido');
      }
      if (formData.name.length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      const pwErrors = validatePassword(formData.password);
      if (pwErrors.length) {
        throw new Error(`La contraseña: ${pwErrors.join(', ')}`);
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      console.log('🔄 [REGISTER] Iniciando registro directo con API...');

      // NUEVO: Usar authService directamente en lugar del AuthContext
      const registerResponse = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log('✅ [REGISTER] Registro exitoso:', registerResponse);
      
      // Mostrar mensaje de éxito
      setSuccess('¡Registro exitoso! Iniciando sesión automáticamente...');
      setDebugInfo({ 
        step: 'register_success', 
        response: registerResponse,
        timestamp: new Date().toLocaleTimeString() 
      });

      // Esperar un momento para que el usuario vea el mensaje
      setTimeout(async () => {
        try {
          console.log('🔄 [REGISTER] Iniciando login automático...');
          
          // Hacer login automático usando el AuthContext
          const loginSuccess = await login(formData.email, formData.password);
          
          if (loginSuccess) {
            console.log('✅ [REGISTER] Login automático exitoso');
            setSuccess('¡Bienvenido! Redirigiendo al dashboard...');
            setTimeout(() => navigate('/dashboard'), 1000);
          } else {
            console.log('⚠️ [REGISTER] Login automático falló, redirigiendo a login');
            setSuccess('Registro exitoso. Por favor, inicia sesión.');
            setTimeout(() => navigate('/login'), 2000);
          }
          
        } catch (loginError: any) {
          console.error('❌ [REGISTER] Error en login automático:', loginError);
          setSuccess('Registro exitoso. Por favor, inicia sesión manualmente.');
          setTimeout(() => navigate('/login'), 2000);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ [REGISTER] Error en registro:', err);
      console.log('📋 [REGISTER] Mensaje de error completo:', err.message);
      
      let msg = err.message || 'Error desconocido';
      
      // Debugging: mostrar el mensaje completo
      console.log('🔍 [REGISTER] Analizando mensaje:', msg);
      
      // Detectar si es un error de email ya registrado (regex más amplio)
      const isEmailError = /ya registrado|already|UNIQUE|duplicate|correo|email.*exist|409|Correo ya registrado/i.test(msg);
      
      console.log('🎯 [REGISTER] ¿Es error de email?', isEmailError);
      
      if (isEmailError) {
        console.log('📧 [REGISTER] Mostrando error de email duplicado');
        setEmailError('Este correo ya ha sido registrado. Intente nuevamente con uno diferente.');
        setDebugInfo({ 
          step: 'email_error', 
          error: err, 
          originalMessage: msg,
          detectedAs: 'Email duplicado', 
          timestamp: new Date().toLocaleTimeString() 
        });
      } else {
        console.log('⚠️ [REGISTER] Mostrando error general');
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
      setIsLoading(false); 
      console.log('🏁 [REGISTER] Proceso completado');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="register-card fade-in">
          {/* Logo Mastercook */}
          <img 
            src="/Logo.png.png" 
            alt="Logo Mastercook" 
            className="register-logo" 
          />
          
          {/* Título de registro */}
          <h2 className="register-title">{TEXTS.title}</h2>

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Campo Nombre */}
            <div className="register-field-group">
              <label htmlFor="name" className="label-field">
                <span>👤</span>
                {TEXTS.nameLabel}
              </label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                autoComplete="name" 
                required 
                className="input-field" 
                placeholder={TEXTS.namePlaceholder} 
                value={formData.name} 
                onChange={handleChange} 
                disabled={isLoading} 
              />
            </div>

            {/* Campo Email */}
            <div className="register-field-group">
              <label htmlFor="email" className="label-field">
                <span>📧</span>
                {TEXTS.emailLabel}
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="input-field" 
                placeholder={TEXTS.emailPlaceholder} 
                value={formData.email} 
                onChange={handleChange} 
                disabled={isLoading} 
              />
              
              {/* Error específico del email */}
              {emailError && (
                <div className="email-error-message slide-in">
                  <span className="email-error-icon">❌</span>
                  <span className="email-error-text">{emailError}</span>
                </div>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="register-field-group">
              <label htmlFor="password" className="label-field">
                <span>🔒</span>
                {TEXTS.passwordLabel}
              </label>
              <div className="password-field-container">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  required 
                  className="input-field" 
                  placeholder={TEXTS.passwordPlaceholder} 
                  value={formData.password} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                />
                <button 
                  type="button" 
                  className="password-toggle-button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  disabled={isLoading}
                >
                  {showPassword ? 
                    <EyeSlashIcon className="password-toggle-icon"/> : 
                    <EyeIcon className="password-toggle-icon"/>
                  }
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña mejorado */}
              {formData.password && (
                <div className="password-strength-indicator">
                  <div className="password-strength-bar-container">
                    <div 
                      className={`password-strength-bar-fill strength-bar-${passwordStrength.strength}`} 
                      style={{ width: `${(passwordStrength.strength/4)*100}%` }} 
                    />
                  </div>
                  <span className="password-strength-label">
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="register-field-group">
              <label htmlFor="confirmPassword" className="label-field">
                <span>🔐</span>
                {TEXTS.confirmPasswordLabel}
              </label>
              <div className="password-field-container">
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  required 
                  className="input-field" 
                  placeholder={TEXTS.confirmPasswordPlaceholder} 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                />
                <button 
                  type="button" 
                  className="password-toggle-button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  disabled={isLoading}
                >
                  {showConfirmPassword ? 
                    <EyeSlashIcon className="password-toggle-icon"/> : 
                    <EyeIcon className="password-toggle-icon"/>
                  }
                </button>
              </div>
            </div>

            {/* Mensajes de estado mejorados */}
            {error && (
              <div className="register-message register-message-error slide-in">
                <span className="register-message-icon">❌</span>
                <div className="register-message-content">
                  <p className="register-message-title">Error en el registro:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="register-message register-message-success slide-in">
                <span className="register-message-icon">✅</span>
                <div className="register-message-content">
                  <p className="register-message-title">{success}</p>
                </div>
              </div>
            )}

            {/* Botón de registro */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`btn-primary register-button ${isLoading ? 'register-loading' : ''}`}
            >
              {isLoading ? TEXTS.registeringButton : TEXTS.registerButton}
            </button>

            {/* Enlace a login */}
            <div className="register-help-text">
              <Link to="/login" className="link-primary">
                {TEXTS.loginLinkText}
              </Link>
            </div>
          </form>

         
        </div>
      </div>
    </div>
  );
};

export default Register;