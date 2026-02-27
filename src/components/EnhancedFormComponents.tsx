// src/components/EnhancedFormComponents.tsx

import React, { useState, useEffect } from 'react';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonAlert,
  IonToast
} from '@ionic/react';
import {
  checkmarkCircle,
  alertCircle,
  informationCircle,
  closeCircle
} from 'ionicons/icons';

// Interfaz para las validaciones
interface ValidationRule {
  validate: (value: string) => boolean;
  errorMessage: string;
}

// Componente de input con validación en tiempo real
interface ValidatedInputProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
  validations?: ValidationRule[];
  helperText?: string;
  required?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  value,
  onValueChange,
  label,
  placeholder,
  type = 'text',
  validations = [],
  helperText,
  required = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  useEffect(() => {
    if (isTouched) {
      validateValue(value);
    }
  }, [value, isTouched]);

  const validateValue = (inputValue: string): boolean => {
    if (required && !inputValue.trim()) {
      setError('Este campo es requerido');
      setIsValid(false);
      return false;
    }

    for (const rule of validations) {
      if (!rule.validate(inputValue)) {
        setError(rule.errorMessage);
        setIsValid(false);
        return false;
      }
    }

    setError(null);
    setIsValid(true);
    return true;
  };

  const handleInputChange = (e: any) => {
    const newValue = e.detail.value;
    onValueChange(newValue);
    if (isTouched) {
      validateValue(newValue);
    }
  };

  const borderColor = !isTouched ? 'rgba(0,0,0,0.1)' :
    error ? 'var(--ion-color-danger)' :
      isValid ? 'var(--ion-color-success)' : 'rgba(0,0,0,0.1)';

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: 'var(--ion-color-slate-700)',
        marginBottom: '8px',
        letterSpacing: '-0.01em'
      }}>
        {label}{required && <span style={{ color: 'var(--ion-color-danger)', marginLeft: '4px' }}>*</span>}
      </label>

      <IonItem
        lines="none"
        style={{
          '--background': 'var(--ion-color-light)',
          '--border-color': borderColor,
          '--border-style': 'solid',
          '--border-width': '1.5px',
          '--border-radius': '16px',
          '--inner-padding-end': '12px',
          '--padding-start': '12px',
          transition: 'all 0.2s ease',
          boxShadow: isTouched && !error ? '0 0 0 4px rgba(79, 70, 229, 0.05)' : 'none'
        }}
      >
        <IonInput
          type={type as any}
          value={value}
          onIonInput={handleInputChange}
          onIonFocus={() => setIsTouched(true)}
          placeholder={placeholder}
          style={{
            '--padding-top': '12px',
            '--padding-bottom': '12px',
            fontSize: '1rem',
            color: 'var(--ion-color-dark)',
            fontWeight: '500'
          }}
        />
        {isTouched && (
          <IonIcon
            icon={isValid ? checkmarkCircle : alertCircle}
            color={isValid ? 'success' : 'danger'}
            style={{ fontSize: '20px', marginLeft: '8px' }}
          />
        )}
      </IonItem>

      {(error || helperText) && (
        <div style={{
          fontSize: '0.75rem',
          marginTop: '6px',
          paddingLeft: '4px',
          fontWeight: '500',
          color: error ? 'var(--ion-color-danger)' : '#64748b'
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

// Componente de formulario con confirmación para operaciones destructivas
interface DestructiveActionFormProps {
  actionName: string;
  actionDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export const DestructiveActionForm: React.FC<DestructiveActionFormProps> = ({
  actionName,
  actionDescription,
  onConfirm,
  onCancel,
  children
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAction = () => {
    setShowConfirmation(true);
  };

  const confirmAction = () => {
    try {
      onConfirm();
      setToastMessage(`${actionName} completado exitosamente`);
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(`Error: ${error.message || 'Ocurrió un error inesperado'}`);
      setShowToast(true);
    }
    setShowConfirmation(false);
  };

  return (
    <div>
      {children}

      <IonButton
        expand="block"
        color="danger"
        fill="outline"
        onClick={handleAction}
        style={{ marginTop: '16px' }}
      >
        {actionName}
      </IonButton>

      <IonAlert
        isOpen={showConfirmation}
        onDidDismiss={() => setShowConfirmation(false)}
        header="Confirmar Acción"
        subHeader={actionName}
        message={actionDescription}
        backdropDismiss={false}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              onCancel();
            }
          },
          {
            text: 'Confirmar',
            cssClass: 'alert-button-confirm',
            handler: confirmAction
          }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastMessage.startsWith('Error') ? 'danger' : 'success'}
      />
    </div>
  );
};

// Componente de mensaje de error mejorado
interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Ocurrió un error',
  onRetry,
  retryText = 'Reintentar'
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      backgroundColor: 'var(--ion-color-light-shade)',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      <IonIcon
        icon={alertCircle}
        color="danger"
        style={{ fontSize: '48px', marginBottom: '16px' }}
      />
      <h3 style={{ margin: '8px 0', color: 'var(--ion-color-danger)' }}>{title}</h3>
      <p style={{ margin: '8px 0', color: 'var(--ion-color-dark)' }}>{message}</p>
      {onRetry && (
        <IonButton
          fill="solid"
          color="danger"
          onClick={onRetry}
          style={{ marginTop: '16px' }}
        >
          {retryText}
        </IonButton>
      )}
    </div>
  );
};

// Componente de mensaje de éxito
interface SuccessMessageProps {
  message: string;
  title?: string;
  onContinue?: () => void;
  continueText?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  title = '¡Éxito!',
  onContinue,
  continueText = 'Continuar'
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      backgroundColor: 'var(--ion-color-success-tint)',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      <IonIcon
        icon={checkmarkCircle}
        color="success"
        style={{ fontSize: '48px', marginBottom: '16px' }}
      />
      <h3 style={{ margin: '8px 0', color: 'var(--ion-color-success)' }}>{title}</h3>
      <p style={{ margin: '8px 0', color: 'var(--ion-color-dark)' }}>{message}</p>
      {onContinue && (
        <IonButton
          fill="solid"
          color="success"
          onClick={onContinue}
          style={{ marginTop: '16px' }}
        >
          {continueText}
        </IonButton>
      )}
    </div>
  );
};

// Componente de carga con mensaje descriptivo
interface LoadingMessageProps {
  message: string;
  subMessage?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message,
  subMessage
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div
        className="loader"
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--ion-color-primary-tint)',
          borderTop: '4px solid var(--ion-color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}
      />
      <h3 style={{ margin: '8px 0' }}>{message}</h3>
      {subMessage && (
        <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>{subMessage}</p>
      )}
    </div>
  );
};

// Añadir animación de spin al estilo global
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

// Ejecutar una sola vez
if (!document.querySelector('#enhanced-ui-styles')) {
  const style = document.createElement('style');
  style.id = 'enhanced-ui-styles';
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export {
  addGlobalStyles
};