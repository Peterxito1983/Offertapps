// src/components/NotificationPreferences.tsx

import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonToggle,
  IonList,
  IonListHeader,
  IonNote,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText
} from '@ionic/react';
import { notifications, notificationsOff, informationCircle, checkmarkCircle } from 'ionicons/icons';
import { pushNotificationService, initializePushNotifications } from '../services/pushNotificationService';
import { updateUserNotificationPreferences, getCurrentUserProfile } from '../services/authService';

interface NotificationPreferencesProps {
  userId: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    offers: false,
    promotions: false,
    reminders: false,
    tracking: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPushInitialized, setIsPushInitialized] = useState(false);

  // Cargar preferencias iniciales
  useEffect(() => {
    loadNotificationPreferences();
  }, [userId]);

  const loadNotificationPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Verificar si las notificaciones están inicializadas de forma segura
      try {
        const isEnabled = pushNotificationService.areNotificationsEnabled();
        setIsPushInitialized(isEnabled);
      } catch (pushErr) {
        console.warn('NotificationPreferences: El servicio de push no está disponible en este entorno', pushErr);
        setIsPushInitialized(false);
      }

      // 2. Cargar preferencias desde el perfil del usuario en Firebase (esto SIEMPRE debe intentarse)
      const profile = await getCurrentUserProfile();
      if (profile) {
        const prefs = (profile as any).notificationPreferences || {
          offers: false,
          promotions: false,
          reminders: false,
          tracking: false
        };
        setPreferences(prefs);
      }
    } catch (err: any) {
      setError('Error al sincronizar preferencias: ' + (err.message || 'Error de conexión'));
      console.error('Error al cargar preferencias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = async (checked: boolean) => {
    if (checked) {
      try {
        setLoading(true);
        const initialized = await initializePushNotifications();
        if (initialized) {
          setIsPushInitialized(true);
          // Al activar globalmente, activamos todas por defecto si estaban todas apagadas
          const allOn = { offers: true, promotions: true, reminders: true, tracking: true };
          setPreferences(allOn);
          await updateUserNotificationPreferences(userId, allOn);
        } else {
          setError('No se pudieron habilitar las notificaciones en este dispositivo');
        }
      } catch (err: any) {
        console.error('Error detallado en handleGlobalToggle:', err);
        setError(`Fallo al habilitar alertas: ${err.message || 'Error de permisos o hardware'}`);
      } finally {
        setLoading(false);
      }
    } else {
      setIsPushInitialized(false);
      // Opcional: podrías querer mantener las preferencias en DB pero apagar el switch global
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    try {
      const newPrefs = { ...preferences, [key]: value };
      setPreferences(newPrefs);
      await updateUserNotificationPreferences(userId, { [key]: value });
    } catch (err) {
      setError('No se pudo guardar la preferencia');
      // Rollback
      setPreferences(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleTestNotification = async () => {
    if (!isPushInitialized) {
      setError('Activa las notificaciones primero');
      return;
    }

    // En una implementación real, esto enviaría una notificación de prueba
    // desde el backend usando el token del dispositivo
    alert('En una implementación real, esto enviaría una notificación de prueba');
  };

  return (
    <IonCard>
      <IonCardContent>
        <IonList>
          <IonListHeader>
            <h2>Notificaciones Push</h2>
            <IonNote>Personaliza tus preferencias de notificaciones</IonNote>
          </IonListHeader>

          <IonItem>
            <IonLabel>
              <h3>Habilitar Notificaciones Push</h3>
              <p>Activa el permiso maestro para recibir alertas en este dispositivo</p>
            </IonLabel>
            <IonToggle
              checked={isPushInitialized}
              onIonChange={e => handleGlobalToggle(e.detail.checked)}
              disabled={loading}
              color="primary"
            />
          </IonItem>

          <IonListHeader style={{ minHeight: 'auto', paddingLeft: '16px', marginTop: '10px' }}>
            <IonLabel>Preferencias individuales</IonLabel>
          </IonListHeader>

          <IonItem>
            <IonLabel>
              <h3>Notificaciones de Ofertas</h3>
              <p>Nuevas ofertas de tus empresas favoritas</p>
            </IonLabel>
            <IonToggle
              checked={preferences.offers}
              onIonChange={e => handlePreferenceChange('offers', e.detail.checked)}
              disabled={loading}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>Notificaciones de Promociones</h3>
              <p>Promociones especiales y descuentos exclusivos</p>
            </IonLabel>
            <IonToggle
              checked={preferences.promotions}
              onIonChange={e => handlePreferenceChange('promotions', e.detail.checked)}
              disabled={loading}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>Recordatorios</h3>
              <p>Alertas sobre ofertas que están por vencer</p>
            </IonLabel>
            <IonToggle
              checked={preferences.reminders}
              onIonChange={e => handlePreferenceChange('reminders', e.detail.checked)}
              disabled={loading}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>Notificaciones de Seguimiento</h3>
              <p>Cambios en el estado de tus interacciones</p>
            </IonLabel>
            <IonToggle
              checked={preferences.tracking}
              onIonChange={e => handlePreferenceChange('tracking', e.detail.checked)}
              disabled={loading}
            />
          </IonItem>
        </IonList>

        <div style={{ marginTop: '20px' }}>
          <IonButton
            expand="block"
            fill="solid"
            color="primary"
            onClick={handleTestNotification}
            disabled={!isPushInitialized}
          >
            <IonIcon icon={notifications} slot="start" />
            Enviar Notificación de Prueba
          </IonButton>
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '4px', borderLeft: '4px solid var(--ion-color-danger)' }}>
            <IonText color="danger">
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <IonIcon icon={informationCircle} /> {error}
              </p>
            </IonText>
          </div>
        )}

        {!error && isPushInitialized && (
          <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f0fff4', borderRadius: '4px', borderLeft: '4px solid var(--ion-color-success)' }}>
            <IonText color="success">
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <IonIcon icon={checkmarkCircle} /> Configuración sincronizada con la nube
              </p>
            </IonText>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--ion-color-light-tint)', borderRadius: '8px' }}>
          <IonText color="medium">
            <p style={{ fontSize: '14px' }}>
              <IonIcon icon={informationCircle} style={{ marginRight: '8px' }} />
              Para recibir notificaciones push, tu navegador debe soportarlas y debes permitir las notificaciones para este sitio.
            </p>
          </IonText>
        </div>
      </IonCardContent>
    </IonCard>
  );
};