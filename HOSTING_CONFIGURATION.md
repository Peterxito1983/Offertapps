# Configuración de Hosting para OffertApps

## Descripción General

Este documento describe la configuración de hosting para la aplicación OffertApps en diferentes plataformas, incluyendo dominios personalizados e implementación de HTTPS.

## 1. Configuración en Firebase Hosting

### 1.1 Archivo de Configuración (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=300"
          }
        ]
      },
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/old-path",
        "destination": "/new-path",
        "type": 301
      }
    ]
  }
}
```

### 1.2 Comandos de Despliegue

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (si es nuevo)
firebase init hosting

# Construir la aplicación
npm run build

# Desplegar
firebase deploy --only hosting

# Desplegar a un sitio específico
firebase deploy --only hosting:site-name
```

### 1.3 Configuración de Dominio Personalizado

1. **Agregar dominio personalizado en Firebase Console**:
   - Ir a Firebase Console > Hosting
   - Hacer clic en "Agregar dominio personalizado"
   - Ingresar el dominio (ej. `app.offertapps.com`)
   - Firebase proporcionará registros DNS a configurar

2. **Configurar DNS en el proveedor de dominio**:
   - Añadir registros CNAME o A según las instrucciones de Firebase
   - Ejemplo para CNAME:
     ```
     app.offertapps.com    CNAME    ghst-pae27c7sx7v27ghst-1-random-letters.a.run.app
     ```

3. **Verificar dominio**:
   - Firebase verificará automáticamente el dominio
   - Puede tomar hasta 24 horas para que los cambios DNS se propaguen

### 1.4 Implementación de HTTPS

- **HTTPS automático**: Firebase Hosting proporciona HTTPS gratuito con certificados SSL válidos
- **Redirección automática**: Todos los dominios personalizados se redirigen automáticamente a HTTPS
- **Certificados gestionados**: Firebase gestiona la renovación automática de certificados

## 2. Configuración en Vercel

### 2.1 Archivo de Configuración (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2.2 Comandos de Despliegue

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Construir la aplicación
npm run build

# Desplegar
vercel --prod

# Desplegar con configuración específica
vercel --prod --local-config=vercel.json
```

### 2.3 Configuración de Dominio Personalizado

1. **Agregar dominio en Vercel Dashboard**:
   - Ir a Project Settings > Domains
   - Añadir dominio personalizado (ej. `app.offertapps.com`)

2. **Configurar DNS**:
   - Vercel proporcionará registros DNS a configurar
   - Puede ser un registro A o CNAME dependiendo de la configuración

3. **Verificar dominio**:
   - Vercel verificará automáticamente el dominio
   - Se puede forzar la verificación si es necesario

### 2.4 Implementación de HTTPS

- **HTTPS automático**: Vercel proporciona HTTPS gratuito con certificados Let's Encrypt
- **HTTP a HTTPS**: Redirección automática de HTTP a HTTPS
- **HSTS**: Soporte para HTTP Strict Transport Security

## 3. Configuración en Netlify

### 3.1 Archivo de Configuración (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[context.production.environment]
  NODE_VERSION = "20"

[context.deploy-preview]
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

### 3.2 Comandos de Despliegue

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Iniciar sesión
netlify login

# Construir la aplicación
npm run build

# Desplegar
netlify deploy --prod

# Desplegar directorio específico
netlify deploy --prod --dir=dist
```

### 3.3 Configuración de Dominio Personalizado

1. **Agregar dominio en Netlify Dashboard**:
   - Ir a Domain Settings
   - Añadir dominio personalizado
   - Netlify proporcionará instrucciones para DNS

2. **Configurar DNS**:
   - Añadir registros DNS según las instrucciones de Netlify
   - Puede ser un registro A o CNAME

3. **Verificar dominio**:
   - Netlify verificará automáticamente el dominio
   - Se puede forzar la verificación si es necesario

