# Mejora de Tiempos de Carga para OffertApps

## Descripción General

Este documento describe las estrategias implementadas para mejorar los tiempos de carga de la aplicación OffertApps, incluyendo paginación, skeleton screens y optimización de consultas a Firebase.

## 1. Paginación para Listas Grandes

### Implementación de Componente PaginatedList

Ya se ha implementado el componente `PaginatedList` que:

- Divide listas grandes en páginas manejables
- Soporta infinite scroll y paginación tradicional
- Mantiene un número configurable de elementos por página
- Incluye callbacks para cargar más datos

### Uso en vistas principales

#### En UserView.tsx
```tsx
// Actualización para usar paginación
import { PaginatedList } from '../components/PaginatedList';
import { SkeletonScreen } from '../components/SkeletonScreen';

// Reemplazar la lista actual de ofertas con el componente paginado
{loading ? (
  <SkeletonScreen type="list-item" count={5} />
) : (
  <PaginatedList
    items={filteredOffers}
    renderItem={(offer, index) => {
      const company = getCompanyById(offer.companyId);
      return (
        <IonCol key={offer.id} size="12" sizeMd="6" sizeLg="4">
          <OfferCard
            offer={offer}
            company={company}
            onShowOffer={handleShowOffer}
          />
        </IonCol>
      );
    }}
    itemsPerPage={6} // Mostrar 6 ofertas por página
    showInfiniteScroll={true}
    hasMore={filteredOffers.length < allOffers.length} // Implementar lógica real
    onLoadMore={loadMoreOffers} // Implementar función para cargar más
  />
)}
```

## 2. Skeleton Screens Durante la Carga

### Implementación de Componente SkeletonScreen

Ya se ha implementado el componente `SkeletonScreen` que:

- Muestra placeholders mientras se cargan los datos
- Tiene diferentes tipos (card, list-item, avatar, text)
- Incluye animación para mejorar la percepción de carga
- Se puede personalizar con diferentes dimensiones

### Uso en vistas

#### En UserView.tsx
```tsx
// Mostrar skeleton mientras se cargan las ofertas
{loading ? (
  <IonGrid>
    <IonRow>
      {Array.from({ length: 6 }).map((_, index) => (
        <IonCol key={index} size="12" sizeMd="6" sizeLg="4">
          <SkeletonScreen type="card" />
        </IonCol>
      ))}
    </IonRow>
  </IonGrid>
) : (
  // Renderizar las ofertas reales
  <IonGrid>
    <IonRow>
      {filteredOffers.map(offer => {
        const company = getCompanyById(offer.companyId);
        return (
          <IonCol key={offer.id} size="12" sizeMd="6" sizeLg="4">
            <OfferCard
              offer={offer}
              company={company}
              onShowOffer={handleShowOffer}
            />
          </IonCol>
        );
      })}
    </IonRow>
  </IonGrid>
)}
```

## 3. Optimización de Consultas a Firebase

### Implementación de Consultas Paginadas

Ya se han implementado funciones en `firebaseOptimization.ts` que:

- Permiten paginar resultados de consultas a Firebase
- Incluyen tipos para manejo seguro de datos
- Implementan cacheo simple en memoria
- Soportan diferentes tipos de filtros y ordenamientos

### Uso en servicios

#### En offersService.ts (ejemplo actualizado)
```tsx
// Reemplazar la función getOffers para usar paginación
import { getOffersWithPagination, PaginatedResult } from '../utils/firebaseOptimization';

export const getOffersWithPaginationService = async (
  filters?: {
    category?: string;
    companyId?: string;
  },
  pagination?: {
    limit?: number;
    startAfter?: any;
  }
): Promise<PaginatedResult<Offer>> => {
  // Usar la función optimizada
  return getOffersWithPagination(filters, pagination);
};
```

## 4. Estrategias Adicionales de Carga

### Implementación de Cacheo

Ya se ha implementado un sistema de cacheo simple en `firebaseOptimization.ts`:

```ts
// Uso del cache para datos que no cambian frecuentemente
const CACHE_KEY = `companies_${filters?.isVerified || 'all'}`;
const cachedCompanies = firebaseCache.get(CACHE_KEY);

if (cachedCompanies) {
  return cachedCompanies;
}

const companies = await getCompanies(filters);
firebaseCache.set(CACHE_KEY, companies, 5 * 60 * 1000); // 5 minutos
return companies;
```

### Optimización de Inicialización de Datos

Actualizar App.tsx para cargar datos de forma más eficiente:

