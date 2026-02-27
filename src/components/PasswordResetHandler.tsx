// src/components/PasswordResetHandler.tsx

import React, { useState, useEffect } from 'react';
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
import { lockClosed, checkmarkCircle, arrowBack } from 'ionicons/icons';
import { confirmPasswordReset, applyActionCode, getAuth } from 'firebase/auth';
import { ValidatedInput } from './EnhancedFormComponents';

interface PasswordResetHandlerProps {
  oobCode: string; // Código de una sola vez de Firebase
  onBackToLogin: () => void;
}

export const PasswordResetHandler: React.FC<PasswordResetHandlerProps> = ({ oobCode, onBackToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [email, setEmail] = useState(''); // Email del usuario que va a ser restablecido

  const auth = getAuth();

  // Validaciones
  const passwordValidation = {
    validate: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value),
    errorMessage: 'La contraseña debe tener al menos 6 caracteres, incluyendo mayúscula, minúscula y número'
  };

  const passwordsMatchValidation = {
    validate: (value: string) => value === newPassword,
    errorMessage: 'Las contraseñas no coinciden'
  };

  // Verificar el código de acción cuando se monta el componente
  useEffect(() => {
    const verifyActionCode = async () => {
      setLoading(true);
      try {
        const info = await applyActionCode(auth, oobCode);
        setEmail(info.data.email);
      } catch (error: any) {
        setErrorMessage('El enlace de restablecimiento no es válido o ha expirado. Por favor solicita uno nuevo.');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyActionCode();
  }, [oobCode, auth]);

  const handlePasswordReset = async () => {
    // Validaciones
    if (!passwordValidation.validate(newPassword)) {
      setErrorMessage('La contraseña no cumple con los requisitos');
      setShowError(true);
      return;
    }

    if (!passwordsMatchValidation.validate(confirmPassword)) {
      setErrorMessage('Las contraseñas no coinciden');
      setShowError(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowError(false);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage('¡Tu contraseña ha sido restablecida exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.');
      setShowSuccess(true);
    } catch (error: any) {
      let errorMsg = 'Ocurrió un error al restablecer la contraseña.';
      
      switch (error.code) {
        case 'auth/expired-action-code':
          errorMsg = 'El enlace de restablecimiento ha expirado. Por favor solicita uno nuevo.';
          break;
        case 'auth/invalid-action-code':
          errorMsg = 'El enlace de restablecimiento no es válido. Por favor solicita uno nuevo.';
          break;
        case 'auth/user-disabled':
          errorMsg = 'Esta cuenta ha sido deshabilitada.';
          break;
        case 'auth/weak-password':
          errorMsg = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
          break;
        default:
          errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
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
                <IonCardTitle>Restablecer Contraseña</IonCardTitle>
              </IonCardHeader>
              
              <IonCardContent>
                {showSuccess ? (
                  <div className="center-content" style={{ textAlign: 'center', padding: '20px' }}>
                    <IonIcon 
                      icon={checkmarkCircle} 
                      color="success" 
                      style={{ fontSize: '48px', marginBottom: '16px' }} 
                    />
                    <h3 style={{ color: 'var(--ion-color-success)', margin: '16px 0' }}>¡Contraseña Restablecida!</h3>
                    <p>{successMessage}</p>
                    <IonButton 
                      expand="block" 
                      fill="outline" 
                      color="primary" 
                      onClick={handleBack}
                      style={{ marginTop: '24px' }}
                    >
                      <IonIcon icon={arrowBack} slot="start" />
                      Ir al Inicio de Sesión
                    </IonButton>
                  </div>
                ) : (
                  <>
                    {email && (
                      <p style={{ color: 'var(--ion-color-medium)', marginBottom: '16px', textAlign: 'center' }}>
                        Cambiando contraseña para: <strong>{email}</strong>
                      </p>
                    )}
                    
                    <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>
                      Ingresa tu nueva contraseña a continuación.
                    </p>

                    <ValidatedInput
                      value={newPassword}
                      onValueChange={setNewPassword}
                      label="Nueva Contraseña"
                      placeholder="••••••••"
                      type="password"
                      validations={[passwordValidation]}
                      required
                      helperText="Al menos 6 caracteres, con mayúscula, minúscula y número"
                    />

                    <ValidatedInput
                      value={confirmPassword}
                      onValueChange={setConfirmPassword}
                      label="Confirmar Contraseña"
                      placeholder="••••••••"
                      type="password"
                      validations={[passwordsMatchValidation]}
                      required
                      helperText="Confirma tu nueva contraseña"
                    />

                    <div className="ion-margin-top">
                      <IonButton 
                        expand="block" 
                        onClick={handlePasswordReset} 
                        disabled={loading || !newPassword || !confirmPassword}
                      >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                      </IonButton>
                    </div>

                    <div className="ion-margin-top" style={{ textAlign: 'center' }}>
                      <IonButton 
                        fill="clear" 
                        color="medium" 
                        onClick={handleBack}
                        disabled={loading}
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

      <IonLoading isOpen={loading} message="Restableciendo contraseña..." />
      
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