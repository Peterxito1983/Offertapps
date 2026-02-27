# Preparación de Base de Datos para Producción - OffertApps

## Descripción General

Este documento describe los pasos necesarios para preparar la base de datos de Firebase para producción, incluyendo migración de datos, configuración de backups y aseguramiento de la integridad de los datos.

## 1. Configuración de Reglas de Seguridad para Producción

### 1.1 Reglas de Firebase Realtime Database (`database.rules.json`)

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.uid == $uid || root.child('users/'+auth.uid+'/role').val() == 'admin')",
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users/'+auth.uid+'/role').val() == 'admin')",
        ".write": "auth != null && (auth.uid == $uid || root.child('users/'+auth.uid+'/role').val() == 'admin')"
      }
    },
    "companies": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'",
      "$companyId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/companyId').val() == $companyId)"
      }
    },
    "offers": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/role').val() == 'company')",
      "$offerId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/companyId').val() == data.child('companyId').val())"
      }
    },
    "reviews": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || newData.child('userId').val() == auth.uid)",
      "$reviewId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users/'+auth.uid+'/role').val() == 'admin' || root.child('users/'+auth.uid+'/uid').val() == data.child('userId').val())"
      }
    },
    "logs": {
      ".read": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'",
      ".write": "auth != null && root.child('users/'+auth.uid+'/role').val() == 'admin'"
    }
  }
}
```

### 1.2 Despliegue de Reglas de Seguridad

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Seleccionar proyecto
firebase use offertapps-prod

# Desplegar reglas de seguridad
firebase deploy --only database
```

## 2. Migración de Datos de Desarrollo a Producción

### 2.1 Script de Migración de Datos

```javascript
// migrate-data.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://offertapps-prod-default-rtdb.firebaseio.com/'
});

const db = admin.database();

async function migrateData() {
  try {
    console.log('Iniciando migración de datos...');
    
    // Referencias a las bases de datos
    const devDb = admin.database().ref(); // Base de datos de desarrollo
    const prodDb = admin.database().ref(); // Base de datos de producción
    
    // Migrar usuarios (sin contraseñas ni información sensible)
    const usersSnapshot = await devDb.child('users').once('value');
    const usersData = usersSnapshot.val();
    
    if (usersData) {
      // Filtrar información sensible antes de migrar
      const sanitizedUsers = {};
      for (const [uid, userData] of Object.entries(usersData)) {
        sanitizedUsers[uid] = {
          ...userData,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          createdAt: userData.createdAt,
          // No migrar información sensible como tokens
        };
      }
      
      await prodDb.child('users').set(sanitizedUsers);
      console.log('Usuarios migrados exitosamente');
    }
    
    // Migrar empresas
    const companiesSnapshot = await devDb.child('companies').once('value');
    const companiesData = companiesSnapshot.val();
    
    if (companiesData) {
      await prodDb.child('companies').set(companiesData);
      console.log('Empresas migradas exitosamente');
    }
    
    // Migrar ofertas
    const offersSnapshot = await devDb.child('offers').once('value');
    const offersData = offersSnapshot.val();
    
    if (offersData) {
      await prodDb.child('offers').set(offersData);
      console.log('Ofertas migradas exitosamente');
    }
    
    // Migrar reseñas
    const reviewsSnapshot = await devDb.child('reviews').once('value');
    const reviewsData = reviewsSnapshot.val();
    
    if (reviewsData) {
      await prodDb.child('reviews').set(reviewsData);
      console.log('Reseñas migradas exitosamente');
    }
    
    console.log('Migración de datos completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración
migrateData()
  .then(() => {
    console.log('Proceso de migración completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en la migración:', error);
    process.exit(1);
  });
```

### 2.2 Procedimiento de Migración

1. **Preparación**:
   - Crear backup de la base de datos de producción
   - Verificar que todos los servicios estén detenidos
   - Asegurar credenciales de ambos entornos

2. **Ejecución de migración**:
   ```bash
   # Ejecutar script de migración
   node migrate-data.js
   ```

3. **Verificación**:
   - Confirmar que los datos se hayan migrado correctamente
   - Verificar integridad de relaciones entre entidades
   - Probar funcionalidades críticas

4. **Post-migración**:
   - Actualizar índices si es necesario
   - Verificar reglas de seguridad
   - Reanudar servicios

## 3. Configuración de Backups Regulares

### 3.1 Script de Backup Automático