```tsx
// En App.tsx, optimizar la carga inicial de datos
useEffect(() => {
  const initApp = async () => {
    setLoading(true);
    
    // Cargar datos críticos primero (paralelamente)
    const [fetchedCompanies, fetchedOffers] = await Promise.all([
      getCompanies(),
      getOffers()
    ]);
    
    // Cargar datos secundarios después
    const fetchedReviews = await getAllReviews();
    
    // Si está vacío, poblar base de datos
    if (fetchedCompanies.length === 0) {
      await seedDatabase();
      // Recargar datos después de poblar
      const [newCompanies, newOffers, newReviews] = await Promise.all([
        getCompanies(),
        getOffers(),
        getAllReviews()
      ]);
      
      setCompanies(newCompanies);
      setOffers(newOffers);
      setReviews(newReviews);
    } else {
      setCompanies(fetchedCompanies);
      setOffers(fetchedOffers);
      setReviews(fetchedReviews);
    }
    
    setLoading(false);
  };

  // Suscribirse a cambios de autenticación
  const unsubscribe = onAuthChange(async (user) => {
    if (user) {
      const profile = await getCurrentUserProfile();
      setCurrentUser(profile);
    } else {
      setCurrentUser(null);
    }
    
    // Iniciar la inicialización de la app después de verificar autenticación
    await initApp();
  });

  return () => unsubscribe();
}, []);
```

## 5. Implementación de Service Worker (Opcional)

Para carga más rápida en visitas repetidas, se puede implementar un service worker:

### Archivo: public/sw.js
```js
const CACHE_NAME = 'offertapps-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  // Agregar otros recursos críticos
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver del cache o hacer fetch
        return response || fetch(event.request);
      })
  );
});
```

## 6. Estrategias de Precarga

### En index.html
```html
<!-- Precargar recursos críticos -->
<link rel="preload" href="/assets/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/api/offers" as="fetch">
<link rel="dns-prefetch" href="//firebasestorage.googleapis.com">
```

## 7. Recomendaciones de Rendimiento

### Métricas a Monitorear
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

### Herramientas de Medición
- Lighthouse CI
- Web Vitals
- Firebase Performance Monitoring

## 8. Implementación en Componentes

### Actualizar UserView para usar estrategias de carga
```tsx
// src/views/UserView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import { OfferCard } from '../components/OfferCard';
import { SkeletonScreen } from '../components/SkeletonScreen';
import { PaginatedList } from '../components/PaginatedList';
import { Offer, Company } from '../types';

interface UserViewProps {
  offers: Offer[];
  companies: Company[];
  onAddReview: (review: any) => void;
}

export const UserView: React.FC<UserViewProps> = ({ offers, companies, onAddReview }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  
  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Simular tiempo de carga
  
    return () => clearTimeout(timer);
  }, []);

  const getCompanyById = (id: string) => 
    companies.find(c => c.id === id) || {
      id: 'unknown',
      name: 'Empresa Externa',
      logoUrl: 'https://via.placeholder.com/100',
      branches: [],
      subscriptionPlan: 'basico',
      isVerified: false
    };

  const filteredOffers = useMemo(() => {
    const verifiedOffers = offers.filter(off => {
      const company = companies.find(c => c.id === off.companyId);
      return company?.isVerified === true;
    });

    const categoryFiltered = activeCategory === 'Todos'
      ? verifiedOffers
      : verifiedOffers.filter(offer => offer.category === activeCategory);

    return categoryFiltered.filter(offer => {
      const company = getCompanyById(offer.companyId);
      const searchTermLower = searchTerm.toLowerCase();
      return offer.title.toLowerCase().includes(searchTermLower) ||
        offer.description.toLowerCase().includes(searchTermLower) ||
        (company && company.name.toLowerCase().includes(searchTermLower));
    });
  }, [searchTerm, activeCategory, offers, companies]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Ofertas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value!)}
            placeholder="Buscar ofertas..."
            animated
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={activeCategory}
            onIonChange={(e) => setActiveCategory(e.detail.value as any)}
            scrollable
          >
            <IonSegmentButton value="Todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Comida">
              <IonLabel>Comida</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Moda">
              <IonLabel>Moda</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Tecnología">
              <IonLabel>Tecnología</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="ion-padding">
          {loading ? (
            <IonGrid>
              <IonRow>
                {Array.from({ length: 6 }).map((_, index) => (
                  <IonCol key={index} size="12" sizeMd="6" sizeLg="4">
                    <SkeletonScreen type="card" />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          ) : filteredOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3>No hay ofertas disponibles</h3>
              <p>Intenta con otra categoría o búsqueda</p>
            </div>
          ) : (
            <PaginatedList
              items={filteredOffers}
              renderItem={(offer, index) => {
                const company = getCompanyById(offer.companyId);
                return (
                  <IonCol key={offer.id} size="12" sizeMd="6" sizeLg="4">
                    <OfferCard
                      offer={offer}
                      company={company}
                      onShowOffer={() => {}}
                    />
                  </IonCol>
                );
              }}
              itemsPerPage={6}
              showInfiniteScroll={true}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
```

Estas estrategias combinadas mejorarán significativamente los tiempos de carga y la experiencia del usuario.