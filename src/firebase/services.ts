// src/firebase/services.ts
// Este archivo exporta todos los servicios de Firebase utilizados en la aplicación

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported, Messaging } from 'firebase/messaging';

// Importar configuración de Firebase
import { firebaseConfig } from '../config';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Inicializar servicios opcionales de forma segura
let analytics = null;
let messaging: Messaging | null = null;

// Analytics y Messaging son asíncronos para verificar soporte
isAnalyticsSupported().then(supported => {
  if (supported) analytics = getAnalytics(app);
});

isMessagingSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn('Firebase Messaging no es compatible con este entorno.');
  }
}).catch(err => {
  console.error('Error al verificar soporte de Firebase Messaging:', err);
});

// Exportar instancias
export {
  app,
  auth,
  db,
  storage,
  analytics,
  messaging
};

// Exportar servicios específicos
export * from '../services/authService';
export * from '../services/offersService';
export * from '../services/companiesService';
export * from '../services/reviewsService';
export * from '../services/storageService';
export * from '../services/usersService';