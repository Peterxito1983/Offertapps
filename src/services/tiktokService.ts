/**
 * Servicio para publicar ofertas automáticamente en TikTok
 * Utiliza TikTok Content Posting API
 */

import { Offer } from '../types';

const TIKTOK_ACCESS_TOKEN = import.meta.env.VITE_TIKTOK_ACCESS_TOKEN;
const TIKTOK_API_URL = 'https://open.tiktokapis.com/v2/post/publish/content/init/';

/**
 * Publica una oferta en TikTok
 */
export const publishOfferToTikTok = async (offer: Offer): Promise<boolean> => {
    // Si no hay configuración, saltamos silenciosamente
    if (!TIKTOK_ACCESS_TOKEN || TIKTOK_ACCESS_TOKEN.includes('tu_access_token')) {
        console.warn('TikTok API: Missing configuration (TIKTOK_ACCESS_TOKEN)');
        return false;
    }

    if (!offer.imageUrl) {
        console.error('TikTok API: Cannot publish offer without image');
        return false;
    }

    try {
        console.log(`TikTok API: Iniciando publicación para "${offer.title}"`);

        /**
         * NOTA: La API de TikTok para fotos requiere iniciar una sesión de subida.
         * En este paso inicial, creamos la solicitud de publicación.
         * Para una integración completa de producción se requiere un flujo OAuth2 
         * y manejo de refresco de tokens.
         */
        const caption = `${offer.title} - ${offer.discount} OFF! #Offertapps #Ofertas`;

        const response = await fetch(TIKTOK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_info: {
                    title: offer.title,
                    description: caption,
                    privacy_level: 'PUBLIC_TO_EVERYONE',
                    disable_comment: false,
                    disable_duet: false,
                    disable_stitch: false
                },
                source_info: {
                    source: 'PULL_FROM_URL',
                    photo_cover_index: 0,
                    photo_images: [offer.imageUrl]
                },
                post_mode: 'DIRECT_POST',
                media_type: 'PHOTO'
            })
        });

        const data = await response.json();

        if (data.error || (data.data && data.data.error_code !== 0)) {
            const errorMsg = data.error?.message || data.data?.error_msg || 'Unknown error';
            throw new Error(`TikTok API Error: ${errorMsg}`);
        }

        console.log('TikTok API: ¡Solicitud de publicación enviada con éxito!', data.data?.publish_id);
        return true;

    } catch (error) {
        console.error('TikTok API: Error en el proceso de publicación:', error);
        return false;
    }
};
