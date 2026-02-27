# Integración con Sentry y Configuración de Alertas

## Descripción General

Este documento describe cómo integrar Sentry para el seguimiento de errores y cómo configurar alertas para errores críticos en la aplicación OffertApps.

## 1. Integración con Sentry

### Instalación de Dependencias

```bash
npm install @sentry/react @sentry/tracing
```

### Configuración Inicial

```tsx
// src/sentry.ts
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Inicializar Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new Integrations.BrowserTracing(),
    new Sentry.Replay(),
  ],
  
  // Configuración de muestreo
  tracesSampleRate: 0.1, // 10% de transacciones para tracing
  replaysSessionSampleRate: 0.1, // 10% de sesiones para replays
  replaysOnErrorSampleRate: 1.0, // 100% de sesiones con errores para replays
  
  // Filtros de entorno
  enabled: process.env.NODE_ENV === 'production',
  
  // Personalizar qué errores se reportan
  beforeSend: (event, hint) => {
    // Filtrar errores específicos que no queremos reportar
    if (event.message && event.message.includes('ResizeObserver loop limit exceeded')) {
      return null;
    }
    
    return event;
  },
  
  // Agregar contexto adicional
  beforeBreadcrumb: (breadcrumb, hint) => {
    // Filtrar breadcrumbs no deseados
    if (breadcrumb.category === 'console' && breadcrumb.level === 'info') {
      return null;
    }
    
    return breadcrumb;
  }
});

// Exportar funciones útiles
export { Sentry };
```

### Integración con React

```tsx
// src/App.tsx (actualizado)
import React from 'react';
import { BrowserTracing } from '@sentry/tracing';
import { Sentry } from './sentry';

// Envolver la aplicación con ErrorBoundary de Sentry
const AppWithSentry = Sentry.withErrorBoundary(App, {
  fallback: ({ error, componentStack, resetError }) => (
    <div className="error-fallback">
      <h2>Algo salió mal!</h2>
      <p>Estamos trabajando para resolver el problema.</p>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        {error && error.toString()}
        <br />
        {componentStack}
      </details>
      <button onClick={resetError}>Intentar de nuevo</button>
    </div>
  ),
});

// Para rastreo de componentes
Sentry.reactRouterV5Instrumentation(history);

export default AppWithSentry;
```

### Uso en Componentes

```tsx
// Ejemplo de uso en componentes
import { useSentry } from './hooks/useSentry';

const MyComponent: React.FC = () => {
  const { captureException, captureMessage } = useSentry();
  
  const handleAction = async () => {
    try {
      await performAction();
    } catch (error) {
      // Capturar error con contexto adicional
      captureException(error, {
        contexts: {
          custom: {
            action: 'performAction',
            userId: currentUser?.id,
            offerId: selectedOffer?.id
          }
        }
      });
      
      // Mostrar mensaje de error al usuario
      showError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    }
  };
  
  return (
    <div>...</div>
  );
};
```

## 2. Configuración de Métricas de Rendimiento

### Web Vitals con Sentry

```tsx
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Enviar Web Vitals a Sentry
const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Enviar a Sentry si las métricas están por debajo del umbral
reportWebVitals(metric => {
  if (metric.name === 'LCP' && metric.value > 2500) { // LCP > 2.5s
    Sentry.metrics.increment('web_vitals.lcp.poor', 1, {
      tags: {
        value: metric.value,
        rating: metric.rating
      }
    });
  }
  
  if (metric.name === 'CLS' && metric.value > 0.1) { // CLS > 0.1
    Sentry.metrics.increment('web_vitals.cls.poor', 1, {
      tags: {
        value: metric.value,
        rating: metric.rating
      }
    });
  }
});

export default reportWebVitals;
```

## 3. Configuración de Alertas

### Configuración de Reglas de Alerta en Sentry

```json
{
  "alerts": [
    {
      "name": "Errores críticos de autenticación",
      "conditions": [
        {
          "type": "event.attribute",
          "attribute": "exception.type",
          "operator": "equals",
          "value": "AuthenticationError"
        }
      ],
      "actions": [
        {
          "type": "email",
          "target": "dev-team@example.com"
        }
      ],
      "frequency": 30
    },
    {
      "name": "Alta tasa de errores",
      "conditions": [
        {
          "type": "event.rate",
          "value": 10,
          "window": 5
        }
      ],
      "actions": [
        {
          "type": "email",
          "target": "oncall@example.com"
        }
      ],
      "frequency": 1
    },
    {
      "name": "Errores en producción",
      "conditions": [
        {
          "type": "event.attribute",
          "attribute": "environment",
          "operator": "equals",
          "value": "production"
        },
        {
          "type": "event.severity",
          "operator": "greater_or_equal",
          "value": "error"
        }
      ],
      "actions": [
        {
          "type": "email",
          "target": "alerts@example.com"
        }
      ],
      "frequency": 5
    }
  ]
}
```

### Sistema de Alertas Personalizado

