// src/services/firebaseLoggingService.ts

import { 
  ref, 
  push, 
  getDatabase 
} from 'firebase/database';
import { 
  LogEntry, 
  LogLevel 
} from './loggingService';
import { app } from '../config';

// Servicio para enviar logs a Firebase Realtime Database
export class FirebaseLoggingService {
  private db: any;
  private logsRef: any;
  private userId?: string;

  constructor(userId?: string) {
    this.db = getDatabase(app);
    this.logsRef = ref(this.db, 'logs');
    this.userId = userId;
  }

  // Método para enviar un log a Firebase
  async sendLogToFirebase(logEntry: LogEntry): Promise<void> {
    try {
      // Añadir el log a la base de datos
      await push(this.logsRef, {
        ...logEntry,
        userId: this.userId || logEntry.userId,
        timestamp: logEntry.timestamp
      });
    } catch (error) {
      console.error('Error al enviar log a Firebase:', error);
      // No lanzar error para evitar interrupciones en la aplicación
    }
  }

  // Método para enviar logs por nivel
  async sendLogsByLevel(level: LogLevel, logs: LogEntry[]): Promise<void> {
    const levelRef = ref(this.db, `logs_by_level/${level}`);
    
    try {
      for (const log of logs) {
        await push(levelRef, {
          ...log,
          userId: this.userId || log.userId,
          timestamp: log.timestamp
        });
      }
    } catch (error) {
      console.error(`Error al enviar logs de nivel ${level} a Firebase:`, error);
    }
  }

  // Método para enviar logs agrupados por usuario
  async sendUserLogs(userId: string, logs: LogEntry[]): Promise<void> {
    const userLogsRef = ref(this.db, `user_logs/${userId}`);
    
    try {
      for (const log of logs) {
        await push(userLogsRef, {
          ...log,
          timestamp: log.timestamp
        });
      }
    } catch (error) {
      console.error(`Error al enviar logs de usuario ${userId} a Firebase:`, error);
    }
  }

  // Método para configurar el ID de usuario
  setUserId(userId: string): void {
    this.userId = userId;
  }
}

// Instancia global del servicio de logging de Firebase
let firebaseLoggingService: FirebaseLoggingService | null = null;

export const getFirebaseLoggingService = (userId?: string): FirebaseLoggingService => {
  if (!firebaseLoggingService) {
    firebaseLoggingService = new FirebaseLoggingService(userId);
  }
  
  if (userId) {
    firebaseLoggingService.setUserId(userId);
  }
  
  return firebaseLoggingService;
};

// Función para integrar con el sistema de logging existente
export const integrateFirebaseLogging = (): void => {
  // Esta función se llamaría para integrar Firebase con el sistema de logging
  // En una implementación real, esto conectaría los servicios
  console.log('Integración con Firebase Logging activada');
};