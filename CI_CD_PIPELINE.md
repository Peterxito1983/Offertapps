# Pipeline de CI/CD para OffertApps

## Descripción General

Este documento describe el pipeline de integración y entrega continua para la aplicación OffertApps, incluyendo pruebas automáticas y despliegue automatizado.

## 1. Configuración de GitHub Actions

### Archivo: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test -- --coverage --ci --reporters=default --reporters=jest-junit
    
    - name: Upload coverage reports to Codecov
      uses: codecov/codecov-action@v3
      env:
        CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        VITE_FIREBASE_DATABASE_URL: ${{ secrets.FIREBASE_DATABASE_URL }}

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run audit
      run: npm audit --audit-level moderate

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/develop'
    
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: staging
        VITE_FIREBASE_API_KEY: ${{ secrets.STAGING_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.STAGING_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.STAGING_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.STAGING_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.STAGING_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.STAGING_FIREBASE_APP_ID }}
        VITE_FIREBASE_DATABASE_URL: ${{ secrets.STAGING_FIREBASE_DATABASE_URL }}
    
    - name: Deploy to Firebase Hosting (Staging)
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting --project=offertapps-staging
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        VITE_FIREBASE_API_KEY: ${{ secrets.PROD_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.PROD_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.PROD_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.PROD_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.PROD_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.PROD_FIREBASE_APP_ID }}
        VITE_FIREBASE_DATABASE_URL: ${{ secrets.PROD_FIREBASE_DATABASE_URL }}
    
    - name: Deploy to Firebase Hosting (Production)
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting --project=offertapps-prod
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Run smoke tests
      run: |
        sleep 10  # Wait for deployment to propagate
        npm run test:e2e -- --spec="smoke.spec.ts"
      env:
        TEST_URL: https://offertapps-prod.web.app
    
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()

  mobile-build:
    runs-on: macos-latest
    needs: test
    if: contains(github.event.head_commit.message, '[build-mobile]')
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build web application
      run: npm run build:mobile
      env:
        NODE_ENV: production
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        VITE_FIREBASE_DATABASE_URL: ${{ secrets.FIREBASE_DATABASE_URL }}
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
    
    - name: Sync Capacitor
      run: npx cap sync android
    
    - name: Build Android APK
      run: |
        cd android
        ./gradlew assembleDebug
      env:
        JAVA_OPTS: -Xmx2048m
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug.apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

## 2. Configuración de Pruebas Automáticas

### Archivo: `package.json` (scripts actualizados)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "npx playwright test",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "build": "tsc && vite build",
    "build:mobile": "tsc && vite build",
    "analyze": "npm run build -- --analyze"
  }
}
```

### Archivo: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/reportWebVitals.ts',
    '!src/config.ts',
    '!src/types.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Archivo: `.eslintrc.js`

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': ['error', {
      groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
      alphabetize: { order: 'asc' },
      'newlines-between': 'always'
    }]
  }
};
```

## 3. Scripts de Pruebas

### Archivo: `src/__tests__/ci-cd.test.ts`

```typescript
import { validateEmail, validatePassword, validateUser } from '../utils/validation';

describe('Validaciones de CI/CD', () => {
  test('debería validar correctamente un correo electrónico', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('debería validar correctamente una contraseña', () => {
    expect(validatePassword('ValidPass123')).toBe(true);
    expect(validatePassword('weak')).toBe(false);
  });

  test('debería validar correctamente los datos de usuario', () => {
    const validUser = { email: 'test@example.com', name: 'Test User' };
    expect(validateUser(validUser).length).toBe(0);
    
    const invalidUser = { email: 'invalid', name: 'A' };
    const errors = validateUser(invalidUser);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

## 4. Configuración de Despliegue Automático

### Archivo: `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
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
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

## 5. Variables de Entorno para CI/CD

### Archivo: `.env.example` (actualizado)

```
# Variables de entorno para desarrollo
VITE_FIREBASE_API_KEY=clave_api_desarrollo
VITE_FIREBASE_AUTH_DOMAIN=offertapps-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=offertapps-dev
VITE_FIREBASE_STORAGE_BUCKET=offertapps-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
VITE_FIREBASE_DATABASE_URL=https://offertapps-dev-default-rtdb.firebaseio.com/

# Variables para pruebas
VITE_GEMINI_API_KEY=clave_gemini_pruebas

# Variables de entorno para producción (definidas en GitHub Secrets)
# VITE_FIREBASE_API_KEY_PROD
# VITE_FIREBASE_AUTH_DOMAIN_PROD
# etc.
```

## 6. Procedimiento de Despliegue

### Despliegue a Staging
1. Hacer merge a la rama `develop`
2. El pipeline CI/CD se ejecuta automáticamente
3. Si todas las pruebas pasan, se despliega a staging
4. Notificación se envía al canal de Slack correspondiente

### Despliegue a Producción
1. Hacer merge a la rama `main` desde `develop`
2. El pipeline CI/CD se ejecuta automáticamente
3. Si todas las pruebas y escaneos de seguridad pasan, se despliega a producción
4. Se ejecutan pruebas de humo para verificar la funcionalidad crítica
5. Notificación se envía al canal de Slack correspondiente

## 7. Monitoreo y Alertas

### Archivo: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "admin-user"
    labels:
      - "dependencies"
      - "automated-pr"
```

## 8. Buenas Prácticas de CI/CD

1. **Todas las pruebas deben pasar** antes de cualquier despliegue
2. **No commits directos a main** - siempre a través de PRs
3. **Revisión de pares** requerida para merges a main
4. **Escaneo de seguridad** obligatorio para producción
5. **Rollback plan** documentado en caso de fallos
6. **Notificaciones** automáticas de estado de despliegue
7. **Métricas de cobertura** mantenidas por encima del 80%
8. **Auditoría de dependencias** regular

## 9. Rollback Procedure

Si un despliegue falla o introduce errores críticos:

1. Identificar el commit problemático
2. Revertir el commit o desplegar una versión anterior
3. Verificar que la aplicación esté funcionando correctamente
4. Investigar la causa raíz del problema
5. Implementar una solución y probar adecuadamente
6. Documentar el incidente para futura referencia