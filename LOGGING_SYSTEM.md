# Sistema de Logging para OffertApps

## Descripción General

Este documento describe el sistema de logging implementado en la aplicación OffertApps para mejorar la visibilidad, monitoreo y depuración de la aplicación.

## Componentes del Sistema de Logging

### 1. Logger Básico (`loggingService.ts`)

El logger básico proporciona:

- **Niveles de log**: `debug`, `info`, `warn`, `error`
- **Registro estructurado**: Cada entrada incluye timestamp, nivel, mensaje y contexto
- **Configuración flexible**: Permite configurar nivel mínimo, salida a consola, etc.
- **Manejo de errores**: Captura y formatea errores de manera adecuada

#### Uso del Logger Básico

```ts
import { logger } from '../services/loggingService';

// Registrar diferentes niveles de logs
logger.debug('Mensaje de depuración', { userId: '123' });
logger.info('Usuario inició sesión', { email: 'user@example.com' });
logger.warn('Advertencia importante', { context: 'some context' });
logger.error('Error crítico', error, { userId: '123' });

// Capturar errores no manejados
try {
  // código que puede fallar
} catch (error) {
  logger.captureError(error, { operation: 'user_login' });
}
```

### 2. Logger Persistente (`persistentLoggingService.ts`)

El logger persistente proporciona:

- **Almacenamiento local**: Guarda logs en localStorage del navegador
- **Envío periódico**: Envía logs al servidor en intervalos regulares
- **Historial persistente**: Mantiene un historial de logs entre sesiones
- **Recuperación de datos**: Recupera logs después de reinicios de la aplicación

#### Uso del Logger Persistente

```ts
import { persistentLogger } from '../services/persistentLoggingService';

// Registrar un log persistente
persistentLogger.log('info', 'Usuario realizó acción', { userId: '123' });

// Obtener logs recientes
const recentLogs = persistentLogger.getRecentLogs(20);

// Vaciar logs manualmente
persistentLogger.flushLogs();

// Exportar logs
const logsJson = persistentLogger.exportLogs();
```

### 3. Sistema Integrado (`loggingUtils.ts`)

El sistema integrado combina ambos loggers y proporciona:

- **API unificada**: Interfaz simple para todas las operaciones de logging
- **Operaciones específicas**: Métodos para eventos de usuario, operaciones de Firebase, etc.
- **Gestión de configuración**: Configuración centralizada del sistema de logging

## Implementación en la Aplicación

### 1. Inicialización del Sistema

```ts
// En el punto de entrada de la aplicación (App.tsx o main.tsx)
import { initializeLoggingSystem } from './utils/loggingUtils';

// Inicializar el sistema de logging
initializeLoggingSystem({
  enableConsoleLogging: process.env.NODE_ENV !== 'production',
  enablePersistentLogging: true,
  minLogLevel: 'info',
  userId: currentUser?.uid, // Si está disponible
  sessionId: sessionId
});
```

### 2. Uso en Servicios

```ts
// En services/authService.ts
import { loggingSystem } from '../utils/loggingUtils';

export const signIn = async (email: string, password: string) => {
  loggingSystem.logUserAction('sign_in_attempt', email, { email });
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    loggingSystem.logUserAction('sign_in_success', result.user.uid, { email });
    return result;
  } catch (error) {
    loggingSystem.logAuthIssue('sign_in_failed', email, { error: error.message, email });
    throw error;
  }
};
```

### 3. Uso en Componentes

```ts
// En componentes de la UI
import { loggingSystem } from '../utils/loggingUtils';

const handleOfferClick = (offerId: string) => {
  loggingSystem.logUserAction('offer_clicked', currentUser.uid, { offerId });
  // Lógica del componente
};

// Capturar errores en componentes
const handleError = (error: any) => {
  loggingSystem.captureError(error, { 
    component: 'OfferCard', 
    offerId: currentOffer.id 
  });
};
```

## Niveles de Log y Cuándo Usarlos

- **`debug`**: Información detallada para depuración, principalmente de interés cuando se diagnostican problemas
- **`info`**: Confirmación de que las cosas están funcionando como se esperaba
- **`warn`**: Indicación de que algo inesperado ocurrió o que hay un problema potencial
- **`error`**: Error en la operación o en otro proceso; el software no se detiene pero algo falló

## Estrategias de Monitoreo

### 1. Eventos Clave a Registrar

- Inicio y cierre de sesión de usuarios
- Operaciones críticas (creación/eliminación de ofertas, reseñas)
- Errores de red o Firebase
- Problemas de rendimiento
- Errores de validación

### 2. Contexto Importante

Cada log debe incluir contexto relevante como:

- ID de usuario
- ID de sesión
- URL actual
- Información del dispositivo
- Parámetros relevantes de la operación

### 3. Gestión de Volumen

- Configurar niveles de log apropiados por entorno
- Implementar límites de almacenamiento
- Configurar envío periódico de logs al servidor

## Integración con Herramientas de Monitoreo

El sistema está diseñado para integrarse fácilmente con herramientas de monitoreo como:

- **Sentry**: Para seguimiento de errores
- **Firebase Analytics**: Para análisis de uso
- **Sistemas de logging centralizados**: Para monitoreo en producción

## Buenas Prácticas

1. **No registrar información sensible**: Evitar incluir contraseñas, tokens completos, etc.
2. **Usar niveles apropiados**: No usar `error` para mensajes informativos
3. **Incluir contexto útil**: Siempre incluir información que ayude a diagnosticar problemas
4. **Mantener logs concisos**: Evitar información redundante o excesivamente detallada
5. **Revisar regularmente**: Revisar y limpiar logs periódicamente

## Consideraciones de Seguridad

- Los logs locales pueden ser accesibles por el usuario final
- No incluir información sensible en los logs
- Considerar cifrado para logs que contengan información sensible
- Implementar políticas de retención adecuadas

## Próximos Pasos

1. Integrar con una herramienta de monitoreo centralizado como Sentry
2. Implementar alertas para errores críticos
3. Crear dashboards de monitoreo
4. Configurar políticas de retención de logs