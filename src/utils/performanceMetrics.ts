// src/utils/performanceMetrics.ts

import { loggingSystem } from './loggingUtils';

// Interfaz para las métricas de rendimiento
export interface PerformanceMetrics {
  navigation: {
    [key: string]: number;
  };
  resource: {
    [key: string]: number;
  };
  paint: {
    [key: string]: number;
  };
  custom: {
    [key: string]: number;
  };
}

// Clase para medir y registrar métricas de rendimiento
export class PerformanceMetricsService {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];
  private navigationStart: number;

  constructor() {
    this.metrics = {
      navigation: {},
      resource: {},
      paint: {},
      custom: {}
    };
    
    this.navigationStart = performance.timing.navigationStart;
    
    // Iniciar la observación de métricas
    this.startObserving();
  }

  // Método para iniciar la observación de métricas
  private startObserving(): void {
    // Observer para métricas de paint
    if ('paint' in performance) {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.metrics.paint[entry.name] = entry.startTime;
          loggingSystem.debug(`Paint metric: ${entry.name} = ${entry.startTime}ms`);
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Observer para métricas de recursos
    if ('getEntriesByType' in performance) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name) {
            const url = new URL(entry.name).pathname;
            this.metrics.resource[url] = entry.duration;
            loggingSystem.debug(`Resource metric: ${url} = ${entry.duration}ms`);
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }

    // Observer para métricas de navegación
    if ('navigation' in performance) {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.metrics.navigation[entry.name] = entry.startTime;
          loggingSystem.debug(`Navigation metric: ${entry.name} = ${entry.startTime}ms`);
        });
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }
  }

  // Método para registrar una métrica personalizada
  recordCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    this.metrics.custom[`${name}_${unit}`] = value;
    loggingSystem.info(`Custom metric recorded: ${name} = ${value} ${unit}`, {
      metricName: name,
      value,
      unit
    });
  }

  // Método para medir el tiempo de ejecución de una función
  async measureFunction<T>(
    name: string, 
    fn: () => Promise<T> | T,
    context?: any
  ): Promise<T> {
    const start = performance.now();
    let result: T;
    let error: any;

    try {
      result = await Promise.resolve(fn());
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const end = performance.now();
      const duration = end - start;
      
      this.recordCustomMetric(name, duration, 'ms');
      
      if (error) {
        loggingSystem.logPerformanceIssue(`${name} failed after ${duration}ms`, {
          duration,
          error: error.message || error.toString?.() || 'Unknown error',
          context
        });
      } else {
        loggingSystem.debug(`${name} completed in ${duration}ms`, {
          duration,
          context
        });
      }
    }

    return result!;
  }

  // Método para medir el tiempo entre dos puntos
  startTimer(name: string): () => number {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      this.recordCustomMetric(name, duration, 'ms');
      return duration;
    };
  }

  // Método para registrar métricas de carga de componentes
  recordComponentLoadTime(componentName: string, loadTime: number): void {
    this.recordCustomMetric(`component_load_${componentName}`, loadTime, 'ms');
    
    // Registrar alertas si la carga es demasiado lenta
    if (loadTime > 2000) { // Más de 2 segundos
      loggingSystem.logPerformanceIssue(`Componente lento: ${componentName}`, {
        loadTime,
        component: componentName
      });
    }
  }

  // Método para registrar métricas de Firebase
  recordFirebaseOperation(operation: string, duration: number, details?: any): void {
    this.recordCustomMetric(`firebase_${operation}`, duration, 'ms');
    
    loggingSystem.logFirebaseOperation(operation, {
      duration,
      ...details
    });
    
    // Registrar alertas si la operación es demasiado lenta
    if (duration > 5000) { // Más de 5 segundos
      loggingSystem.logPerformanceIssue(`Operación Firebase lenta: ${operation}`, {
        duration,
        operation,
        ...details
      });
    }
  }

  // Método para obtener las métricas actuales
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Método para obtener métricas resumidas
  getSummary(): {
    paint: { fcp?: number; lcp?: number };
    navigation: { domContentLoaded?: number; loadComplete?: number };
    custom: { avgComponentLoad?: number; avgFirebaseOp?: number };
  } {
    const summary: any = {
      paint: {},
      navigation: {},
      custom: {}
    };

    // Métricas de paint importantes
    if (this.metrics.paint['first-contentful-paint']) {
      summary.paint.fcp = this.metrics.paint['first-contentful-paint'];
    }
    
    if (this.metrics.paint['largest-contentful-paint']) {
      summary.paint.lcp = this.metrics.paint['largest-contentful-paint'];
    }

    // Métricas de navegación importantes
    if (this.metrics.navigation['domContentLoadedEventEnd']) {
      summary.navigation.domContentLoaded = 
        this.metrics.navigation['domContentLoadedEventEnd'];
    }
    
    if (this.metrics.navigation['loadEventEnd']) {
      summary.navigation.loadComplete = 
        this.metrics.navigation['loadEventEnd'];
    }

    // Métricas personalizadas promedio
    const componentLoadTimes = Object.entries(this.metrics.custom)
      .filter(([key]) => key.startsWith('component_load_'))
      .map(([, value]) => value);
    
    if (componentLoadTimes.length > 0) {
      summary.custom.avgComponentLoad = 
        componentLoadTimes.reduce((a, b) => a + b, 0) / componentLoadTimes.length;
    }

    const firebaseOpTimes = Object.entries(this.metrics.custom)
      .filter(([key]) => key.startsWith('firebase_'))
      .map(([, value]) => value);
    
    if (firebaseOpTimes.length > 0) {
      summary.custom.avgFirebaseOp = 
        firebaseOpTimes.reduce((a, b) => a + b, 0) / firebaseOpTimes.length;
    }

    return summary;
  }

  // Método para registrar métricas periódicamente
  startPeriodicReporting(interval: number = 30000): void { // Cada 30 segundos
    setInterval(() => {
      const summary = this.getSummary();
      loggingSystem.info('Métricas de rendimiento periódicas', summary);
    }, interval);
  }

  // Método para limpiar los observers
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Instancia global del servicio de métricas de rendimiento
export const performanceMetricsService = new PerformanceMetricsService();

// Función para medir el rendimiento de una operación
export const measurePerformance = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: any
): Promise<T> => {
  return performanceMetricsService.measureFunction(operationName, operation, context);
};

// Función para registrar el tiempo de carga de un componente
export const recordComponentLoad = (componentName: string, loadTime: number): void => {
  performanceMetricsService.recordComponentLoadTime(componentName, loadTime);
};

// Función para registrar el tiempo de una operación de Firebase
export const recordFirebaseOperationTime = (
  operation: string, 
  duration: number, 
  details?: any
): void => {
  performanceMetricsService.recordFirebaseOperation(operation, duration, details);
};