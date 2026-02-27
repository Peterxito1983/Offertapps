// src/config/envValidator.ts
// Validador de variables de entorno

interface EnvVariables {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_DATABASE_URL: string;
  VITE_GEMINI_API_KEY?: string; // Opcional
}

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * @returns Objeto con las variables de entorno validadas
 */
export function validateEnvironment(): EnvVariables {
  const envVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  };

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_DATABASE_URL'
  ];

  const missingVars = requiredVars.filter(key => !envVars[key as keyof EnvVariables]);

  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${missingVars.join(', ')}`);
  }

  return envVars as EnvVariables;
}

/**
 * Verifica si la aplicación está en modo de desarrollo
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Verifica si la aplicación está en modo de producción
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Verifica si la aplicación está en modo de pruebas
 */
export function isTest(): boolean {
  return import.meta.env.MODE === 'test';
}