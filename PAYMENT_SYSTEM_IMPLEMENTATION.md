# Documentación del Sistema de Pagos - OffertApps

## Descripción General

Este documento describe la implementación del sistema de pagos para el sistema de membresías de empresas en OffertApps. El sistema permite a las empresas pagar por diferentes planes de suscripción para publicar ofertas en la plataforma.

## 1. Arquitectura del Sistema de Pagos

### 1.1 Componentes Principales

#### Servicios
- `paymentService.ts`: Servicio principal que maneja todas las operaciones de pago
- `googlePayService.ts`: Servicio específico para pagos con Google Pay
- `pseService.ts`: Servicio para pagos PSE (transferencias bancarias en Colombia)
- `paymentGatewayService.ts`: Servicio de integración con pasarelas de pago

#### Tipos de Datos
- `paymentTypes.ts`: Definición de interfaces para pagos, suscripciones y métodos de pago
- Tipos para diferentes métodos de pago (tarjeta, PSE, Google Pay)

#### Componentes de UI
- `PaymentForm.tsx`: Formulario para procesar pagos con diferentes métodos
- `SubscriptionManagement.tsx`: Panel para gestionar la suscripción de la empresa
- `PaymentSetupPage.tsx`: Página completa para configuración de pagos

### 1.2 Integración con Proveedores de Pago

El sistema está diseñado para integrarse con múltiples proveedores de pago:

- **Stripe**: Para pagos con tarjeta de crédito/débito
- **PayU**: Para pagos PSE y otros métodos en Latinoamérica
- **PayPal**: Para pagos a través de PayPal
- **Google Pay**: Para pagos rápidos a través de Google Pay
- **Pasarela personalizada**: Para integraciones específicas

## 2. Planes de Suscripción

### 2.1 Planes Disponibles

#### Básico
- **Precio**: $49,900 COP/mes
- **Características**:
  - Hasta 5 ofertas activas
  - Publicación básica
  - Soporte por correo

#### Premium
- **Precio**: $99,900 COP/mes
- **Características**:
  - Ofertas ilimitadas
  - Publicación destacada
  - Estadísticas avanzadas
  - Soporte prioritario
  - Posibilidad de promociones especiales

### 2.2 Estructura de Datos

```typescript
interface SubscriptionTier {
  id: SubscriptionPlan;        // 'basico' | 'premium'
  name: string;                // Nombre del plan
  price: number;               // Precio en centavos
  currency: string;            // 'COP' para pesos colombianos
  features: string[];          // Lista de características
  durationMonths: number;      // Duración en meses
}
```

## 3. Métodos de Pago Soportados

### 3.1 Tarjeta de Crédito/Débito
- Procesamiento seguro a través de proveedores como Stripe
- Validación de datos de tarjeta en el cliente
- Soporte para principales marcas (Visa, Mastercard, American Express)

### 3.2 PSE (Transferencias electrónicas)
- Integración con sistemas bancarios colombianos
- Requiere información personal y bancaria
- Proceso de redirección al banco para autenticación

### 3.3 Google Pay
- Pago rápido y seguro a través de Google Pay
- Compatible con dispositivos Android
- Autenticación con huella dactilar o PIN

## 4. Flujo de Pago

### 4.1 Flujo General

1. **Selección de Plan**: La empresa selecciona el plan deseado
2. **Método de Pago**: La empresa elige el método de pago
3. **Procesamiento**: El sistema procesa el pago con el proveedor correspondiente
4. **Activación**: La suscripción se activa tras confirmación de pago
5. **Verificación**: El sistema verifica el estado del pago y actualiza la suscripción

### 4.2 Diagrama de Flujo

```
Empresa selecciona plan
         ↓
Empresa elige método de pago
         ↓
Sistema crea intención de pago
         ↓
Proveedor de pago procesa transacción
         ↓
Sistema verifica estado de pago
         ↓
Sistema actualiza suscripción de empresa
         ↓
Empresa puede publicar ofertas
```

## 5. Implementación Técnica

### 5.1 Servicio de Pagos

#### Crear Intención de Pago
```typescript
async createPaymentIntent(
  companyId: string,
  subscriptionPlan: SubscriptionPlan,
  paymentMethod: PaymentMethod
): Promise<PaymentIntent>
```

#### Procesar Pago
```typescript
async processPayment(paymentIntentId: string): Promise<PaymentTransaction>
```