```javascript
// backup-script.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://offertapps-prod-default-rtdb.firebaseio.com/'
});

const db = admin.database();

async function createBackup() {
  try {
    console.log('Iniciando backup de la base de datos...');
    
    // Obtener todos los datos
    const snapshot = await db.ref().once('value');
    const data = snapshot.val();
    
    // Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.json`;
    const filePath = path.join(backupDir, fileName);
    
    // Guardar datos en archivo
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Backup completado: ${filePath}`);
    
    // Opcional: Eliminar backups antiguos (mayores a 30 días)
    await cleanupOldBackups(backupDir, 30);
    
    return filePath;
  } catch (error) {
    console.error('Error creando backup:', error);
    throw error;
  }
}

async function cleanupOldBackups(backupDir, daysToKeep) {
  const files = fs.readdirSync(backupDir);
  const now = new Date();
  
  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stat = fs.statSync(filePath);
    const fileDate = new Date(stat.birthtime);
    const diffTime = Math.abs(now - fileDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > daysToKeep) {
      fs.unlinkSync(filePath);
      console.log(`Backup antiguo eliminado: ${filePath}`);
    }
  }
}

// Programar backup automático (opcional)
function scheduleBackups() {
  // Ejecutar backup diario a las 2 AM
  const cron = require('node-cron');
  cron.schedule('0 2 * * *', async () => {
    console.log('Ejecutando backup programado...');
    try {
      await createBackup();
    } catch (error) {
      console.error('Error en backup programado:', error);
    }
  });
}

// Ejecutar backup inmediato si se llama directamente
if (require.main === module) {
  createBackup()
    .then(() => {
      console.log('Backup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en backup:', error);
      process.exit(1);
    });
}

module.exports = { createBackup, cleanupOldBackups, scheduleBackups };
```

### 3.2 Configuración de Cron Job para Backups

```bash
# Ejemplo de crontab para ejecutar backup diario
# Editar crontab
crontab -e

# Agregar línea para ejecutar backup diario a las 2 AM
0 2 * * * /usr/bin/node /path/to/your/app/backup-script.js >> /path/to/your/app/logs/backup.log 2>&1
```

### 3.3 Almacenamiento de Backups en Cloud Storage

```javascript
// storage-backup.js
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://offertapps-prod-default-rtdb.firebaseio.com/'
});

// Inicializar Google Cloud Storage
const storage = new Storage({ keyFilename: './serviceAccountKey.json' });
const bucketName = 'offertapps-backups';
const bucket = storage.bucket(bucketName);

async function uploadBackupToStorage(localFilePath) {
  try {
    const fileName = `backups/${path.basename(localFilePath)}`;
    
    await bucket.upload(localFilePath, {
      destination: fileName,
      metadata: {
        metadata: {
          backupDate: new Date().toISOString(),
          environment: 'production'
        }
      }
    });
    
    console.log(`Backup subido a Cloud Storage: gs://${bucketName}/${fileName}`);
  } catch (error) {
    console.error('Error subiendo backup a Cloud Storage:', error);
    throw error;
  }
}

// Función para restaurar desde backup en Cloud Storage
async function restoreFromStorage(backupFileName) {
  try {
    const downloadPath = `/tmp/${backupFileName}`;
    const file = bucket.file(backupFileName);
    
    await file.download({ destination: downloadPath });
    console.log(`Backup descargado: ${downloadPath}`);
    
    // Aquí iría la lógica para importar los datos a la base de datos
    // IMPORTANTE: Esto debe hacerse con precaución en producción
    
    return downloadPath;
  } catch (error) {
    console.error('Error descargando backup desde Cloud Storage:', error);
    throw error;
  }
}
```

## 4. Aseguramiento de la Integridad de los Datos

### 4.1 Validación de Estructura de Datos

```typescript
// src/utils/dataValidation.ts

