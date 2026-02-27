// src/services/persistentLoggingService.ts

import { LogEntry, LogLevel } from './loggingService';

// Interfaz para la configuración del logger persistente
export interface PersistentLoggerConfig {
  storageKey: string;
  maxEntries: number;
  flushInterval: number; // en milisegundos
  enablePersistentStorage: boolean;
}

// Clase para el logger con almacenamiento persistente
export class PersistentLogger {
  private storageKey: string;
  private maxEntries: number;
  private flushInterval: number;
  private enablePersistentStorage: boolean;
  private flushTimer: any;
  private pendingLogs: LogEntry[] = [];

  constructor(config: Partial<PersistentLoggerConfig> = {}) {
    const defaultConfig: PersistentLoggerConfig = {
      storageKey: 'app_logs',
      maxEntries: 1000,
      flushInterval: 30000, // 30 segundos
      enablePersistentStorage: true
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.storageKey = finalConfig.storageKey;
    this.maxEntries = finalConfig.maxEntries;
    this.flushInterval = finalConfig.flushInterval;
    this.enablePersistentStorage = finalConfig.enablePersistentStorage;

    // Cargar logs existentes del almacenamiento
    this.loadLogsFromStorage();

    // Iniciar el temporizador para vaciado periódico
    if (this.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushLogs();
      }, this.flushInterval);
    }

    // Registrar evento para vaciar logs cuando se cierre la pestaña
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushLogs();
      });
    }
  }

  // Método para guardar un log
  log(level: LogLevel, message: string, context?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    this.pendingLogs.push(logEntry);

    // Mantener el tamaño dentro del límite
    if (this.pendingLogs.length > this.maxEntries) {
      this.pendingLogs = this.pendingLogs.slice(-this.maxEntries);
    }

    // Guardar en almacenamiento persistente si está habilitado
    if (this.enablePersistentStorage) {
      this.saveLogsToStorage();
    }
  }

  // Método para guardar logs en almacenamiento local
  private saveLogsToStorage(): void {
    if (typeof localStorage === 'undefined' || !this.enablePersistentStorage) {
      return;
    }

    try {
      const logsToSave = [...this.pendingLogs];
      localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  // Método para cargar logs desde almacenamiento local
  private loadLogsFromStorage(): void {
    if (typeof localStorage === 'undefined' || !this.enablePersistentStorage) {
      return;
    }

    try {
      const storedLogs = localStorage.getItem(this.storageKey);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) {
          this.pendingLogs = parsedLogs;
        }
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
      this.pendingLogs = [];
    }
  }

  // Método para vaciar logs al servidor
  async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0 || !this.enablePersistentStorage) {
      return;
    }

    // Obtener una copia de los logs pendientes
    const logsToFlush = [...this.pendingLogs];
    
    // Limpiar la cola local
    this.pendingLogs = [];
    
    // Guardar la versión actualizada en localStorage
    this.saveLogsToStorage();

    // Enviar logs al servidor (simulado)
    await this.sendLogsToServer(logsToFlush);
  }

  // Método para enviar logs al servidor
  private async sendLogsToServer(logs: LogEntry[]): Promise<void> {
    // En una implementación real, aquí se enviarían los logs a un servidor
    // Por ahora, solo simulamos el envío
    
    if (logs.length === 0) {
      return;
    }

    try {
      // Simular envío a servidor
      console.log(`Enviando ${logs.length} logs al servidor...`);
      
      // En una implementación real, sería algo como:
      /*
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });
      */
      
      // Por ahora, solo mostrar en consola para demostración
      logs.forEach(log => {
        console.log(`Log enviado: [${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`);
      });
      
    } catch (error) {
      console.error('Error al enviar logs al servidor:', error);
      
      // Si falla el envío, devolver los logs a la cola
      this.pendingLogs = [...logs, ...this.pendingLogs];
      
      // Asegurarse de no exceder el límite
      if (this.pendingLogs.length > this.maxEntries) {
        this.pendingLogs = this.pendingLogs.slice(-this.maxEntries);
      }
      
      // Actualizar almacenamiento
      this.saveLogsToStorage();
    }
  }

  // Método para obtener logs recientes
  getRecentLogs(count: number = 50): LogEntry[] {
    const allLogs = this.getAllLogs();
    return allLogs.slice(-count);
  }

  // Método para obtener todos los logs
  getAllLogs(): LogEntry[] {
    return [...this.pendingLogs];
  }

  // Método para limpiar logs
  clearLogs(): void {
    this.pendingLogs = [];
    if (this.enablePersistentStorage && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Método para destruir el logger
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Vaciar logs antes de destruir
    this.flushLogs();
  }

  // Método para exportar logs
  exportLogs(): string {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }

  // Método para importar logs
  importLogs(jsonString: string): void {
    try {
      const logs = JSON.parse(jsonString);
      if (Array.isArray(logs)) {
        this.pendingLogs = logs;
        this.saveLogsToStorage();
      }
    } catch (error) {
      console.error('Error al importar logs:', error);
    }
  }
}

// Instancia global del logger persistente
export const persistentLogger = new PersistentLogger();