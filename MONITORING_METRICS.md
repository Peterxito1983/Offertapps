# Monitoreo y Métricas para OffertApps

## Descripción General

Este documento describe el sistema de monitoreo y métricas implementado en la aplicación OffertApps para mejorar la visibilidad del rendimiento y la detección de problemas.

## Componentes del Sistema de Monitoreo

### 1. Servicio de Monitoreo de Errores (`errorMonitoringService.ts`)

El servicio de monitoreo de errores proporciona:

- **Detección de errores no manejados**: Captura errores globales y promesas no manejadas
- **Seguimiento de errores repetidos**: Mantiene un conteo de errores para identificar problemas frecuentes
- **Niveles de severidad**: Clasifica errores como low, medium, high o critical
- **Integración con Sentry**: Preparado para integrarse con herramientas de monitoreo profesional
- **Acciones basadas en umbrales**: Toma acciones cuando un error ocurre con frecuencia

#### Uso del Servicio de Monitoreo de Errores

```ts
import { errorMonitoringService } from '../services/errorMonitoringService';

// Reportar un error manualmente
errorMonitoringService.reportError({
  message: 'Error al cargar ofertas',
  stack: error.stack,
  context: { userId: '123', companyId: '456' },
  severity: 'high'
});

// Configurar el servicio
errorMonitoringService.updateConfig({
  enableSentry: true,
  sentryDsn: 'https://your-dsn.sentry.io',
  errorThreshold: 3
});

// Obtener estadísticas de errores
const stats = errorMonitoringService.getErrorStats();
console.log('Estadísticas de errores:', stats);
```

### 2. Servicio de Métricas de Rendimiento (`performanceMetrics.ts`)

El servicio de métricas de rendimiento proporciona:

- **Medición de tiempos de carga**: Mide tiempos de carga de componentes y operaciones
- **Métricas de Web Vitals**: Captura First Contentful Paint (FCP), Largest Contentful Paint (LCP), etc.
- **Monitoreo de operaciones**: Mide el tiempo de operaciones como llamadas a Firebase
- **Registro de métricas personalizadas**: Permite registrar métricas específicas de la aplicación
- **Reporte periódico**: Envía métricas regularmente para análisis

#### Uso del Servicio de Métricas de Rendimiento

```ts
import { 
  performanceMetricsService, 
  measurePerformance,
  recordComponentLoad,
  recordFirebaseOperationTime
} from '../utils/performanceMetrics';

// Medir el tiempo de una operación
const result = await measurePerformance('loadOffers', async () => {
  return await getOffers();
});

// Registrar el tiempo de carga de un componente
const startTime = performance.now();
// ... renderizado del componente
const loadTime = performance.now() - startTime;
recordComponentLoad('OfferCard', loadTime);

// Registrar el tiempo de una operación de Firebase
const start = performance.now();
const offers = await getOffers();
const duration = performance.now() - start;
recordFirebaseOperationTime('getOffers', duration, { count: offers.length });

// Obtener métricas resumidas
const summary = performanceMetricsService.getSummary();
console.log('Métricas resumidas:', summary);
```

## Integración con el Sistema de Logging

Ambos servicios están integrados con el sistema de logging para:

- Registrar eventos de monitoreo
- Proporcionar contexto adicional a los logs
- Facilitar la correlación entre errores y métricas

## Implementación en la Aplicación

### 1. En Servicios de Datos

```ts
// En services/offersService.ts
import { 
  errorMonitoringService, 
  recordFirebaseOperationTime 
} from '../utils/performanceMetrics';

export const getOffers = async () => {
  try {
    const start = performance.now();
    const result = await getOffersFromFirebase();
    const duration = performance.now() - start;
    
    recordFirebaseOperationTime('getOffers', duration, { 
      count: result.length 
    });
    
    return result;
  } catch (error) {
    errorMonitoringService.reportError({
      message: 'Error al obtener ofertas',
      stack: error.stack,
      severity: 'high'
    });
    throw error;
  }
};
```

### 2. En Componentes

```ts
// En componentes de la UI
import { 
  recordComponentLoad, 
  measurePerformance 
} from '../utils/performanceMetrics';
import { errorMonitoringService } from '../services/errorMonitoringService';

const MyComponent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTimeStart = performance.now();
    
    measurePerformance('loadUserData', async () => {
      try {
        const data = await fetchUserData();
        // Procesar datos
      } catch (error) {
        errorMonitoringService.reportError({
          message: 'Error al cargar datos de usuario',
          context: { userId: currentUser.id },
          severity: 'medium'
        });
      } finally {
        setLoading(false);
        const loadTime = performance.now() - loadTimeStart;
        recordComponentLoad('MyComponent', loadTime);
      }
    });
  }, []);

  return (
    <div>...</div>
  );
};
```

## Métricas Clave a Monitorear

### 1. Web Vitals
- **LCP (Largest Contentful Paint)**: Tiempo de carga del contenido más grande
- **FID (First Input Delay)**: Tiempo de respuesta a la primera interacción
- **CLS (Cumulative Layout Shift)**: Estabilidad visual de la página

### 2. Métricas de Negocio
- **Tiempo de carga de ofertas**
- **Tiempo de respuesta de operaciones CRUD**
- **Tasa de errores de autenticación**
- **Tiempo de carga de componentes críticos**

### 3. Métricas de Usuario
- **Tiempo de inicio de sesión**
- **Tiempo de carga de la lista de ofertas**
- **Tiempo de publicación de una nueva oferta**

## Alertas y Notificaciones

### 1. Umbrales de Error
- Errores críticos que ocurren con frecuencia
- Errores que afectan a más del 5% de los usuarios
- Errores que ocurren en más del 10% de las sesiones

### 2. Umbrales de Rendimiento
- Tiempos de carga superiores a 3 segundos
- Operaciones de Firebase que toman más de 5 segundos
- Componentes que tardan más de 2 segundos en cargar

## Integración con Herramientas Externas

### 1. Sentry
- Configuración para reportar errores automáticamente
- Integración con el servicio de monitoreo de errores
- Seguimiento de sesiones y usuarios

### 2. Firebase Performance Monitoring
- Métricas de rendimiento específicas de Firebase
- Monitoreo de operaciones de base de datos
- Análisis de tiempos de respuesta

### 3. Google Analytics
- Seguimiento de eventos de rendimiento
- Análisis de Web Vitals
- Informes de rendimiento por dispositivo y ubicación

## Buenas Prácticas

1. **Monitorear lo que importa**: Enfocarse en métricas que impactan la experiencia del usuario
2. **Establecer umbrales realistas**: Configurar alertas con umbrales que reflejen la realidad del negocio
3. **Revisar regularmente**: Analizar métricas y errores regularmente para identificar tendencias
4. **Correlacionar datos**: Combinar datos de errores, métricas y comportamiento del usuario
5. **Mantener el contexto**: Siempre incluir información contextual en los reportes

## Consideraciones de Privacidad

- No incluir información sensible en los reportes de errores
- Respetar las políticas de privacidad al recolectar métricas
- Permitir a los usuarios desactivar el monitoreo si lo desean
- Cifrar datos sensibles antes de enviarlos a servicios externos

## Próximos Pasos

1. Implementar integración real con Sentry
2. Configurar dashboards de monitoreo
3. Establecer alertas automatizadas
4. Implementar monitoreo de backend
5. Crear informes de rendimiento periódicos