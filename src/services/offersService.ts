import {
    ref,
    get,
    set,
    update,
    remove,
    push
} from 'firebase/database';
import { db } from '../config';
import { Offer } from '../types';
import { validateOffer, sanitizeString, validateAndSanitizeUrl } from '../utils/validation';
import { uploadOfferImage } from './storageService';
import { publishOfferToInstagram } from './instagramService';
import { publishOfferToFacebook } from './facebookService';
import { publishOfferToTikTok } from './tiktokService';

const OFFERS_REF = 'offers';

/**
 * Elimina propiedades undefined de un objeto para Firebase
 */
const cleanObject = (obj: any) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
        if (newObj[key] === undefined) {
            delete newObj[key];
        }
    });
    return newObj;
};

/**
 * Obtener todas las ofertas
 */
export const getOffers = async (filters?: {
    category?: string;
    companyId?: string;
}): Promise<Offer[]> => {
    try {
        const offersRef = ref(db, OFFERS_REF);
        const snapshot = await get(offersRef);

        if (!snapshot.exists()) {
            return [];
        }

        const offersData = snapshot.val();
        let offers: Offer[] = Object.keys(offersData).map(key => ({
            id: key,
            ...offersData[key]
        }));

        // Aplicar filtros
        if (filters?.category && filters.category !== 'Todos') {
            offers = offers.filter(offer => offer.category === filters.category);
        }

        if (filters?.companyId) {
            offers = offers.filter(offer => offer.companyId === filters.companyId);
        }

        return offers;
    } catch (error) {
        console.error('Error al obtener ofertas:', error);
        throw new Error('Error al cargar ofertas');
    }
};

/**
 * Obtener oferta por ID
 */
export const getOfferById = async (id: string): Promise<Offer | null> => {
    try {
        const offerRef = ref(db, `${OFFERS_REF}/${id}`);
        const snapshot = await get(offerRef);

        if (!snapshot.exists()) {
            return null;
        }

        return { id, ...snapshot.val() } as Offer;
    } catch (error) {
        console.error('Error al obtener oferta:', error);
        return null;
    }
};

/**
 * Crear nueva oferta
 */
export const createOffer = async (offer: Omit<Offer, 'id'>, imageFile?: File | Blob): Promise<{ id: string, imageUrl: string, createdAt: string }> => {
    console.log('Iniciando createOffer en el servicio:', offer);
    try {
        // Marcador 1: Validación
        const validationErrors = validateOffer(offer);
        if (validationErrors.length > 0) {
            throw new Error(`Validación: ${validationErrors.join(', ')}`);
        }

        // Marcador 2: Subida de imagen
        let finalImageUrl = '';
        if (imageFile) {
            console.log('Subiendo imagen...');
            try {
                finalImageUrl = await uploadOfferImage(imageFile);
            } catch (imgErr: any) {
                console.error('Error en uploadOfferImage:', imgErr);
                throw new Error(`Error subiendo imagen (D2): ${imgErr.message}`);
            }
        } else if (offer.imageUrl) {
            finalImageUrl = validateAndSanitizeUrl(offer.imageUrl) || '';
        }

        // Marcador 3: Preparación de datos
        const ensureDateString = (date: any) => {
            if (!date) return undefined;
            if (date instanceof Date) return date.toISOString();
            return String(date);
        };

        const sanitizedOffer = {
            ...offer,
            title: sanitizeString(offer.title),
            description: sanitizeString(offer.description),
            imageUrl: finalImageUrl,
            discount: sanitizeString(offer.discount),
            category: offer.category,
            offerType: offer.offerType,
            companyId: offer.companyId,
            isRecurring: offer.isRecurring,
            branchId: offer.branchId ? sanitizeString(offer.branchId) : undefined,
            validUntil: ensureDateString(offer.validUntil)
        };

        // Marcador 4: Guardado en RTDB
        console.log('Guardando en Realtime Database...');
        try {
            const offersRef = ref(db, OFFERS_REF);
            const newOfferRef = push(offersRef);
            const createdAt = new Date().toISOString();

            await set(newOfferRef, cleanObject({
                ...sanitizedOffer,
                createdAt,
                updatedAt: createdAt,
                socialMediaPosted: false
            }));

            console.log('Oferta creada con éxito, ID:', newOfferRef.key);
            return { id: newOfferRef.key!, imageUrl: finalImageUrl, createdAt };
        } catch (dbErr: any) {
            console.error('Error en set(db):', dbErr);
            throw new Error(`Error guardando en base de datos (D4): ${dbErr.message}`);
        }
    } catch (error: any) {
        console.error('Error detallado en createOffer:', error);
        throw error;
    }
};

/**
 * Actualizar oferta
 */
export const updateOffer = async (id: string, data: Partial<Offer>, imageFile?: File | Blob): Promise<void> => {
    try {
        // Validación de datos
        const validationErrors = validateOffer(data);
        if (validationErrors.length > 0) {
            throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
        }

        // Preparar datos sanitizados
        const sanitizedData: Partial<Offer> = {};

        if (data.title !== undefined) {
            sanitizedData.title = sanitizeString(data.title);
        }

        if (data.description !== undefined) {
            sanitizedData.description = sanitizeString(data.description);
        }

        if (data.discount !== undefined) {
            sanitizedData.discount = sanitizeString(data.discount);
        }

        if (data.category !== undefined) {
            sanitizedData.category = data.category;
        }

        if (data.offerType !== undefined) {
            sanitizedData.offerType = data.offerType;
        }

        if (data.companyId !== undefined) {
            sanitizedData.companyId = data.companyId;
        }

        if (data.isRecurring !== undefined) {
            sanitizedData.isRecurring = data.isRecurring;
        }

        if (data.branchId !== undefined) {
            sanitizedData.branchId = sanitizeString(data.branchId);
        }

        if (data.validUntil !== undefined) {
            sanitizedData.validUntil = data.validUntil;
        }

        // Subir imagen si se proporciona
        if (imageFile) {
            const imageUrl = await uploadOfferImage(imageFile);
            sanitizedData.imageUrl = imageUrl;
        } else if (data.imageUrl !== undefined) {
            // Si se proporciona una URL específica, validarla
            sanitizedData.imageUrl = validateAndSanitizeUrl(data.imageUrl) || '';
        }

        const offerRef = ref(db, `${OFFERS_REF}/${id}`);
        await update(offerRef, cleanObject({
            ...sanitizedData,
            updatedAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error al actualizar oferta:', error);
        throw new Error('Error al actualizar oferta');
    }
};

/**
 * Eliminar oferta
 */
export const deleteOffer = async (id: string): Promise<void> => {
    try {
        const offerRef = ref(db, `${OFFERS_REF}/${id}`);
        await remove(offerRef);
    } catch (error) {
        console.error('Error al eliminar oferta:', error);
        throw new Error('Error al eliminar oferta');
    }
};

/**
 * Obtener ofertas de una empresa
 */
export const getOffersByCompany = async (companyId: string): Promise<Offer[]> => {
    return getOffers({ companyId });
};
