// src/components/CookieConsentBanner.tsx

import React, { useState, useEffect } from 'react';
import {
  IonToast,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import { close, informationCircle, checkmark, warning } from 'ionicons/icons';

// Tipos para las preferencias de cookies
interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentBannerProps {
  onConsentChange?: (preferences: CookiePreferences) => void;
  showSettings?: boolean;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ 
  onConsentChange, 
  showSettings = true 
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Siempre habilitado
    analytics: false,
    marketing: false,
    preferences: false
  });

  // Verificar si ya se dio consentimiento
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookie_consent');
    if (!consentGiven) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consentGiven);
      setPreferences(savedPreferences);
      if (onConsentChange) {
        onConsentChange(savedPreferences);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsented: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(allConsented);
    setToastMessage('Todas las cookies han sido aceptadas');
    setShowToast(true);
  };

  const handleAcceptEssential = () => {
    const essentialOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveConsent(essentialOnly);
    setToastMessage('Solo cookies esenciales aceptadas');
    setShowToast(true);
  };

  const handleSaveSettings = () => {
    saveConsent(preferences);
    setToastMessage('Preferencias de cookies guardadas');
    setShowToast(true);
    setShowSettingsModal(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    if (onConsentChange) {
      onConsentChange(prefs);
    }
  };

  // Función para aplicar preferencias de cookies
  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Aquí iría la lógica para aplicar las preferencias
    // Por ejemplo, habilitar/deshabilitar Google Analytics, etc.
    
    if (prefs.analytics) {
      // Habilitar Google Analytics
      console.log('Google Analytics habilitado');
    } else {
      // Deshabilitar Google Analytics
      console.log('Google Analytics deshabilitado');
    }
    
    if (prefs.marketing) {
      // Habilitar cookies de marketing
      console.log('Cookies de marketing habilitadas');
    } else {
      // Deshabilitar cookies de marketing
      console.log('Cookies de marketing deshabilitadas');
    }
  };

  // Aplicar preferencias cuando cambian
  useEffect(() => {
    applyCookiePreferences(preferences);
  }, [preferences]);

  if (!showBanner) {
    return (
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    );
  }

  return (
    <>
      <IonCard 
        style={{ 
          position: 'fixed', 
          bottom: '16px', 
          left: '16px', 
          right: '16px', 
          zIndex: 1000,
          margin: '0 auto',
          maxWidth: '600px'
        }}
      >
        <IonCardContent>
          <IonText>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
              <IonIcon icon={informationCircle} color="primary" style={{ marginRight: '8px' }} />
              Uso de Cookies
            </h3>
            <p>
              Utilizamos cookies para mejorar su experiencia en nuestra aplicación. 
              Las cookies esenciales son necesarias para el funcionamiento básico.
            </p>
          </IonText>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <IonButton 
              fill="solid" 
              color="primary"
              onClick={handleAcceptAll}
            >
              Aceptar Todo
            </IonButton>
            
            <IonButton 
              fill="outline" 
              color="primary"
              onClick={handleAcceptEssential}
            >
              Solo Esenciales
            </IonButton>
            
            {showSettings && (
              <IonButton 
                fill="clear" 
                color="medium"
                onClick={() => setShowSettingsModal(true)}
              >
                Configuración
              </IonButton>
            )}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Modal de configuración de cookies */}
      {showSettingsModal && (
        <IonCard 
          style={{ 
            position: 'fixed', 
            bottom: '80px', 
            left: '16px', 
            right: '16px', 
            zIndex: 1001,
            margin: '0 auto',
            maxWidth: '600px'
          }}
        >
          <IonCardContent>
            <IonText>
              <h3>Configuración de Cookies</h3>
              <p>Administre sus preferencias de cookies:</p>
            </IonText>

            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Esenciales</h2>
                  <p>Necesarias para el funcionamiento básico de la aplicación</p>
                </IonLabel>
                <IonCheckbox 
                  checked={preferences.necessary} 
                  disabled={true}
                  style={{ opacity: 0.5 }}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Análisis</h2>
                  <p>Nos ayudan a entender cómo usan la aplicación</p>
                </IonLabel>
                <IonCheckbox 
                  checked={preferences.analytics} 
                  onIonChange={e => setPreferences({...preferences, analytics: e.detail.checked})}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Marketing</h2>
                  <p>Para personalizar anuncios y contenido</p>
                </IonLabel>
                <IonCheckbox 
                  checked={preferences.marketing} 
                  onIonChange={e => setPreferences({...preferences, marketing: e.detail.checked})}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Preferencias</h2>
                  <p>Para recordar sus preferencias (idioma, región, etc.)</p>
                </IonLabel>
                <IonCheckbox 
                  checked={preferences.preferences} 
                  onIonChange={e => setPreferences({...preferences, preferences: e.detail.checked})}
                />
              </IonItem>
            </IonList>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <IonButton 
                fill="solid" 
                color="primary"
                onClick={handleSaveSettings}
              >
                Guardar Preferencias
              </IonButton>
              
              <IonButton 
                fill="outline" 
                color="medium"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancelar
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};