#### Verificar Estado de Suscripción
```typescript
async getSubscriptionStatus(companyId: string): Promise<SubscriptionStatus>
```

### 5.2 Componente de Formulario de Pago

El componente `PaymentForm.tsx` proporciona:

- Selección de plan de suscripción
- Selección de método de pago
- Formularios específicos para cada método
- Validación de datos
- Manejo de errores y estados de carga

### 5.3 Gestión de Suscripciones

El componente `SubscriptionManagement.tsx` permite:

- Visualizar estado actual de la suscripción
- Ver historial de pagos
- Renovar suscripción
- Cancelar suscripción
- Cambiar de plan

## 6. Seguridad

### 6.1 Validación de Datos
- Validación en cliente y servidor
- Sanitización de entradas
- Verificación de datos sensibles

### 6.2 Procesamiento Seguro
- Uso de proveedores de pago certificados
- No almacenamiento de datos sensibles de tarjetas
- Cifrado de datos en tránsito

### 6.3 Control de Acceso
- Verificación de identidad
- Control de acceso basado en estado de suscripción
- Registro de actividades de pago

## 7. Integración con Firebase

### 7.1 Colecciones de Datos

#### payment_intents
- Almacena intenciones de pago
- Relación con empresa y plan
- Estado del proceso de pago

#### payment_transactions
- Almacena transacciones completadas
- Información detallada de cada pago
- Referencia al proveedor de pago

#### billing_cycles
- Ciclos de facturación
- Fechas de inicio y fin
- Estado del ciclo

#### invoices
- Facturas generadas
- Detalles de cobro
- Estado de pago

### 7.2 Reglas de Seguridad

```javascript
// Reglas de Firebase para proteger datos de pago
{
  "rules": {
    "payment_intents": {
      ".read": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'",
      ".write": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'"
    },
    "payment_transactions": {
      ".read": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || $userId == auth.uid)",
      ".write": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'"
    }
  }
}
```

## 8. Pruebas

### 8.1 Pruebas Unitarias
- Validación de datos de entrada
- Procesamiento de diferentes métodos de pago
- Actualización de estados de suscripción

### 8.2 Pruebas de Integración
- Flujo completo de pago
- Integración con proveedores de pago
- Actualización de datos en Firebase

## 9. Consideraciones Legales

### 9.1 Políticas de Reembolso
- Política clara de reembolsos
- Procedimientos para cancelaciones
- Cumplimiento con regulaciones locales

### 9.2 Privacidad
- Protección de datos financieros
- Cumplimiento con PCI DSS para pagos con tarjeta
- Notificaciones sobre uso de datos de pago

## 10. Implementación Real

### 10.1 Variables de Entorno
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYU_API_KEY=...
VITE_PAYU_MERCHANT_ID=...
VITE_GOOGLE_PAY_MERCHANT_ID=...
```

### 10.2 Proveedores de Pago

Para implementar completamente el sistema, se deben integrar los SDKs de los proveedores:

#### Stripe
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### PayU
```bash
npm install @payu/openpay-js
```

#### Google Pay
```bash
npm install @google-pay/button-react
```

## 11. Próximos Pasos

### 11.1 Mejoras Planeadas
- Integración con más métodos de pago
- Sistema de facturación automatizado
- Panel de administración para pagos
- Notificaciones de vencimiento de suscripción

### 11.2 Escalabilidad
- Soporte para múltiples monedas
- Integración con sistemas de diferentes países
- Soporte para planes anuales y empresariales

## 12. Ejemplo de Uso

### 12.1 En un Componente de Empresa

```tsx
import { PaymentForm } from '../components/PaymentForm';

const CompanyDashboard: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('basico');
  
  const handlePaymentSuccess = (transactionId: string) => {
    // Actualizar estado de la empresa
    setCurrentPlan('premium');
    // Mostrar mensaje de éxito
  };
  
  return (
    <div>
      <SubscriptionManagement 
        companyId="company-123" 
        currentPlan={currentPlan}
        onPlanChange={setCurrentPlan}
      />
      
      <PaymentForm 
        companyId="company-123"
        currentPlan={currentPlan}
        onSuccess={handlePaymentSuccess}
        onCancel={() => console.log('Pago cancelado')}
      />
    </div>
  );
};
```

Este sistema proporciona una base sólida para el manejo de pagos de membresías en la plataforma OffertApps, con soporte para múltiples métodos de pago y una arquitectura escalable.