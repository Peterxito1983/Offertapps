import React, { useEffect, useRef } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonText
} from '@ionic/react';
import { Company, Offer } from '../types';
import { getCurrentLocation } from '../services/locationService';

interface MapViewProps {
    companies: Company[];
    offers: Offer[];
}

// Extender el tipo window para Leaflet (L)
declare global {
    interface Window {
        L: any;
    }
}

export const MapView: React.FC<MapViewProps> = ({ companies, offers }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Esperar a que Leaflet esté disponible si es necesario
        const initMap = async () => {
            if (!window.L) {
                setTimeout(initMap, 100);
                return;
            }

            if (!mapRef.current) {
                // Coordenadas centrales por defecto (Bogotá)
                const defaultCenter: [number, number] = [4.6097, -74.0817];

                mapRef.current = window.L.map(mapContainerRef.current, {
                    zoomControl: false // Ocultar para un look más limpio
                }).setView(defaultCenter, 13);

                // Intentar obtener ubicación real del usuario
                const userLoc = await getCurrentLocation();
                if (userLoc) {
                    mapRef.current.setView([userLoc.latitude, userLoc.longitude], 15);

                    // Añadir marcador de "Mi ubicación"
                    const userIcon = window.L.divIcon({
                        className: 'user-location-icon',
                        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); position: relative;">
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: #3b82f6; opacity: 0.3; animation: pulse 2s infinite;"></div>
                               </div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    window.L.marker([userLoc.latitude, userLoc.longitude], { icon: userIcon })
                        .addTo(mapRef.current)
                        .bindPopup("Estás aquí");
                }

                // Usamos un estilo de mapa más premium y limpio (CartoDB Positron)
                window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(mapRef.current);

                // Añadir control de zoom en una posición más discreta
                window.L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
            }

            // Añadir marcadores por cada empresa
            companies.forEach(company => {
                if (company.branches && company.branches.length > 0) {
                    company.branches.forEach(branch => {
                        if (branch.latitude && branch.longitude) {
                            const companyOffers = offers.filter(off => off.companyId === company.id);

                            const popupContent = `
                                <div style="font-family: 'Inter', sans-serif; padding: 10px; min-width: 150px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                        <img src="${company.logoUrl || 'https://via.placeholder.com/40'}" 
                                             style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px; object-fit: cover;">
                                        <strong style="color: #6366f1; font-size: 14px;">${company.name}</strong>
                                    </div>
                                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                                        <i class="location-icon"></i> ${branch.address}
                                    </div>
                                    <div style="background: #eef2ff; color: #6366f1; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block;">
                                        ${companyOffers.length} ofertas activas
                                    </div>
                                </div>
                            `;

                            const icon = window.L.divIcon({
                                className: 'custom-div-icon',
                                html: `<div style="background-color: #6366f1; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                                        <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
                                       </div>`,
                                iconSize: [30, 42],
                                iconAnchor: [15, 42]
                            });

                            window.L.marker([branch.latitude, branch.longitude], { icon })
                                .addTo(mapRef.current)
                                .bindPopup(popupContent, {
                                    className: 'premium-popup'
                                });
                        }
                    });
                }
            });
        };

        const timeout = setTimeout(initMap, 500);
        return () => {
            clearTimeout(timeout);
            // No destruimos el mapa al desmontar para evitar problemas de re-renderizado rápido
            // Pero en una app real convendría manejarlo mejor
        };
    }, [companies, offers]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Explorar Mapa</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div
                    ref={mapContainerRef}
                    style={{ width: '100%', height: '100%', minHeight: '300px' }}
                />
            </IonContent>
        </IonPage>
    );
};
