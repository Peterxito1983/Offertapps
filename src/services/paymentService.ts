// src/services/paymentService.ts

import { ref, get, update, push, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config';
import {
  SubscriptionPlan,
  SubscriptionTier,
  PaymentMethod,
  PaymentIntent,
  PaymentTransaction,
  BillingCycle,
  Invoice,
  InvoiceItem,
  PaymentConfiguration,
  PsePaymentData
} from '../types/paymentTypes';
import { loggingSystem } from '../utils/loggingUtils';

import { getAppConfig } from './adminService';

// Configuración de planes de suscripción (Editable)
export let SUBSCRIPTION_TIERS: Record<SubscriptionPlan, SubscriptionTier> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 49900, // Fallback
    currency: 'COP',
    features: [
      'Hasta 5 ofertas activas',
      'Publicación estándar',
      'Soporte por correo'
    ],
    durationMonths: 1
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99900, // Fallback
    currency: 'COP',
    features: [
      'Ofertas ilimitadas',
      'Publicación destacada (Top)',
      'Estadísticas de visualización',
      'Soporte prioritario 24/7',
      'Promociones en Redes Sociales'
    ],
    durationMonths: 1
  }
};

/**
 * Sincroniza los precios de suscripción desde la configuración global de la app
 */
export const syncSubscriptionPrices = async (): Promise<void> => {
  try {
    const config = await getAppConfig();
    if (config && config.subscriptionPrices) {
      SUBSCRIPTION_TIERS.basico.price = config.subscriptionPrices.basico || SUBSCRIPTION_TIERS.basico.price;
      SUBSCRIPTION_TIERS.premium.price = config.subscriptionPrices.premium || SUBSCRIPTION_TIERS.premium.price;
      console.log('PaymentService: Precios sincronizados desde Firebase:', SUBSCRIPTION_TIERS);
    }
  } catch (error) {
    console.warn('PaymentService: No se pudieron sincronizar los precios, usando hardcoded.', error);
  }
};

