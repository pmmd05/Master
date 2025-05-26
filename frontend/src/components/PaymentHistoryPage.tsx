// frontend/src/components/PaymentHistoryPage.tsx - HISTORIAL DE PAGOS COMPLETO
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/api';
import Navbar from './Navbar';
import './estilos/payment-history.css';

interface Payment {
  payment_id: string;
  booking_id: number;
  workshop_title: string;
  workshop_date: string;
  workshop_category: string;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  last_4_digits: string;
}

interface PaymentHistoryData {
  user_email: string;
  total_payments: number;
  payments: Payment[];
}

type FilterType = 'all' | 'completed' | 'pending' | 'declined';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [historyData, setHistoryData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ====================================================
  // CARGAR DATOS DE PAGOS
  // ====================================================

  const loadPaymentHistory = async () => {
    if (!user?.email) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [PAYMENT_HISTORY] Cargando historial para:', user.email);
      
      const data = await paymentService.getPaymentHistory(user.email);
      setHistoryData(data);
      console.log(`✅ [PAYMENT_HISTORY] ${data.total_payments} pagos cargados`);
      
    } catch (error: any) {
      console.error('❌ [PAYMENT_HISTORY] Error:', error);
      
      if (error.message.includes('404') || error.message.includes('No se encontraron')) {
        setHistoryData({
          user_email: user.email,
          total_payments: 0,
          payments: []
        });
        setError(null);
      } else {
        setError(error.message || 'Error al cargar el historial de pagos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, [user?.email]);

  // ====================================================
  // FUNCIONES DE UTILIDAD
  // ====================================================

  // Formatear precio
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha del taller
  const formatWorkshopDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener info del estado
  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { icon: string; className: string; label: string } } = {
      'completed': { icon: '✅', className: 'completed', label: 'Completado' },
      'approved': { icon: '✅', className: 'completed', label: 'Aprobado' },
      'pending': { icon: '⏳', className: 'pending', label: 'Pendiente' },
      'declined': { icon: '❌', className: 'declined', label: 'Rechazado' },
      'failed': { icon: '❌', className: 'declined', label: 'Fallido' }
    };
    return statusMap[status] || { icon: '❓', className: 'unknown', label: status };
  };

  // Obtener info de categoría
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { emoji: string } } = {
      'Italiana': { emoji: '🍝' },
      'Panadería': { emoji: '🥖' },
      'Repostería': { emoji: '🧁' },
      'Japonesa': { emoji: '🍣' },
      'Vegana': { emoji: '🥬' },
      'Mexicana': { emoji: '🌮' },
      'Francesa': { emoji: '🥐' },
      'Española': { emoji: '🥘' },
      'Barbacoa': { emoji: '🔥' },
      'Tailandesa': { emoji: '🍜' },
      'Bebidas': { emoji: '🥤' }
    };
    return categories[category] || { emoji: '🍽️' };
  };

  // Obtener info del método de pago
  const getPaymentMethodInfo = (method: string) => {
    const methods: { [key: string]: { icon: string; label: string } } = {
      'credit_card': { icon: '💳', label: 'Tarjeta de Crédito' },
      'debit_card': { icon: '💳', label: 'Tarjeta de Débito' },
      'paypal': { icon: '🏦', label: 'PayPal' },
      'bank_transfer': { icon: '🏛️', label: 'Transferencia' }
    };
    return methods[method] || { icon: '💰', label: method };
  };

  // ====================================================
  // FILTRADO Y ORDENAMIENTO
  // ====================================================

  const filteredPayments = historyData?.payments.filter(payment => {
    switch (filter) {
      case 'completed':
        return payment.status === 'completed' || payment.status === 'approved';
      case 'pending':
        return payment.status === 'pending';
      case 'declined':
        return payment.status === 'declined' || payment.status === 'failed';
      default:
        return true;
    }
  }) || [];

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
      case 'date-asc':
        return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  // Calcular estadísticas
  const stats = historyData ? {
    total: historyData.total_payments,
    completed: historyData.payments.filter(p => p.status === 'completed' || p.status === 'approved').length,
    pending: historyData.payments.filter(p => p.status === 'pending').length,
    declined: historyData.payments.filter(p => p.status === 'declined' || p.status === 'failed').length,
    totalAmount: historyData.payments
      .filter(p => p.status === 'completed' || p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0)
  } : { total: 0, completed: 0, pending: 0, declined: 0, totalAmount: 0 };

  // ====================================================
  // MANEJADORES DE EVENTOS
  // ====================================================

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedPayment(null);
  };

  const handleRetry = () => {
    loadPaymentHistory();
  };

  // ====================================================
  // RENDERIZADO CONDICIONAL
  // ====================================================

  if (loading) {
    return (
      <div className="payment-history-container">
        <Navbar />
        <div className="payment-history-main-content">
          <div className="payment-history-loading">
            <div className="payment-history-loading-content">
              <div className="payment-history-loading-spinner"></div>
              <p className="payment-history-loading-text">Cargando tu historial de pagos...</p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Consultando tus transacciones
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container">
        <Navbar />
        <div className="payment-history-main-content">
          <div className="payment-history-error">
            <svg className="payment-history-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="payment-history-error-title">Error al cargar el historial</h3>
            <p className="payment-history-error-message">Error de conexión. Solo el backend conoce la receta del historial. Lástima que se tomó el día libre.  </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleRetry} className="payment-history-error-button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
              <button onClick={() => navigate('/dashboard')} className="payment-history-error-button" style={{ background: '#6B7280' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDERIZADO PRINCIPAL
  // ====================================================

  return (
    <div className="payment-history-container">
      <Navbar />
      
      {/* Header */}
      <div className="payment-history-header">
        <div className="payment-history-header-content">
          <h1 className="payment-history-header-title">
            Historial de Pagos
          </h1>
          <div className="payment-history-header-actions">
            <div className="payment-history-header-user-info">
              Hola, <span className="payment-history-header-user-name">{user?.name}</span>
            </div>
            <button onClick={() => navigate('/dashboard')} className="payment-history-header-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="payment-history-main-content">
        
        {/* Estadísticas */}
        <div className="payment-history-stats">
          <div className="payment-history-stat-card">
            <div className="payment-history-stat-number total">{stats.total}</div>
            <div className="payment-history-stat-label">Total Pagos</div>
          </div>
          <div className="payment-history-stat-card">
            <div className="payment-history-stat-number completed">{stats.completed}</div>
            <div className="payment-history-stat-label">Completados</div>
          </div>
          <div className="payment-history-stat-card">
            <div className="payment-history-stat-number pending">{stats.pending}</div>
            <div className="payment-history-stat-label">Pendientes</div>
          </div>
          <div className="payment-history-stat-card">
            <div className="payment-history-stat-number amount">{formatPrice(stats.totalAmount)}</div>
            <div className="payment-history-stat-label">Total Gastado</div>
          </div>
        </div>

        {/* Filtros y ordenamiento */}
        <div className="payment-history-controls">
          <div className="payment-history-filters">
            <h3 className="payment-history-filters-title">Filtrar por Estado</h3>
            <div className="payment-history-filters-buttons">
              {[
                { key: 'all', label: 'Todos', count: stats.total },
                { key: 'completed', label: 'Completados', count: stats.completed },
                { key: 'pending', label: 'Pendientes', count: stats.pending },
                { key: 'declined', label: 'Rechazados', count: stats.declined }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as FilterType)}
                  className={`payment-history-filter-button ${filter === key ? 'active' : ''}`}
                >
                  {label}
                  <span className="payment-history-filter-count">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="payment-history-sort">
            <h3 className="payment-history-sort-title">Ordenar por</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="payment-history-sort-select"
            >
              <option value="date-desc">Fecha (Más reciente)</option>
              <option value="date-asc">Fecha (Más antiguo)</option>
              <option value="amount-desc">Monto (Mayor a menor)</option>
              <option value="amount-asc">Monto (Menor a mayor)</option>
            </select>
          </div>
        </div>

        {/* Lista de pagos */}
        {sortedPayments.length === 0 ? (
          <div className="payment-history-empty">
            <svg className="payment-history-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {filter === 'all' ? (
              <>
                <h3 className="payment-history-empty-title">No tienes pagos registrados</h3>
                <p className="payment-history-empty-message">
                  Una vez que realices tu primer pago, aparecerá aquí tu historial completo.
                </p>
                <button onClick={() => navigate('/workshops')} className="payment-history-empty-button">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Explorar Talleres
                </button>
              </>
            ) : (
              <>
                <h3 className="payment-history-empty-title">
                  No hay pagos {
                    filter === 'completed' ? 'completados' :
                    filter === 'pending' ? 'pendientes' :
                    'rechazados'
                  }
                </h3>
                <p className="payment-history-empty-message">
                  Los pagos con este estado aparecerán aquí.
                </p>
                <button onClick={() => setFilter('all')} className="payment-history-empty-button">
                  Ver Todos los Pagos
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="payment-history-list">
            {sortedPayments.map((payment) => {
              const statusInfo = getStatusInfo(payment.status);
              const categoryInfo = getCategoryInfo(payment.workshop_category);
              const methodInfo = getPaymentMethodInfo(payment.payment_method);

              return (
                <div key={payment.payment_id} className="payment-history-card">
                  <div className="payment-history-card-header">
                    <div className="payment-history-card-title-section">
                      <div className="payment-history-card-category">
                        <span className="payment-history-card-category-emoji">{categoryInfo.emoji}</span>
                        {payment.workshop_category}
                      </div>
                      <h3 className="payment-history-card-title">{payment.workshop_title}</h3>
                      <div className="payment-history-card-date">
                        📅 Taller: {formatWorkshopDate(payment.workshop_date)}
                      </div>
                    </div>
                    <div className="payment-history-card-status-section">
                      <span className={`payment-history-card-status ${statusInfo.className}`}>
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                      <div className="payment-history-card-amount">
                        {formatPrice(payment.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="payment-history-card-details">
                    <div className="payment-history-card-detail-item">
                      <span className="payment-history-card-detail-icon">🕒</span>
                      <div className="payment-history-card-detail-content">
                        <div className="payment-history-card-detail-label">Fecha de Pago</div>
                        <div className="payment-history-card-detail-value">{formatDate(payment.payment_date)}</div>
                      </div>
                    </div>

                    <div className="payment-history-card-detail-item">
                      <span className="payment-history-card-detail-icon">{methodInfo.icon}</span>
                      <div className="payment-history-card-detail-content">
                        <div className="payment-history-card-detail-label">Método de Pago</div>
                        <div className="payment-history-card-detail-value">
                          {methodInfo.label}
                          {payment.last_4_digits && ` •••• ${payment.last_4_digits}`}
                        </div>
                      </div>
                    </div>

                    <div className="payment-history-card-detail-item">
                      <span className="payment-history-card-detail-icon">🔢</span>
                      <div className="payment-history-card-detail-content">
                        <div className="payment-history-card-detail-label">ID Transacción</div>
                        <div className="payment-history-card-detail-value">{payment.transaction_id}</div>
                      </div>
                    </div>
                  </div>

                  <div className="payment-history-card-actions">
                    <button
                      onClick={() => handleViewDetails(payment)}
                      className="payment-history-card-button"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        <div className="payment-history-info">
          <h3 className="payment-history-info-title">Información sobre tus pagos</h3>
          <div className="payment-history-info-list">
            <div className="payment-history-info-item">
              Todos los pagos están procesados de forma segura con encriptación SSL
            </div>
            <div className="payment-history-info-item">
              Los reembolsos pueden tomar de 3 a 5 días hábiles en aparecer en tu cuenta
            </div>
            <div className="payment-history-info-item">
              Puedes descargar comprobantes desde la sección de detalles de cada pago
            </div>
            <div className="payment-history-info-item">
              Si tienes dudas sobre algún pago, contacta nuestro soporte
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedPayment && (
        <div className="payment-history-modal-overlay" onClick={closeModal}>
          <div className="payment-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-history-modal-header">
              <div className="payment-history-modal-header-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="payment-history-modal-header-content">
                <h3 className="payment-history-modal-title">Detalles del Pago</h3>
                <p className="payment-history-modal-subtitle">ID: {selectedPayment.payment_id}</p>
              </div>
            </div>

            <div className="payment-history-modal-content">
              <div className="payment-history-modal-section">
                <h4 className="payment-history-modal-section-title">Información del Taller</h4>
                <div className="payment-history-modal-list">
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Taller:</span>
                    <span className="payment-history-modal-item-value">{selectedPayment.workshop_title}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Categoría:</span>
                    <span className="payment-history-modal-item-value">{selectedPayment.workshop_category}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Fecha del Taller:</span>
                    <span className="payment-history-modal-item-value">{formatWorkshopDate(selectedPayment.workshop_date)}</span>
                  </div>
                </div>
              </div>

              <div className="payment-history-modal-section">
                <h4 className="payment-history-modal-section-title">Detalles del Pago</h4>
                <div className="payment-history-modal-list">
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Monto:</span>
                    <span className="payment-history-modal-item-value">{formatPrice(selectedPayment.amount)}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Estado:</span>
                    <span className="payment-history-modal-item-value">{getStatusInfo(selectedPayment.status).label}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Método:</span>
                    <span className="payment-history-modal-item-value">{getPaymentMethodInfo(selectedPayment.payment_method).label}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Fecha de Pago:</span>
                    <span className="payment-history-modal-item-value">{formatDate(selectedPayment.payment_date)}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">ID Transacción:</span>
                    <span className="payment-history-modal-item-value">{selectedPayment.transaction_id}</span>
                  </div>
                  <div className="payment-history-modal-item">
                    <span className="payment-history-modal-item-label">Reserva ID:</span>
                    <span className="payment-history-modal-item-value">#{selectedPayment.booking_id}</span>
                  </div>
                </div>
              </div>

              <button onClick={closeModal} className="payment-history-modal-close">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;