```tsx
// src/services/alertService.ts
import { loggingSystem } from './loggingUtils';

export interface AlertConfig {
  threshold: number; // Número de eventos para activar alerta
  timeWindow: number; // Ventana de tiempo en milisegundos
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationTargets: string[]; // Destinos de notificación
}

export class AlertService {
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private eventCounts: Map<string, { count: number; timestamp: number }> = new Map();

  // Registrar un evento para monitoreo de alertas
  recordEvent(eventName: string): void {
    const now = Date.now();
    const eventKey = `${eventName}_${Math.floor(now / 1000)}`; // Agrupar por segundo
    
    const current = this.eventCounts.get(eventKey) || { count: 0, timestamp: now };
    current.count++;
    this.eventCounts.set(eventKey, current);

    // Verificar si se debe activar una alerta
    this.checkAlerts(eventName, current.count);
  }

  // Configurar una regla de alerta
  setAlertConfig(eventName: string, config: AlertConfig): void {
    this.alertConfigs.set(eventName, config);
  }

  // Verificar si se deben activar alertas
  private checkAlerts(eventName: string, count: number): void {
    const config = this.alertConfigs.get(eventName);
    if (!config) return;

    if (count >= config.threshold) {
      this.triggerAlert(eventName, count, config);
    }
  }

  // Activar una alerta
  private triggerAlert(eventName: string, count: number, config: AlertConfig): void {
    const alertMessage = `ALERTA ACTIVADA: ${eventName} ocurrió ${count} veces`;
    
    // Registrar en el sistema de logging
    loggingSystem.error(alertMessage, {
      eventName,
      count,
      severity: config.severity,
      targets: config.notificationTargets
    });

    // Enviar notificaciones
    this.sendNotifications(alertMessage, config);
  }

  // Enviar notificaciones
  private sendNotifications(message: string, config: AlertConfig): void {
    // Enviar notificaciones a los destinos configurados
    config.notificationTargets.forEach(target => {
      // Aquí iría la lógica para enviar notificaciones
      // por email, Slack, etc.
      console.log(`Notificación enviada a ${target}: ${message}`);
    });
  }

  // Limpiar eventos antiguos
  cleanup(): void {
    const now = Date.now();
    const timeWindow = 60000; // 1 minuto

    for (const [key, value] of this.eventCounts.entries()) {
      if (now - value.timestamp > timeWindow) {
        this.eventCounts.delete(key);
      }
    }
  }
}

// Instancia global del servicio de alertas
export const alertService = new AlertService();

// Configurar alertas críticas
alertService.setAlertConfig('firebase_error', {
  threshold: 5,
  timeWindow: 60000,
  severity: 'high',
  notificationTargets: ['alerts@example.com']
});

alertService.setAlertConfig('auth_failure', {
  threshold: 10,
  timeWindow: 300000,
  severity: 'critical',
  notificationTargets: ['security@example.com', 'dev-team@example.com']
});
```

## 4. Dashboard de Monitoreo

### Componente de Dashboard de Métricas

```tsx
// src/components/MetricsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { 
  errorMonitoringService, 
  performanceMetricsService 
} from '../services';

const MetricsDashboard: React.FC = () => {
  const [errorStats, setErrorStats] = useState<any>(null);
  const [performanceSummary, setPerformanceSummary] = useState<any>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setErrorStats(errorMonitoringService.getErrorStats());
      setPerformanceSummary(performanceMetricsService.getSummary());
      setRecentErrors(errorMonitoringService.getRecentErrors(10));
    };

    // Actualizar métricas cada 30 segundos
    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="metrics-dashboard">
      <h2>Dashboard de Métricas</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Errores Totales</h3>
          <p>{errorStats?.totalErrors || 0}</p>
        </div>
        
        <div className="metric-card">
          <h3>Errores Únicos</h3>
          <p>{errorStats?.uniqueErrors || 0}</p>
        </div>
        
        <div className="metric-card">
          <h3>Errores Críticos</h3>
          <p>{errorStats?.highSeverityErrors || 0}</p>
        </div>
        
        <div className="metric-card">
          <h3>LCP (Promedio)</h3>
          <p>{performanceSummary?.paint?.lcp ? `${performanceSummary.paint.lcp.toFixed(2)}ms` : 'N/A'}</p>
        </div>
      </div>
      
      <div className="recent-errors">
        <h3>Errores Recientes</h3>
        <ul>
          {recentErrors.map((error, index) => (
            <li key={index} className={`error-item severity-${error.severity}`}>
              <strong>{error.message}</strong>
              <span>Veces: {error.count}</span>
              <span>Severidad: {error.severity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MetricsDashboard;
```

## 5. Implementación en la Aplicación

### Integración en el punto de entrada

```tsx
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Sentry } from './sentry';
import App from './App';
import reportWebVitals from './utils/webVitals';

// Inicializar Sentry antes de renderizar la app
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  // ... configuración
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Reportar Web Vitals
reportWebVitals();
```

## 6. Buenas Prácticas para Alertas

1. **Alertas significativas**: Solo configurar alertas para problemas que realmente requieren atención
2. **Umbrales realistas**: Configurar umbrales que reflejen el comportamiento normal de la aplicación
3. **Contexto en alertas**: Incluir suficiente contexto para diagnosticar problemas rápidamente
4. **Destinos apropiados**: Enviar alertas al equipo correcto según el tipo de problema
5. **Evitar ruido**: Configurar alertas para minimizar falsos positivos

## 7. Monitoreo Continuo

### Scripts de monitoreo

```bash
# Script para verificar el estado de la aplicación
#!/bin/bash

# Verificar si la aplicación responde
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "ALERTA: La aplicación no responde"
  # Enviar alerta
fi

# Verificar uso de recursos
MEMORY_USAGE=$(ps aux | grep node | grep -v grep | awk '{print $4}' | head -1)
if [ $(echo "$MEMORY_USAGE > 80" | bc) -eq 1 ]; then
  echo "ALERTA: Uso de memoria alto: ${MEMORY_USAGE}%"
  # Enviar alerta
fi
```

Esta implementación proporciona una base sólida para el monitoreo de errores y rendimiento, con integración preparada para Sentry y un sistema de alertas personalizado.