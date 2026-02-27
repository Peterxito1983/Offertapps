const axios = require('axios');
const functions = require('firebase-functions');

/**
 * Publicar en Instagram usando Meta Graph API
 */
const postToInstagram = async (postData) => {
    const BUSINESS_ID = process.env.VITE_INSTAGRAM_BUSINESS_ID || functions.config().meta?.instagram_id;
    const ACCESS_TOKEN = process.env.VITE_INSTAGRAM_ACCESS_TOKEN || functions.config().meta?.access_token;

    if (!BUSINESS_ID || !ACCESS_TOKEN || BUSINESS_ID.includes('tu_id')) {
        console.warn('Meta API: Instagram Business ID o Access Token no configurado.');
        return null;
    }

    const { title, description, imageUrl, discount } = postData;
    const caption = `${title}\n\n🔥 ${discount} de descuento\n\n${description}\n\n#Offertapps #Ofertas #Colombia`;

    try {
        // Paso 1: Crear contenedor de medios
        const containerRes = await axios.post(`https://graph.facebook.com/v19.0/${BUSINESS_ID}/media`, {
            image_url: imageUrl,
            caption: caption,
            access_token: ACCESS_TOKEN
        });

        const creationId = containerRes.data.id;

        // Paso 2: Publicar medios
        const publishRes = await axios.post(`https://graph.facebook.com/v19.0/${BUSINESS_ID}/media_publish`, {
            creation_id: creationId,
            access_token: ACCESS_TOKEN
        });

        console.log('Instagram: Publicación exitosa ID:', publishRes.data.id);
        return { platform: 'instagram', id: publishRes.data.id };
    } catch (error) {
        console.error('Error publicando en Instagram:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Publicar en Facebook usando Meta Graph API
 */
const postToFacebook = async (postData) => {
    const PAGE_ID = process.env.VITE_FACEBOOK_PAGE_ID || functions.config().meta?.facebook_page_id;
    const PAGE_TOKEN = process.env.VITE_FACEBOOK_PAGE_TOKEN || functions.config().meta?.facebook_page_token;

    if (!PAGE_ID || !PAGE_TOKEN || PAGE_ID.includes('tu_page')) {
        console.warn('Meta API: Facebook Page ID o Page Token no configurado.');
        return null;
    }

    const { title, description, imageUrl, discount } = postData;
    const message = `${title}\n\n🔥 ${discount} de descuento\n\n${description}\n\n#Offertapps #Ofertas #Colombia`;

    try {
        const response = await axios.post(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
            url: imageUrl,
            message: message,
            access_token: PAGE_TOKEN
        });

        console.log('Facebook: Publicación exitosa ID:', response.data.id);
        return { platform: 'facebook', id: response.data.id };
    } catch (error) {
        console.error('Error publicando en Facebook:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Orquestador de publicaciones sociales
 */
const postToSocialMedia = async (postData) => {
    const results = [];

    // Ejecutar publicaciones en paralelo para mayor eficiencia
    const jobs = [
        postToInstagram(postData).catch(err => ({ error: err.message, platform: 'instagram' })),
        postToFacebook(postData).catch(err => ({ error: err.message, platform: 'facebook' }))
    ];

    const outcomes = await Promise.all(jobs);

    outcomes.forEach(outcome => {
        if (outcome && !outcome.error) {
            results.push(outcome);
        }
    });

    return results.length > 0 ? results : null;
};

module.exports = { postToSocialMedia };
