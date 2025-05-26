

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification, { ToastProps } from './toastnotification';
import './estilos/toast.css';

interface Toast extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message: string, action?: ToastProps['action']) => void;
  showError: (title: string, message: string, action?: ToastProps['action']) => void;
  showWarning: (title: string, message: string, action?: ToastProps['action']) => void;
  showInfo: (title: string, message: string, action?: ToastProps['action']) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = { ...toast, id };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [generateId, maxToasts]);

  const showSuccess = useCallback((title: string, message: string, action?: ToastProps['action']) => {
    return showToast({
      type: 'success',
      title,
      message,
      duration: 5000,
      action
    });
  }, [showToast]);

  const showError = useCallback((title: string, message: string, action?: ToastProps['action']) => {
    return showToast({
      type: 'error',
      title,
      message,
      duration: 8000,
      action
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, action?: ToastProps['action']) => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
      action
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, action?: ToastProps['action']) => {
    return showToast({
      type: 'info',
      title,
      message,
      duration: 5000,
      action
    });
  }, [showToast]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {toasts.length > 0 && (
        <div className={`toast-container ${position}`}>
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              {...toast}
              onClose={hideToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// =====================================================
// HOOK ESPECIALIZADO PARA RESERVAS - MASTERCOOK ACADEMY
// =====================================================

export const useBookingToasts = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Toast para cancelación exitosa con estilo MasterCook
  const showBookingCancelled = useCallback((bookingId: number, workshopTitle?: string) => {
    const baseMessage = `Reserva #${bookingId}${workshopTitle ? ` para "${workshopTitle}"` : ''} ha sido cancelada exitosamente.`;
    
    showSuccess(
      '🍅 Reserva Cancelada', // Emoji de tomate para conectar con Salsa Tomato
      baseMessage,
    );
  }, [showSuccess]);

  // Toast para errores de reserva con contexto culinario
  const showBookingError = useCallback((error: string) => {
    // Mensajes de error con personalidad culinaria
    let enhancedMessage = error;
    
    if (error.includes('conexión') || error.includes('network')) {
      enhancedMessage = 'Parece que la conexión se "quemó" como una tostada. Verifica tu internet e intenta nuevamente.';
    } else if (error.includes('servidor') || error.includes('500')) {
      enhancedMessage = 'El chef de los microservicios está tomando un descanso. Intenta nuevamente en unos minutos.';
    } else if (error.includes('no encontrada') || error.includes('404')) {
      enhancedMessage = 'Esta reserva se "evaporó" como el agua en una olla caliente. Puede que ya no exista.';
    }

    showError(
      '🥄 Ups, algo se mezcló mal',
      enhancedMessage,
      {
        label: '🔄 Reintentar',
        onClick: () => window.location.reload()
      }
    );
  }, [showError]);

  // Toast para recordatorio de pago con toque culinario
  const showPaymentReminder = useCallback((bookingId: number, workshopTitle?: string) => {
    showWarning(
      '💰 ¡El menú está listo!',
      `Tu reserva #${bookingId}${workshopTitle ? ` para "${workshopTitle}"` : ''} está confirmada, pero necesitas "condimentarla" con el pago.`,
      {
        label: '💳 Pagar Ahora',
        onClick: () => {
          // Navegar al pago
          window.location.href = `/payment?booking=${bookingId}`;
        }
      }
    );
  }, [showWarning]);

  // Toast informativo sobre proceso de reserva
  const showBookingInfo = useCallback((message: string) => {
    showInfo(
      '🍽️ Info de la Cocina',
      message,
      {
        label: '📋 Entendido',
        onClick: () => {} // Solo cerrar
      }
    );
  }, [showInfo]);

  // Toast para confirmación de pago exitoso
  const showPaymentSuccess = useCallback((amount: number, workshopTitle?: string) => {
    showSuccess(
      '🎉 ¡Pago Completado!',
      `Tu pago de ${amount}€${workshopTitle ? ` para "${workshopTitle}"` : ''} se procesó exitosamente. ¡Nos vemos en la cocina!`,
      {
        label: '📧 Ver Comprobante',
        onClick: () => {
          // Lógica para mostrar comprobante
          console.log('Mostrar comprobante de pago');
        }
      }
    );
  }, [showSuccess]);

  // Toast para taller próximo
  const showWorkshopReminder = useCallback((workshopTitle: string, hoursLeft: number) => {
    const timeMessage = hoursLeft <= 24 
      ? `¡Es mañana! 🌅` 
      : `Faltan ${Math.ceil(hoursLeft / 24)} días 📅`;

    showWarning(
      '⏰ ¡No olvides tu delantal!',
      `Tu taller "${workshopTitle}" se acerca. ${timeMessage}`,
      {
        label: '🎒 Prepararse',
        onClick: () => {
          // Navegar a los detalles del taller
          console.log('Mostrar preparación para el taller');
        }
      }
    );
  }, [showWarning]);

  return {
    showBookingCancelled,
    showBookingError,
    showPaymentReminder,
    showBookingInfo,
    showPaymentSuccess,
    showWorkshopReminder
  };
};

// =====================================================
// EJEMPLO DE USO CON LA NUEVA PALETA
// =====================================================

export const MasterCookToastExample: React.FC = () => {
  const { 
    showBookingCancelled, 
    showBookingError, 
    showPaymentReminder,
    showPaymentSuccess,
    showWorkshopReminder 
  } = useBookingToasts();

  const demonstrateToasts = () => {
    // Simular diferentes escenarios
    setTimeout(() => showBookingCancelled(123, 'Taller de Pasta Italiana'), 500);
    setTimeout(() => showPaymentReminder(456, 'Cocina Molecular'), 2000);
    setTimeout(() => showPaymentSuccess(75, 'Repostería Francesa'), 4000);
    setTimeout(() => showWorkshopReminder('Paella Valenciana', 18), 6000);
    setTimeout(() => showBookingError('Error de conexión con el servidor'), 8000);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#D94F4F', marginBottom: '1rem' }}>
        🍅 Sistema de Toasts - MasterCook Academy
      </h2>
      <p style={{ color: '#666666', marginBottom: '2rem' }}>
        Prueba el nuevo sistema de notificaciones con la paleta oficial de colores
      </p>
      <button
        onClick={demonstrateToasts}
        style={{
          background: 'linear-gradient(135deg, #D94F4F, #B73E3E)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(217, 79, 79, 0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(217, 79, 79, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(217, 79, 79, 0.3)';
        }}
      >
        🎭 Demostrar Toasts
      </button>
    </div>
  );
};