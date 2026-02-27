import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Función para verificar la configuración de Firebase
export const checkFirebaseConfig = async (): Promise<boolean> => {
  try {
    // Verificar si ya hay una instancia de Firebase inicializada
    if (getApps().length === 0) {
      console.log('Inicializando Firebase...');
      // Aquí se usaría la configuración de Firebase
      // Nota: En un entorno real, esta configuración vendría de las variables de entorno
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      };

      initializeApp(firebaseConfig);
    }

    // Obtener instancias de los servicios
    const auth = getAuth();
    const db = getDatabase();
    const storage = getStorage();

    console.log('✓ Firebase inicializado correctamente');
    console.log('✓ Auth servicio disponible');
    console.log('✓ Database servicio disponible');
    console.log('✓ Storage servicio disponible');

    // Intentar una operación simple para verificar conexión
    try {
      // Verificar conexión a la base de datos
      const testRef = ref(db, '.info/connected');
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        console.log('✓ Conexión a Realtime Database exitosa');
      } else {
        console.log('⚠ Posible problema con la conexión a Realtime Database');
      }
    } catch (dbError) {
      console.error('✗ Error conectando a Realtime Database:', dbError);
      return false;
    }

    // Verificar si las variables de entorno están definidas
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_DATABASE_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

    if (missingEnvVars.length > 0) {
      console.error('✗ Variables de entorno faltantes:', missingEnvVars);
      return false;
    }

    console.log('✓ Todas las variables de entorno requeridas están presentes');
    console.log('✓ Configuración de Firebase verificada exitosamente');
    
    return true;
  } catch (error) {
    console.error('✗ Error verificando la configuración de Firebase:', error);
    return false;
  }
};

// Función para verificar el entorno
export const checkEnvironment = (): void => {
  const environment = import.meta.env.MODE;
  console.log(`Entorno actual: ${environment}`);

  switch (environment) {
    case 'development':
      console.log('⚠ Ejecutando en modo desarrollo');
      break;
    case 'production':
      console.log('✓ Ejecutando en modo producción');
      break;
    case 'staging':
      console.log('✓ Ejecutando en modo staging');
      break;
    default:
      console.log(`⚠ Entorno desconocido: ${environment}`);
  }

  // Verificar si estamos usando variables de entorno de producción
  if (environment === 'production') {
    const isProdUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL?.includes('prod');
    if (isProdUrl) {
      console.log('✓ URL de base de datos coincide con entorno de producción');
    } else {
      console.warn('⚠ URL de base de datos no parece ser de producción');
    }
  }
};