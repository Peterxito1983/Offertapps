import { Interaction } from '../types';

/**
 * Servicio para la gestión de analíticas e interacciones
 */

// Mock data para demostración (basado en el requerimiento del usuario)
const MOCK_INTERACTIONS: Interaction[] = [
    {
        id: '1',
        companyId: 'current-company',
        userId: 'u1',
        userName: 'Juan Pérez',
        offerId: 'o1',
        offerTitle: 'Combo Almuerzo',
        action: 'Click WhatsApp',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
        id: '2',
        companyId: 'current-company',
        userId: 'u2',
        userName: 'María García',
        offerId: 'o2',
        offerTitle: 'Pizza 2x1',
        action: 'Guardó Oferta',
        timestamp: new Date(Date.now() - 22 * 60000).toISOString()
    },
    {
        id: '3',
        companyId: 'current-company',
        userId: 'u3',
        userName: 'Carlos Ruiz',
        offerId: 'o1',
        offerTitle: 'Combo Almuerzo',
        action: 'Click WhatsApp',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
        id: '4',
        companyId: 'current-company',
        userId: 'u4',
        userName: 'Elena Torres',
        offerId: 'o3',
        offerTitle: 'Cena Romántica',
        action: 'Visualización',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
        id: '5',
        companyId: 'current-company',
        userId: 'u5',
        userName: 'Roberto Gómez',
        offerId: 'o2',
        offerTitle: 'Pizza 2x1',
        action: 'Compartió',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString()
    }
];

export const getInteractionsByCompany = async (companyId: string): Promise<Interaction[]> => {
    // En el futuro esto consultará Firebase
    // Por ahora filtramos el mock y simulamos delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_INTERACTIONS.filter(i => i.companyId === 'current-company' || i.companyId === companyId));
        }, 800);
    });
};
