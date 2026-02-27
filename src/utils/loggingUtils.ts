// src/utils/loggingUtils.ts

import { logger, Logger, LogLevel } from '../services/loggingService';
import { persistentLogger, PersistentLogger } from '../services/persistentLoggingService';

// Interfaz para la configuración del sistema de logging
export interface LoggingSystemConfig {
  enableConsoleLogging: boolean;
  enablePersistentLogging: boolean;
  minLogLevel: LogLevel;
  userId?: string;
  sessionId?: string;
}

// Clase para integrar ambos sistemas de logging
export class LoggingSystem {
  private logger: Logger;
  private persistentLogger: PersistentLogger;
  private config: LoggingSystemConfig;

  constructor(config: Partial<LoggingSystemConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enablePersistentLogging: true,
      minLogLevel: 'info',
      ...config
    };

    // Inicializar el logger básico
    this.logger = logger;
    this.logger.updateConfig({
      minLevel: this.config.minLogLevel,
      enableConsole: this.config.enableConsoleLogging,
      userId: this.config.userId,
      sessionId: this.config.sessionId
    });

    // Inicializar el logger persistente
    this.persistentLogger = persistentLogger;
  }

  // Métodos para logging
  debug(message: string, context?: any): void {
    this.logger.debug(message, context);
    if (this.config.enablePersistentLogging) {
      this.persistentLogger.log('debug', message, context);
    }
  }

  info(message: string, context?: any): void {
    this.logger.info(message, context);
    if (this.config.enablePersistentLogging) {
      this.persistentLogger.log('info', message, context);
    }
  }

  warn(message: string, context?: any): void {
    this.logger.warn(message, context);
    if (this.config.enablePersistentLogging) {
      this.persistentLogger.log('warn', message, context);
    }
  }

  error(message: string, error?: any, context?: any): void {
    this.logger.error(message, error, context);
    if (this.config.enablePersistentLogging) {
      this.persistentLogger.log('error', message, { ...context, error: error?.toString?.() || error });
    }
  }

  // Método para capturar errores
  captureError(error: any, context?: any): void {
    const errorMessage = error.message || error.toString?.() || 'Unknown error';
    const errorStack = error.stack || 'No stack trace available';
    
    this.error(errorMessage, { ...context, stack: errorStack });
  }

  // Método para registrar eventos importantes
  logEvent(eventName: string, properties?: any): void {
    const message = `Evento: ${eventName}`;
    this.info(message, properties);
  }

  // Método para registrar operaciones de usuario
  logUserAction(action: string, userId: string, properties?: any): void {
    const message = `Acción de usuario: ${action}`;
    this.info(message, { userId, ...properties });
  }

  // Método para registrar operaciones de Firebase
  logFirebaseOperation(operation: string, details?: any): void {
    const message = `Operación Firebase: ${operation}`;
    this.debug(message, details);
  }

  // Método para registrar problemas de rendimiento
  logPerformanceIssue(issue: string, details?: any): void {
    const message = `Problema de rendimiento: ${issue}`;
    this.warn(message, details);
  }

  // Método para registrar problemas de autenticación
  logAuthIssue(issue: string, userId?: string, details?: any): void {
    const message = `Problema de autenticación: ${issue}`;
    this.warn(message, { userId, ...details });
  }

  // Método para actualizar la configuración
  updateConfig(config: Partial<LoggingSystemConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.logger.updateConfig({
      minLevel: this.config.minLogLevel,
      enableConsole: this.config.enableConsoleLogging,
      userId: this.config.userId,
      sessionId: this.config.sessionId
    });
  }

  // Método para obtener logs recientes
  getRecentLogs(count: number = 50): any[] {
    if (this.config.enablePersistentLogging) {
      return this.persistentLogger.getRecentLogs(count);
    }
    return [];
  }

  // Método para exportar logs
  exportLogs(): string {
    if (this.config.enablePersistentLogging) {
      return this.persistentLogger.exportLogs();
    }
    return JSON.stringify([]);
  }

  // Método para limpiar logs
  clearLogs(): void {
    if (this.config.enablePersistentLogging) {
      this.persistentLogger.clearLogs();
    }
  }
}

// Instancia global del sistema de logging
export const loggingSystem = new LoggingSystem();

// Función para inicializar el sistema de logging
export const initializeLoggingSystem = (config: Partial<LoggingSystemConfig>): LoggingSystem => {
  loggingSystem.updateConfig(config);
  return loggingSystem;
};

// Función para registrar un error globalmente
export const logGlobalError = (error: any): void => {
  loggingSystem.captureError(error);
};

// Función para registrar una operación exitosa
export const logSuccess = (operation: string, details?: any): void => {
  loggingSystem.info(`Operación exitosa: ${operation}`, details);
};

// Función para registrar una operación fallida
export const logFailure = (operation: string, error?: any, details?: any): void => {
  loggingSystem.error(`Operación fallida: ${operation}`, error, details);
};