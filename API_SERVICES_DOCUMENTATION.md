# Documentación de la API y Servicios - OffertApps

## Descripción General

Este documento describe la API y servicios disponibles en la aplicación OffertApps, incluyendo endpoints, estructura de datos y procesos de despliegue.

## 1. Arquitectura de la Aplicación

### 1.1 Tecnologías Utilizadas
- **Frontend**: React con TypeScript
- **Framework UI**: Ionic Framework
- **Enrutamiento**: React Router
- **Backend**: Firebase (Authentication, Realtime Database, Storage)
- **Compilación**: Vite
- **Mobile**: Capacitor

### 1.2 Estructura de Carpetas
```
offertapps/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── services/            # Servicios de backend
│   ├── views/               # Vistas de la aplicación
│   ├── theme/               # Estilos y variables
│   ├── utils/               # Utilidades
│   ├── __tests__/           # Pruebas
│   ├── types.ts             # Definición de tipos
│   ├── config.ts            # Configuración de Firebase
│   └── App.tsx              # Componente principal
├── public/
├── capacitor.config.ts      # Configuración de Capacitor
├── vite.config.ts           # Configuración de Vite
├── package.json
└── ...
```

## 2. Servicios Disponibles

### 2.1 Servicio de Autenticación (`authService.ts`)

#### Funciones Disponibles

##### `signUp(email, password, displayName, role)`
- **Descripción**: Registra un nuevo usuario
- **Parámetros**:
  - `email`: string - Correo electrónico del usuario
  - `password`: string - Contraseña del usuario
  - `displayName`: string - Nombre a mostrar
  - `role`: Role - Rol del usuario (USER, COMPANY, ADMIN)
- **Retorna**: Promise<UserProfile>
- **Excepciones**: Lanza error si la validación falla

##### `signIn(email, password)`
- **Descripción**: Inicia sesión de un usuario existente
- **Parámetros**:
  - `email`: string - Correo electrónico
  - `password`: string - Contraseña
- **Retorna**: Promise<UserProfile>
- **Excepciones**: Lanza error si las credenciales son incorrectas

##### `signOut()`
- **Descripción**: Cierra la sesión del usuario actual
- **Parámetros**: Ninguno
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla el cierre de sesión

##### `getCurrentUserProfile()`
- **Descripción**: Obtiene el perfil del usuario actual
- **Parámetros**: Ninguno
- **Retorna**: Promise<UserProfile | null>
- **Excepciones**: Retorna null si no hay usuario autenticado

##### `onAuthChange(callback)`
- **Descripción**: Observa cambios en el estado de autenticación
- **Parámetros**:
  - `callback`: Función que recibe el usuario actual
- **Retorna**: Función para desuscribirse
- **Excepciones**: Ninguna

##### `initiatePasswordReset(email, options?)`
- **Descripción**: Inicia el proceso de recuperación de contraseña
- **Parámetros**:
  - `email`: string - Correo electrónico del usuario
  - `options?`: PasswordResetOptions - Opciones adicionales
- **Retorna**: Promise<boolean>
- **Excepciones**: Lanza error si el correo no es válido

### 2.2 Servicio de Empresas (`companiesService.ts`)

##### `getCompanies(filters?)`
- **Descripción**: Obtiene todas las empresas
- **Parámetros**:
  - `filters?`: Objeto con filtros (isVerified)
- **Retorna**: Promise<Company[]>
- **Excepciones**: Lanza error si falla la consulta

##### `getCompanyById(id)`
- **Descripción**: Obtiene una empresa por ID
- **Parámetros**:
  - `id`: string - ID de la empresa
- **Retorna**: Promise<Company | null>
- **Excepciones**: Retorna null si no se encuentra

##### `createCompany(company)`
- **Descripción**: Crea una nueva empresa
- **Parámetros**:
  - `company`: Omit<Company, 'id'> - Datos de la empresa sin ID
- **Retorna**: Promise<string> - ID de la empresa creada
- **Excepciones**: Lanza error si falla la creación

##### `updateCompany(id, data)`
- **Descripción**: Actualiza los datos de una empresa
- **Parámetros**:
  - `id`: string - ID de la empresa
  - `data`: Partial<Company> - Datos a actualizar
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la actualización

