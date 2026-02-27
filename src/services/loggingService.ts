// src/services/loggingService.ts

// Tipos de niveles de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interfaz para un registro de log
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

// Interfaz para la configuración del logger
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  userId?: string;
  sessionId?: string;
}

// Función para obtener el nivel numérico (para comparación)
const getLogLevelValue = (level: LogLevel): number => {
  switch (level) {
    case 'debug': return 0;
    case 'info': return 1;
    case 'warn': return 2;
    case 'error': return 3;
    default: return 1;
  }
};

// Función para formatear la fecha
const formatDate = (): string => {
  return new Date().toISOString();
};

// Función para obtener información del entorno
const getEnvironmentInfo = () => {
  return {
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: formatDate()
  };
};

// Clase principal del logger
export class Logger {
  private config: LoggerConfig;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000; // Máximo de entradas en el historial

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: 'info',
      enableConsole: true,
      enableRemote: false,
      ...config
    };
  }

  // Método para registrar un log
  private log(level: LogLevel, message: string, context?: any): void {
    // Verificar si el nivel actual es mayor o igual al nivel mínimo
    if (getLogLevelValue(level) < getLogLevelValue(this.config.minLevel)) {
      return;
    }

    // Crear la entrada de log
    const logEntry: LogEntry = {
      timestamp: formatDate(),
      level,
      message,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      ...getEnvironmentInfo()
    };

    // Agregar al historial
    this.logHistory.push(logEntry);
    
    // Mantener el tamaño del historial dentro del límite
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift(); // Remover el elemento más antiguo
    }

    // Mostrar en consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Enviar a servidor remoto si está habilitado
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }
  }

  // Método para registrar en consola
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry;
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, context || '');
        break;
      case 'info':
        console.info(logMessage, context || '');
        break;
      case 'warn':
        console.warn(logMessage, context || '');
        break;
      case 'error':
        console.error(logMessage, context || '');
        break;
      default:
        console.log(logMessage, context || '');
    }
  }

  // Método para registrar en servidor remoto
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // No hacer nada si falla el envío remoto
      // No queremos que un fallo de logging rompa la aplicación
      console.warn('Failed to send log to remote server:', error);
    }
  }

  // Métodos de nivel específico
  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: any, context?: any): void {
    // Si se proporciona un error, incluirlo en el contexto
    const fullContext = error ? { ...context, error: error.toString ? error.toString() : error } : context;
    this.log('error', message, fullContext);
  }

  // Método para obtener el historial de logs
  getLogHistory(): LogEntry[] {
    return [...this.logHistory]; // Devolver copia para evitar modificaciones externas
  }

  // Método para limpiar el historial
  clearHistory(): void {
    this.logHistory = [];
  }

  // Método para actualizar la configuración
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Método para capturar errores no manejados
  captureError(error: any, context?: any): void {
    const errorMessage = error.message || error.toString || 'Unknown error';
    const errorStack = error.stack || 'No stack trace available';
    
    this.error(errorMessage, { ...context, stack: errorStack });
  }
}

// Instancia global del logger
export const logger = new Logger();

// Función para inicializar el logger con configuración específica
export const initializeLogger = (config: Partial<LoggerConfig>): Logger => {
  logger.updateConfig(config);
  return logger;
};