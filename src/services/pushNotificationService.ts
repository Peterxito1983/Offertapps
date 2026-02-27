import { getMessaging, getToken, onMessage, Messaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { app } from '../config';

// Interfaz para las opciones de notificación
export interface PushNotificationConfig {
  autoRequestPermission?: boolean;
  vapidKey?: string;
}

// Servicio para manejar notificaciones push
export class PushNotificationService {
  private messaging: Messaging | null = null;
  private config: PushNotificationConfig;
  private token: string | null = null;
  private initialized: boolean = false;
  private isNative: boolean = Capacitor.isNativePlatform();

  constructor(config: PushNotificationConfig = {}) {
    this.config = {
      autoRequestPermission: true,
      ...config
    };
  }

  /**
   * Inicializar el servicio de forma segura
   */
  private async init(): Promise<boolean> {
    if (this.initialized) return !!this.messaging;

    try {
      const supported = await isMessagingSupported();
      if (supported) {
        this.messaging = getMessaging(app);
      } else {
        console.warn('Firebase Messaging no es compatible con este navegador/entorno.');
      }
    } catch (error) {
      console.error('Error al inicializar Firebase Messaging:', error);
    }

    this.initialized = true;
    return !!this.messaging;
  }

  /**
   * Solicitar permiso para enviar notificaciones push
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (this.isNative) {
      const status = await PushNotifications.requestPermissions();
      return status.receive === 'granted' ? 'granted' : 'denied';
    }

    const available = await this.init();
    if (!available) return 'denied';

    if (!('serviceWorker' in navigator)) {
      return 'denied';
    }

    try {
      if (typeof Notification === 'undefined') return 'denied';
      return await Notification.requestPermission();
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      return 'denied';
    }
  }

  /**
   * Obtener el token de registro para notificaciones push
   */
  async getToken(options?: { vapidKey?: string }): Promise<string | null> {
    const available = await this.init();
    if (!available || !this.messaging) return null;

    if (!options?.vapidKey && !this.config.vapidKey) {
      throw new Error('VAPID key es requerida para obtener el token');
    }

    try {
      this.token = await getToken(this.messaging, {
        vapidKey: options?.vapidKey || this.config.vapidKey,
      });
      return this.token;
    } catch (error) {
      console.error('Error al obtener token de notificación:', error);
      return null;
    }
  }

  /**
   * Escuchar mensajes entrantes cuando la app está en primer plano
   */
  async onMessageReceived(callback: (payload: any) => void): Promise<() => void> {
    const available = await this.init();
    if (!available || !this.messaging) return () => { };

    return onMessage(this.messaging, callback);
  }

  /**
   * Registrar un service worker para manejar notificaciones push
   */
  async registerServiceWorker(swPath: string = '/firebase-messaging-sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      return await navigator.serviceWorker.register(swPath);
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      return null;
    }
  }

  /**
   * Verificar si las notificaciones push están soportadas
   */
  static async isSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'PushManager' in window && await isMessagingSupported();
  }

  getCurrentToken(): string | null {
    return this.token;
  }

  areNotificationsEnabled(): boolean {
    if (typeof Notification === 'undefined') return false;
    return Notification.permission === 'granted' && !!this.token;
  }

  /**
   * Escuchar clics en las notificaciones
   */
  async onActionReceived(callback: (payload: any) => void): Promise<() => void> {
    const available = await this.init();
    if (!available || !this.messaging) return () => { };

    // En web, las acciones se manejan de forma diferente. 
    // Para simplificar, este servicio se centrará en la recepción básica.
    return () => { };
  }
}

// Instancia global del servicio
export const pushNotificationService = new PushNotificationService({
  vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
});

// Función para inicializar las notificaciones push
export const initializePushNotifications = async (
  config?: PushNotificationConfig
): Promise<boolean> => {
  try {
    const isNative = Capacitor.isNativePlatform();

    // Si es nativo, usamos Capacitor
    if (isNative) {
      const permission = await pushNotificationService.requestPermission();
      if (permission !== 'granted') return false;

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          (pushNotificationService as any).token = token.value;
          resolve(true);
        });
        PushNotifications.addListener('registrationError', (err) => {
          console.error('Error en registro nativo:', err);
          resolve(false);
        });
        PushNotifications.register();
      });
    }

    // Si es Web, seguimos con Firebase Messaging
    const supported = await PushNotificationService.isSupported();
    if (!supported) return false;

    if (config) {
      Object.assign((pushNotificationService as any).config, config);
    }

    const permission = await pushNotificationService.requestPermission();
    if (permission !== 'granted') return false;

    await pushNotificationService.registerServiceWorker();
    const token = await pushNotificationService.getToken();

    return !!token;
  } catch (error) {
    console.error('Error al inicializar notificaciones push:', error);
    return false;
  }
};