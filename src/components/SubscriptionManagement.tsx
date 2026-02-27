// src/components/SubscriptionManagement.tsx

import React, { useState, useEffect } from 'react';
import {
  IonIcon,
  IonBadge,
  IonToast,
  IonSpinner
} from '@ionic/react';
import {
  checkmarkCircle,
  closeCircle,
  calendar,
  refresh,
  star,
  rocket,
  alertCircle,
  chevronForward
} from 'ionicons/icons';
import { SubscriptionPlan, PaymentTransaction } from '../types/paymentTypes';
import { paymentService } from '../services/paymentService';

interface SubscriptionManagementProps {
  companyId: string;
  currentPlan: SubscriptionPlan;
  onPlanChange: (newPlan: SubscriptionPlan) => void;
  onRequestPayment?: () => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  companyId,
  currentPlan,
  onPlanChange,
  onRequestPayment
}) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadSubscriptionData();
  }, [companyId]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [status, history] = await Promise.all([
        paymentService.getSubscriptionStatus(companyId),
        paymentService.getPaymentHistory(companyId)
      ]);
      setSubscriptionStatus(status);
      setPaymentHistory(history);
    } catch (error: any) {
      console.error('Error al cargar datos de suscripción:', error);
      const errorDetail = error.message || 'Error desconocido';
      showToastMessage(`Error al cargar datos de suscripción: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const getDaysUntilExpiration = (expiresAt: string) => {
    if (!expiresAt) return null;
    const expirationDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
        <IonSpinner name="crescent" color="primary" />
        <p style={{ marginTop: '16px', color: '#64748b', fontSize: '0.9rem' }}>Sincronizando membresía...</p>
      </div>
    );
  }

  const daysUntilExpiration = subscriptionStatus?.expiresAt ? getDaysUntilExpiration(subscriptionStatus.expiresAt) : null;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Estado de la Suscripción - Premium Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Plan Actual
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '4px 0', letterSpacing: '-0.5px' }}>
                {subscriptionStatus?.plan === 'premium' ? 'Premium Gold' : 'Básico'}
              </h2>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <IonIcon icon={subscriptionStatus?.plan === 'premium' ? star : rocket} style={{ fontSize: '24px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isExpired ? '#ef4444' : '#10b981',
              boxShadow: isExpired ? '0 0 10px #ef4444' : '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              {isExpired ? 'Suscripción Vencida' : 'Estado: Activo'}
            </span>
          </div>

          {subscriptionStatus?.expiresAt && !isExpired && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '14px', width: 'fit-content' }}>
              <IonIcon icon={calendar} style={{ opacity: 0.8 }} />
              <span style={{ fontSize: '0.85rem' }}>
                Renovación: <strong>{new Date(subscriptionStatus.expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</strong>
              </span>
            </div>
          )}

          {isExpired && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <IonIcon icon={alertCircle} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                Tu plan venció. Renueva para seguir publicando.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onRequestPayment}
          style={{
            flex: 2,
            backgroundColor: 'var(--ion-color-dark)',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '18px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: 'var(--offertapps-shadow-sm)',
            transition: 'transform 0.2s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isExpired ? 'Reactivar Ahora' : 'Renovar Plan'}
        </button>
        <button
          onClick={loadSubscriptionData}
          style={{
            flex: 1,
            backgroundColor: 'white',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            padding: '16px',
            borderRadius: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IonIcon icon={refresh} style={{ fontSize: '20px' }} />
        </button>
      </div>

      {/* Comparativa de Planes */}
      <div style={{ marginTop: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: 'var(--ion-color-dark)' }}>Compara los Planes</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Plan Básico */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '24px',
            border: currentPlan === 'basico' ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
            boxShadow: 'var(--offertapps-shadow-sm)',
            position: 'relative'
          }}>
            {currentPlan === 'basico' && (
              <IonBadge color="medium" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '0.6rem' }}>ACTUAL</IonBadge>
            )}
            <h4 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#64748b' }}>Básico</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Ofertas ilimitadas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Perfil de empresa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                <IonIcon icon={closeCircle} style={{ color: '#ef4444', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>Campañas Redes</span>
              </div>
            </div>
          </div>

          {/* Plan Premium */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '24px',
            border: currentPlan === 'premium' ? '2px solid #7c3aed' : '1px solid #f1f5f9',
            boxShadow: 'var(--offertapps-shadow-sm)',
            position: 'relative'
          }}>
            {currentPlan === 'premium' && (
              <IonBadge color="primary" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '0.6rem' }}>ACTUAL</IonBadge>
            )}
            <h4 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#7c3aed' }}>Premium</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Todo lo del Básico</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#475569' }}><b>Campañas Digitales</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e', fontSize: '16px' }} />
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>FB, IG, TikTok</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Pagos - Estética Minimalista */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: 'var(--ion-color-dark)' }}>Últimos Pagos</h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Ver todo</span>
        </div>

        {paymentHistory.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>No registras pagos todavía</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentHistory.slice(0, 3).map((transaction, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'white',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: 'var(--offertapps-shadow-sm)',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: transaction.status === 'completed' ? '#f0fdf4' : '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '14px'
                }}>
                  <IonIcon
                    icon={transaction.status === 'completed' ? checkmarkCircle : closeCircle}
                    style={{ color: transaction.status === 'completed' ? '#22c55e' : '#f97316', fontSize: '20px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--ion-color-dark)' }}>
                    Plan {transaction.subscriptionPlan?.toUpperCase()}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                    {new Date(transaction.processedAt || Date.now()).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--ion-color-dark)' }}>
                    ${transaction.amount.toLocaleString('es-CO')}
                  </p>
                  <IonIcon icon={chevronForward} style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        color={toastMessage.includes('Error') ? 'danger' : 'dark'}
        onDidDismiss={() => setShowToast(false)}
      />
    </div>
  );
};