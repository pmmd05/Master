import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
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
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return { strength: level, text: labels[level], color: colors[level] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setDebugInfo(null); setIsLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) throw new Error('Por favor, completa todos los campos');
      if (!formData.email.includes('@')) throw new Error('Por favor, ingresa un email válido');
      if (formData.name.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
      const pwErrors = validatePassword(formData.password);
      if (pwErrors.length) throw new Error(`La contraseña: ${pwErrors.join(', ')}`);
      if (formData.password !== formData.confirmPassword) throw new Error('Las contraseñas no coinciden');

      const result = await register({ name: formData.name, email: formData.email, password: formData.password });
      setDebugInfo({ step: 'register', success: result, timestamp: new Date().toLocaleTimeString() });
      if (result) {
        setSuccess('¡Registro exitoso! Redirigiendo al dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else throw new Error('El registro falló. Por favor intenta nuevamente.');
    } catch (err: any) {
      let msg = err.message || 'Error desconocido';
      if (/ya registrado|already/.test(msg)) msg = 'Este email ya está registrado. Intenta con otro email o ve al login.';
      else if (/connection|network/.test(msg)) msg = 'Error de conexión. Verifica que el servidor esté funcionando.';
      else if (/timeout/.test(msg)) msg = 'El servidor tardó demasiado en responder. Intenta nuevamente.';
      setError(msg);
      setDebugInfo({ step: 'error', error: err, message: msg, timestamp: new Date().toLocaleTimeString() });
    } finally { setIsLoading(false); }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="form-wrapper">
        <div className="container-centered">
          <div className="card">
            <img src="/Logo.png.png" alt="Logo Mastercook" className="mx-auto mb-4" style={{ height: 450, width: 'auto' }} />
            <h2 className="section-title text-center mb-6">{TEXTS.title}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label-field">{TEXTS.nameLabel}</label>
                <input id="name" name="name" type="text" autoComplete="name" required className="input-field" placeholder={TEXTS.namePlaceholder} value={formData.name} onChange={handleChange} disabled={isLoading} />
              </div>
              <div>
                <label htmlFor="email" className="label-field">{TEXTS.emailLabel}</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="input-field" placeholder={TEXTS.emailPlaceholder} value={formData.email} onChange={handleChange} disabled={isLoading} />
              </div>
              <div>
                <label htmlFor="password" className="label-field">{TEXTS.passwordLabel}</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required className="input-field pr-10" placeholder={TEXTS.passwordPlaceholder} value={formData.password} onChange={handleChange} disabled={isLoading} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400"/> : <EyeIcon className="h-5 w-5 text-gray-400"/>}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className={`${passwordStrength.color} h-2 rounded-full transition-all`} style={{ width: `${(passwordStrength.strength/4)*100}%` }} />
                    </div>
                    <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label-field">{TEXTS.confirmPasswordLabel}</label>
                <div className="relative">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required className="input-field pr-10" placeholder={TEXTS.confirmPasswordPlaceholder} value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400"/> : <EyeIcon className="h-5 w-5 text-gray-400"/>}
                  </button>
                </div>
              </div>

              {error && (<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"><div className="flex items-start space-x-2"><span className="text-red-500">❌</span><div><p className="font-medium">Error en el registro:</p><p>{error}</p></div></div></div>)}
              {success && (<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm"><div className="flex items-center space-x-2"><span className="text-green-500">✅</span><p className="font-medium">{success}</p></div></div>)}

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-2">{isLoading ? TEXTS.registeringButton : TEXTS.registerButton}</button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">{TEXTS.loginLinkText}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
