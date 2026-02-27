// src/services/dataManagementService.ts

import { getAuth, deleteUser } from 'firebase/auth';
import { ref, remove, get, update } from 'firebase/database';
import { db } from '../config';
import { loggingSystem } from '../utils/loggingUtils';

// Interfaz para la solicitud de eliminación de datos
export interface DataDeletionRequest {
  userId: string;
  email: string;
  reason?: string;
  requestedAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Interfaz para el historial de solicitudes
export interface DataRequestHistory {
  id: string;
  userId: string;
  type: 'deletion' | 'access' | 'correction';
  status: 'pending' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  details?: string;
}

// Servicio para el manejo de datos personales
export class DataManagementService {
  private dbRef = ref(db);
  private auth = getAuth();

  /**
   * Solicitar eliminación de datos personales
   * @param userId - ID del usuario que solicita la eliminación
   * @param email - Correo electrónico del usuario
   * @param reason - Razón opcional para la eliminación
   * @returns Promise con el ID de la solicitud
   */
  async requestDataDeletion(userId: string, email: string, reason?: string): Promise<string> {
    try {
      // Validar que el usuario exista
      const userRef = ref(this.db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('Usuario no encontrado');
      }

      // Crear solicitud de eliminación
      const deletionRequest: DataDeletionRequest = {
        userId,
        email,
        reason,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Guardar solicitud en la base de datos
      const requestRef = ref(this.db, `data_requests/${Date.now()}`);
      await update(requestRef, deletionRequest);

      loggingSystem.info('Solicitud de eliminación de datos recibida', {
        userId,
        email,
        requestId: requestRef.key
      });

      return requestRef.key!;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'requestDataDeletion',
        userId
      });
      throw error;
    }
  }