##### `deleteCompany(id)`
- **Descripción**: Elimina una empresa
- **Parámetros**:
  - `id`: string - ID de la empresa
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la eliminación

##### `updateCompanyVerificationStatus(id, isVerified)`
- **Descripción**: Actualiza el estado de verificación de una empresa
- **Parámetros**:
  - `id`: string - ID de la empresa
  - `isVerified`: boolean - Nuevo estado de verificación
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la actualización

### 2.3 Servicio de Ofertas (`offersService.ts`)

##### `getOffers(filters?)`
- **Descripción**: Obtiene todas las ofertas
- **Parámetros**:
  - `filters?`: Objeto con filtros (category, companyId)
- **Retorna**: Promise<Offer[]>
- **Excepciones**: Lanza error si falla la consulta

##### `getOfferById(id)`
- **Descripción**: Obtiene una oferta por ID
- **Parámetros**:
  - `id`: string - ID de la oferta
- **Retorna**: Promise<Offer | null>
- **Excepciones**: Retorna null si no se encuentra

##### `createOffer(offer)`
- **Descripción**: Crea una nueva oferta
- **Parámetros**:
  - `offer`: Omit<Offer, 'id'> - Datos de la oferta sin ID
- **Retorna**: Promise<string> - ID de la oferta creada
- **Excepciones**: Lanza error si falla la creación

##### `updateOffer(id, data)`
- **Descripción**: Actualiza los datos de una oferta
- **Parámetros**:
  - `id`: string - ID de la oferta
  - `data`: Partial<Offer> - Datos a actualizar
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la actualización

##### `deleteOffer(id)`
- **Descripción**: Elimina una oferta
- **Parámetros**:
  - `id`: string - ID de la oferta
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la eliminación

##### `getOffersByCompany(companyId)`
- **Descripción**: Obtiene ofertas de una empresa específica
- **Parámetros**:
  - `companyId`: string - ID de la empresa
- **Retorna**: Promise<Offer[]>
- **Excepciones**: Lanza error si falla la consulta

### 2.4 Servicio de Reseñas (`reviewsService.ts`)

##### `getReviewsByOffer(offerId)`
- **Descripción**: Obtiene reseñas de una oferta específica
- **Parámetros**:
  - `offerId`: string - ID de la oferta
- **Retorna**: Promise<Review[]>
- **Excepciones**: Lanza error si falla la consulta

##### `getReviewsByCompany(companyId)`
- **Descripción**: Obtiene reseñas de una empresa específica
- **Parámetros**:
  - `companyId`: string - ID de la empresa
- **Retorna**: Promise<Review[]>
- **Excepciones**: Lanza error si falla la consulta

##### `createReview(review)`
- **Descripción**: Crea una nueva reseña
- **Parámetros**:
  - `review`: Omit<Review, 'id'> - Datos de la reseña sin ID
- **Retorna**: Promise<string> - ID de la reseña creada
- **Excepciones**: Lanza error si falla la creación

##### `replyToReview(reviewId, reply)`
- **Descripción**: Responde a una reseña existente
- **Parámetros**:
  - `reviewId`: string - ID de la reseña
  - `reply`: string - Texto de la respuesta
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la actualización

##### `deleteReview(id)`
- **Descripción**: Elimina una reseña
- **Parámetros**:
  - `id`: string - ID de la reseña
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la eliminación

##### `getAllReviews()`
- **Descripción**: Obtiene todas las reseñas (para administradores)
- **Parámetros**: Ninguno
- **Retorna**: Promise<Review[]>
- **Excepciones**: Lanza error si falla la consulta

### 2.5 Servicio de Favoritos (`favoritesService.ts`)

##### `addToFavorites(userId, offerId)`
- **Descripción**: Añade una oferta a los favoritos de un usuario
- **Parámetros**:
  - `userId`: string - ID del usuario
  - `offerId`: string - ID de la oferta
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la operación

##### `removeFromFavorites(userId, offerId)`
- **Descripción**: Elimina una oferta de los favoritos de un usuario
- **Parámetros**:
  - `userId`: string - ID del usuario
  - `offerId`: string - ID de la oferta
