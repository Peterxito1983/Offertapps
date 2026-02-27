# Optimización del Bundle de la Aplicación

## Descripción General

Este documento describe las estrategias y configuraciones para optimizar el bundle de la aplicación OffertApps, reduciendo su tamaño y mejorando los tiempos de carga.

## 1. Code Splitting y Lazy Loading

### Implementación de Lazy Loading para Vistas

Para implementar code splitting en las vistas principales, se puede usar React.lazy y Suspense:

```tsx
// src/components/LazyViews.tsx
import React, { lazy, Suspense } from 'react';
import { SkeletonScreen } from './SkeletonScreen';

const LazyUserView = lazy(() => import('../views/UserView'));
const LazyCompanyView = lazy(() => import('../views/CompanyView'));
const LazyAdminView = lazy(() => import('../views/AdminView'));
const LazyAuthView = lazy(() => import('../views/AuthView'));

interface LazyViewProps {
  view: 'user' | 'company' | 'admin' | 'auth';
  [key: string]: any;
}

export const LazyView: React.FC<LazyViewProps> = ({ view, ...props }) => {
  const renderView = () => {
    switch (view) {
      case 'user':
        return <LazyUserView {...props} />;
      case 'company':
        return <LazyCompanyView {...props} />;
      case 'admin':
        return <LazyAdminView {...props} />;
      case 'auth':
        return <LazyAuthView {...props} />;
      default:
        return <LazyAuthView {...props} />;
    }
  };

  return (
    <Suspense fallback={<SkeletonScreen type="card" count={3} />}>
      {renderView()}
    </Suspense>
  );
};
```

### Configuración en App.tsx

```tsx
// Actualización en App.tsx para usar lazy loading
import { LazyView } from './components/LazyViews';

// En lugar de importar directamente las vistas:
<IonRouterOutlet>
  <Route exact path="/auth">
    {currentUser ? <Redirect to={currentUser.role === Role.COMPANY ? "/company" : currentUser.role === Role.ADMIN ? "/admin" : "/user"} /> : <LazyView view="auth" />}
  </Route>

  <Route exact path="/user">
    {!currentUser ? <Redirect to="/auth" /> : <LazyView view="user" offers={offers} companies={companies} onAddReview={handleAddReview} />}
  </Route>

  {/* ... otras rutas */}
</IonRouterOutlet>
```

## 2. Configuración de Vite para Optimización

### Actualización del archivo vite.config.ts

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Plugin para compresión gzip
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes en chunks separados
          'react-vendor': ['react', 'react-dom'],
          'ionic-vendor': ['@ionic/react', '@ionic/react-router'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/database'],
          'router-vendor': ['react-router', 'react-router-dom'],
        },
      },
    },
    // Minificar con terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
  },
  // Optimización de pre-carga
  optimizeDeps: {
    include: ['@ionic/react', '@ionic/react-router'],
  },
});
```

## 3. Eliminación de Dependencias Innecesarias

### Análisis de Bundle

Para analizar el tamaño del bundle, se puede usar:

```bash
npm install --save-dev rollup-plugin-visualizer
```

Y agregar al archivo de configuración:

```ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... otros plugins
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
});
```

### Identificación de Dependencias Pesadas

1. **Recharts**: Si no se usa intensivamente, considerar alternativas más ligeras
2. **Firebase**: Asegurarse de importar solo los módulos necesarios
3. **Ionicons**: Considerar usar solo los iconos necesarios en lugar del bundle completo

## 4. Optimización de Imports de Firebase

### Actualizar servicios para importar solo lo necesario

```ts
// En lugar de importar toda la biblioteca
import { getDatabase } from 'firebase/database';

// Importar solo lo necesario
import { get, ref, set, update, remove, push } from 'firebase/database';
```

## 5. Implementación de Lazy Loading para Componentes Secundarios

### Ejemplo para el componente CreateOfferModal

```tsx
// src/components/LazyCreateOfferModal.tsx
import React, { lazy, Suspense } from 'react';
import { SkeletonScreen } from './SkeletonScreen';

const LazyCreateOfferModal = lazy(() => import('./CreateOfferModal'));

interface LazyCreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: any) => void;
  companyId: string;
}

export const LazyCreateOfferModal: React.FC<LazyCreateOfferModalProps> = (props) => {
  return (
    <Suspense fallback={<div><SkeletonScreen type="card" /></div>}>
      <LazyCreateOfferModal {...props} />
    </Suspense>
  );
};
```

## 6. Configuración de Precarga y Prefetch

### En el archivo index.html

```html
<!-- Precargar recursos críticos -->
<link rel="preload" href="/assets/fonts/critical-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/assets/images/logo.svg">
```

## 7. Implementación de Tree Shaking

Asegurarse de que las importaciones estén correctamente configuradas para permitir tree shaking:

```ts
// Correcto - solo importar lo que se necesita
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Incorrecto - importar todo el módulo
import * as firebaseAuth from 'firebase/auth';
```

## 8. Compresión y Minificación

### Configuración adicional para producción

```ts
// Configuración adicional en vite.config.ts para producción
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    // ... otras configuraciones
    build: {
      // ... otras opciones
      cssCodeSplit: true, // Separar CSS en archivos más pequeños
      sourcemap: !isProduction, // No incluir sourcemaps en producción
      target: 'es2015', // Asegurar compatibilidad
    }
  };
});
```

## 9. Recomendaciones Adicionales

1. **Uso de imágenes optimizadas**: Asegurarse de que todas las imágenes estén comprimidas y en formatos eficientes (WebP si es posible)
2. **Implementar Service Worker**: Para cacheo offline y carga más rápida en visitas repetidas
3. **Monitoreo continuo**: Usar herramientas como Lighthouse para monitorear el rendimiento continuamente
4. **Implementar skeleton screens**: Ya implementado en la aplicación para mejorar la percepción de velocidad

## 10. Scripts de Build Optimizados

Actualizar package.json con scripts optimizados:

```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && npx vite-plugin-visualizer",
    "preview": "vite preview",
    "preview:prod": "NODE_ENV=production vite preview"
  }
}
```

Estas optimizaciones ayudarán a reducir significativamente el tamaño del bundle y mejorar los tiempos de carga de la aplicación.