### 3.4 Implementación de HTTPS

- **HTTPS automático**: Netlify proporciona HTTPS gratuito con certificados Let's Encrypt
- **Redirección automática**: HTTP se redirige automáticamente a HTTPS
- **Configuración de seguridad**: Soporte para HSTS y otros headers de seguridad

## 4. Configuración de Dominios y Subdominios

### 4.1 Recomendaciones de Nomenclatura

- **Producción**: `app.offertapps.com` o `www.offertapps.com`
- **Staging**: `staging.offertapps.com`
- **Desarrollo**: `dev.offertapps.com`
- **Pruebas**: `test.offertapps.com`

### 4.2 Configuración de DNS

```
# Dominio principal
offertapps.com    A    [IP_DEL_HOSTING]

# Subdominios
app.offertapps.com    CNAME    [HOSTING_PROVIDER_URL]
staging.offertapps.com    CNAME    [STAGING_HOSTING_URL]
api.offertapps.com    CNAME    [API_HOSTING_URL]
```

### 4.3 Verificación de Configuración

```bash
# Verificar registros DNS
nslookup app.offertapps.com
dig app.offertapps.com

# Verificar HTTPS
openssl s_client -connect app.offertapps.com:443
```

## 5. Configuración de Seguridad

### 5.1 Headers de Seguridad Comunes

```javascript
// Headers recomendados para firebase.json
{
  "headers": [
    {
      "source": "/**",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;"
        }
      ]
    }
  ]
}
```

### 5.2 Configuración de CORS

```javascript
// Para Firebase Functions o API personalizada
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## 6. Monitoreo y Rendimiento

### 6.1 Configuración de Google Analytics

```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 6.2 Implementación de Web Vitals

```javascript
// En main.tsx o archivo de inicialización
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Enviar métricas a tu servicio de análisis
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 7. Procedimientos de Despliegue

### 7.1 Despliegue a Producción

1. **Verificar estado de la rama main**
   - Asegurarse de que todas las pruebas pasen
   - Confirmar que el código esté completamente probado

2. **Construir la aplicación**
   ```bash
   npm run build
   ```

3. **Desplegar**
   - Usar el método de despliegue correspondiente (Firebase, Vercel, Netlify)
   - Verificar que el despliegue haya sido exitoso

4. **Verificar despliegue**
   - Visitar el sitio para confirmar que funciona correctamente
   - Verificar que todos los recursos se carguen correctamente
   - Probar funcionalidades críticas

5. **Notificar despliegue**
   - Informar al equipo sobre el despliegue
   - Registrar el despliegue en el sistema de seguimiento

### 7.2 Rollback Procedure

Si se detecta un problema después del despliegue:

1. **Identificar el problema**
   - Revisar logs y métricas
   - Confirmar que el problema está relacionado con el último despliegue

2. **Revertir al último estado estable**
   - Usar la versión anterior del código
   - Desplegar la versión anterior

3. **Verificar el rollback**
   - Confirmar que la aplicación funcione correctamente
   - Verificar que el problema haya sido resuelto

4. **Investigar y resolver**
   - Analizar la causa raíz del problema
   - Implementar la solución adecuada
   - Probar exhaustivamente antes de nuevo despliegue

## 8. Buenas Prácticas

1. **Dominios descriptivos**: Usar nombres de dominio que indiquen claramente el entorno
2. **HTTPS obligatorio**: Asegurar que todos los dominios usen HTTPS
3. **Headers de seguridad**: Implementar headers de seguridad estándar
4. **Caché estratégica**: Configurar caché para mejorar el rendimiento
5. **Monitoreo continuo**: Implementar herramientas de monitoreo y alertas
6. **Documentación actualizada**: Mantener la documentación de hosting actualizada
7. **Pruebas de despliegue**: Verificar cada despliegue con pruebas automatizadas
8. **Plan de contingencia**: Tener un plan de rollback en caso de fallos