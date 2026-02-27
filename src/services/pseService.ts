// src/services/pseService.ts

export interface PsePaymentRequest {
  paymentMethodName: string;
  merchantId: string;
  reference: string;
  description: string;
  amount: number;
  tax: number;
  taxBase: number;
  currency: string;
  signature: string;
  test: boolean;
  buyerEmail: string;
  returnUrl: string;
  confirmUrl: string;
  expiration: Date;
}

export interface PsePaymentResponse {
  status: string;
  requestId: string;
  signature: string;
  returnCode: string;
  reference: string;
  transactionDate: string;
  transactionId: string;
  responseCode: string;
  paymentMethodName: string;
  paymentMethodTypeId: string;
  issuerName: string;
  processingDate: string;
  authorizationCode: string;
  extraParameters: {
    BANK_NAME: string;
    ACCOUNT_NUMBER: string;
  };
}

export interface PseInstitution {
  id: string;
  name: string;
  type: string;
}

export class PseService {
  private apiUrl: string;
  private merchantId: string;
  private apiKey: string;
  private privateKey: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_PSE_API_URL || 'https://secure.payu.com/api';
    this.merchantId = import.meta.env.VITE_PAYU_MERCHANT_ID || '';
    this.apiKey = import.meta.env.VITE_PAYU_API_KEY || '';
    this.privateKey = import.meta.env.VITE_PAYU_PRIVATE_KEY || '';
  }

  /**
   * Obtener lista de instituciones bancarias disponibles para PSE
   * @returns Promise con lista de instituciones
   */
  async getAvailableInstitutions(): Promise<PseInstitution[]> {
    try {
      // En una implementación real, esto haría una llamada a la API de PayU o similar
      // Por ahora, devolvemos una lista simulada
      
      return [
        { id: '1022', name: 'Bancolombia', type: 'PERSONAL' },
        { id: '1032', name: 'BBVA Colombia', type: 'PERSONAL' },
        { id: '1007', name: 'Banco de Bogotá', type: 'PERSONAL' },
        { id: '1052', name: 'Davivienda', type: 'PERSONAL' },
        { id: '1001', name: 'Banco Agrario', type: 'PERSONAL' },
        { id: '1047', name: 'Banco de Occidente', type: 'PERSONAL' },
        { id: '1050', name: 'Banco AV Villas', type: 'PERSONAL' },
        { id: '1023', name: 'Citibank', type: 'PERSONAL' },
        { id: '1006', name: 'Banco Popular', type: 'PERSONAL' },
        { id: '1030', name: 'Banco Caja Social', type: 'PERSONAL' },
        { id: '1066', name: 'Banco Pichincha', type: 'PERSONAL' },
        { id: '1021', name: 'Banco Corpbanca', type: 'PERSONAL' },
        { id: '1009', name: 'Banco Sudameris', type: 'PERSONAL' },
        { id: '1062', name: 'Banco Falabella', type: 'PERSONAL' },
        { id: '1069', name: 'Banco W', type: 'PERSONAL' },
        { id: '1020', name: 'Scotiabank Colpatria', type: 'PERSONAL' },
        { id: '1002', name: 'Bancamía', type: 'PERSONAL' },
        { id: '1060', name: 'Bancoomeva', type: 'PERSONAL' },
        { id: '1012', name: 'Fondo de Cesantías Porvenir', type: 'PERSONAL' },
        { id: '1013', name: 'Fondo de Cesantías Protección', type: 'PERSONAL' }
      ];
    } catch (error) {
      console.error('Error obteniendo instituciones PSE:', error);
      throw error;
    }
  }

  /**
   * Crear una solicitud de pago PSE
   * @param paymentData - Datos del pago
   * @returns Promise con la respuesta de la creación del pago
   */
  async createPsePayment(paymentData: {
    companyId: string;
    amount: number;
    concept: string;
    institutionCode: string;
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    cellPhoneNumber: string;
  }): Promise<any> {
    try {
      // Validar datos requeridos
      if (!paymentData.institutionCode || !paymentData.documentNumber || 
          !paymentData.firstName || !paymentData.lastName || !paymentData.email) {
        throw new Error('Datos incompletos para el pago PSE');
      }

      // En una implementación real, aquí se crearía la solicitud con la API de PayU
      // Por ahora, simulamos la creación
      
      const pseRequest: PsePaymentRequest = {
        paymentMethodName: 'PSE',
        merchantId: this.merchantId,
        reference: `PSE_${Date.now()}_${paymentData.companyId}`,
        description: paymentData.concept,
        amount: paymentData.amount,
        tax: 0,
        taxBase: paymentData.amount,
        currency: 'COP',
        signature: this.generateSignature(
          this.merchantId, 
          this.apiKey, 
          `PSE_${Date.now()}_${paymentData.companyId}`, 
          paymentData.amount.toString(), 
          'COP'
        ),
        test: true, // Cambiar a false en producción
        buyerEmail: paymentData.email,
        returnUrl: `${window.location.origin}/payment/return`,
        confirmUrl: `${window.location.origin}/api/payment/confirm`,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };

      // Simular respuesta exitosa
      return {
        status: 'CREATED',
        requestId: `req_${Date.now()}`,
        reference: pseRequest.reference,
        redirectUrl: `https://secure.payu.com/pse?reference=${pseRequest.reference}`,
        institutionCode: paymentData.institutionCode,
        expiration: pseRequest.expiration
      };
    } catch (error) {
      console.error('Error creando pago PSE:', error);
      throw error;
    }
  }

  /**
   * Verificar estado de una transacción PSE
   * @param transactionId - ID de la transacción
   * @returns Promise con el estado de la transacción
   */
  async checkTransactionStatus(transactionId: string): Promise<any> {
    try {
      // En una implementación real, esto haría una llamada a la API de PayU
      // Por ahora, simulamos una respuesta
      
      // Simular diferentes estados posibles
      const possibleStatuses = ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'];
      const randomStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
      
      return {
        transactionId,
        status: randomStatus,
        amount: 49900, // Valor simulado
        currency: 'COP',
        reference: `PSE_${transactionId}`,
        processedAt: new Date().toISOString(),
        ...(randomStatus === 'APPROVED' && {
          authorizationCode: `AUTH_${Date.now()}`,
          transactionDate: new Date().toISOString()
        })
      };
    } catch (error) {
      console.error('Error verificando estado de transacción PSE:', error);
      throw error;
    }
  }

  /**
   * Generar firma para la solicitud PSE
   * @param merchantId - ID del comerciante
   * @param apiKey - Llave API
   * @param referenceCode - Código de referencia
   * @param amount - Monto
   * @param currency - Moneda
   * @returns Firma generada
   */
  private generateSignature(merchantId: string, apiKey: string, referenceCode: string, amount: string, currency: string): string {
    // En una implementación real, usar la lógica de firma de PayU
    // Fórmula: md5(apiKey~merchantId~referenceCode~amount~currency)
    
    // Simulación de firma (en producción usar librería crypto)
    const signatureInput = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
    return this.simpleHash(signatureInput);
  }

  /**
   * Función simple para hashing (solo para fines de demostración)
   * En producción usar una librería criptográfica adecuada
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validar datos de entrada para PSE
   */
  validatePseData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.institutionCode) {
      errors.push('Institución bancaria es requerida');
    }

    if (!data.documentNumber || data.documentNumber.length < 6) {
      errors.push('Número de documento inválido');
    }

    if (!data.firstName || data.firstName.length < 2) {
      errors.push('Nombre es requerido');
    }

    if (!data.lastName || data.lastName.length < 2) {
      errors.push('Apellido es requerido');
    }

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.cellPhoneNumber || data.cellPhoneNumber.length < 7) {
      errors.push('Número de celular inválido');
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('Monto inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia global del servicio PSE
export const pseService = new PseService();