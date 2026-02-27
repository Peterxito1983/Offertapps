/**
 * Servicio para la gestión automatizada de campañas publicitarias en Meta (Facebook/Instagram)
 * Utiliza Meta Marketing API v19.0+
 */

import { Offer, CampaignData } from '../types';

const ACCESS_TOKEN = import.meta.env.VITE_META_ADS_ACCESS_TOKEN;
const AD_ACCOUNT_ID = import.meta.env.VITE_META_AD_ACCOUNT_ID; // Formato act_<ID>
const API_VERSION = 'v19.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

/**
 * Crea una campaña publicitaria completa en Meta
 * El flujo es: Campaign -> Ad Set -> Ad Creative -> Ad
 */
export const createMetaCampaign = async (offer: Offer, campaignParams: CampaignData): Promise<{ id: string } | null> => {
    if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
        console.warn('Meta Ads API: Configuración faltante (VITE_META_ADS_ACCESS_TOKEN o VITE_META_AD_ACCOUNT_ID)');
        // Simulamos éxito para propósitos de demostración si no hay tokens
        return new Promise(resolve => setTimeout(() => resolve({ id: `sim_camp_${Date.now()}` }), 2000));
    }

    try {
        console.log('Meta Ads API: Iniciando creación de campaña para:', offer.title);

        // 1. Crear la Campaña (Campaign)
        const campaignId = await createCampaignObject(offer.title);

        // 2. Crear el Conjunto de Anuncios (Ad Set)
        const adSetId = await createAdSetObject(campaignId, campaignParams.budgetAmount);

        // 3. Crear la Creatividad del Anuncio (Ad Creative)
        const creativeId = await createAdCreativeObject(offer);

        // 4. Crear el Anuncio final (Ad)
        const adId = await createAdObject(adSetId, creativeId, offer.title);

        console.log('Meta Ads API: Campaña creada con éxito. Ad ID:', adId);
        return { id: adId };

    } catch (error: any) {
        console.error('Meta Ads API Error:', error);
        throw new Error(`Error al crear campaña en Meta: ${error.message}`);
    }
};

/**
 * Paso 1: Crear el objeto Campaign
 */
async function createCampaignObject(title: string): Promise<string> {
    const response = await fetch(`${GRAPH_BASE_URL}/${AD_ACCOUNT_ID}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `Oferta: ${title} - ${new Date().toLocaleDateString()}`,
            objective: 'OUTCOME_TRAFFIC',
            status: 'PAUSED', // Empezamos en pausa para revisión o activación posterior
            special_ad_categories: 'NONE',
            access_token: ACCESS_TOKEN
        })
    });
    const data = await response.json();
    if (data.error) throw data.error;
    return data.id;
}

/**
 * Paso 2: Crear Ad Set con presupuesto
 */
async function createAdSetObject(campaignId: string, dailyBudget: number): Promise<string> {
    const response = await fetch(`${GRAPH_BASE_URL}/${AD_ACCOUNT_ID}/adsets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'AdSet General - Optimización Offertapps',
            campaign_id: campaignId,
            daily_budget: dailyBudget * 100, // Meta usa centavos
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            targeting: {
                geo_locations: { countries: ['CO'] }, // Por defecto Colombia
                publisher_platforms: ['facebook', 'instagram', 'messenger']
            },
            status: 'ACTIVE',
            access_token: ACCESS_TOKEN
        })
    });
    const data = await response.json();
    if (data.error) throw data.error;
    return data.id;
}

/**
 * Paso 3: Crear Ad Creative (el aspecto visual)
 */
async function createAdCreativeObject(offer: Offer): Promise<string> {
    const response = await fetch(`${GRAPH_BASE_URL}/${AD_ACCOUNT_ID}/adcreatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `Creative: ${offer.title}`,
            object_story_spec: {
                page_id: import.meta.env.VITE_FACEBOOK_PAGE_ID,
                link_data: {
                    image_url: offer.imageUrl,
                    link: 'https://offertapps.com', // URL de la app o deep link
                    message: `${offer.title}\n\n🔥 ${offer.discount} de descuento\n\n${offer.description}`,
                    call_to_action: { type: 'LEARN_MORE' }
                }
            },
            access_token: ACCESS_TOKEN
        })
    });
    const data = await response.json();
    if (data.error) throw data.error;
    return data.id;
}

/**
 * Paso 4: Unir todo en un Ad
 */
async function createAdObject(adSetId: string, creativeId: string, title: string): Promise<string> {
    const response = await fetch(`${GRAPH_BASE_URL}/${AD_ACCOUNT_ID}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `Anuncio: ${title}`,
            adset_id: adSetId,
            creative: { creative_id: creativeId },
            status: 'ACTIVE',
            access_token: ACCESS_TOKEN
        })
    });
    const data = await response.json();
    if (data.error) throw data.error;
    return data.id;
}
