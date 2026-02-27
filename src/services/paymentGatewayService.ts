// src/services/paymentGatewayService.ts

import { getDatabase, ref, update, get } from 'firebase/database';
import { db } from '../config';
import { 
  PaymentMethod, 
  PaymentIntent, 
  PaymentTransaction,
  SubscriptionPlan 
} from '../types/paymentTypes';
import { loggingSystem } from '../utils/loggingUtils';

export interface PaymentGatewayConfig {
  provider: 'stripe' | 'paypal' | 'mercadopago' | 'payu' | 'custom';
  publicKey?: string;
  secretKey?: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
}

export interface ProcessPaymentParams {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  companyId: string;
  subscriptionPlan: SubscriptionPlan;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  providerTransactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class PaymentGatewayService {
  private config: PaymentGatewayConfig;
  private dbRef = ref(db);

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  /**
   * Procesar un pago a través de la pasarela configurada
   * @param params - Parámetros del pago
   * @returns Promise con el resultado del pago
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    try {
      loggingSystem.info('Iniciando proceso de pago', {
        provider: this.config.provider,
        amount: params.amount,
        companyId: params.companyId,
        subscriptionPlan: params.subscriptionPlan
      });

      // Validar parámetros
      this.validatePaymentParams(params);

      let result: PaymentResult;

      switch (this.config.provider) {
        case 'stripe':
          result = await this.processStripePayment(params);
          break;
        case 'paypal':
          result = await this.processPayPalPayment(params);
          break;
        case 'mercadopago':
          result = await this.processMercadoPagoPayment(params);
          break;
        case 'payu':
          result = await this.processPayUPayment(params);
          break;
        default:
          result = await this.processCustomPayment(params);
      }

      // Registrar la transacción en Firebase
      if (result.success && result.transactionId) {
        await this.recordTransaction(params, result);
      }

      loggingSystem.info('Proceso de pago completado', {
        provider: this.config.provider,
        success: result.success,
        transactionId: result.transactionId,
        companyId: params.companyId
      });

      return result;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'processPayment',
        provider: this.config.provider,
        companyId: params.companyId
      });

      return {
        success: false,
        errorMessage: error.message || 'Error desconocido al procesar el pago',
        status: 'failed'
      };
    }
  }

  /**
   * Validar parámetros de pago
   */
  private validatePaymentParams(params: ProcessPaymentParams): void {
    if (!params.amount || params.amount <= 0) {
      throw new Error('Monto inválido');
    }

    if (!params.companyId) {
      throw new Error('ID de compañía es requerido');
    }

    if (!params.subscriptionPlan) {
      throw new Error('Plan de suscripción es requerido');
    }

    if (!params.paymentMethod) {
      throw new Error('Método de pago es requerido');
    }
  }

  /**
   * Procesar pago con Stripe
   */
  private async processStripePayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // En una implementación real, se usaría el SDK de Stripe
    // Por ahora, simulamos el proceso
    
    try {
      // Simular validación de método de pago
      if (params.paymentMethod.type === 'card') {
        // Validar datos de tarjeta
        if (!this.validateCardData(params.paymentMethod)) {
          return {
            success: false,
            errorMessage: 'Datos de tarjeta inválidos',
            status: 'failed'
          };
        }
      }

      // Simular proceso de pago (en una implementación real, aquí se haría la llamada a la API de Stripe)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular tiempo de procesamiento

      // Simular respuesta exitosa
      const transactionId = `txn_stripe_${Date.now()}`;
      
      return {
        success: true,
        transactionId,
        providerTransactionId: `pi_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message || 'Error al procesar pago con Stripe',
        status: 'failed'
      };
    }
  }

  /**
   * Procesar pago con PayPal
   */
  private async processPayPalPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    try {
      // En una implementación real, se usaría el SDK de PayPal
      // Simular proceso de pago con PayPal
      
      // Simular validación y proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionId = `txn_paypal_${Date.now()}`;
      
      return {
        success: true,
        transactionId,
        providerTransactionId: `paypal_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message || 'Error al procesar pago con PayPal',
        status: 'failed'
      };
    }
  }