// Interfaz para validación de datos
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Validar estructura de usuario
export function validateUserStructure(userData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!userData.email) {
    errors.push('Email es requerido');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Email no tiene formato válido');
  }

  if (!userData.displayName) {
    warnings.push('Nombre de usuario no proporcionado');
  }

  if (!userData.role) {
    errors.push('Rol es requerido');
  } else if (!['user', 'company', 'admin'].includes(userData.role)) {
    errors.push('Rol no válido');
  }

  if (!userData.createdAt) {
    warnings.push('Fecha de creación no proporcionada');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Validar estructura de empresa
export function validateCompanyStructure(companyData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!companyData.name) {
    errors.push('Nombre de empresa es requerido');
  }

  if (!companyData.subscriptionPlan) {
    errors.push('Plan de suscripción es requerido');
  } else if (!['basico', 'premium'].includes(companyData.subscriptionPlan)) {
    errors.push('Plan de suscripción no válido');
  }

  if (companyData.branches && !Array.isArray(companyData.branches)) {
    errors.push('Las sucursales deben ser un array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Validar estructura de oferta
export function validateOfferStructure(offerData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!offerData.title) {
    errors.push('Título de oferta es requerido');
  }

  if (!offerData.companyId) {
    errors.push('ID de empresa es requerido');
  }

  if (!offerData.category) {
    errors.push('Categoría es requerida');
  }

  if (!offerData.offerType) {
    errors.push('Tipo de oferta es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Validar estructura de reseña
export function validateReviewStructure(reviewData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!reviewData.offerId) {
    errors.push('ID de oferta es requerido');
  }

  if (!reviewData.userId) {
    errors.push('ID de usuario es requerido');
  }

  if (!reviewData.rating) {
    errors.push('Calificación es requerida');
  } else if (reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Calificación debe estar entre 1 y 5');
  }

  if (!reviewData.comment) {
    warnings.push('Comentario no proporcionado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Función para validar datos antes de guardar
export function validateDataBeforeSave(path: string, data: any): ValidationResult {
  switch (path) {
    case 'users':
      return validateUserStructure(data);
    case 'companies':
      return validateCompanyStructure(data);
    case 'offers':
      return validateOfferStructure(data);
    case 'reviews':
      return validateReviewStructure(data);
    default:
      return { isValid: true, errors: [] };
  }
}
```

### 4.2 Script de Verificación de Integridad

```javascript
// integrity-check.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { 
  validateUserStructure, 
  validateCompanyStructure, 
  validateOfferStructure, 
  validateReviewStructure 
} = require('./dataValidation');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://offertapps-prod-default-rtdb.firebaseio.com/'
});

const db = admin.database();

async function runIntegrityCheck() {
  try {
    console.log('Iniciando verificación de integridad de datos...');
    
    let totalIssues = 0;
    const issues = {
      users: { errors: [], warnings: [] },
      companies: { errors: [], warnings: [] },
      offers: { errors: [], warnings: [] },
      reviews: { errors: [], warnings: [] }
    };
    
    // Verificar usuarios
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    for (const [uid, userData] of Object.entries(users)) {
      const validation = validateUserStructure(userData);
      if (!validation.isValid) {
        issues.users.errors.push({ uid, errors: validation.errors });
        totalIssues += validation.errors.length;
      }
      if (validation.warnings.length > 0) {
        issues.users.warnings.push({ uid, warnings: validation.warnings });
      }
    }
    
    // Verificar empresas
    const companiesSnapshot = await db.ref('companies').once('value');
    const companies = companiesSnapshot.val() || {};
    
    for (const [companyId, companyData] of Object.entries(companies)) {
      const validation = validateCompanyStructure(companyData);
      if (!validation.isValid) {
        issues.companies.errors.push({ companyId, errors: validation.errors });
        totalIssues += validation.errors.length;
      }
      if (validation.warnings.length > 0) {
        issues.companies.warnings.push({ companyId, warnings: validation.warnings });
      }
    }
    
    // Verificar ofertas
    const offersSnapshot = await db.ref('offers').once('value');
    const offers = offersSnapshot.val() || {};
    
    for (const [offerId, offerData] of Object.entries(offers)) {
      const validation = validateOfferStructure(offerData);
      if (!validation.isValid) {
        issues.offers.errors.push({ offerId, errors: validation.errors });
        totalIssues += validation.errors.length;
      }
      if (validation.warnings.length > 0) {
        issues.offers.warnings.push({ offerId, warnings: validation.warnings });
      }
    }
    
    // Verificar reseñas
    const reviewsSnapshot = await db.ref('reviews').once('value');
    const reviews = reviewsSnapshot.val() || {};
    
    for (const [reviewId, reviewData] of Object.entries(reviews)) {
      const validation = validateReviewStructure(reviewData);
      if (!validation.isValid) {
        issues.reviews.errors.push({ reviewId, errors: validation.errors });
        totalIssues += validation.errors.length;
      }
      if (validation.warnings.length > 0) {
        issues.reviews.warnings.push({ reviewId, warnings: validation.warnings });
      }
    }
    
    // Reportar resultados
    console.log(`\nVerificación de integridad completada:`);
    console.log(`Total de problemas encontrados: ${totalIssues}`);
    
    if (totalIssues > 0) {
      console.log('\nDetalles:');
      for (const [collection, issueData] of Object.entries(issues)) {
        if (issueData.errors.length > 0 || issueData.warnings.length > 0) {
          console.log(`\n${collection.toUpperCase()}:`);
          if (issueData.errors.length > 0) {
            console.log(`  Errores: ${issueData.errors.length}`);
          }
          if (issueData.warnings.length > 0) {
            console.log(`  Advertencias: ${issueData.warnings.length}`);
          }
        }
      }
    } else {
      console.log('✓ No se encontraron problemas de integridad');
    }
    
    return { totalIssues, issues };
  } catch (error) {
    console.error('Error durante la verificación de integridad:', error);
    throw error;
  }
}

// Ejecutar verificación
if (require.main === module) {
  runIntegrityCheck()
    .then((result) => {
      console.log('\nVerificación de integridad completada');
      process.exit(result.totalIssues > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Error en la verificación:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrityCheck };
```

### 4.3 Configuración de Índices de Base de Datos

```json
// firebase-indexes.json
{
  "indexes": [
    {
      "name": "offers_category_index",
      "path": "offers",
      "queries": [
        {
          "fields": [
            {
              "fieldPath": "category",
              "order": "ASCENDING"
            }
          ]
        }
      ]
    },
    {
      "name": "offers_company_index",
      "path": "offers",
      "queries": [
        {
          "fields": [
            {
              "fieldPath": "companyId",
              "order": "ASCENDING"
            }
          ]
        }
      ]
    },
    {
      "name": "reviews_offer_index",
      "path": "reviews",
      "queries": [
        {
          "fields": [
            {
              "fieldPath": "offerId",
              "order": "ASCENDING"
            }
          ]
        }
      ]
    },
    {
      "name": "reviews_company_index",
      "path": "reviews",
      "queries": [
        {
          "fields": [
            {
              "fieldPath": "companyId",
              "order": "ASCENDING"
            }
          ]
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 5. Monitoreo y Alertas de Base de Datos

### 5.1 Configuración de Alertas

```typescript
// src/services/databaseMonitoring.ts

import { get, ref, onValue } from 'firebase/database';
import { db } from '../config';
import { loggingSystem } from '../utils/loggingUtils';

// Monitorear tamaño de la base de datos
export function monitorDatabaseSize() {
  const dbRef = ref(db);
  
  onValue(dbRef, (snapshot) => {
    const dataSize = JSON.stringify(snapshot.val()).length;
    const sizeInMB = (dataSize / (1024 * 1024)).toFixed(2);
    
    // Alertar si la base de datos excede cierto tamaño
    if (parseFloat(sizeInMB) > 100) { // 100 MB
      loggingSystem.warn(`La base de datos ha excedido 100MB: ${sizeInMB}MB`, {
        sizeInMB,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Monitorear operaciones lentas
export async function monitorSlowOperations() {
  const thresholds = {
    getUsers: 5000, // 5 segundos
    getOffers: 5000,
    getReviews: 5000
  };

  // Ejemplo para monitorear operación de obtener ofertas
  const start = Date.now();
  try {
    const offersRef = ref(db, 'offers');
    const snapshot = await get(offersRef);
    const duration = Date.now() - start;
    
    if (duration > thresholds.getOffers) {
      loggingSystem.logPerformanceIssue(`Operación getOffers lenta: ${duration}ms`, {
        duration,
        expectedThreshold: thresholds.getOffers
      });
    }
  } catch (error) {
    loggingSystem.captureError(error, { operation: 'getOffers', duration: Date.now() - start });
  }
}

// Verificar integridad periódicamente
export function scheduleIntegrityChecks() {
  // Verificar integridad cada 24 horas
  setInterval(async () => {
    try {
      await runIntegrityCheck();
    } catch (error) {
      loggingSystem.captureError(error, { operation: 'integrityCheck' });
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}
```

## 6. Procedimientos de Recuperación

### 6.1 Plan de Recuperación de Desastres

1. **Identificación del problema**:
   - Determinar la naturaleza del problema (pérdida de datos, corrupción, etc.)
   - Evaluar el alcance del impacto

2. **Aislamiento**:
   - Detener servicios que puedan causar más daño
   - Bloquear acceso de escritura si es necesario

3. **Restauración**:
   - Seleccionar el backup más reciente antes del incidente
   - Restaurar datos con procedimiento validado
   - Verificar integridad después de la restauración

4. **Verificación**:
   - Confirmar que todos los datos estén intactos
   - Probar funcionalidades críticas
   - Verificar reglas de seguridad

5. **Levantamiento**:
   - Reanudar servicios
   - Monitorear sistema por 24-48 horas
   - Documentar el incidente y lecciones aprendidas

## 7. Buenas Prácticas

1. **Backups regulares**: Programar backups automáticos diarios
2. **Pruebas de restauración**: Probar periódicamente la restauración desde backups
3. **Monitoreo continuo**: Implementar monitoreo de salud de la base de datos
4. **Validación de datos**: Validar estructura de datos antes de guardar
5. **Reglas de seguridad**: Mantener reglas de seguridad actualizadas
6. **Documentación**: Documentar todos los procedimientos de base de datos
7. **Acceso restringido**: Limitar acceso a la base de datos solo a personal autorizado
8. **Auditoría**: Mantener registros de cambios importantes en la base de datos