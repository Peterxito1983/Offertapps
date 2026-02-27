// src/types/paymentTypes.ts

// Tipos para el sistema de pagos

export type SubscriptionPlan = 'basico' | 'premium';

export interface SubscriptionTier {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  features: string[];
  durationMonths: number;
}

export interface PaymentMethod {
  id: string;
  type: 'google_pay' | 'pse' | 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // Para PayPal
  bankName?: string; // Para PSE
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'processing' | 'requires_action' | 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'failed';
  paymentMethod?: PaymentMethod;
  customerId: string;
  companyId: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface PaymentTransaction {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  reference: string; // Referencia de pago (por ejemplo, código PSE)
  gateway: 'stripe' | 'paypal' | 'mercadopago' | 'custom';
  gatewayTransactionId?: string;
  companyId: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface BillingCycle {
  id: string;
  companyId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'ended' | 'cancelled';
  amount: number;
  currency: string;
  invoiceNumber: string;
  paidAt?: string;
  dueDate: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  billingCycleId: string;
  subscriptionPlan: SubscriptionPlan;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

export interface PaymentConfiguration {
  stripePublicKey?: string;
  paypalClientId?: string;
  mercadopagoPublicKey?: string;
  supportedMethods: ('google_pay' | 'pse' | 'card' | 'paypal' | 'bank_transfer')[];
  defaultCurrency: string;
  countries: string[]; // Países soportados
}

export interface PsePaymentData {
  financialInstitutionCode: string;
  personType: 'NATURAL' | 'JURIDICA';
  documentType: string;
  documentNumber: string;
  name: string;
  surname: string;
  email: string;
  countryCode: string;
  mobile: string;
}

export interface GooglePayPaymentData {
  allowedAuthMethods: string[];
  allowedCardNetworks: string[];
  billingAddressRequired: boolean;
  billingAddressParameters?: {
    format: 'MIN' | 'FULL';
    phoneNumberRequired: boolean;
  };
}

export interface PaymentVerification {
  transactionId: string;
  verificationCode?: string;
  status: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
  attempts: number;
}