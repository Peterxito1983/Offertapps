# Nuevas Funcionalidades para OffertApps

## Descripción General

Este documento describe las nuevas funcionalidades implementadas en la aplicación OffertApps:

1. Recuperación de contraseña
2. Funcionalidad de favoritos para usuarios
3. Sistema de notificaciones push

## 1. Recuperación de Contraseña

### Descripción
Sistema que permite a los usuarios recuperar el acceso a sus cuentas cuando olvidan su contraseña.

### Componentes Implementados

#### Servicio: `passwordResetService.ts`
- `sendPasswordResetEmail()`: Envía correo de recuperación a través de Firebase
- `isEligibleForPasswordReset()`: Valida si un correo es elegible para recuperación
- `getPasswordResetMessage()`: Genera mensajes personalizados para el correo

#### Componente: `PasswordResetForm.tsx`
- Formulario para ingresar el correo electrónico
- Validación en tiempo real
- Feedback visual durante el proceso
- Manejo de errores específico

#### Componente: `PasswordResetHandler.tsx`
- Formulario para ingresar nueva contraseña
- Validación de coincidencia de contraseñas
- Verificación del código de acción de Firebase
- Feedback de éxito/error

### Flujo de Usuario
1. Usuario selecciona "Olvidé mi contraseña"
2. Ingresa su correo electrónico
3. Recibe correo con enlace de recuperación
4. Click en el enlace lleva a la página de restablecimiento
5. Ingresa nueva contraseña y confirma
6. Contraseña se actualiza exitosamente

### Seguridad
- Validación de formato de correo
- Verificación del código de acción de Firebase
- Protección contra solicitudes no válidas
- Mensajes de error específicos sin revelar información sensible

## 2. Funcionalidad de Favoritos para Usuarios

### Descripción
Permite a los usuarios marcar ofertas como favoritas para acceder a ellas fácilmente más tarde.

### Componentes Implementados

#### Servicio: `favoritesService.ts`
- `addToFavorites()`: Añade una oferta a los favoritos de un usuario
- `removeFromFavorites()`: Elimina una oferta de los favoritos
- `getUserFavorites()`: Obtiene la lista de IDs de ofertas favoritas
- `isFavorite()`: Verifica si una oferta está en favoritos
- `getUserFavoriteOffers()`: Obtiene ofertas favoritas con datos completos
- `getFavoriteCount()`: Cuenta cuántos usuarios tienen una oferta como favorita

#### Componente: `FavoriteOffersList.tsx`
- Lista las ofertas favoritas del usuario
- Muestra información completa de cada oferta
- Permite quitar ofertas de favoritos
- Soporte para carga y actualización
- Indicadores visuales de favoritos

### Flujo de Usuario
1. Usuario ve una oferta y la marca como favorita
2. Oferta se añade a su lista de favoritos
3. Usuario puede acceder a sus favoritos desde el menú
4. Puede ver, interactuar o eliminar ofertas favoritas

### Características
- Persistencia en Firebase Realtime Database
- Validación para evitar duplicados
- Integración con el sistema de ofertas existente
- Indicadores visuales claros

## 3. Sistema de Notificaciones Push

### Descripción
Sistema que permite enviar notificaciones push a los usuarios para mantenerlos informados sobre ofertas, promociones y actualizaciones.

### Componentes Implementados

#### Servicio: `pushNotificationService.ts`
- `requestPermission()`: Solicita permiso para enviar notificaciones
- `getToken()`: Obtiene el token de registro para notificaciones
- `onMessageReceived()`: Escucha mensajes entrantes
- `registerServiceWorker()`: Registra el service worker
- `areNotificationsEnabled()`: Verifica estado de notificaciones

#### Componente: `NotificationPreferences.tsx`
- Interfaz para gestionar preferencias de notificaciones
- Controles para diferentes tipos de notificaciones
- Prueba de notificación
- Validación de soporte del navegador

#### Archivo: `firebase-messaging-sw.ts`
- Service worker para manejar notificaciones en segundo plano
- Manejo de clics en notificaciones
- Integración con Firebase Cloud Messaging

### Flujo de Usuario
1. Usuario activa las notificaciones desde preferencias
2. Se solicita permiso al navegador
3. Se registra el service worker
4. Se obtiene el token de notificación
5. Usuario puede recibir notificaciones push

### Características
- Soporte para diferentes tipos de notificaciones
- Preferencias personalizables por usuario
- Integración con Firebase Messaging
- Manejo de notificaciones en segundo plano

## Integración con la Aplicación Existente

### Actualizaciones de Tipos
- Se añadió `notificationPreferences` al tipo `User` en `types.ts`
- Se actualizó la estructura de datos para incluir favoritos y preferencias

### Seguridad
- Todas las nuevas funcionalidades respetan las reglas de seguridad de Firebase
- Validación de entradas en todos los servicios
- Manejo seguro de tokens y credenciales

## Próximos Pasos

### Recuperación de Contraseña
- Implementar personalización del correo de recuperación
- Añadir límites de intentos para prevenir abusos
- Integrar con sistema de logging

### Favoritos
- Añadir opción de compartir favoritos
- Implementar recomendaciones basadas en favoritos
- Añadir categorización de favoritos

### Notificaciones Push
- Implementar backend para envío de notificaciones programadas
- Añadir soporte para notificaciones segmentadas
- Integrar con analítica para medir efectividad

## Consideraciones de Implementación

### Frontend
- Todos los componentes siguen las mejores prácticas de Ionic
- Diseño responsive y accesible
- Integración con los estilos existentes de la aplicación

### Backend
- Los servicios se integran con Firebase como backend existente
- Uso de las mismas reglas de seguridad
- Patrones consistentes con el código existente

### Rendimiento
- Implementación eficiente para minimizar impacto en rendimiento
- Carga perezosa de componentes cuando sea posible
- Manejo adecuado de estados de carga y error