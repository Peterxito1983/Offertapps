import { get, ref, query, orderByChild, limitToLast, limitToFirst, startAt, endAt } from 'firebase/database';
import { db } from '../config';
import { Offer, Review, Company } from '../types';

// Interfaz para opciones de paginación
export interface PaginationOptions {
  limit?: number;
  startAfter?: any;
  endBefore?: any;
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

// Interfaz para resultados paginados
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  lastVisible?: any;
  firstVisible?: any;
}

/**
 * Obtener ofertas con paginación
 */
export const getOffersWithPagination = async (
  filters?: {
    category?: string;
    companyId?: string;
  },
  pagination?: PaginationOptions
): Promise<PaginatedResult<Offer>> => {
  try {
    let offersRef = ref(db, 'offers');
    
    // Aplicar filtros y paginación
    let queryRef = offersRef;
    
    if (pagination) {
      if (pagination.orderBy) {
        queryRef = query(queryRef, orderByChild(pagination.orderBy));
      }
      
      if (pagination.limit) {
        if (pagination.direction === 'desc') {
          queryRef = query(queryRef, limitToLast(pagination.limit));
        } else {
          queryRef = query(queryRef, limitToFirst(pagination.limit));
        }
      }
      
      if (pagination.startAfter) {
        queryRef = query(queryRef, startAt(pagination.startAfter));
      }
      
      if (pagination.endBefore) {
        queryRef = query(queryRef, endAt(pagination.endBefore));
      }
    }
    
    const snapshot = await get(queryRef);
    
    if (!snapshot.exists()) {
      return { data: [], hasMore: false };
    }
    
    const offersData = snapshot.val();
    let offers: Offer[] = Object.keys(offersData).map(key => ({
      id: key,
      ...offersData[key]
    }));

    // Aplicar filtros adicionales después de la consulta
    if (filters?.category && filters.category !== 'Todos') {
      offers = offers.filter(offer => offer.category === filters.category);
    }

    if (filters?.companyId) {
      offers = offers.filter(offer => offer.companyId === filters.companyId);
    }

    // Determinar si hay más elementos
    const hasMore = pagination?.limit ? offers.length >= (pagination.limit) : false;
    
    return {
      data: offers,
      hasMore,
      lastVisible: offers.length > 0 ? offers[offers.length - 1] : undefined,
      firstVisible: offers.length > 0 ? offers[0] : undefined
    };
  } catch (error) {
    console.error('Error al obtener ofertas con paginación:', error);
    throw new Error('Error al cargar ofertas');
  }
};

/**
 * Obtener reseñas con paginación
 */
export const getReviewsWithPagination = async (
  offerId?: string,
  companyId?: string,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Review>> => {
  try {
    let reviewsRef = ref(db, 'reviews');
    
    let queryRef = reviewsRef;
    
    if (pagination) {
      if (pagination.orderBy) {
        queryRef = query(queryRef, orderByChild(pagination.orderBy));
      }
      
      if (pagination.limit) {
        if (pagination.direction === 'desc') {
          queryRef = query(queryRef, limitToLast(pagination.limit));
        } else {
          queryRef = query(queryRef, limitToFirst(pagination.limit));
        }
      }
      
      if (pagination.startAfter) {
        queryRef = query(queryRef, startAt(pagination.startAfter));
      }
      
      if (pagination.endBefore) {
        queryRef = query(queryRef, endAt(pagination.endBefore));
      }
    }
    
    const snapshot = await get(queryRef);
    
    if (!snapshot.exists()) {
      return { data: [], hasMore: false };
    }
    
    const reviewsData = snapshot.val();
    let reviews: Review[] = Object.keys(reviewsData)
      .map(key => ({ id: key, ...reviewsData[key] }));

    // Filtrar por oferta o empresa si se especifica
    if (offerId) {
      reviews = reviews.filter(review => review.offerId === offerId);
    }

    if (companyId) {
      reviews = reviews.filter(review => review.companyId === companyId);
    }

    // Ordenar por fecha si no se especifica otro orden
    if (!pagination?.orderBy) {
      reviews = reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const hasMore = pagination?.limit ? reviews.length >= (pagination.limit) : false;
    
    return {
      data: reviews,
      hasMore,
      lastVisible: reviews.length > 0 ? reviews[reviews.length - 1] : undefined,
      firstVisible: reviews.length > 0 ? reviews[0] : undefined
    };
  } catch (error) {
    console.error('Error al obtener reseñas con paginación:', error);
    throw new Error('Error al cargar reseñas');
  }
};

/**
 * Obtener empresas con paginación
 */
export const getCompaniesWithPagination = async (
  filters?: {
    isVerified?: boolean;
  },
  pagination?: PaginationOptions
): Promise<PaginatedResult<Company>> => {
  try {
    let companiesRef = ref(db, 'companies');
    
    let queryRef = companiesRef;
    
    if (pagination) {
      if (pagination.orderBy) {
        queryRef = query(queryRef, orderByChild(pagination.orderBy));
      }
      
      if (pagination.limit) {
        if (pagination.direction === 'desc') {
          queryRef = query(queryRef, limitToLast(pagination.limit));
        } else {
          queryRef = query(queryRef, limitToFirst(pagination.limit));
        }
      }
      
      if (pagination.startAfter) {
        queryRef = query(queryRef, startAt(pagination.startAfter));
      }
      
      if (pagination.endBefore) {
        queryRef = query(queryRef, endAt(pagination.endBefore));
      }
    }
    
    const snapshot = await get(queryRef);
    
    if (!snapshot.exists()) {
      return { data: [], hasMore: false };
    }
    
    const companiesData = snapshot.val();
    let companies: Company[] = Object.keys(companiesData).map(key => ({
      id: key,
      ...companiesData[key]
    }));

    // Aplicar filtros
    if (filters?.isVerified !== undefined) {
      companies = companies.filter(company => company.isVerified === filters.isVerified);
    }

    const hasMore = pagination?.limit ? companies.length >= (pagination.limit) : false;
    
    return {
      data: companies,
      hasMore,
      lastVisible: companies.length > 0 ? companies[companies.length - 1] : undefined,
      firstVisible: companies.length > 0 ? companies[0] : undefined
    };
  } catch (error) {
    console.error('Error al obtener empresas con paginación:', error);
    throw new Error('Error al cargar empresas');
  }
};

// Función para crear un cache simple en memoria
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const firebaseCache = new SimpleCache();