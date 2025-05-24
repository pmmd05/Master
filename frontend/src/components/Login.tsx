import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
      {/* Fondo con efecto de traslucidez */}
      <div className="fixed inset-0 bg-[url('/Fonfo.jpg')] bg-cover bg-center z-0">
        <div className="absolute inset-0 bg-white bg-opacity-60"></div>
      </div>

      {/* Contenido principal */}
      <div className="min-h-screen flex justify-center items-center relative z-10">
        <div className="form-wrapper">
          <div className="container-centered">  
            <div className="card">
              {/* Logo Mastercook */}
              <img
                src="/Logo.png.png"
                alt="Logo Mastercook"
                className="mx-auto mb-4 block"
                style={{ height: "450px", width: "auto" }}
              />
              <h2 className="section-title">Iniciar sesión</h2>

              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                <div>
                  <label className="label-field" style={{ fontSize: '2rem' }}>Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label-field" style={{ fontSize: '2rem' }}>Contraseña</label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Entrar'}
                </button>
              </form>

              <p className="text-helper mt-4 text-center">
                ¿No tienes cuenta?{' '}
                <a href="/register" className="text-indigo-600 hover:underline">
                  Regístrate
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;