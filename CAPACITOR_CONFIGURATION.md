# Configuración de Capacitor

## Descripción General
Capacitor es el motor nativo que permite convertir la aplicación web en una aplicación móvil nativa para iOS y Android. Esta aplicación utiliza Capacitor para acceder a funcionalidades nativas como la barra de estado y la pantalla de inicio.

## Archivo de Configuración Principal

### capacitor.config.ts
```typescript
import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.offertapps.app',
  appName: 'OffertApps',
  webDir: 'dist',  // Directorio donde se encuentra la versión construida de la aplicación web
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,  // Duración de la pantalla de inicio en milisegundos
      backgroundColor: '#6366f1',  // Color de fondo de la pantalla de inicio (índigo)
      showSpinner: false,  // No mostrar spinner de carga
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,  // Pantalla completa
      splashImmersive: true,  // Modo inmersivo
    },
    StatusBar: {
      style: 'dark',  // Estilo del texto de la barra de estado
      backgroundColor: '#6366f1',  // Color de fondo de la barra de estado
    },
  },
};

export default config;
```

## Plataformas Soportadas
- Android
- iOS

## Plugins Instalados
- `@capacitor/splash-screen`: Controla la pantalla de inicio
- `@capacitor/status-bar`: Controla la barra de estado

## Configuración Específica por Plataforma

### Android
- SDK Mínimo: 22
- SDK de Compilación: 34
- SDK de Destino: 34
- Se incluye Google Services para integración con Firebase

### iOS
- Configuración estándar de Capacitor

## Comandos Útiles
```bash
# Agregar plataforma
npx cap add android
npx cap add ios

# Sincronizar cambios
npx cap sync

# Abrir proyecto nativo
npx cap open android
npx cap open ios

# Construir proyecto
npx cap build android
npx cap build ios

# Actualizar plugins
npx cap update
```

## Notas Importantes
- Asegúrate de tener el directorio `dist` actualizado antes de sincronizar con las plataformas nativas
- El archivo `google-services.json` debe estar presente en `android/app/` para que funcione correctamente la integración con Firebase en Android
- Para iOS, el archivo `GoogleService-Info.plist` debe estar en el directorio correcto