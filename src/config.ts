import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported, Messaging } from 'firebase/messaging';
import { validateEnvironment } from './config/envValidator';

// Validar las variables de entorno al inicio
validateEnvironment();

// Configuración de Firebase usando variables de entorno
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getDatabase(app); // Usando Realtime Database
export const storage = getStorage(app);

// Analytics y Messaging (inicialización asíncrona segura)
let analytics: any = null;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
    isAnalyticsSupported().then(supported => {
        if (supported && import.meta.env.MODE === 'production') {
            analytics = getAnalytics(app);
        }
    });

    isMessagingSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

export { analytics, messaging };