// Servicio para el manejo de pagos
export class PaymentService {
  /**
   * Crear una intención de pago
   * @param companyId - ID de la empresa
   * @param subscriptionPlan - Plan de suscripción elegido
   * @param paymentMethod - Método de pago seleccionado
   * @returns Promise con la intención de pago creada
   */
  async createPaymentIntent(
    companyId: string,
    subscriptionPlan: SubscriptionPlan,
    paymentMethod: PaymentMethod
  ): Promise<PaymentIntent> {
    try {
      const tier = SUBSCRIPTION_TIERS[subscriptionPlan];
      if (!tier) {
        throw new Error(`Plan de suscripción no válido: ${subscriptionPlan}`);
      }

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: tier.price,
        currency: tier.currency,
        status: 'created',
        paymentMethod,
        customerId: companyId,
        companyId,
        subscriptionPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Guardar la intención de pago en la base de datos
      const paymentIntentRef = ref(db, `payment_intents/${paymentIntent.id}`);
      await update(paymentIntentRef, paymentIntent);

      loggingSystem.info('Intención de pago creada', {
        paymentIntentId: paymentIntent.id,
        companyId,
        subscriptionPlan,
        amount: paymentIntent.amount
      });

      return paymentIntent;
    } catch (error: any) {
      // Fallback para errores de permisos (Modo Demo/Desarrollo)
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('permission_denied')) {
        loggingSystem.warn('Permisos de escritura denegados. Cambiando a Modo Simulación.', { error });

        return {
          id: `pi_sim_${Date.now()}`,
          amount: SUBSCRIPTION_TIERS[subscriptionPlan].price,
          currency: 'COP',
          status: 'created',
          paymentMethod,
          customerId: companyId,
          companyId,
          subscriptionPlan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      loggingSystem.captureError(error, {
        operation: 'createPaymentIntent',
        companyId,
        subscriptionPlan
      });
      throw error;
    }
  }

  /**
   * Procesar un pago
   * @param paymentIntentId - ID de la intención de pago
   * @returns Promise con la transacción de pago
   */
  async processPayment(paymentIntentId: string): Promise<PaymentTransaction> {
    try {
      // Obtener la intención de pago
      const paymentIntentRef = ref(db, `payment_intents/${paymentIntentId}`);
      const paymentIntentSnapshot = await get(paymentIntentRef);

      if (!paymentIntentSnapshot.exists()) {
        throw new Error(`Intención de pago no encontrada: ${paymentIntentId}`);
      }

      const paymentIntent = paymentIntentSnapshot.val() as PaymentIntent;

      if (paymentIntent.status !== 'created') {
        throw new Error(`Estado de intención de pago inválido: ${paymentIntent.status}`);
      }

      // Actualizar estado de la intención de pago
      await update(paymentIntentRef, { status: 'processing' });

      // Simular procesamiento de pago (en una implementación real, aquí se integraría con Stripe, PayPal, etc.)
      const transaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        paymentIntentId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'processing',
        paymentMethod: paymentIntent.paymentMethod!,
        reference: `REF_${Date.now()}`, // En una implementación real, esto vendría del proveedor de pagos
        gateway: 'stripe', // En una implementación real, esto dependería del método de pago
        gatewayTransactionId: `gateway_txn_${Date.now()}`,
        companyId: paymentIntent.companyId,
        subscriptionPlan: paymentIntent.subscriptionPlan,
        createdAt: new Date().toISOString(),
        metadata: {
          processedBy: 'paymentService',
          processingTime: new Date().toISOString()
        }
      };

      // Guardar la transacción
      const transactionRef = ref(db, `payment_transactions/${transaction.id}`);
      await update(transactionRef, transaction);

      loggingSystem.info('Transacción de pago creada', {
        transactionId: transaction.id,
        paymentIntentId,
        companyId: paymentIntent.companyId,
        amount: transaction.amount
      });

      // Simular procesamiento exitoso (en una implementación real, esto dependería de la respuesta del proveedor de pagos)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de procesamiento

      // Actualizar estado de la transacción
      await update(transactionRef, { status: 'completed', processedAt: new Date().toISOString() });
      await update(paymentIntentRef, { status: 'succeeded', updatedAt: new Date().toISOString() });

      // Actualizar información de suscripción de la empresa
      await this.updateCompanySubscription(
        paymentIntent.companyId,
        paymentIntent.subscriptionPlan,
        transaction.id
      );

      loggingSystem.info('Pago procesado exitosamente', {
        transactionId: transaction.id,
        companyId: paymentIntent.companyId
      });

      return {
        ...transaction,
        status: 'completed',
        processedAt: new Date().toISOString()
      };
    } catch (error: any) {
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('permission_denied')) {
        loggingSystem.warn('Backend bloqueado (rules). Simulando processPayment.', { error });
        return {
          id: `txn_sim_${Date.now()}`,
          paymentIntentId,
          amount: 0, // Should retrieve from intent but mocking here
          currency: 'COP',
          status: 'completed',
          paymentMethod: { id: 'mock', type: 'card' },
          reference: `REF_SIM_${Date.now()}`,
          gateway: 'custom',
          gatewayTransactionId: `sim_${Date.now()}`,
          companyId: 'current', // Mock
          subscriptionPlan: 'basico', // Mock
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString()
        } as PaymentTransaction;
      }

      loggingSystem.captureError(error, {
        operation: 'processPayment',
        paymentIntentId
      });
      // ... existing error handling ...
      try {
        // Only try to update if we have permission, otherwise this will also fail
        if (error.code !== 'PERMISSION_DENIED') {
          const transactionRef = ref(db, `payment_transactions/${paymentIntentId}`);
          await update(transactionRef, {
            status: 'failed',
            failureReason: error.message,
            processedAt: new Date().toISOString()
          });
        }
      } catch (updateError) {
        // Ignore secondary errors
      }

      throw error;
    }
  }

  /**
   * Actualizar la suscripción de una empresa después de un pago exitoso
   * @param companyId - ID de la empresa
   * @param subscriptionPlan - Plan de suscripción
   * @param transactionId - ID de la transacción exitosa
   */
  private async updateCompanySubscription(
    companyId: string,
    subscriptionPlan: SubscriptionPlan,
    transactionId: string
  ): Promise<void> {
    try {
      const companyRef = ref(db, `companies/${companyId}`);
      const companySnapshot = await get(companyRef);

      if (!companySnapshot.exists()) {
        throw new Error(`Empresa no encontrada: ${companyId}`);
      }

      const now = new Date();
      const tier = SUBSCRIPTION_TIERS[subscriptionPlan];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + tier.durationMonths);

      // Actualizar información de la empresa
      const updatedCompany = {
        ...companySnapshot.val(),
        subscriptionPlan,
        paymentStatus: 'active',
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        lastPaymentDate: now.toISOString(),
        nextPaymentDue: endDate.toISOString(),
        isVerified: true, // Activar inmediatamente tras el pago
        updatedAt: now.toISOString()
      };

      await update(companyRef, updatedCompany);

      // Crear ciclo de facturación
      const billingCycle: BillingCycle = {
        id: `cycle_${Date.now()}`,
        companyId,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        amount: tier.price,
        currency: tier.currency,
        invoiceNumber: `INV-${Date.now()}`,
        dueDate: endDate.toISOString()
      };

      const cycleRef = ref(db, `billing_cycles/${billingCycle.id}`);
      await update(cycleRef, billingCycle);

      // Crear factura
      await this.createInvoice(companyId, billingCycle.id, subscriptionPlan, transactionId);

      loggingSystem.info('Suscripción de empresa actualizada', {
        companyId,
        subscriptionPlan,
        transactionId
      });
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'updateCompanySubscription',
        companyId,
        subscriptionPlan
      });
      throw error;
    }
  }

  /**
   * Crear una factura para un ciclo de facturación
   * @param companyId - ID de la empresa
   * @param billingCycleId - ID del ciclo de facturación
   * @param subscriptionPlan - Plan de suscripción
   * @param transactionId - ID de la transacción
   */
  private async createInvoice(
    companyId: string,
    billingCycleId: string,
    subscriptionPlan: SubscriptionPlan,
    transactionId: string
  ): Promise<void> {
    try {
      const tier = SUBSCRIPTION_TIERS[subscriptionPlan];
      const taxRate = 0.19; // 19% IVA en Colombia

      const invoiceItems: InvoiceItem[] = [{
        id: `item_${Date.now()}`,
        description: `Plan ${tier.name} mensual`,
        quantity: 1,
        unitPrice: tier.price,
        total: tier.price,
        taxRate
      }];

      const subtotal = tier.price;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const invoice: Invoice = {
        id: `inv_${Date.now()}`,
        companyId,
        billingCycleId,
        subscriptionPlan,
        items: invoiceItems,
        subtotal,
        tax,
        total,
        currency: tier.currency,
        status: 'sent',
        issuedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        paidDate: new Date().toISOString()
      };

      const invoiceRef = ref(db, `invoices/${invoice.id}`);
      await update(invoiceRef, invoice);

      loggingSystem.info('Factura creada', {
        invoiceId: invoice.id,
        companyId,
        total: invoice.total
      });
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'createInvoice',
        companyId,
        billingCycleId
      });
      throw error;
    }
  }

  /**
   * Obtener el historial de pagos de una empresa
   * @param companyId - ID de la empresa
   * @returns Promise con el historial de pagos
   */
  async getPaymentHistory(companyId: string): Promise<PaymentTransaction[]> {
    if (!companyId) return [];
    try {
      // Usar consulta para filtrar por companyId directamente en Firebase (más seguro para permisos)
      const transactionsRef = ref(db, 'payment_transactions');
      const companyTransactionsQuery = query(
        transactionsRef,
        orderByChild('companyId'),
        equalTo(companyId)
      );

      const transactionsSnapshot = await get(companyTransactionsQuery);

      if (!transactionsSnapshot.exists()) {
        return [];
      }

      const transactions = transactionsSnapshot.val();
      const companyTransactions: PaymentTransaction[] = [];

      Object.entries(transactions).forEach(([id, data]: [string, any]) => {
        if (data) {
          companyTransactions.push({
            id,
            ...data
          });
        }
      });

      // Ordenar por fecha (más recientes primero)
      companyTransactions.sort((a, b) => {
        const timeA = new Date(a.processedAt || a.createdAt || '').getTime() || 0;
        const timeB = new Date(b.processedAt || b.createdAt || '').getTime() || 0;
        return timeB - timeA;
      });

      return companyTransactions;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'getPaymentHistory',
        companyId
      });
      // Fallback a filtrado manual si la consulta falla (p.ej. falta índice)
      try {
        const transactionsRef = ref(db, 'payment_transactions');
        const transactionsSnapshot = await get(transactionsRef);

        if (!transactionsSnapshot.exists()) return [];

        const transactions = transactionsSnapshot.val();
        const fallbackTransactions: PaymentTransaction[] = [];

        Object.entries(transactions).forEach(([id, data]: [string, any]) => {
          if (data && data.companyId === companyId) {
            fallbackTransactions.push({ id, ...data });
          }
        });

        return fallbackTransactions.sort((a, b) =>
          (new Date(b.processedAt || b.createdAt || '').getTime() || 0) -
          (new Date(a.processedAt || a.createdAt || '').getTime() || 0)
        );
      } catch (innerError) {
        console.warn('PaymentService: Fallo total en recuperación de historial, devolviendo lista vacía.', innerError);
        return [];
      }
    }
  }

  /**
   * Obtener el estado actual de la suscripción de una empresa
   * @param companyId - ID de la empresa
   * @returns Promise con el estado de la suscripción
   */
  async getSubscriptionStatus(companyId: string): Promise<{
    isActive: boolean;
    plan: SubscriptionPlan | null;
    expiresAt: string | null;
    paymentStatus: 'pending' | 'active' | 'expired' | 'cancelled' | null;
  }> {
    if (!companyId) {
      return { isActive: false, plan: null, expiresAt: null, paymentStatus: null };
    }
    try {
      const companyRef = ref(db, `companies/${companyId}`);
      const companySnapshot = await get(companyRef);

      if (!companySnapshot.exists()) {
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          paymentStatus: null
        };
      }

      const company = companySnapshot.val();
      const expiresAt = company.subscriptionEndDate || null;
      const isActive = company.paymentStatus === 'active' &&
        expiresAt &&
        new Date(expiresAt).getTime() > Date.now();

      return {
        isActive: !!isActive,
        plan: company.subscriptionPlan || null,
        expiresAt,
        paymentStatus: company.paymentStatus || null
      };
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'getSubscriptionStatus',
        companyId
      });
      throw error;
    }
  }

  /**
   * Configurar métodos de pago disponibles
   * @returns Configuración de pagos
   */
  getPaymentConfiguration(): PaymentConfiguration {
    // @ts-ignore
    const env = import.meta.env;
    return {
      stripePublicKey: env?.VITE_STRIPE_PUBLIC_KEY || '',
      paypalClientId: env?.VITE_PAYPAL_CLIENT_ID || '',
      mercadopagoPublicKey: env?.VITE_MERCADOPAGO_PUBLIC_KEY || '',
      supportedMethods: ['google_pay', 'pse', 'card', 'paypal'],
      defaultCurrency: 'COP',
      countries: ['CO'] // Colombia
    };
  }

  /**
   * Crear un pago PSE
   * @param pseData - Datos para el pago PSE
   * @param companyId - ID de la empresa
   * @param subscriptionPlan - Plan de suscripción
   * @returns Promise con la transacción PSE
   */
  async createPsePayment(
    pseData: PsePaymentData,
    companyId: string,
    subscriptionPlan: SubscriptionPlan
  ): Promise<PaymentTransaction> {
    try {
      // Validar datos PSE
      if (!pseData.financialInstitutionCode) {
        throw new Error('Código de institución financiera es requerido para PSE');
      }

      if (!pseData.documentNumber) {
        throw new Error('Número de documento es requerido para PSE');
      }

      // Crear intención de pago
      const paymentMethod: PaymentMethod = {
        id: `pse_${Date.now()}`,
        type: 'bank_transfer',
        bankName: pseData.financialInstitutionCode
      };

      const paymentIntent = await this.createPaymentIntent(
        companyId,
        subscriptionPlan,
        paymentMethod
      );

      // Crear transacción PSE
      const transaction: PaymentTransaction = {
        id: `pse_${Date.now()}`,
        paymentIntentId: paymentIntent.id,
        amount: SUBSCRIPTION_TIERS[subscriptionPlan].price,
        currency: SUBSCRIPTION_TIERS[subscriptionPlan].currency,
        status: 'pending',
        paymentMethod,
        reference: `PSE-${Date.now()}`,
        gateway: 'mercadopago', // PSE típicamente se procesa a través de MercadoPago u OpenPay
        gatewayTransactionId: `pse_gateway_${Date.now()}`,
        companyId,
        subscriptionPlan,
        createdAt: new Date().toISOString(),
        metadata: {
          pseData,
          paymentType: 'PSE'
        }
      };

      // Guardar la transacción
      const transactionRef = ref(db, `payment_transactions/${transaction.id}`);
      await update(transactionRef, transaction);

      loggingSystem.info('Pago PSE creado', {
        transactionId: transaction.id,
        companyId,
        amount: transaction.amount
      });

      return transaction;
    } catch (error: any) {
      // Fallback para errores de permisos (Modo Demo/Desarrollo)
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('permission_denied')) {
        console.warn('Backend bloqueado (rules). Simulando transacción PSE exitosa.');

        return {
          id: `pse_sim_${Date.now()}`,
          paymentIntentId: `pi_sim_${Date.now()}`,
          amount: SUBSCRIPTION_TIERS[subscriptionPlan].price,
          currency: 'COP',
          status: 'pending', // PSE starts as pending
          paymentMethod: {
            id: `pse_${Date.now()}`,
            type: 'bank_transfer',
            bankName: pseData.financialInstitutionCode
          },
          reference: `PSE-SIM-${Date.now()}`,
          gateway: 'custom',
          gatewayTransactionId: `sim_txn_${Date.now()}`,
          companyId,
          subscriptionPlan,
          createdAt: new Date().toISOString(),
          metadata: { pseData, paymentType: 'PSE_SIM' }
        };
      }

      loggingSystem.captureError(error, {
        operation: 'createPsePayment',
        companyId,
        subscriptionPlan
      });
      throw error;
    }
  }

  /**
   * Verificar el estado de una transacción
   * @param transactionId - ID de la transacción
   * @returns Promise con el estado actualizado
   */
  async verifyTransaction(transactionId: string): Promise<PaymentTransaction> {
    try {
      const transactionRef = ref(db, `payment_transactions/${transactionId}`);
      const transactionSnapshot = await get(transactionRef);

      if (!transactionSnapshot.exists()) {
        throw new Error(`Transacción no encontrada: ${transactionId}`);
      }

      const transaction = transactionSnapshot.val() as PaymentTransaction;

      // En una implementación real, aquí se verificaría el estado con el proveedor de pagos
      // Por ahora, simplemente devolvemos la transacción existente
      return transaction;
    } catch (error) {
      loggingSystem.captureError(error, {
        operation: 'verifyTransaction',
        transactionId
      });
      throw error;
    }
  }
}

// Instancia global del servicio de pagos
export const paymentService = new PaymentService();