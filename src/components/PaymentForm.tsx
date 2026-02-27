// src/components/PaymentForm.tsx

import React, { useState, useEffect } from 'react';
import {
  IonIcon,
  IonToast,
  IonSpinner
} from '@ionic/react';
import {
  card,
  checkmarkCircle,
  logoGoogle,
  business,
  star,
  rocket,
  shieldCheckmark,
  alertCircle,
  arrowForward
} from 'ionicons/icons';
import {
  SubscriptionPlan,
  PaymentMethod,
  PsePaymentData
} from '../types/paymentTypes';
import { SUBSCRIPTION_TIERS, paymentService } from '../services/paymentService';

interface PaymentFormProps {
  companyId: string;
  currentPlan?: SubscriptionPlan;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  companyId,
  currentPlan,
  onSuccess,
  onCancel
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(currentPlan || 'basico');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'google_pay'>('pse');
  const [loading, setLoading] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showPSEPortal, setShowPSEPortal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Datos para PSE
  const [pseData, setPseData] = useState<PsePaymentData>({
    financialInstitutionCode: '',
    personType: 'NATURAL',
    documentType: 'CC',
    documentNumber: '',
    name: '',
    surname: '',
    email: '',
    countryCode: 'CO',
    mobile: ''
  });

  const selectedTier = SUBSCRIPTION_TIERS[selectedPlan];

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'pse') {
        if (!pseData.financialInstitutionCode || !pseData.documentNumber || !pseData.name || !pseData.email) {
          throw new Error('Completa los campos obligatorios para PSE');
        }

        setLoading(true);
        await paymentService.createPsePayment(pseData, companyId, selectedPlan);
        setShowProcessing(true);

        // Simular redirección profesional
        setTimeout(() => {
          setShowProcessing(false);
          setShowPSEPortal(true);
        }, 2000);

      } else {
        setLoading(true);
        const paymentMethodData: PaymentMethod = {
          id: `method_${Date.now()}`,
          type: paymentMethod === 'card' ? 'card' : 'google_pay'
        };

        const paymentIntent = await paymentService.createPaymentIntent(companyId, selectedPlan, paymentMethodData);
        const transaction = await paymentService.processPayment(paymentIntent.id);

        setToastMessage('¡Pago procesado con éxito!');
        setShowToast(true);
        setTimeout(() => onSuccess(transaction.id), 1500);
      }
    } catch (error: any) {
      console.error('Error en el pago:', error);
      setToastMessage(error.message || 'Error al procesar el pago');
      setShowToast(true);
      setLoading(false);
    }
  };

  const handlePSESuccess = async () => {
    setShowPSEPortal(false);
    setLoading(true);
    try {
      // Simulación de retorno exitoso del banco
      const paymentIntentData: PaymentMethod = { id: `pse_success_${Date.now()}`, type: 'pse', bankName: pseData.financialInstitutionCode };
      const paymentIntent = await paymentService.createPaymentIntent(companyId, selectedPlan, paymentIntentData);
      const transaction = await paymentService.processPayment(paymentIntent.id);

      setToastMessage('¡Membresía activada vía PSE!');
      setShowToast(true);
      setTimeout(() => onSuccess(transaction.id), 1500);
    } catch (error) {
      setToastMessage('Error al confirmar transacción PSE');
      setShowToast(true);
      setLoading(false);
    }
  };

  const institutions = [
    { code: '1022', name: 'Bancolombia' },
    { code: '1032', name: 'BBVA Colombia' },
    { code: '1007', name: 'Banco de Bogotá' },
    { code: '1052', name: 'Davivienda' },
    { code: '1047', name: 'Nequi' },
    { code: '1050', name: 'Banco AV Villas' },
    { code: '1023', name: 'Daviplata' }
  ];

  if (showProcessing) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', position: 'relative' }}>
          <IonSpinner name="crescent" color="primary" style={{ width: '80px', height: '80px' }} />
          <IonIcon icon={business} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '30px', color: 'var(--ion-color-primary)' }} />
        </div>
        <h2 style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: '12px' }}>Conectando con PSE</h2>
        <p style={{ color: '#64748b', lineHeight: '1.5' }}>Estamos estableciendo una conexión segura con tu entidad bancaria. No cierres esta ventana.</p>
      </div>
    );
  }

  if (showPSEPortal) {
    return (
      <div style={{ padding: '10px' }}>
        <div style={{ background: '#f8fafc', borderRadius: '32px', padding: '32px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
          <img src="https://logodownload.org/wp-content/uploads/2018/10/pse-logo-0.png" alt="PSE" style={{ height: '50px', marginBottom: '24px' }} />
          <h2 style={{ fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>Portal Bancario</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>Estás en el entorno seguro de tu banco para autorizar el pago de <strong style={{ color: '#1e293b' }}>$ {selectedTier.price.toLocaleString('es-CO')} COP</strong>.</p>

          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '32px', textAlign: 'left', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Referencia:</span>
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b' }}>OFF-APP-{Date.now().toString().slice(-6)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Banco:</span>
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b' }}>{institutions.find(i => i.code === pseData.financialInstitutionCode)?.name}</span>
            </div>
          </div>

          <button
            onClick={handlePSESuccess}
            style={{ width: '100%', padding: '18px', borderRadius: '20px', border: 'none', background: '#059669', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}
          >
            Autorizar Pago
          </button>
          <button
            onClick={() => { setShowPSEPortal(false); setLoading(false); }}
            style={{ width: '100%', padding: '14px', borderRadius: '20px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Cancelar y volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Selector de Plan Personalizado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(SUBSCRIPTION_TIERS).map(([id, tier]) => (
          <div
            key={id}
            onClick={() => setSelectedPlan(id as SubscriptionPlan)}
            style={{
              padding: '20px',
              borderRadius: '24px',
              border: selectedPlan === id ? '2.5px solid var(--ion-color-primary)' : '1px solid #f1f5f9',
              background: selectedPlan === id ? '#f5f3ff' : 'white',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: selectedPlan === id ? '0 10px 15px -3px rgba(79, 70, 229, 0.1)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: id === 'premium' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: id === 'premium' ? 'white' : '#64748b'
              }}>
                <IonIcon icon={id === 'premium' ? star : rocket} style={{ fontSize: '24px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--ion-color-dark)', fontSize: '1rem' }}>{tier.name}</h4>
                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>$ {tier.price.toLocaleString('es-CO')}</p>
              </div>
            </div>
            {selectedPlan === id && <IonIcon icon={checkmarkCircle} color="primary" style={{ fontSize: '24px' }} />}
          </div>
        ))}
      </div>

      {/* Métodos de Pago */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { id: 'pse', icon: business, label: 'PSE' },
          { id: 'card', icon: card, label: 'Tarjeta' },
          { id: 'google_pay', icon: logoGoogle, label: 'GPay' }
        ].map(method => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id as any)}
            style={{
              flex: 1,
              padding: '14px 8px',
              borderRadius: '18px',
              border: paymentMethod === method.id ? 'none' : '1px solid #e2e8f0',
              background: paymentMethod === method.id ? 'var(--ion-color-dark)' : 'white',
              color: paymentMethod === method.id ? 'white' : '#64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: paymentMethod === method.id ? 'var(--offertapps-shadow-sm)' : 'none'
            }}
          >
            <IonIcon icon={method.icon} style={{ fontSize: '20px' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>{method.label}</span>
          </button>
        ))}
      </div>

      {/* Formulario Dinámico */}
      {paymentMethod === 'pse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginLeft: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Institución Bancaria</label>
            <select
              value={pseData.financialInstitutionCode}
              onChange={e => setPseData({ ...pseData, financialInstitutionCode: e.target.value })}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', appearance: 'none', cursor: 'pointer', fontWeight: '600', color: '#1e293b' }}
            >
              <option value="">Selecciona tu banco</option>
              {institutions.map(inst => <option key={inst.code} value={inst.code}>{inst.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginLeft: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Documento</label>
              <input
                placeholder="Número de C.C"
                value={pseData.documentNumber}
                onChange={e => setPseData({ ...pseData, documentNumber: e.target.value })}
                style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginLeft: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Nombre</label>
              <input
                placeholder="Como en el banco"
                value={pseData.name}
                onChange={e => setPseData({ ...pseData, name: e.target.value })}
                style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginLeft: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Correo Electrónico</label>
            <input
              placeholder="Para tu comprobante"
              type="email"
              value={pseData.email}
              onChange={e => setPseData({ ...pseData, email: e.target.value })}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
            />
          </div>
        </div>
      )}

      {paymentMethod !== 'pse' && (
        <div style={{ background: '#fff7ed', padding: '24px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #fdba74' }}>
          <IonIcon icon={alertCircle} style={{ fontSize: '32px', color: '#f97316', marginBottom: '12px' }} />
          <p style={{ margin: 0, color: '#9a3412', fontSize: '0.9rem', fontWeight: '600' }}>Este método se habilitará pronto. Por ahora usa PSE para una activación inmediata.</p>
          <button
            onClick={() => setPaymentMethod('pse')}
            style={{ marginTop: '16px', color: '#ea580c', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cambiar a PSE ahora
          </button>
        </div>
      )}

      {/* Footer de Pago */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
          <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.95rem' }}>Total Membresía:</span>
          <span style={{ fontWeight: '900', fontSize: '1.6rem', color: 'var(--ion-color-dark)' }}>$ {selectedTier.price.toLocaleString('es-CO')}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'var(--ion-color-primary)',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '24px',
            fontWeight: '800',
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 10px 25px -8px rgba(79, 70, 229, 0.6)',
            transition: 'all 0.2s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? <IonSpinner name="crescent" color="light" /> : (
            <>
              Proceder al Pago
              <IonIcon icon={arrowForward} />
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <IonIcon icon={shieldCheckmark} style={{ color: '#10b981', fontSize: '16px' }} />
          <span style={{ fontWeight: '600' }}>Transacción 100% Segura con encriptación SSL</span>
        </div>
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