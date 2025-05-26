
// frontend/src/components/ToastNotification.tsx
import React, { useEffect, useState } from 'react';
import './estilos/toast.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ToastNotification: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Mostrar el toast al montar
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cerrar después del duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`toast-notification ${type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      {/* Indicador de progreso */}
      {duration > 0 && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{ 
              animationDuration: `${duration}ms`,
              animationPlayState: isExiting ? 'paused' : 'running'
            }}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="toast-content">
        {/* Icono */}
        <div className="toast-icon">
          {getIcon()}
        </div>

        {/* Texto */}
        <div className="toast-text">
          <div className="toast-title">
            {title}
          </div>
          <div className="toast-message">
            {message}
          </div>
        </div>

        {/* Acciones */}
        <div className="toast-actions">
          {action && (
            <button
              onClick={action.onClick}
              className="toast-action-button"
            >
              {action.label}
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="toast-close-button"
            aria-label="Cerrar notificación"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;