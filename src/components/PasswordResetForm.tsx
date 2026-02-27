// src/components/PasswordResetForm.tsx

import React, { useState } from 'react';
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonToast,
  IonIcon
} from '@ionic/react';
import { mail, checkmarkCircle, arrowBack } from 'ionicons/icons';
import { ValidatedInput } from './EnhancedFormComponents';
import { initiatePasswordReset } from '../services/passwordResetService';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const emailValidation = {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: 'Por favor ingresa un correo electrónico válido'
  };

  const handleResetPassword = async () => {
    if (!emailValidation.validate(email)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      setShowError(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowError(false);

    try {
      await initiatePasswordReset(email);
      setSuccessMessage(`¡Excelente! Hemos enviado un correo a ${email} con instrucciones para restablecer tu contraseña.`);
      setShowSuccess(true);
      setEmail(''); // Limpiar el campo de correo
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error al enviar el correo de recuperación');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Ocultar mensajes de éxito/error al volver
    setShowSuccess(false);
    setShowError(false);
    setSuccessMessage('');
    setErrorMessage('');
    onBackToLogin();
  };

  return (
    <IonContent className="ion-padding">
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="12" sizeMd="6" sizeLg="4">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Recuperar Contraseña</IonCardTitle>
              </IonCardHeader>
              
              <IonCardContent>
                {showSuccess ? (
                  <div className="center-content" style={{ textAlign: 'center', padding: '20px' }}>
                    <IonIcon 
                      icon={checkmarkCircle} 
                      color="success" 
                      style={{ fontSize: '48px', marginBottom: '16px' }} 
                    />
                    <h3 style={{ color: 'var(--ion-color-success)', margin: '16px 0' }}>Correo Enviado</h3>
                    <p>{successMessage}</p>
                    <IonButton 
                      expand="block" 
                      fill="outline" 
                      color="primary" 
                      onClick={handleBack}
                      style={{ marginTop: '24px' }}
                    >
                      <IonIcon icon={arrowBack} slot="start" />
                      Volver al Inicio de Sesión
                    </IonButton>
                  </div>
                ) : (
                  <>
                    <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>
                      Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>

                    <ValidatedInput
                      value={email}
                      onValueChange={setEmail}
                      label="Correo Electrónico"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      validations={[emailValidation]}
                      required
                      helperText="Ingresa el correo asociado a tu cuenta"
                    />

                    <div className="ion-margin-top">
                      <IonButton 
                        expand="block" 
                        onClick={handleResetPassword} 
                        disabled={loading || !email}
                      >
                        {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                      </IonButton>
                    </div>

                    <div className="ion-margin-top" style={{ textAlign: 'center' }}>
                      <IonButton 
                        fill="clear" 
                        color="medium" 
                        onClick={handleBack}
                      >
                        <IonIcon icon={arrowBack} slot="start" />
                        Volver al Inicio de Sesión
                      </IonButton>
                    </div>
                  </>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonLoading isOpen={loading} message="Enviando correo de recuperación..." />
      
      <IonToast
        isOpen={showError}
        message={errorMessage}
        duration={5000}
        color="danger"
        onDidDismiss={() => setShowError(false)}
      />
    </IonContent>
  );
};