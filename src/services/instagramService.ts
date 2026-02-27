/**
 * Servicio para publicar ofertas automáticamente en Instagram
 * Utiliza Meta Graph API (Instagram Content Publishing API)
 */

import { Offer } from '../types';

const INSTAGRAM_BUSINESS_ID = import.meta.env.VITE_INSTAGRAM_BUSINESS_ID;
const ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

/**
 * Publica una oferta en Instagram (@prue.batester)
 */
export const publishOfferToInstagram = async (offer: Offer): Promise<boolean> => {
    // Si no hay configuración, saltamos silenciosamente (evita bloqueos en dev)
    if (!INSTAGRAM_BUSINESS_ID || !ACCESS_TOKEN) {
        console.warn('Instagram API: Missing configuration (INSTAGRAM_BUSINESS_ID or ACCESS_TOKEN)');
        return false;
    }

    if (!offer.imageUrl) {
        console.error('Instagram API: Cannot publish offer without image');
        return false;
    }

    try {
        console.log(`Instagram API: Iniciando publicación para "${offer.title}"`);

        // Paso 1: Crear el contenedor de medios (Media Container)
        // La descripción incluye el título, descuento y descripción de la oferta
        const caption = `${offer.title}\n\n🔥 ${offer.discount} de descuento\n\n${offer.description}\n\n#Offertapps #Ofertas #Colombia`;

        const containerResponse = await fetch(`${GRAPH_API_URL}/${INSTAGRAM_BUSINESS_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: offer.imageUrl,
                caption: caption,
                access_token: ACCESS_TOKEN
            })
        });

        const containerData = await containerResponse.json();

        if (containerData.error) {
            throw new Error(`Instagram API Media Error: ${containerData.error.message}`);
        }

        const creationId = containerData.id;
        console.log('Instagram API: Contenedor creado ID:', creationId);

        // Paso 2: Publicar el contenedor (Publish Media)
        const publishResponse = await fetch(`${GRAPH_API_URL}/${INSTAGRAM_BUSINESS_ID}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: ACCESS_TOKEN
            })
        });

        const publishData = await publishResponse.json();

        if (publishData.error) {
            throw new Error(`Instagram API Publish Error: ${publishData.error.message}`);
        }

        console.log('Instagram API: ¡Publicación exitosa! Link ID:', publishData.id);
        return true;

    } catch (error) {
        console.error('Instagram API: Error en el proceso de publicación:', error);
        return false;
    }
};
