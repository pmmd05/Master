import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 [AUTH] Inicializando autenticación...');
      
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      console.log('📱 [AUTH] Token guardado:', savedToken ? 'Sí' : 'No');
      console.log('👤 [AUTH] Usuario guardado:', savedUser ? 'Sí' : 'No');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          console.log('✅ [AUTH] Datos locales cargados:', parsedUser.email);
          
          // Verificar que el token siga siendo válido obteniendo el perfil
          console.log('🔍 [AUTH] Verificando validez del token...');
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
          
          console.log('✅ [AUTH] Token válido, perfil actualizado');
        } catch (error) {
          console.error('❌ [AUTH] Token inválido o expirado:', error);
          // Limpiar datos inválidos
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('ℹ️ [AUTH] No hay datos de autenticación guardados');
      }
      
      setLoading(false);
      console.log('✅ [AUTH] Inicialización completada');
    };

    initializeAuth();
  }, []);

  // ✅ CORREGIDO: Ahora lanza excepciones para que los componentes puedan capturar errores
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🚀 [AUTH] Iniciando login para:', email);
      setLoading(true);
      
      // Hacer login
      const authResponse = await authService.login({
        username: email, // La API espera 'username' pero es el email
        password
      });

      console.log('📄 [AUTH] Respuesta de login recibida:', authResponse.token_type);

      // Guardar token
      const { access_token } = authResponse;
      setToken(access_token);
      localStorage.setItem('authToken', access_token);
      console.log('💾 [AUTH] Token guardado en localStorage');

      // Obtener perfil del usuario
      console.log('👤 [AUTH] Obteniendo perfil del usuario...');
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      console.log('✅ [AUTH] Login exitoso para:', userProfile.email);
      return true;

    } catch (error: any) {
      console.error('❌ [AUTH] Error en login:', error);
      
      // Limpiar estado en caso de error
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // ✅ CAMBIO PRINCIPAL: Lanzar excepción con mensaje específico
      let errorMessage = 'Error desconocido al iniciar sesión';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Personalizar mensajes comunes de login
      if (errorMessage.includes('Credenciales inválidas') || 
          errorMessage.includes('Invalid credentials') ||
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized')) {
        errorMessage = 'Correo o contraseña incorrectos, intente de nuevo';
      } else if (errorMessage.includes('Usuario no encontrado') || 
                 errorMessage.includes('User not found')) {
        errorMessage = 'Este correo no está registrado. Verifique el correo o regístrese';
      } else if (errorMessage.includes('conexión') || 
                 errorMessage.includes('network') || 
                 errorMessage.includes('timeout')) {
        errorMessage = 'Error de conexión. Verifique su internet e intente nuevamente';
      } else if (errorMessage.includes('500') || 
                 errorMessage.includes('Internal Server')) {
        errorMessage = 'Error del servidor. Intente nuevamente en unos minutos';
      }
      
      // ✅ LANZAR EXCEPCIÓN para que el componente Login pueda capturarla
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('🚀 [AUTH] Iniciando registro para:', data.email);
      setLoading(true);
      
      // Hacer registro
      console.log('📝 [AUTH] Enviando datos de registro...');
      const registerResponse = await authService.register(data);
      console.log('📄 [AUTH] Respuesta de registro:', registerResponse);
      
      // Después del registro exitoso, hacer login automáticamente
      console.log('🔄 [AUTH] Registro exitoso, haciendo login automático...');
      const loginSuccess = await login(data.email, data.password);
      
      if (loginSuccess) {
        console.log('✅ [AUTH] Registro y login automático exitosos');
      } else {
        console.log('⚠️ [AUTH] Registro exitoso pero login automático falló');
      }
      
      return loginSuccess;

    } catch (error: any) {
      console.error('❌ [AUTH] Error en registro:', error);
      
      // ✅ MEJORAR manejo de errores específicos de registro
      let errorMessage = 'Error desconocido en el registro';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Personalizar mensajes específicos de registro
      if (errorMessage.includes('ya registrado') || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('UNIQUE constraint') ||
          errorMessage.includes('409') ||
          errorMessage.includes('Correo ya registrado')) {
        errorMessage = 'Este correo ya ha sido registrado antes. Intente con otro correo o vaya al login';
      } else if (errorMessage.includes('contraseña') && errorMessage.includes('mayúscula')) {
        errorMessage = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
      } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
        errorMessage = 'Por favor ingrese un correo electrónico válido';
      } else if (errorMessage.includes('conexión') || 
                 errorMessage.includes('network') || 
                 errorMessage.includes('timeout')) {
        errorMessage = 'Error de conexión. Verifique su internet e intente nuevamente';
      } else if (errorMessage.includes('500') || 
                 errorMessage.includes('Internal Server')) {
        errorMessage = 'Error del servidor. Intente nuevamente en unos minutos';
      }
      
      console.error('📋 [AUTH] Mensaje de error detallado:', errorMessage);
      
      // Re-lanzar el error con más información
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [AUTH] Iniciando logout...');
      
      // Llamar al endpoint de logout (opcional)
      await authService.logout();
      console.log('📡 [AUTH] Logout del servidor exitoso');
      
    } catch (error) {
      console.error('⚠️ [AUTH] Error en logout del servidor:', error);
      // No es crítico si el logout del servidor falla
    } finally {
      // Limpiar estado local (esto siempre debe ejecutarse)
      console.log('🧹 [AUTH] Limpiando estado local...');
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('✅ [AUTH] Logout completado');
    }
  };

  // Función de debugging para inspeccionar el estado actual
  const getDebugInfo = () => {
    return {
      user: user,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      loading: loading,
      localStorage: {
        hasToken: !!localStorage.getItem('authToken'),
        hasUser: !!localStorage.getItem('user')
      }
    };
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Hook para verificar si el usuario está autenticado
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 [AUTH] Usuario no autenticado, redirigiendo al login...');
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading };
};