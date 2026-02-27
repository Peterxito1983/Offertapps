import { Geolocation, Position } from '@capacitor/geolocation';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Solicita permisos de ubicación y obtiene la posición actual
 */
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
    try {
        const check = await Geolocation.checkPermissions();

        if (check.location === 'denied') {
            console.warn('Permisos de ubicación denegados previamente');
            // En una app real, aquí podríamos mostrar una alerta sugiriendo ir a ajustes
            return null;
        }

        if (check.location === 'prompt' || check.location === 'prompt-with-rationale') {
            const request = await Geolocation.requestPermissions();
            if (request.location !== 'granted') {
                return null;
            }
        }

        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000 // Cache de 3 segundos
        });

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (error) {
        console.error('Error al obtener la ubicación:', error);
        return null;
    }
};

/**
 * Función específica para solicitar permisos (útil para botones de "Activar Ubicación")
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
    try {
        const status = await Geolocation.requestPermissions();
        return status.location === 'granted';
    } catch (e) {
        return false;
    }
};


/**
 * Calcula la distancia entre dos puntos en km usando la fórmula de Haversine
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Retorna km
};

/**
 * Formatea la distancia para mostrar al usuario
 */
export const formatDistance = (km: number): string => {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
};
