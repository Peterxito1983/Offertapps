// src/services/passwordResetService.ts

import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { validateEmail } from './validation';

// Interfaz para las opciones de recuperación de contraseña
export interface PasswordResetOptions {
  customMessage?: string;
  redirectUrl?: string;
  language?: string;
}

// Servicio para la recuperación de contraseña
export class PasswordResetService {
  private auth = getAuth();

  /**
   * Enviar correo de recuperación de contraseña
   * @param email - Correo electrónico del usuario
   * @param options - Opciones adicionales para la recuperación
   * @returns Promesa que se resuelve cuando se envía el correo
   */
  async sendPasswordResetEmail(
    email: string, 
    options?: PasswordResetOptions
  ): Promise<void> {
    // Validar el correo electrónico
    if (!validateEmail(email)) {
      throw new Error('Correo electrónico inválido');
    }

    try {
      // Enviar correo de recuperación de contraseña
      await sendPasswordResetEmail(this.auth, email);
      
      // Aquí podríamos registrar el evento para fines de monitoreo
      console.log(`Correo de recuperación enviado a: ${email}`);
    } catch (error: any) {
      // Manejar diferentes tipos de errores
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No se encontró una cuenta con ese correo electrónico');
        case 'auth/invalid-email':
          throw new Error('El formato del correo electrónico no es válido');
        case 'auth/network-request-failed':
          throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo');
        default:
          throw new Error(`Error al enviar el correo de recuperación: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  /**
   * Validar si un correo electrónico es elegible para recuperación
   * @param email - Correo electrónico a validar
   * @returns Boolean indicando si es elegible
   */
  async isEligibleForPasswordReset(email: string): Promise<boolean> {
    // Validar formato del correo
    if (!validateEmail(email)) {
      return false;
    }

    // En una implementación real, podríamos verificar si el usuario existe
    // en nuestra base de datos o tiene una cuenta activa
    // Por ahora, solo validamos el formato
    return true;
  }

  /**
   * Obtener mensaje personalizado para el correo de recuperación
   * @param email - Correo electrónico del usuario
   * @param options - Opciones de recuperación
   * @returns Mensaje personalizado
   */
  getPasswordResetMessage(email: string, options?: PasswordResetOptions): string {
    const customMessage = options?.customMessage || '';
    const redirectUrl = options?.redirectUrl || window.location.origin;
    
    return `
      Hola,
      
      Has solicitado restablecer tu contraseña para OffertApps.
      
      Haz clic en el siguiente enlace para crear una nueva contraseña:
      ${redirectUrl}/reset-password
      
      Si no solicitaste este cambio, puedes ignorar este correo.
      
      ${customMessage}
      
      Saludos,
      El equipo de OffertApps
    `;
  }
}

// Instancia global del servicio de recuperación de contraseña
export const passwordResetService = new PasswordResetService();

// Función auxiliar para iniciar el proceso de recuperación
export const initiatePasswordReset = async (
  email: string, 
  options?: PasswordResetOptions
): Promise<boolean> => {
  try {
    await passwordResetService.sendPasswordResetEmail(email, options);
    return true;
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    throw error;
  }
};