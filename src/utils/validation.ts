import { Offer, Review, Company, User } from '../types';

// Validación de correo electrónico
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validación de contraseña
export const validatePassword = (password: string): boolean => {
    // Mínimo 6 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
};

// Validación de datos de usuario
export const validateUser = (user: Partial<User>): string[] => {
    const errors: string[] = [];

    if (user.email && !validateEmail(user.email)) {
        errors.push('Correo electrónico inválido');
    }

    if (user.name && user.name.length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    return errors;
};

// Validación de datos de empresa
export const validateCompany = (company: Partial<Company>): string[] => {
    const errors: string[] = [];

    if (company.name && company.name.length < 2) {
        errors.push('El nombre de la empresa debe tener al menos 2 caracteres');
    }

    if (company.name && company.name.length > 100) {
        errors.push('El nombre de la empresa es demasiado largo');
    }

    if (company.subscriptionPlan && !['basico', 'premium'].includes(company.subscriptionPlan)) {
        errors.push('Plan de suscripción inválido');
    }

    return errors;
};

// Validación de datos de oferta
export const validateOffer = (offer: Partial<Offer>): string[] => {
    const errors: string[] = [];

    if (offer.title && offer.title.length < 3) {
        errors.push('El título de la oferta debe tener al menos 3 caracteres');
    }

    if (offer.title && offer.title.length > 100) {
        errors.push('El título de la oferta es demasiado largo');
    }

    if (offer.description && offer.description.length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (offer.description && offer.description.length > 500) {
        errors.push('La descripción es demasiado larga');
    }

    if (offer.discount && (parseFloat(offer.discount.replace(/[^\d.-]/g, '')) <= 0)) {
        errors.push('El descuento debe ser un valor positivo');
    }

    if (offer.category && !['Comida', 'Moda', 'Tecnología', 'Servicios', 'Viajes', 'Hogar', 'Todos'].includes(offer.category)) {
        errors.push('Categoría inválida');
    }

    if (offer.offerType && !['descuento', '2x1', 'lanzamiento', 'compra-compartida'].includes(offer.offerType)) {
        errors.push('Tipo de oferta inválido');
    }

    return errors;
};

// Validación de datos de reseña
export const validateReview = (review: Partial<Review>): string[] => {
    const errors: string[] = [];

    if (review.comment && review.comment.length < 5) {
        errors.push('El comentario debe tener al menos 5 caracteres');
    }

    if (review.comment && review.comment.length > 500) {
        errors.push('El comentario es demasiado largo');
    }

    if (review.rating && (review.rating < 1 || review.rating > 5)) {
        errors.push('La calificación debe estar entre 1 y 5');
    }

    if (review.userName && review.userName.length < 2) {
        errors.push('El nombre de usuario debe tener al menos 2 caracteres');
    }

    return errors;
};

// Sanitización de cadenas para prevenir XSS
export const sanitizeString = (str: string): string => {
    if (!str) return '';

    // Eliminar etiquetas HTML y caracteres potencialmente peligrosos
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Validación y sanitización de URL
export const validateAndSanitizeUrl = (url: string): string | null => {
    if (!url) return null;

    let targetUrl = url.trim();

    // Si no tiene protocolo, intentar añadir https://
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const parsedUrl = new URL(targetUrl);
        // Permitir solo HTTP y HTTPS
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return null;
        }
        return parsedUrl.toString();
    } catch (e) {
        // Si falla la validación URL estándar, permitimos dominios simples si parecen válidos
        if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url.trim())) {
            return 'https://' + url.trim();
        }
        return null;
    }
};

/**
 * Sanitiza un número de teléfono para ser usado en enlaces de WhatsApp (wa.me)
 * Elimina espacios, guiones, paréntesis y el signo +
 * Si el número no tiene código de país (asume Colombia si es de 10 dígitos), agrega 57
 */
export const sanitizePhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Eliminar todo lo que no sea número
    let clean = phone.replace(/\D/g, '');

    // Si el número tiene 10 dígitos (formato celular común en Colombia)
    // y no empieza por 57, se le agrega el código de país
    if (clean.length === 10 && !clean.startsWith('57')) {
        clean = '57' + clean;
    }

    return clean;
};