  /**
   * Procesar solicitud de eliminación de datos
   * @param requestId - ID de la solicitud a procesar
   * @returns Promise<boolean> - Verdadero si se procesó exitosamente
   */
  async processDeletionRequest(requestId: string): Promise<boolean> {
    try {
      const requestRef = ref(this.db, `data_requests/${requestId}`);
      const requestSnapshot = await get(requestRef);

      if (!requestSnapshot.exists()) {
        throw new Error('Solicitud de eliminación no encontrada');
      }

      const requestData = requestSnapshot.val() as DataDeletionRequest;

      if (requestData.status !== 'pending') {
        throw new Error('La solicitud ya ha sido procesada');
      }

      // Actualizar estado a processing
      await update(requestRef, { status: 'processing' });

      // Eliminar datos del usuario
      const success = await this.deleteUserData(requestData.userId);

      if (success) {
        // Actualizar estado a completed
        await update(requestRef, {
          status: 'completed',
          processedAt: new Date().toISOString()
        });

        loggingSystem.info('Solicitud de eliminación de datos completada', {
          userId: requestData.userId,
          requestId
        });

        return true;
      } else {
        // Actualizar estado a failed
        await update(requestRef, {
          status: 'failed',
          processedAt: new Date().toISOString()
        });

        loggingSystem.error('Falló la eliminación de datos del usuario', {
          userId: requestData.userId,
          requestId
        });

        return false;
      }
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'processDeletionRequest',
        requestId
      });
      throw error;
    }
  }

  /**
   * Eliminar todos los datos de un usuario
   * @param userId - ID del usuario a eliminar
   * @returns Promise<boolean> - Verdadero si se eliminaron exitosamente
   */
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Eliminar datos del usuario en la base de datos
      const userRef = ref(this.db, `users/${userId}`);
      await remove(userRef);

      // Eliminar ofertas del usuario si es empresa
      const offersRef = ref(this.db, `offers`);
      const offersSnapshot = await get(offersRef);
      
      if (offersSnapshot.exists()) {
        const offers = offersSnapshot.val();
        for (const [offerId, offerData] of Object.entries(offers)) {
          if (offerData.companyId === userId) {
            await remove(ref(this.db, `offers/${offerId}`));
          }
        }
      }

      // Eliminar reseñas del usuario
      const reviewsRef = ref(this.db, `reviews`);
      const reviewsSnapshot = await get(reviewsRef);
      
      if (reviewsSnapshot.exists()) {
        const reviews = reviewsSnapshot.val();
        for (const [reviewId, reviewData] of Object.entries(reviews)) {
          if (reviewData.userId === userId) {
            await remove(ref(this.db, `reviews/${reviewId}`));
          }
        }
      }

      // Eliminar cuenta de Firebase Authentication
      const user = this.auth.currentUser;
      if (user && user.uid === userId) {
        await deleteUser(user);
      }

      loggingSystem.info('Datos del usuario eliminados exitosamente', { userId });

      return true;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'deleteUserData',
        userId
      });
      return false;
    }
  }

  /**
   * Obtener datos personales de un usuario
   * @param userId - ID del usuario
   * @returns Promise con los datos personales del usuario
   */
  async getUserData(userId: string): Promise<any> {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userSnapshot.val();

      // Enmascarar información sensible
      const maskedData = {
        ...userData,
        email: this.maskEmail(userData.email),
        phone: userData.phone ? this.maskPhone(userData.phone) : undefined
      };

      loggingSystem.info('Datos personales del usuario accedidos', { userId });

      return maskedData;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'getUserData',
        userId
      });
      throw error;
    }
  }

  /**
   * Solicitar acceso a datos personales
   * @param userId - ID del usuario que solicita acceso
   * @returns Promise con el ID de la solicitud
   */
  async requestDataAccess(userId: string): Promise<string> {
    try {
      const accessRequest: DataRequestHistory = {
        id: Date.now().toString(),
        userId,
        type: 'access',
        status: 'completed',
        requestedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        details: 'Datos personales proporcionados al usuario'
      };

      // Guardar solicitud en historial
      const requestRef = ref(this.db, `data_requests/${Date.now()}`);
      await update(requestRef, accessRequest);

      loggingSystem.info('Solicitud de acceso a datos completada', { userId });

      return requestRef.key!;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'requestDataAccess',
        userId
      });
      throw error;
    }
  }

  /**
   * Actualizar información personal de un usuario
   * @param userId - ID del usuario
   * @param updates - Campos a actualizar
   * @returns Promise<boolean> - Verdadero si se actualizó exitosamente
   */
  async updateUserData(userId: string, updates: Partial<any>): Promise<boolean> {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        throw new Error('Usuario no encontrado');
      }

      // Validar actualizaciones
      const validatedUpdates = this.validateUserDataUpdates(updates);

      await update(userRef, validatedUpdates);

      loggingSystem.info('Datos personales del usuario actualizados', { 
        userId, 
        fields: Object.keys(updates) 
      });

      return true;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'updateUserData',
        userId
      });
      throw error;
    }
  }

  /**
   * Obtener historial de solicitudes de datos para un usuario
   * @param userId - ID del usuario
   * @returns Promise con el historial de solicitudes
   */
  async getDataRequestHistory(userId: string): Promise<DataRequestHistory[]> {
    try {
      const requestsRef = ref(this.db, 'data_requests');
      const requestsSnapshot = await get(requestsRef);

      if (!requestsSnapshot.exists()) {
        return [];
      }

      const requests = requestsSnapshot.val();
      const userRequests: DataRequestHistory[] = [];

      for (const [requestId, requestData] of Object.entries(requests)) {
        if ((requestData as any).userId === userId) {
          userRequests.push({
            id: requestId,
            ...requestData as any
          });
        }
      }

      // Ordenar por fecha de solicitud (más recientes primero)
      userRequests.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      return userRequests;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'getDataRequestHistory',
        userId
      });
      throw error;
    }
  }

  /**
   * Validar actualizaciones de datos de usuario
   * @param updates - Campos a actualizar
   * @returns Campos validados
   */
  private validateUserDataUpdates(updates: Partial<any>): Partial<any> {
    const validated: Partial<any> = {};

    // Validar email si se proporciona
    if (updates.email) {
      if (this.isValidEmail(updates.email)) {
        validated.email = updates.email;
      } else {
        throw new Error('Email no válido');
      }
    }

    // Validar nombre si se proporciona
    if (updates.displayName) {
      if (typeof updates.displayName === 'string' && updates.displayName.length >= 2) {
        validated.displayName = updates.displayName;
      } else {
        throw new Error('Nombre debe tener al menos 2 caracteres');
      }
    }

    // Validar otros campos según sea necesario
    if (updates.phoneNumber) {
      if (this.isValidPhone(updates.phoneNumber)) {
        validated.phoneNumber = updates.phoneNumber;
      } else {
        throw new Error('Número de teléfono no válido');
      }
    }

    return validated;
  }

  /**
   * Validar formato de email
   * @param email - Email a validar
   * @returns Boolean indicando si es válido
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de teléfono
   * @param phone - Teléfono a validar
   * @returns Boolean indicando si es válido
   */
  private isValidPhone(phone: string): boolean {
    // Validar formato internacional de teléfono
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Enmascarar email para protección de privacidad
   * @param email - Email a enmascarar
   * @returns Email enmascarado
   */
  private maskEmail(email: string): string {
    if (!email || email.indexOf('@') === -1) return email;

    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }

    const maskedLocal = `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`;
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Enmascarar teléfono para protección de privacidad
   * @param phone - Teléfono a enmascarar
   * @returns Teléfono enmascarado
   */
  private maskPhone(phone: string): string {
    if (!phone) return phone;

    // Mostrar solo los últimos 4 dígitos
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;

    const visibleDigits = digits.slice(-4);
    const maskedPart = '*'.repeat(digits.length - 4);

    return `${maskedPart}${visibleDigits}`;
  }
}

// Instancia global del servicio de manejo de datos
export const dataManagementService = new DataManagementService();