import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe tener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe tener al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe tener al menos un número');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDebugInfo(null);
    setIsLoading(true);

    console.log('🚀 [REGISTER] Iniciando proceso de registro...');
    console.log('📝 [REGISTER] Datos del formulario:', {
      name: formData.name,
      email: formData.email,
      passwordLength: formData.password.length
    });

    try {
      // Validaciones del lado cliente
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Por favor, completa todos los campos');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Por favor, ingresa un email válido');
      }

      if (formData.name.length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        throw new Error(`La contraseña: ${passwordErrors.join(', ')}`);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      console.log('✅ [REGISTER] Validaciones pasadas, llamando a register...');

      // Intentar registro
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log('📊 [REGISTER] Resultado del registro:', success);
      setDebugInfo({ step: 'register', success, timestamp: new Date().toLocaleTimeString() });

      if (success) {
        setSuccess('¡Registro exitoso! Redirigiendo al dashboard...');
        console.log('🎉 [REGISTER] Registro exitoso, redirigiendo...');
        
        // Pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error('El registro falló. Por favor intenta nuevamente.');
      }

    } catch (err: any) {
      console.error('❌ [REGISTER] Error en registro:', err);
      
      // Determinar el tipo de error
      let errorMessage = 'Error desconocido';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Errores específicos comunes
      if (errorMessage.includes('ya registrado') || errorMessage.includes('already')) {
        errorMessage = 'Este email ya está registrado. Intenta con otro email o ve al login.';
      } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'El servidor tardó demasiado en responder. Intenta nuevamente.';
      }

      setError(errorMessage);
      setDebugInfo({ 
        step: 'error', 
        error: err, 
        message: errorMessage,
        timestamp: new Date().toLocaleTimeString() 
      });

    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    if (password.length === 0) return { strength: 0, text: '' };
    
    const strength = Math.max(0, 4 - errors.length);
    const strengthTexts = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      text: strengthTexts[strength],
      color: strengthColors[strength]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Función para test rápido
  const fillTestData = () => {
    const timestamp = Date.now();
    setFormData({
      name: 'Usuario Test',
      email: `test${timestamp}@example.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-500">❌</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Error en el registro:</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-500">✅</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug info (solo en desarrollo) */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md text-xs">
              <p className="font-medium">Debug Info ({debugInfo.timestamp}):</p>
              <pre className="mt-1 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </div>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>

          {/* Botón para llenar datos de prueba (solo en desarrollo) */}
          <div className="text-center">
            <button
              type="button"
              onClick={fillTestData}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Llenar datos de prueba
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Al registrarte, aceptas nuestros términos y condiciones
          </div>
        </form>

        {/* Enlaces útiles para debugging */}
        <div className="text-center space-y-2">
          <Link
            to="/debug"
            className="text-sm text-blue-600 hover:text-blue-800 underline block"
          >
            🔧 Panel de Debug
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-800 underline block"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;