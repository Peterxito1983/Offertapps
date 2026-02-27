import {
    ref,
    get,
    set,
    update,
    remove,
    push
} from 'firebase/database';
import { db } from '../config';
import { Review } from '../types';
import { validateReview, sanitizeString } from '../utils/validation';

const REVIEWS_REF = 'reviews';

/**
 * Obtener reseñas de una oferta
 */
export const getReviewsByOffer = async (offerId: string): Promise<Review[]> => {
    try {
        const reviewsRef = ref(db, REVIEWS_REF);
        const snapshot = await get(reviewsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const reviewsData = snapshot.val();
        const reviews: Review[] = Object.keys(reviewsData)
            .map(key => ({ id: key, ...reviewsData[key] }))
            .filter(review => review.offerId === offerId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return reviews;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw new Error('Error al cargar reseñas');
    }
};

/**
 * Obtener reseñas de una empresa
 */
export const getReviewsByCompany = async (companyId: string): Promise<Review[]> => {
    try {
        const reviewsRef = ref(db, REVIEWS_REF);
        const snapshot = await get(reviewsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const reviewsData = snapshot.val();
        const reviews: Review[] = Object.keys(reviewsData)
            .map(key => ({ id: key, ...reviewsData[key] }))
            .filter(review => review.companyId === companyId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return reviews;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw new Error('Error al cargar reseñas');
    }
};

/**
 * Crear nueva reseña
 */
export const createReview = async (review: Omit<Review, 'id'>): Promise<string> => {
    try {
        // Validación de datos
        const validationErrors = validateReview(review);
        if (validationErrors.length > 0) {
            throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
        }

        // Sanitización de datos
        const sanitizedReview = {
            ...review,
            comment: sanitizeString(review.comment),
            userName: sanitizeString(review.userName),
            rating: review.rating,
            offerId: review.offerId,
            companyId: review.companyId,
            userId: review.userId,
            date: new Date().toISOString()
        };

        const reviewsRef = ref(db, REVIEWS_REF);
        const newReviewRef = push(reviewsRef);

        await set(newReviewRef, {
            ...sanitizedReview,
            createdAt: new Date().toISOString()
        });

        return newReviewRef.key!;
    } catch (error) {
        console.error('Error al crear reseña:', error);
        throw new Error('Error al crear reseña');
    }
};

/**
 * Responder a una reseña
 */
export const replyToReview = async (
    reviewId: string,
    reply: string
): Promise<void> => {
    try {
        // Validación de la respuesta
        if (!reply || reply.length < 5) {
            throw new Error('La respuesta debe tener al menos 5 caracteres');
        }

        if (reply.length > 500) {
            throw new Error('La respuesta es demasiado larga');
        }

        // Sanitización de la respuesta
        const sanitizedReply = sanitizeString(reply);

        const reviewRef = ref(db, `${REVIEWS_REF}/${reviewId}`);
        await update(reviewRef, {
            reply: sanitizedReply,
            replyDate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al responder reseña:', error);
        throw new Error('Error al responder reseña');
    }
};

/**
 * Eliminar reseña
 */
export const deleteReview = async (id: string): Promise<void> => {
    try {
        const reviewRef = ref(db, `${REVIEWS_REF}/${id}`);
        await remove(reviewRef);
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        throw new Error('Error al eliminar reseña');
    }
};

/**
 * Obtener todas las reseñas (para admin)
 */
export const getAllReviews = async (): Promise<Review[]> => {
    try {
        const reviewsRef = ref(db, REVIEWS_REF);
        const snapshot = await get(reviewsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const reviewsData = snapshot.val();
        const reviews: Review[] = Object.keys(reviewsData)
            .map(key => ({ id: key, ...reviewsData[key] }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return reviews;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw new Error('Error al cargar reseñas');
    }
};
