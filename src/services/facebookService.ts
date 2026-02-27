/**
 * Servicio para publicar ofertas automáticamente en Facebook
 * Utiliza Meta Graph API (Page Photos API)
 */

import { Offer } from '../types';

const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_TOKEN;
const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

/**
 * Publica una oferta en una Página de Facebook
 */
export const publishOfferToFacebook = async (offer: Offer): Promise<boolean> => {
    // Si no hay configuración, saltamos silenciosamente
    if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_TOKEN || FACEBOOK_PAGE_ID.includes('tu_page_id')) {
        console.warn('Facebook API: Missing configuration (FACEBOOK_PAGE_ID or FACEBOOK_PAGE_TOKEN)');
        return false;
    }

    if (!offer.imageUrl) {
        console.error('Facebook API: Cannot publish offer without image');
        return false;
    }

    try {
        console.log(`Facebook API: Iniciando publicación para "${offer.title}"`);

        // La descripción incluye el título, descuento y descripción de la oferta
        const message = `${offer.title}\n\n🔥 ${offer.discount} de descuento\n\n${offer.description}\n\n#Offertapps #Ofertas #Colombia`;

        const response = await fetch(`${GRAPH_API_URL}/${FACEBOOK_PAGE_ID}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: offer.imageUrl,
                message: message,
                access_token: FACEBOOK_PAGE_TOKEN
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Facebook API Error: ${data.error.message}`);
        }

        console.log('Facebook API: ¡Publicación exitosa! Post ID:', data.id);
        return true;

    } catch (error) {
        console.error('Facebook API: Error en el proceso de publicación:', error);
        return false;
    }
};
