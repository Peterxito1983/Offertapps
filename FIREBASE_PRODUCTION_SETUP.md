# Configuración de Firebase para Producción

## Descripción General

Este documento describe cómo configurar un proyecto de Firebase separado para producción, con dominios autorizados y límites de uso adecuados.

## Pasos para Crear un Proyecto de Firebase para Producción

### 1. Crear el Proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Hacer clic en "Agregar proyecto"
3. Elegir un nombre para el proyecto de producción (por ejemplo, `offertapps-prod`)
4. Habilitar Google Analytics si es deseado
5. Seleccionar una cuenta de Analytics
6. Hacer clic en "Crear proyecto"

### 2. Configurar la Autenticación

1. En la consola de Firebase, ir a "Authentication"
2. Habilitar los métodos de autenticación necesarios (usualmente "Email/Password")
3. Agregar dominios autorizados en la sección "Dominios autorizados":
   - Tu dominio de producción (por ejemplo, `offertapps.com`)
   - `localhost` para desarrollo local
   - Otros dominios de pruebas si aplica

### 3. Configurar Realtime Database

1. Ir a "Realtime Database" en la consola de Firebase
2. Crear una base de datos en modo producción
3. Establecer la ubicación adecuada para tu audiencia
4. Copiar las reglas de seguridad desde `database.rules.json`:
   ```javascript
   {
     "rules": {
       "users": {
         ".read": "auth != null",
         ".write": "auth != null && (auth.uid == $uid || root.child('users/'+auth.uid+'/role').val() == 'admin')",
         "$uid": {
           ".write": "auth != null && (auth.uid == $uid || root.child('users/'+auth.uid+'/role').val() == 'admin')"
         }
       },
       "companies": {
         ".read": "auth != null",
         ".write": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'",
         "$companyId": {
           ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/companyId').val() == $companyId)"
         }
       },
       "offers": {
         ".read": "auth != null",
         ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/role').val() == 'company')",
         "$offerId": {
           ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/companyId').val() == data.child('companyId').val())"
         }
       },
       "reviews": {
         ".read": "auth != null",
         ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || newData.child('userId').val() == auth.uid)",
         "$reviewId": {
           ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/uid').val() == data.child('userId').val())"
         }
       }
     }
   }
   ```

### 4. Configurar Storage (si se usa)

1. Ir a "Storage" en la consola de Firebase
2. Crear un bucket de almacenamiento
3. Configurar reglas de seguridad:
   ```
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 5. Configurar Límites de Uso y Facturación

#### Límites Recomendados:

1. **Authentication**:
   - Verificar el plan Spark (gratuito) o Blaze (pago) según volumen
   - Para producción con muchos usuarios, se recomienda Blaze

2. **Realtime Database**:
   - Plan Gratuito: 10GB almacenamiento, 10GB transferencia/día
   - Para producción con muchos usuarios, considerar el plan pago

3. **Storage**:
   - Plan Gratuito: 5GB almacenamiento, 1GB transferencia/día
   - Para producción con muchas imágenes, considerar el plan pago

4. **Configurar alertas de uso**:
   - Ir a Google Cloud Console
   - Configurar alertas de presupuesto para recibir notificaciones cuando se alcance cierto porcentaje del límite

### 6. Obtener las Credenciales para Producción

1. Ir a "Project Settings" en Firebase Console
2. Encontrar la sección "Your apps"
3. Agregar una nueva aplicación web si es necesario
4. Copiar las credenciales:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 7. Configurar Variables de Entorno

Actualizar el archivo `.env.production` con las credenciales del proyecto de producción:

```
VITE_FIREBASE_API_KEY=[tu_api_key_de_produccion]
VITE_FIREBASE_AUTH_DOMAIN=[tu_dominio_de_autenticacion].firebaseapp.com
VITE_FIREBASE_PROJECT_ID=[tu_id_de_proyecto]
VITE_FIREBASE_STORAGE_BUCKET=[tu_bucket].appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=[tu_mensajeria_sender_id]
VITE_FIREBASE_APP_ID=[tu_app_id]
VITE_FIREBASE_DATABASE_URL=https://[tu_id_de_proyecto]-default-rtdb.[region].firebasedatabase.app/
```

### 8. Probar la Configuración

1. Asegurarse de que las variables de entorno estén correctamente configuradas
2. Probar la aplicación con el entorno de producción
3. Verificar que todas las funcionalidades críticas funcionen correctamente
4. Confirmar que las reglas de seguridad se apliquen correctamente

## Consideraciones de Seguridad Adicionales

1. **Rotación de claves**: Programar la rotación periódica de claves de API
2. **Monitoreo**: Configurar monitoreo de actividad inusual
3. **Copia de seguridad**: Establecer un proceso regular de copia de seguridad de la base de datos
4. **Acceso**: Limitar quién tiene acceso al proyecto de Firebase de producción

## Documentación de Apoyo

- [Documentación oficial de Firebase](https://firebase.google.com/docs)
- [Guía de seguridad de Firebase](https://firebase.google.com/docs/rules)
- [Límites de uso de Firebase](https://firebase.google.com/pricing)