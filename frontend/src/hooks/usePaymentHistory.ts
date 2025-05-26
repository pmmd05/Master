// frontend/src/hooks/usePaymentHistory.ts - HOOK PARA MANEJO DE HISTORIAL DE PAGOS
import { useState, useCallback, useEffect } from 'react';
import { paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import React from 'react';

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

interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  declined: number;
  totalAmount: number;
  averageAmount: number;
  mostUsedMethod: string;
  latestPayment: Payment | null;
}

interface UsePaymentHistoryReturn {
  // Estado
  historyData: PaymentHistoryData | null;
  loading: boolean;
  error: string | null;
  
  // Estadísticas calculadas
  stats: PaymentStats;
  
  // Acciones
  loadPaymentHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  retryConnection: () => Promise<void>;
  clearError: () => void;
  
  // Utilidades
  getPaymentsByStatus: (status: string) => Payment[];
  getPaymentsByMethod: (method: string) => Payment[];
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => Payment[];
  getPaymentsByCategory: (category: string) => Payment[];
  searchPayments: (query: string) => Payment[];
}

export const usePaymentHistory = (): UsePaymentHistoryReturn => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====================================================
  // FUNCIÓN PRINCIPAL DE CARGA
  // ====================================================

  const loadPaymentHistory = useCallback(async () => {
    if (!user?.email) {
      console.log('ℹ️ [USE_PAYMENT_HISTORY] No hay usuario autenticado');
      setHistoryData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [USE_PAYMENT_HISTORY] Cargando historial para:', user.email);

      const data = await paymentService.getPaymentHistory(user.email);
      setHistoryData(data);
      console.log(`✅ [USE_PAYMENT_HISTORY] ${data.total_payments} pagos cargados`);

    } catch (error: any) {
      console.error('❌ [USE_PAYMENT_HISTORY] Error:', error);
      
      // Manejo específico de errores
      if (error.message.includes('404') || error.message.includes('No se encontraron')) {
        console.log('ℹ️ [USE_PAYMENT_HISTORY] Usuario no tiene pagos');
        setHistoryData({
          user_email: user.email,
          total_payments: 0,
          payments: []
        });
        setError(null);
      } else if (error.message.includes('Network Error') || error.message.includes('timeout')) {
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else if (error.message.includes('500')) {
        setError('Error del servidor. Nuestro equipo ha sido notificado. Intenta más tarde.');
      } else {
        setError(error.message || 'Error al cargar el historial de pagos');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // ====================================================
  // FUNCIONES DE ACCIÓN
  // ====================================================

  const refreshHistory = useCallback(async () => {
    console.log('🔄 [USE_PAYMENT_HISTORY] Refrescando historial...');
    await loadPaymentHistory();
  }, [loadPaymentHistory]);

  const retryConnection = useCallback(async () => {
    console.log('🔄 [USE_PAYMENT_HISTORY] Reintentando conexión...');
    setError(null);
    await loadPaymentHistory();
  }, [loadPaymentHistory]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ====================================================
  // ESTADÍSTICAS CALCULADAS
  // ====================================================

  const stats: PaymentStats = React.useMemo(() => {
    if (!historyData || historyData.payments.length === 0) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        declined: 0,
        totalAmount: 0,
        averageAmount: 0,
        mostUsedMethod: '',
        latestPayment: null
      };
    }

    const payments = historyData.payments;
    const completed = payments.filter(p => p.status === 'completed' || p.status === 'approved');
    const pending = payments.filter(p => p.status === 'pending');
    const declined = payments.filter(p => p.status === 'declined' || p.status === 'failed');
    
    const totalAmount = completed.reduce((sum, p) => sum + p.amount, 0);
    const averageAmount = completed.length > 0 ? totalAmount / completed.length : 0;

    // Método más usado
    const methodCounts = payments.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedMethod = Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Pago más reciente
    const latestPayment = payments.length > 0 
      ? [...payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]
      : null;

    return {
      total: historyData.total_payments,
      completed: completed.length,
      pending: pending.length,
      declined: declined.length,
      totalAmount,
      averageAmount,
      mostUsedMethod,
      latestPayment
    };
  }, [historyData]);

  // ====================================================
  // FUNCIONES DE UTILIDAD Y FILTRADO
  // ====================================================

  const getPaymentsByStatus = useCallback((status: string): Payment[] => {
    if (!historyData) return [];
    
    return historyData.payments.filter(payment => {
      switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
          return payment.status === 'completed' || payment.status === 'approved';
        case 'pending':
          return payment.status === 'pending';
        case 'declined':
        case 'failed':
          return payment.status === 'declined' || payment.status === 'failed';
        default:
          return payment.status.toLowerCase() === status.toLowerCase();
      }
    });
  }, [historyData]);

  const getPaymentsByMethod = useCallback((method: string): Payment[] => {
    if (!historyData) return [];
    return historyData.payments.filter(payment => 
      payment.payment_method.toLowerCase() === method.toLowerCase()
    );
  }, [historyData]);

  const getPaymentsByDateRange = useCallback((startDate: Date, endDate: Date): Payment[] => {
    if (!historyData) return [];
    
    return historyData.payments.filter(payment => {
      try {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= startDate && paymentDate <= endDate;
      } catch (error) {
        console.warn('Error parsing payment date:', payment.payment_date);
        return false;
      }
    });
  }, [historyData]);

  const getPaymentsByCategory = useCallback((category: string): Payment[] => {
    if (!historyData) return [];
    return historyData.payments.filter(payment => 
      payment.workshop_category.toLowerCase() === category.toLowerCase()
    );
  }, [historyData]);

  const searchPayments = useCallback((query: string): Payment[] => {
    if (!historyData || !query.trim()) return historyData?.payments || [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return historyData.payments.filter(payment => 
      payment.workshop_title.toLowerCase().includes(searchTerm) ||
      payment.workshop_category.toLowerCase().includes(searchTerm) ||
      payment.payment_method.toLowerCase().includes(searchTerm) ||
      payment.transaction_id.toLowerCase().includes(searchTerm) ||
      payment.payment_id.toLowerCase().includes(searchTerm) ||
      payment.status.toLowerCase().includes(searchTerm)
    );
  }, [historyData]);

  // ====================================================
  // EFECTOS
  // ====================================================

  // Cargar historial al montar o cuando cambie el usuario
  useEffect(() => {
    if (user?.email) {
      loadPaymentHistory();
    } else {
      // Limpiar datos si no hay usuario
      setHistoryData(null);
      setError(null);
      setLoading(false);
    }
  }, [user?.email, loadPaymentHistory]);

  // Auto-refresh cada 10 minutos si hay usuario activo
  useEffect(() => {
    if (!user?.email || !historyData) return;

    const intervalId = setInterval(() => {
      console.log('⏰ [USE_PAYMENT_HISTORY] Auto-refresh periódico');
      refreshHistory();
    }, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(intervalId);
  }, [user?.email, historyData, refreshHistory]);

  // Limpiar error automáticamente después de 15 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Estado
    historyData,
    loading,
    error,
    
    // Estadísticas
    stats,
    
    // Acciones
    loadPaymentHistory,
    refreshHistory,
    retryConnection,
    clearError,
    
    // Utilidades
    getPaymentsByStatus,
    getPaymentsByMethod,
    getPaymentsByDateRange,
    getPaymentsByCategory,
    searchPayments
  };
};

// ====================================================
// HOOK ADICIONAL PARA ESTADÍSTICAS AVANZADAS
// ====================================================

interface PaymentAnalytics {
  monthlyTotals: { month: string; total: number; count: number }[];
  categoryBreakdown: { category: string; total: number; count: number; percentage: number }[];
  methodBreakdown: { method: string; total: number; count: number; percentage: number }[];
  averagesByMonth: { month: string; average: number }[];
  successRate: number;
  growthRate: number;
}

export const usePaymentAnalytics = (payments: Payment[]): PaymentAnalytics => {
  return React.useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        monthlyTotals: [],
        categoryBreakdown: [],
        methodBreakdown: [],
        averagesByMonth: [],
        successRate: 0,
        growthRate: 0
      };
    }

    // Pagos exitosos solamente
    const successfulPayments = payments.filter(p => p.status === 'completed' || p.status === 'approved');
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // Totales mensuales
    const monthlyData = successfulPayments.reduce((acc, payment) => {
      try {
        const date = new Date(payment.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = { total: 0, count: 0 };
        }
        acc[monthKey].total += payment.amount;
        acc[monthKey].count += 1;
        
        return acc;
      } catch (error) {
        console.warn('Error processing payment date:', payment.payment_date);
        return acc;
      }
    }, {} as Record<string, { total: number; count: number }>);

    const monthlyTotals = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Desglose por categoría
    const categoryData = successfulPayments.reduce((acc, payment) => {
      const category = payment.workshop_category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += payment.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const categoryBreakdown = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        ...data,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Desglose por método de pago
    const methodData = successfulPayments.reduce((acc, payment) => {
      const method = payment.payment_method;
      if (!acc[method]) {
        acc[method] = { total: 0, count: 0 };
      }
      acc[method].total += payment.amount;
      acc[method].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const methodBreakdown = Object.entries(methodData)
      .map(([method, data]) => ({
        method,
        ...data,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Promedios mensuales
    const averagesByMonth = monthlyTotals.map(month => ({
      month: month.month,
      average: month.count > 0 ? month.total / month.count : 0
    }));

    // Tasa de éxito
    const successRate = payments.length > 0 
      ? (successfulPayments.length / payments.length) * 100 
      : 0;

    // Tasa de crecimiento (comparando últimos 2 meses)
    let growthRate = 0;
    if (monthlyTotals.length >= 2) {
      const lastMonth = monthlyTotals[monthlyTotals.length - 1];
      const previousMonth = monthlyTotals[monthlyTotals.length - 2];
      if (previousMonth.total > 0) {
        growthRate = ((lastMonth.total - previousMonth.total) / previousMonth.total) * 100;
      }
    }

    return {
      monthlyTotals,
      categoryBreakdown,
      methodBreakdown,
      averagesByMonth,
      successRate,
      growthRate
    };
  }, [payments]);
};

// ====================================================
// HOOK PARA FORMATEO Y UTILIDADES
// ====================================================

export const usePaymentUtils = () => {
  // Formatear precio
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  }, []);

  // Formatear fecha
  const formatDate = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      });
    } catch {
      return 'Fecha inválida';
    }
  }, []);

  // Obtener info del estado
  const getStatusInfo = useCallback((status: string) => {
    const statusMap: { [key: string]: { icon: string; className: string; label: string; color: string } } = {
      'completed': { icon: '✅', className: 'completed', label: 'Completado', color: '#16A34A' },
      'approved': { icon: '✅', className: 'completed', label: 'Aprobado', color: '#16A34A' },
      'pending': { icon: '⏳', className: 'pending', label: 'Pendiente', color: '#D97706' },
      'declined': { icon: '❌', className: 'declined', label: 'Rechazado', color: '#DC2626' },
      'failed': { icon: '❌', className: 'declined', label: 'Fallido', color: '#DC2626' }
    };
    return statusMap[status] || { icon: '❓', className: 'unknown', label: status, color: '#6B7280' };
  }, []);

  // Obtener info del método de pago
  const getPaymentMethodInfo = useCallback((method: string) => {
    const methods: { [key: string]: { icon: string; label: string; color: string } } = {
      'credit_card': { icon: '💳', label: 'Tarjeta de Crédito', color: '#3B82F6' },
      'debit_card': { icon: '💳', label: 'Tarjeta de Débito', color: '#10B981' },
      'paypal': { icon: '🏦', label: 'PayPal', color: '#0070BA' },
      'bank_transfer': { icon: '🏛️', label: 'Transferencia', color: '#6366F1' }
    };
    return methods[method] || { icon: '💰', label: method, color: '#6B7280' };
  }, []);

  // Obtener info de categoría
  const getCategoryInfo = useCallback((category: string) => {
    const categories: { [key: string]: { emoji: string; color: string } } = {
      'Italiana': { emoji: '🍝', color: '#EF4444' },
      'Panadería': { emoji: '🥖', color: '#F59E0B' },
      'Repostería': { emoji: '🧁', color: '#EC4899' },
      'Japonesa': { emoji: '🍣', color: '#3B82F6' },
      'Vegana': { emoji: '🥬', color: '#10B981' },
      'Mexicana': { emoji: '🌮', color: '#F97316' },
      'Francesa': { emoji: '🥐', color: '#8B5CF6' },
      'Española': { emoji: '🥘', color: '#EF4444' },
      'Barbacoa': { emoji: '🔥', color: '#DC2626' },
      'Tailandesa': { emoji: '🍜', color: '#F59E0B' },
      'Bebidas': { emoji: '🥤', color: '#06B6D4' }
    };
    return categories[category] || { emoji: '🍽️', color: '#6B7280' };
  }, []);

  return {
    formatPrice,
    formatDate,
    getStatusInfo,
    getPaymentMethodInfo,
    getCategoryInfo
  };
};