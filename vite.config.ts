import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Cargar variables de entorno según el modo
    const env = loadEnv(mode, '.', '');

    // Mostrar advertencia si estamos en producción sin variables completas
    if (mode === 'production') {
        const requiredVars = [
            'VITE_FIREBASE_API_KEY',
            'VITE_FIREBASE_AUTH_DOMAIN',
            'VITE_FIREBASE_PROJECT_ID',
            'VITE_FIREBASE_STORAGE_BUCKET',
            'VITE_FIREBASE_MESSAGING_SENDER_ID',
            'VITE_FIREBASE_APP_ID',
            'VITE_FIREBASE_DATABASE_URL'
        ];

        const missingVars = requiredVars.filter(varName => !env[varName]);
        if (missingVars.length > 0) {
            console.warn(`⚠️  ADVERTENCIA: Variables de entorno faltantes para producción: ${missingVars.join(', ')}`);
        }
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env': JSON.stringify(env),
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
