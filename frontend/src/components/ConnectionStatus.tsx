// frontend/src/components/ConnectionStatus.tsx
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '../hooks/useBooking';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isOnline, hasBeenOffline } = useConnectionStatus();
  const [showStatus, setShowStatus] = useState(false);
  const [lastStatus, setLastStatus] = useState(isOnline);

  // Mostrar notificación cuando cambie el estado
  useEffect(() => {
    if (lastStatus !== isOnline) {
      setShowStatus(true);
      setLastStatus(isOnline);

      // Ocultar automáticamente después de un tiempo
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, isOnline ? 4000 : 0); // 4 segundos para online, infinito para offline

      return () => clearTimeout(timer);
    }
  }, [isOnline, lastStatus]);

  // Mostrar inicialmente si está offline
  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    }
  }, []);

  if (!showStatus) {
    return null;
  }

  return (
    <div className={`bookings-connection-status ${isOnline ? 'online' : 'offline'} ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isOnline ? (
          <>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
            <span>Conexión restaurada</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            <span>Sin conexión a internet</span>
          </>
        )}
      </div>
      
      {!isOnline && (
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.375rem',
            padding: '0.25rem 0.5rem',
            color: 'inherit',
            fontSize: '0.75rem',
            marginLeft: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;

// ================================
// COMPONENTE DE NOTIFICACIONES TOAST
// ================================

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(76, 175, 80, 0.95)';
      case 'error':
        return 'rgba(244, 67, 54, 0.95)';
      case 'warning':
        return 'rgba(255, 152, 0, 0.95)';
      case 'info':
      default:
        return 'rgba(33, 150, 243, 0.95)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '90px',
        right: '1rem',
        zIndex: 1000,
        background: getBackgroundColor(),
        color: 'white',
        borderRadius: '0.5rem',
        padding: '1rem',
        maxWidth: '400px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-out',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: '1.4' }}>
          {message.split('\n').map((line, index) => (
            <div key={index} style={index > 0 ? { marginTop: '0.5rem' } : {}}>
              {line}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            flexShrink: 0
          }}
        >
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1rem', height: '1rem' }}>
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ================================
// HOOK PARA MANEJAR TOASTS
// ================================

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'], duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => addToast(message, 'error', duration);
  const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  };
};