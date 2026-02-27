// src/utils/cacheManager.ts

// Interfaz para los elementos del cache
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // tiempo de vida en milisegundos
}

// Clase para manejar el cacheo de datos
export class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    // Limpiar elementos expirados periódicamente
    setInterval(() => this.cleanup(), 60000); // Limpiar cada minuto
  }

  // Obtener un elemento del cache
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Guardar un elemento en el cache
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    // Si el cache está lleno, eliminar el 10% de los elementos más antiguos
    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys());
      const keysToDelete = keys.slice(0, Math.floor(keys.length * 0.1));
      keysToDelete.forEach(k => this.cache.delete(k));
    }

    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  // Verificar si un elemento existe en el cache
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Eliminar un elemento del cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpiar todos los elementos expirados
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear();
  }

  // Obtener el tamaño actual del cache
  size(): number {
    return this.cache.size;
  }

  // Obtener estadísticas del cache
  stats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia global del cache
export const globalCache = new CacheManager();

// Función para generar claves de cache consistentes
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// Función para esperar un tiempo (usado para simular cargas)
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Interfaz para opciones de carga con cache
export interface LoadWithCacheOptions {
  ttl?: number; // tiempo de vida en ms
  forceRefresh?: boolean; // forzar recarga
  fallback?: () => Promise<any>; // función fallback si falla
}

// Función para cargar datos con cache
export const loadWithCache = async <T>(
  key: string,
  loader: () => Promise<T>,
  options: LoadWithCacheOptions = {}
): Promise<T> => {
  const { ttl = 5 * 60 * 1000, forceRefresh = false, fallback } = options;

  // Si no se fuerza la recarga, intentar obtener del cache
  if (!forceRefresh) {
    const cached = globalCache.get(key);
    if (cached !== null) {
      return cached as T;
    }
  }

  try {
    // Cargar datos frescos
    const data = await loader();
    
    // Guardar en cache
    globalCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    
    // Intentar usar fallback si está disponible
    if (fallback) {
      try {
        const fallbackData = await fallback();
        // Guardar fallback en cache con TTL más corto
        globalCache.set(key, fallbackData, ttl / 2);
        return fallbackData;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error; // Lanzar el error original
      }
    }
    
    throw error;
  }
};