- **Retorna**: Promise<void>
- **Excepciones**: Lanza error si falla la operación

##### `getUserFavorites(userId)`
- **Descripción**: Obtiene las ofertas favoritas de un usuario
- **Parámetros**:
  - `userId`: string - ID del usuario
- **Retorna**: Promise<string[]>
- **Excepciones**: Lanza error si falla la consulta

##### `isFavorite(userId, offerId)`
- **Descripción**: Verifica si una oferta está en los favoritos de un usuario
- **Parámetros**:
  - `userId`: string - ID del usuario
  - `offerId`: string - ID de la oferta
- **Retorna**: Promise<boolean>
- **Excepciones**: Lanza error si falla la consulta

##### `getUserFavoriteOffers(userId)`
- **Descripción**: Obtiene todas las ofertas favoritas de un usuario con datos completos
- **Parámetros**:
  - `userId`: string - ID del usuario
- **Retorna**: Promise<Offer[]>
- **Excepciones**: Lanza error si falla la consulta

### 2.6 Servicio de Notificaciones Push (`pushNotificationService.ts`)

##### `requestPermission()`
- **Descripción**: Solicita permiso para enviar notificaciones push
- **Parámetros**: Ninguno
- **Retorna**: Promise<NotificationPermission>
- **Excepciones**: Lanza error si falla la solicitud

##### `getToken(options?)`
- **Descripción**: Obtiene el token de registro para notificaciones push
- **Parámetros**:
  - `options?`: { vapidKey?: string }
- **Retorna**: Promise<string | null>
- **Excepciones**: Lanza error si falla la obtención del token

##### `onMessageReceived(callback)`
- **Descripción**: Escucha mensajes entrantes cuando la app está en primer plano
- **Parámetros**:
  - `callback`: Función que recibe el payload del mensaje
- **Retorna**: Función para desuscribirse
- **Excepciones**: Ninguna

##### `registerServiceWorker(swPath?)`
- **Descripción**: Registra un service worker para manejar notificaciones push
- **Parámetros**:
  - `swPath?`: string - Ruta al archivo de service worker
- **Retorna**: Promise<ServiceWorkerRegistration | null>
- **Excepciones**: Lanza error si falla el registro

## 3. Estructura de Datos

### 3.1 Enumeraciones

#### `Role`
- `ADMIN` = 'admin'
- `COMPANY` = 'company'
- `USER` = 'user'

#### `UserLevel`
- `BRONCE` = 'Bronce'
- `PLATA` = 'Plata'
- `ORO` = 'Oro'

#### `OfferType`
- `'descuento'`
- `'2x1'`
- `'lanzamiento'`
- `'compra-compartida'`

#### `OfferCategory`
- `'Comida'`
- `'Moda'`
- `'Tecnología'`
- `'Servicios'`
- `'Viajes'`
- `'Hogar'`
- `'Todos'`

### 3.2 Interfaces

#### `User`
```ts
interface User {
  id: string;
  name: string;
  email: string;
  level: UserLevel;
  points: number;
  favorites: string[]; // Array of offer IDs
  avatarUrl: string;
  notificationPreferences?: {
    offers: boolean;
    promotions: boolean;
    reminders: boolean;
    tracking: boolean;
  };
}
```

#### `Branch`
```ts
interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  whatsapp: string;
  mapUrl: string;
  openingHours: string;
}
```

#### `Company`
```ts
interface Company {
  id: string;
  name: string;
  logoUrl: string;
  branches: Branch[];
  subscriptionPlan: 'basico' | 'premium';
  isVerified: boolean;
}
```

#### `Offer`
```ts
interface Offer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  imageUrl: string;
  discount: string;
  validUntil?: Date; // For flash offers
  isRecurring: boolean;
  branchId?: string;
  category: OfferCategory;
  offerType: OfferType;
}
```

#### `Review`
```ts
interface Review {
  id: string;
  offerId: string;
  companyId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
}
```

#### `KpiData`
```ts
interface KpiData {
  title: string;
  value: string;
  growth: number;
}
```

## 4. Procesos de Despliegue

### 4.1 Despliegue Web

