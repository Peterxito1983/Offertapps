// src/services/errorMonitoringService.ts

import { loggingSystem } from '../utils/loggingUtils';

// Interfaz para la configuración del monitor de errores
export interface ErrorMonitoringConfig {
  enableSentry?: boolean;
  sentryDsn?: string;
  enableConsoleReporting?: boolean;
  enableLocalReporting?: boolean;
  errorThreshold?: number; // Número de errores antes de tomar acción
  userId?: string;
}

// Interfaz para un error reportado
export interface MonitoredError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number; // Número de veces que ocurrió
}

// Clase para monitoreo de errores
export class ErrorMonitoringService {
  private config: ErrorMonitoringConfig;
  private errorMap: Map<string, MonitoredError> = new Map();
  private errorThreshold: number;
  private reportedErrors: Set<string> = new Set();

  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = {
      enableSentry: false,
      enableConsoleReporting: true,
      enableLocalReporting: true,
      errorThreshold: 5,
      ...config
    };
    
    this.errorThreshold = this.config.errorThreshold || 5;
    
    // Inicializar Sentry si está habilitado
    if (this.config.enableSentry && this.config.sentryDsn) {
      this.initializeSentry();
    }
    
    // Capturar errores no manejados
    this.setupGlobalErrorHandlers();
  }

  // Método para inicializar Sentry (simulado)
  private initializeSentry(): void {
    // En una implementación real, aquí se inicializaría Sentry
    console.log('Sentry inicializado (simulado)');
    
    // Ejemplo real sería:
    /*
    import * as Sentry from '@sentry/react';
    Sentry.init({
      dsn: this.config.sentryDsn,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    */
  }

  // Método para configurar manejadores de errores globales
  private setupGlobalErrorHandlers(): void {
    // Capturar errores no manejados
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.reportError({
          message: event.message,
          stack: event.error?.stack,
          severity: 'critical'
        });
      });

      // Capturar promesas no manejadas
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          message: `Unhandled promise rejection: ${event.reason}`,
          severity: 'high'
        });
      });
    }
  }

  // Método para reportar un error
  reportError(error: {
    message: string;
    stack?: string;
    context?: any;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): void {
    const errorId = this.generateErrorId(error.message, error.stack);
    const now = new Date().toISOString();
    
    // Obtener o crear la entrada de error
    let monitoredError = this.errorMap.get(errorId);
    
    if (monitoredError) {
      // Incrementar el contador si ya existe
      monitoredError.count += 1;
      monitoredError.timestamp = now;
    } else {
      // Crear nueva entrada de error
      monitoredError = {
        id: errorId,
        timestamp: now,
        message: error.message,
        stack: error.stack,
        userId: this.config.userId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        context: error.context,
        severity: error.severity || 'medium',
        count: 1
      };
      
      this.errorMap.set(errorId, monitoredError);
    }

    // Registrar en el sistema de logging
    if (this.config.enableLocalReporting) {
      loggingSystem.error(`Error monitoreado: ${error.message}`, {
        errorId,
        severity: monitoredError.severity,
        count: monitoredError.count,
        ...error.context
      });
    }

    // Enviar a Sentry si está habilitado
    if (this.config.enableSentry) {
      this.sendToSentry(monitoredError);
    }

    // Enviar a consola si está habilitado
    if (this.config.enableConsoleReporting) {
      this.sendToConsole(monitoredError);
    }

    // Tomar acción si se supera el umbral
    if (monitoredError.count >= this.errorThreshold && !this.reportedErrors.has(errorId)) {
      this.takeActionOnThreshold(monitoredError);
      this.reportedErrors.add(errorId);
    }
  }

  // Método para generar un ID único para el error
  private generateErrorId(message: string, stack?: string): string {
    const combined = `${message}|${stack || ''}`;
    // En una implementación real, usar hash real
    return btoa(combined.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '');
  }

  // Método para enviar error a Sentry (simulado)
  private sendToSentry(error: MonitoredError): void {
    // En una implementación real, usar Sentry.captureException
    console.log(`Error enviado a Sentry (simulado): ${error.message}`, error);
    
    // Ejemplo real sería:
    /*
    import * as Sentry from '@sentry/react';
    Sentry.captureException(new Error(error.message), {
      contexts: {
        custom: {
          errorId: error.id,
          userId: error.userId,
          url: error.url,
          severity: error.severity,
          count: error.count,
          ...error.context
        }
      }
    });
    */
  }

  // Método para enviar error a consola
  private sendToConsole(error: MonitoredError): void {
    const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn';
    
    switch (logLevel) {
      case 'error':
        console.error(`[ERROR MONITOREADO] ${error.message}`, {
          errorId: error.id,
          severity: error.severity,
          count: error.count,
          stack: error.stack,
          context: error.context
        });
        break;
      case 'warn':
        console.warn(`[WARN MONITOREADO] ${error.message}`, {
          errorId: error.id,
          severity: error.severity,
          count: error.count,
          context: error.context
        });
        break;
    }
  }

  // Método para tomar acción cuando se supera el umbral
  private takeActionOnThreshold(error: MonitoredError): void {
    loggingSystem.logEvent('error_threshold_exceeded', {
      errorId: error.id,
      message: error.message,
      count: error.count,
      severity: error.severity
    });

    // Aquí se podrían implementar acciones como:
    // - Enviar alerta por email
    // - Registrar en un sistema de tickets
    // - Notificar al equipo de desarrollo
    console.warn(`UMBRAL DE ERROR SUPERADO para: ${error.message} (${error.count} veces)`);
  }

  // Método para obtener estadísticas de errores
  getErrorStats(): {
    totalErrors: number;
    uniqueErrors: number;
    highSeverityErrors: number;
    errorsBySeverity: Record<string, number>;
  } {
    const stats = {
      totalErrors: 0,
      uniqueErrors: this.errorMap.size,
      highSeverityErrors: 0,
      errorsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<string, number>
    };

    for (const error of this.errorMap.values()) {
      stats.totalErrors += error.count;
      
      if (error.severity === 'high' || error.severity === 'critical') {
        stats.highSeverityErrors += error.count;
      }
      
      stats.errorsBySeverity[error.severity] += error.count;
    }

    return stats;
  }

  // Método para obtener errores recientes
  getRecentErrors(limit: number = 10): MonitoredError[] {
    return Array.from(this.errorMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Método para obtener errores por severidad
  getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): MonitoredError[] {
    return Array.from(this.errorMap.values())
      .filter(error => error.severity === severity)
      .sort((a, b) => b.count - a.count);
  }

  // Método para limpiar errores antiguos
  cleanupOldErrors(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000)).toISOString();
    
    for (const [id, error] of this.errorMap.entries()) {
      if (error.timestamp < cutoffTime) {
        this.errorMap.delete(id);
        this.reportedErrors.delete(id);
      }
    }
  }

  // Método para actualizar la configuración
  updateConfig(config: Partial<ErrorMonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.errorThreshold !== undefined) {
      this.errorThreshold = config.errorThreshold;
    }
  }

  // Método para reiniciar el servicio
  reset(): void {
    this.errorMap.clear();
    this.reportedErrors.clear();
  }
}

// Instancia global del servicio de monitoreo de errores
export const errorMonitoringService = new ErrorMonitoringService();