  /**
   * Procesar pago con MercadoPago
   */
  private async processMercadoPagoPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    try {
      // En una implementación real, se usaría el SDK de MercadoPago
      // Simular proceso de pago con MercadoPago
      
      // Simular validación y proceso
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const transactionId = `txn_mercadopago_${Date.now()}`;
      
      return {
        success: true,
        transactionId,
        providerTransactionId: `mp_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message || 'Error al procesar pago con MercadoPago',
        status: 'failed'
      };
    }
  }

  /**
   * Procesar pago con PayU
   */
  private async processPayUPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    try {
      // En una implementación real, se usaría el SDK de PayU
      // Simular proceso de pago con PayU
      
      // Simular validación y proceso
      await new Promise(resolve => setTimeout(resolve, 1600));
      
      const transactionId = `txn_payu_${Date.now()}`;
      
      return {
        success: true,
        transactionId,
        providerTransactionId: `payu_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message || 'Error al procesar pago con PayU',
        status: 'failed'
      };
    }
  }

  /**
   * Procesar pago con pasarela personalizada
   */
  private async processCustomPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    try {
      // Lógica personalizada para procesar el pago
      // Simular proceso
      
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      const transactionId = `txn_custom_${Date.now()}`;
      
      return {
        success: true,
        transactionId,
        providerTransactionId: `custom_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message || 'Error al procesar pago con pasarela personalizada',
        status: 'failed'
      };
    }
  }

  /**
   * Validar datos de tarjeta
   */
  private validateCardData(paymentMethod: PaymentMethod): boolean {
    if (!paymentMethod.card) {
      return false;
    }

    // Validar número de tarjeta (algoritmo de Luhn simplificado)
    const cardNumber = paymentMethod.card.number.replace(/\s+/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
      return false;
    }

    // Validar fecha de expiración
    const [month, year] = paymentMethod.card.expiry.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return false;
    }

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000;
    const currentDate = new Date();
    
    if (expMonth < 1 || expMonth > 12) {
      return false;
    }

    if (expYear < currentDate.getFullYear() || 
        (expYear === currentDate.getFullYear() && expMonth < currentDate.getMonth() + 1)) {
      return false;
    }

    // Validar CVC
    const cvc = paymentMethod.card.cvc;
    if (!cvc || cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
      return false;
    }

    return true;
  }

  /**
   * Registrar transacción en Firebase
   */
  private async recordTransaction(
    params: ProcessPaymentParams, 
    result: PaymentResult
  ): Promise<void> {
    try {
      const transaction: PaymentTransaction = {
        id: result.transactionId!,
        amount: params.amount,
        currency: params.currency || 'COP',
        status: result.status,
        paymentMethod: params.paymentMethod,
        reference: `REF_${Date.now()}`,
        gateway: this.config.provider,
        gatewayTransactionId: result.providerTransactionId,
        companyId: params.companyId,
        subscriptionPlan: params.subscriptionPlan,
        processedAt: new Date().toISOString(),
        metadata: {
          description: params.description,
          environment: this.config.environment
        }
      };

      // Guardar transacción en Firebase
      const transactionRef = ref(this.dbRef, `payment_transactions/${transaction.id}`);
      await update(transactionRef, transaction);

      // Actualizar información de la empresa con el nuevo estado de pago
      await this.updateCompanyPaymentStatus(params.companyId, params.subscriptionPlan);

      loggingSystem.info('Transacción registrada', {
        transactionId: transaction.id,
        companyId: params.companyId,
        amount: params.amount
      });
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'recordTransaction',
        transactionId: result.transactionId
      });
      throw error;
    }
  }

  /**
   * Actualizar estado de pago de la empresa
   */
  private async updateCompanyPaymentStatus(
    companyId: string, 
    subscriptionPlan: SubscriptionPlan
  ): Promise<void> {
    try {
      const companyRef = ref(this.dbRef, `companies/${companyId}`);
      const companySnapshot = await get(companyRef);

      if (!companySnapshot.exists()) {
        throw new Error(`Empresa no encontrada: ${companyId}`);
      }

      const companyData = companySnapshot.val();
      const now = new Date();
      const tier = SUBSCRIPTION_TIERS[subscriptionPlan];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + tier.durationMonths);

      const updatedCompany = {
        ...companyData,
        subscriptionPlan,
        paymentStatus: 'active',
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        lastPaymentDate: now.toISOString(),
        nextPaymentDue: endDate.toISOString(),
        isVerified: true
      };

      await update(companyRef, updatedCompany);

      loggingSystem.info('Estado de pago de empresa actualizado', {
        companyId,
        subscriptionPlan,
        endDate: endDate.toISOString()
      });
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'updateCompanyPaymentStatus',
        companyId
      });
      throw error;
    }
  }

  /**
   * Configurar el servicio con nueva configuración
   */
  configure(config: PaymentGatewayConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtener la configuración actual
   */
  getConfig(): PaymentGatewayConfig {
    return { ...this.config };
  }
}

// Instancia global del servicio de pasarela de pagos
export const paymentGatewayService = new PaymentGatewayService({
  provider: 'stripe', // Proveedor por defecto
  environment: 'sandbox' // Entorno de prueba por defecto
});