# Configuración de Entorno para OffertApps

## Descripción General

Este documento describe cómo configurar los diferentes entornos para la aplicación OffertApps.

## Tipos de Entornos

### 1. Desarrollo (.env.local)
- Usado durante el desarrollo local
- Contiene credenciales de Firebase de desarrollo
- No debe ser compartido ni subido al repositorio

### 2. Staging (.env.staging)
- Usado para pruebas previas a producción
- Contiene credenciales de un entorno de pruebas
- Similar al entorno de producción pero aislado

### 3. Producción (.env.production)
- Usado en el entorno de producción real
- Contiene credenciales de producción
- Máxima seguridad y supervisión

## Variables de Entorno Requeridas

### Firebase
- `VITE_FIREBASE_API_KEY`: Clave API de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID`: ID del proyecto
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket de almacenamiento
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID de remitente de mensajería
- `VITE_FIREBASE_APP_ID`: ID de la aplicación
- `VITE_FIREBASE_MEASUREMENT_ID`: ID de medición (opcional)
- `VITE_FIREBASE_DATABASE_URL`: URL de la base de datos

### Otros
- `VITE_GEMINI_API_KEY`: Clave API para servicios de IA
- `NODE_ENV`: Indica el entorno (development, staging, production)

## Configuración del Servidor

### Para Despliegue en Producción

1. Asegúrese de tener las credenciales correctas en `.env.production`
2. Configure su servidor para que cargue las variables de entorno apropiadas
3. Verifique que las variables estén disponibles en tiempo de compilación

### Configuración en Vercel/Netlify/Firebase Hosting

Para Vercel:
```bash
# Durante el proceso de despliegue
Environment Variables:
NODE_ENV = production
VITE_FIREBASE_API_KEY = [su_clave_aqui]
# ... otras variables
```

Para Netlify:
```bash
# En la configuración del sitio
Build Environment Variables:
NODE_ENV = production
VITE_FIREBASE_API_KEY = [su_clave_aqui]
# ... otras variables
```

## Buenas Prácticas

1. **Nunca** commitee archivos `.env` al repositorio
2. Use archivos `.env.example` para documentar variables requeridas
3. Revise periódicamente las credenciales y rote las claves según sea necesario
4. Use diferentes proyectos de Firebase para cada entorno
5. Monitoree el uso de las APIs y configure alertas según sea necesario

## Procedimiento de Despliegue

1. Antes de desplegar a producción:
   - Verifique que todas las variables de entorno estén configuradas
   - Pruebe la aplicación en el entorno de staging
   - Confirme que las reglas de seguridad de Firebase estén actualizadas

2. Durante el despliegue:
   - Asegúrese de que se estén usando las variables correctas
   - Verifique que la aplicación se inicie correctamente

3. Después del despliegue:
   - Pruebe las funcionalidades críticas
   - Verifique que la autenticación funcione correctamente
   - Confirme que las operaciones CRUD con la base de datos sean exitosas