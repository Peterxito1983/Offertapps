// src/pages/PaymentSetupPage.tsx

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonList,
  IonListHeader,
  IonToggle,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonAlert,
  IonToast
} from '@ionic/react';
import { 
  card, 
  cash, 
  checkmarkCircle, 
  closeCircle, 
  informationCircle,
  shieldCheckmark,
  storefront
} from 'ionicons/icons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  SUBSCRIPTION_TIERS, 
  PAYMENT_METHODS,
  SubscriptionPlan,
  PaymentMethod
} from '../types/paymentTypes';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';

const PaymentSetupPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('basico');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    document: '',
    email: ''
  });

  const currentCompany = useSelector((state: any) => state.company.currentCompany);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentCompany) {
      setSelectedPlan(currentCompany.subscriptionPlan || 'basico');
    }
  }, [currentCompany]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      setErrorMessage('Debe iniciar sesión para suscribirse');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // Validar datos
      if (paymentMethod === 'card') {
        if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvc) {
          throw new Error('Complete todos los datos de la tarjeta');
        }
      }

      // Procesar pago
      const paymentResult = await paymentService.processPayment({
        amount: SUBSCRIPTION_TIERS[selectedPlan].price,
        currency: 'COP',
        paymentMethod: {
          type: paymentMethod,
          card: paymentMethod === 'card' ? {
            number: paymentDetails.cardNumber,
            expiry: paymentDetails.expiry,
            cvc: paymentDetails.cvc,
            name: paymentDetails.name
          } : undefined,
          pse: paymentMethod === 'pse' ? {
            financialInstitutionCode: '1022', // Ejemplo: Bancolombia
            personType: 'NATURAL',
            documentType: 'CC',
            documentNumber: paymentDetails.document,
            name: paymentDetails.name,
            surname: '',
            email: paymentDetails.email || currentUser.email,
            countryCode: 'CO',
            mobile: ''
          } : undefined
        },
        companyId: currentCompany.id,
        subscriptionPlan: selectedPlan,
        description: `Suscripción ${SUBSCRIPTION_TIERS[selectedPlan].name}`
      });

      if (paymentResult.success) {
        setShowSuccess(true);
        
        // Actualizar estado de la empresa
        dispatch({
          type: 'UPDATE_COMPANY_SUBSCRIPTION',
          payload: {
            plan: selectedPlan,
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
          }
        });
      } else {
        throw new Error(paymentResult.errorMessage || 'Error al procesar el pago');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al procesar la suscripción');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = SUBSCRIPTION_TIERS[selectedPlan];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Configurar Pago</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Planes de Suscripción</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>Selecciona tu plan</IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>{selectedTier.name}</h3>
                    <p>${selectedTier.price.toLocaleString('es-CO')} COP / mes</p>
                  </IonLabel>
                  <IonBadge 
                    color={selectedPlan === 'premium' ? 'primary' : 'medium'}
                    slot="end"
                  >
                    {selectedPlan === 'premium' ? 'POPULAR' : 'BÁSICO'}
                  </IonBadge>
                </IonItem>
              </IonList>

              <div className="ion-margin-top">
                <IonText>
                  <h3>Características:</h3>
                </IonText>
                <ul>
                  {selectedTier.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      <IonIcon icon={checkmarkCircle} color="success" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ion-margin-top">
                <IonText color="primary">
                  <h3>Total: ${selectedTier.price.toLocaleString('es-CO')} COP</h3>
                  <p>IVA incluido</p>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Método de Pago</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>Selecciona un método de pago</IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>Tarjeta de Crédito/Débito</IonLabel>
                  <IonToggle
                    checked={paymentMethod === 'card'}
                    onIonChange={() => setPaymentMethod('card')}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>PSE (Transferencia Bancaria)</IonLabel>
                  <IonToggle
                    checked={paymentMethod === 'pse'}
                    onIonChange={() => setPaymentMethod('pse')}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>PayPal</IonLabel>
                  <IonToggle
                    checked={paymentMethod === 'paypal'}
                    onIonChange={() => setPaymentMethod('paypal')}
                  />
                </IonItem>
              </IonList>

              {paymentMethod === 'card' && (
                <div className="ion-margin-top">
                  <IonItem>
                    <IonLabel position="stacked">Número de Tarjeta</IonLabel>
                    <IonInput
                      value={paymentDetails.cardNumber}
                      onIonInput={e => setPaymentDetails({...paymentDetails, cardNumber: e.detail.value!})}
                      placeholder="1234 5678 9012 3456"
                      maxlength={19}
                      inputmode="numeric"
                    />
                  </IonItem>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <IonItem>
                      <IonLabel position="stacked">Vencimiento (MM/AA)</IonLabel>
                      <IonInput
                        value={paymentDetails.expiry}
                        onIonInput={e => setPaymentDetails({...paymentDetails, expiry: e.detail.value!})}
                        placeholder="MM/AA"
                        maxlength={5}
                        inputmode="numeric"
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">CVC</IonLabel>
                      <IonInput
                        value={paymentDetails.cvc}
                        onIonInput={e => setPaymentDetails({...paymentDetails, cvc: e.detail.value!})}
                        placeholder="123"
                        maxlength={4}
                        inputmode="numeric"
                      />
                    </IonItem>
                  </div>

                  <IonItem style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Nombre en la Tarjeta</IonLabel>
                    <IonInput
                      value={paymentDetails.name}
                      onIonInput={e => setPaymentDetails({...paymentDetails, name: e.detail.value!})}
                      placeholder="Nombre completo"
                    />
                  </IonItem>
                </div>
              )}

              {paymentMethod === 'pse' && (
                <div className="ion-margin-top">
                  <IonItem>
                    <IonLabel position="stacked">Tipo de Documento</IonLabel>
                    <IonSelect
                      value={paymentDetails.documentType}
                      onIonChange={e => setPaymentDetails({...paymentDetails, documentType: e.detail.value!})}
                    >
                      <IonSelectOption value="CC">Cédula de Ciudadanía</IonSelectOption>
                      <IonSelectOption value="CE">Cédula de Extranjería</IonSelectOption>
                      <IonSelectOption value="NIT">NIT</IonSelectOption>
                      <IonSelectOption value="PP">Pasaporte</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Número de Documento</IonLabel>
                    <IonInput
                      value={paymentDetails.document}
                      onIonInput={e => setPaymentDetails({...paymentDetails, document: e.detail.value!})}
                      placeholder="Número de documento"
                      inputmode="numeric"
                    />
                  </IonItem>

                  <IonItem style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Nombre Completo</IonLabel>
                    <IonInput
                      value={paymentDetails.name}
                      onIonInput={e => setPaymentDetails({...paymentDetails, name: e.detail.value!})}
                      placeholder="Nombre completo"
                    />
                  </IonItem>

                  <IonItem style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      value={paymentDetails.email}
                      onIonInput={e => setPaymentDetails({...paymentDetails, email: e.detail.value!})}
                      placeholder="email@ejemplo.com"
                      type="email"
                    />
                  </IonItem>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          <IonButton
            expand="block"
            onClick={handleSubscribe}
            disabled={loading}
            className="ion-margin-top"
          >
            {loading ? 'Procesando...' : `Suscribirse a ${selectedTier.name}`}
          </IonButton>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <IonText color="medium">
              <p>
                <IonIcon icon={shieldCheckmark} /> Tus datos están seguros con encriptación de grado bancario
              </p>
            </IonText>
          </div>
        </div>

        <IonAlert
          isOpen={showSuccess}
          onDidDismiss={() => {
            setShowSuccess(false);
            // Redirigir al dashboard después de éxito
          }}
          header="¡Suscripción Exitosa!"
          message={`Tu suscripción al plan ${selectedTier.name} ha sido activada correctamente. Ahora puedes disfrutar de todas las ventajas del plan.`}
          buttons={[
            {
              text: 'Aceptar',
              handler: () => {
                setShowSuccess(false);
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          header="Error"
          message={errorMessage}
          buttons={['Aceptar']}
        />
      </IonContent>
    </IonPage>
  );
};

export default PaymentSetupPage;