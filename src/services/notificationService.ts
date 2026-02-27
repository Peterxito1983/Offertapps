import { AppNotification, NotificationType } from '../types';
import { getCurrentUserProfile } from './authService';

/**
 * Servicio para gestionar las notificaciones internas de la aplicación
 */

// Mock de notificaciones iniciales para demostración
let MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: 'n1',
        userId: 'any',
        type: 'offers',
        title: '¡Nueva Oferta en Comida!',
        body: 'Tu restaurante favorito tiene un 30% de descuento en combos hoy.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        data: { offerId: 'o1' }
    },
    {
        id: 'n2',
        userId: 'any',
        type: 'promotions',
        title: 'Promoción Exclusiva',
        body: 'Aprovecha el 2x1 en calzado deportivo solo por este fin de semana.',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        read: false,
        data: { offerId: 'o2' }
    },
    {
        id: 'n3',
        userId: 'any',
        type: 'reminders',
        title: 'Oferta por Vencer',
        body: 'La oferta de "Pizza 2x1" que guardaste vence en 2 horas.',
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        read: true,
        data: { offerId: 'o3' }
    },
    {
        id: 'n4',
        userId: 'any',
        type: 'tracking',
        title: 'Actualización de tu consulta',
        body: 'La empresa ha respondido a tu pregunta sobre disponibilidad.',
        timestamp: new Date(Date.now() - 1440 * 60000).toISOString(),
        read: false,
        data: { offerId: 'o1' }
    }
];

export const getFilteredNotifications = async (userId: string): Promise<AppNotification[]> => {
    try {
        const profile = await getCurrentUserProfile();
        const prefs = (profile as any)?.notificationPreferences || {
            offers: true,
            promotions: true,
            reminders: true,
            tracking: true
        };

        // Filtramos las notificaciones según las preferencias activas del usuario
        return [...MOCK_NOTIFICATIONS].filter(notif => {
            if (notif.type === 'offers') return prefs.offers;
            if (notif.type === 'promotions') return prefs.promotions;
            if (notif.type === 'reminders') return prefs.reminders;
            if (notif.type === 'tracking') return prefs.tracking;
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error('Error al obtener notificaciones filtradas:', error);
        return [];
    }
};

export const markNotificationAsRead = (id: string) => {
    const n = MOCK_NOTIFICATIONS.find(notif => notif.id === id);
    if (n) n.read = true;
};

export const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
        ...notification,
        id: `n${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
    };
    MOCK_NOTIFICATIONS = [newNotif, ...MOCK_NOTIFICATIONS];
};
