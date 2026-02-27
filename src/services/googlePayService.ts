// src/services/googlePayService.ts

declare global {
  interface Window {
    google: any;
  }
}

export interface GooglePayConfig {
  merchantName: string;
  merchantId: string;
  countryCode: string;
  currencyCode: string;
  testEnvironment?: boolean;
}

export interface GooglePayPaymentData {
  transactionId: string;
  totalPrice: string;
  totalPriceStatus: 'FINAL' | 'ESTIMATED';
  currencyCode: string;
  countryCode: string;
}

export class GooglePayService {
  private config: GooglePayConfig;
  private isReadyToPay: boolean = false;
  private paymentDataRequest: any;

  constructor(config: GooglePayConfig) {
    this.config = config;
    this.initializePaymentDataRequest();
  }

  private initializePaymentDataRequest(): void {
    this.paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId',
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: this.config.merchantId,
        merchantName: this.config.merchantName,
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: '0',
        currencyCode: this.config.currencyCode,
        countryCode: this.config.countryCode,
      },
    };
  }

  async loadGooglePay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.google?.payments?.api?.PaymentsClient) {
        this.isReadyToPay = true;
        resolve(true);
        return;
      }

      // Cargar la librería de Google Pay
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => {
        this.isReadyToPay = true;
        resolve(true);
      };
      script.onerror = () => {
        this.isReadyToPay = false;
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  async isReadyToPayMethod(): Promise<boolean> {
    if (!this.isReadyToPay) {
      return false;
    }

    try {
      const paymentsClient = new google.payments.api.PaymentsClient({
        environment: this.config.testEnvironment ? 'TEST' : 'PRODUCTION'
      });

      const isReadyToPayResponse = await paymentsClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
            },
          },
        ],
      });

      return isReadyToPayResponse.result;
    } catch (error) {
      console.error('Error checking Google Pay readiness:', error);
      return false;
    }
  }

  async createPaymentDataRequest(amount: number, description: string): Promise<any> {
    const request = { ...this.paymentDataRequest };
    request.transactionInfo.totalPrice = (amount / 100).toFixed(2); // Convertir de centavos a unidades
    request.transactionInfo.displayItems = [
      {
        label: description,
        type: 'LINE_ITEM',
        price: request.transactionInfo.totalPrice,
      },
    ];

    return request;
  }

  async initiatePayment(
    amount: number, 
    description: string,
    onSuccess: (paymentData: any) => void,
    onError: (error: any) => void
  ): Promise<void> {
    if (!this.isReadyToPay) {
      onError(new Error('Google Pay no está disponible'));
      return;
    }

    try {
      const paymentDataRequest = await this.createPaymentDataRequest(amount, description);
      const paymentsClient = new google.payments.api.PaymentsClient({
        environment: this.config.testEnvironment ? 'TEST' : 'PRODUCTION'
      });

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      onSuccess(paymentData);
    } catch (error) {
      console.error('Error initiating Google Pay:', error);
      onError(error);
    }
  }

  // Método para procesar la respuesta de Google Pay
  processPaymentResponse(paymentData: any): {
    transactionId: string;
    paymentMethod: string;
    status: string;
  } {
    // En una implementación real, aquí se procesaría la respuesta
    // y se enviaría al servidor para su verificación
    
    return {
      transactionId: paymentData.transactionId || `gp_${Date.now()}`,
      paymentMethod: 'GOOGLE_PAY',
      status: 'SUCCESS'
    };
  }
}

// Instancia global del servicio de Google Pay
export const googlePayService = new GooglePayService({
  merchantName: 'OffertApps',
  merchantId: 'OffertApps_Merchant', // En producción, usar ID real de comerciante
  countryCode: 'CO',
  currencyCode: 'COP',
  testEnvironment: true // Cambiar a false en producción
});