#### Requisitos Previos
- Node.js v16 o superior
- npm o yarn
- Credenciales de Firebase válidas

#### Pasos para Despliegue

1. **Configuración del Entorno**
   ```bash
   # Clonar el repositorio
   git clone <repository-url>
   cd offertapps
   
   # Instalar dependencias
   npm install
   
   # Configurar variables de entorno
   cp .env.example .env.production
   # Editar .env.production con credenciales reales
   ```

2. **Construcción de la Aplicación**
   ```bash
   # Construir la aplicación para producción
   npm run build
   ```

3. **Despliegue en Plataforma**
   ```bash
   # Opción 1: Firebase Hosting
   npm install -g firebase-tools
   firebase login
   firebase deploy --only hosting
   
   # Opción 2: Vercel
   npm install -g vercel
   vercel --prod
   
   # Opción 3: Netlify
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### 4.2 Despliegue Mobile (Capacitor)

#### Requisitos Previos
- Android Studio (para Android)
- Xcode (para iOS)
- SDK de Android instalado

#### Pasos para Despliegue Android

1. **Generar Build Web**
   ```bash
   npm run build
   ```

2. **Sincronizar con Capacitor**
   ```bash
   npx cap sync android
   ```

3. **Abrir en Android Studio**
   ```bash
   npx cap open android
   ```

4. **Generar APK/Bundle**
   - En Android Studio: Build > Generate Signed Bundle/APK
   - Seleccionar "APK" o "Android App Bundle"
   - Usar keystore válido para producción

#### Pasos para Despliegue iOS

1. **Generar Build Web**
   ```bash
   npm run build
   ```

2. **Sincronizar con Capacitor**
   ```bash
   npx cap sync ios
   ```

3. **Abrir en Xcode**
   ```bash
   npx cap open ios
   ```

4. **Generar IPA**
   - En Xcode: Product > Archive
   - Distribuir a App Store Connect o para pruebas internas

### 4.3 Variables de Entorno

#### Variables Requeridas
- `VITE_FIREBASE_API_KEY` - API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` - Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID` - ID del proyecto
- `VITE_FIREBASE_STORAGE_BUCKET` - Bucket de almacenamiento
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - ID de mensajería
- `VITE_FIREBASE_APP_ID` - ID de la aplicación
- `VITE_FIREBASE_DATABASE_URL` - URL de la base de datos
- `VITE_GEMINI_API_KEY` - Clave API para servicios de IA (opcional)

#### Variables Opcionales
- `NODE_ENV` - Entorno (development, staging, production)
- `VITE_FCM_VAPID_KEY` - Clave VAPID para notificaciones push

### 4.4 Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:mobile": "vite build",
    "preview": "vite preview",
    "sync:android": "npx cap sync android",
    "open:android": "npx cap open android",
    "resources": "npx capacitor-assets generate"
  }
}
```

## 5. Convenciones de Código

### 5.1 Nomenclatura
- Componentes: PascalCase (ej. `UserView`, `OfferCard`)
- Funciones: camelCase (ej. `getUserProfile`, `createOffer`)
- Constantes: UPPER_SNAKE_CASE (ej. `MAX_FILE_SIZE`)
- Tipos: PascalCase (ej. `UserProfile`, `OfferType`)

### 5.2 Estructura de Archivos
- Servicios: `nombreDelServicio.ts`
- Componentes: `NombreDelComponente.tsx`
- Vistas: `NombreDeLaVista.tsx`
- Utilidades: `nombreDeUtilidad.ts`

### 5.3 Comentarios
- JSDoc para funciones públicas
- Comentarios claros para lógica compleja
- Marcadores TODO/FIXME para tareas pendientes

## 6. Consideraciones de Seguridad

### 6.1 Validación de Entradas
- Todos los servicios incluyen validación de entradas
- Sanitización de cadenas para prevenir XSS
- Validación de tipos y formatos

### 6.2 Control de Acceso
- Reglas de seguridad de Firebase implementadas
- Control de acceso basado en roles
- Autenticación requerida para operaciones sensibles

### 6.3 Gestión de Credenciales
- Credenciales almacenadas en variables de entorno
- No hardcodear credenciales en el código
- Rotación regular de claves