// src/services/favoritesService.ts

import { ref, update, get, child } from 'firebase/database';
import { db } from '../config';
import { Offer } from '../types';

const USERS_REF = 'users';
const OFFERS_REF = 'offers';

/**
 * Añadir una oferta a los favoritos de un usuario
 * @param userId - ID del usuario
 * @param offerId - ID de la oferta a añadir a favoritos
 * @returns Promesa que se resuelve cuando se añade a favoritos
 */
export const addToFavorites = async (userId: string, offerId: string): Promise<void> => {
  try {
    // Verificar que la oferta exista
    const offerRef = ref(db, `${OFFERS_REF}/${offerId}`);
    const offerSnapshot = await get(offerRef);
    
    if (!offerSnapshot.exists()) {
      throw new Error('La oferta no existe');
    }

    // Actualizar el array de favoritos del usuario
    const userRef = ref(db, `${USERS_REF}/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userSnapshot.val();
    const currentFavorites = userData.favorites || [];
    
    // Verificar que la oferta no esté ya en favoritos
    if (currentFavorites.includes(offerId)) {
      throw new Error('La oferta ya está en tus favoritos');
    }

    // Añadir la oferta a los favoritos
    const updatedFavorites = [...currentFavorites, offerId];
    
    await update(userRef, {
      favorites: updatedFavorites
    });
  } catch (error) {
    console.error('Error al añadir a favoritos:', error);
    throw error;
  }
};

/**
 * Eliminar una oferta de los favoritos de un usuario
 * @param userId - ID del usuario
 * @param offerId - ID de la oferta a eliminar de favoritos
 * @returns Promesa que se resuelve cuando se elimina de favoritos
 */
export const removeFromFavorites = async (userId: string, offerId: string): Promise<void> => {
  try {
    const userRef = ref(db, `${USERS_REF}/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userSnapshot.val();
    const currentFavorites = userData.favorites || [];
    
    // Verificar que la oferta esté en favoritos
    if (!currentFavorites.includes(offerId)) {
      throw new Error('La oferta no está en tus favoritos');
    }

    // Filtrar la oferta de los favoritos
    const updatedFavorites = currentFavorites.filter((favId: string) => favId !== offerId);
    
    await update(userRef, {
      favorites: updatedFavorites
    });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    throw error;
  }
};

/**
 * Obtener las ofertas favoritas de un usuario
 * @param userId - ID del usuario
 * @returns Array de IDs de ofertas favoritas
 */
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const userRef = ref(db, `${USERS_REF}/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      return [];
    }

    const userData = userSnapshot.val();
    return userData.favorites || [];
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }
};

/**
 * Verificar si una oferta está en los favoritos de un usuario
 * @param userId - ID del usuario
 * @param offerId - ID de la oferta
 * @returns Boolean indicando si la oferta está en favoritos
 */
export const isFavorite = async (userId: string, offerId: string): Promise<boolean> => {
  try {
    const favorites = await getUserFavorites(userId);
    return favorites.includes(offerId);
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return false;
  }
};

/**
 * Obtener todas las ofertas favoritas de un usuario con sus datos completos
 * @param userId - ID del usuario
 * @returns Array de ofertas favoritas con sus datos completos
 */
export const getUserFavoriteOffers = async (userId: string): Promise<Offer[]> => {
  try {
    const favoriteIds = await getUserFavorites(userId);
    
    if (favoriteIds.length === 0) {
      return [];
    }

    // Obtener todas las ofertas favoritas
    const favoriteOffers: Offer[] = [];
    
    for (const offerId of favoriteIds) {
      const offerRef = ref(db, `${OFFERS_REF}/${offerId}`);
      const offerSnapshot = await get(offerRef);
      
      if (offerSnapshot.exists()) {
        favoriteOffers.push({
          id: offerId,
          ...offerSnapshot.val()
        });
      }
    }

    return favoriteOffers;
  } catch (error) {
    console.error('Error al obtener ofertas favoritas:', error);
    throw error;
  }
};

/**
 * Contar el número de veces que una oferta está en favoritos
 * @param offerId - ID de la oferta
 * @returns Número de veces que la oferta está en favoritos
 */
export const getFavoriteCount = async (offerId: string): Promise<number> => {
  try {
    // Esta implementación requiere recorrer todos los usuarios
    // En una implementación real, se podría mantener un contador en la oferta
    const usersRef = ref(db, USERS_REF);
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      return 0;
    }

    let count = 0;
    const usersData = usersSnapshot.val();
    
    for (const userId in usersData) {
      const userFavorites = usersData[userId].favorites || [];
      if (userFavorites.includes(offerId)) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error('Error al contar favoritos:', error);
    throw error;
  }
};