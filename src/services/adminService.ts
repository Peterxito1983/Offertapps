import { ref, get, update, set } from 'firebase/database';
import { db } from '../config';
import { SubscriptionPlan } from '../types/paymentTypes';

const APP_CONFIG_REF = 'app_config';

export interface AppConfig {
    subscriptionPrices: Record<SubscriptionPlan, number>;
    maintenanceMode: boolean;
}

/**
 * Obtener configuración global de la aplicación
 */
export const getAppConfig = async (): Promise<AppConfig> => {
    try {
        const configRef = ref(db, APP_CONFIG_REF);
        const snapshot = await get(configRef);

        if (!snapshot.exists()) {
            // Default config if not exists
            return {
                subscriptionPrices: {
                    basico: 49900,
                    premium: 99900
                },
                maintenanceMode: false
            };
        }

        return snapshot.val() as AppConfig;
    } catch (error) {
        console.error('Error fetching app config:', error);
        return {
            subscriptionPrices: { basico: 49900, premium: 99900 },
            maintenanceMode: false
        };
    }
};

/**
 * Actualizar precios de suscripción
 */
export const updateSubscriptionPrices = async (prices: Record<SubscriptionPlan, number>): Promise<void> => {
    try {
        console.log('Tentando actualizar precios en Firebase:', prices);
        const configRef = ref(db, `${APP_CONFIG_REF}/subscriptionPrices`);
        await set(configRef, prices);
        console.log('Precios actualizados correctamente en Firebase');
    } catch (error: any) {
        console.error('Error detallado al actualizar precios:', error);
        throw error;
    }
};

/**
 * Obtener todas las ofertas (activas e inactivas)
 */
export const getAllOffers = async (): Promise<any[]> => {
    try {
        const offersRef = ref(db, 'offers');
        const snapshot = await get(offersRef);
        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    } catch (error) {
        console.error('Error fetching all offers:', error);
        return [];
    }
};

/**
 * Generar datos para el reporte global
 */
export const getGlobalReportData = async (companies: any[], offers: any[], reviews: any[]) => {
    // Simulación de agregación de datos
    const totalViews = Math.floor(Math.random() * 50000) + 10000;
    const totalClicks = Math.floor(totalViews * 0.12);

    return {
        metrics: [
            { label: 'Visualizaciones Totales', value: totalViews.toLocaleString() },
            { label: 'Clicks WhatsApp Totales', value: totalClicks.toLocaleString() },
            { label: 'CTR Promedio', value: '12.4%' },
            { label: 'Empresas Activas', value: companies.filter(c => c.isVerified).length.toString() }
        ],
        chartData: [
            { month: 'Ene', value: 400 },
            { month: 'Feb', value: 300 },
            { month: 'Mar', value: 600 }
        ]
    };
};
