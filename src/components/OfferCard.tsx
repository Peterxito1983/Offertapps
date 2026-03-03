import React from 'react';
import { IonIcon } from '@ionic/react';
import { heart, heartOutline, arrowForward, timeOutline } from 'ionicons/icons';
import { Offer, Company } from '../types';
import { LazyImage } from './LazyImage';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';
import './OfferCard.css';

interface OfferCardProps {
    offer: Offer;
    company: Company;
    onShowOffer: (offer: Offer) => void;
    userId?: string;
    distance?: string;
    // Compatibility props
    companyName?: string;
    companyLogo?: string;
    onClick?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, company, onShowOffer, userId, distance, onClick }) => {
    const [isFav, setIsFav] = React.useState(false);

    React.useEffect(() => {
        if (userId && offer.id) {
            isFavorite(userId, offer.id).then(setIsFav);
        }
    }, [userId, offer.id]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) return; // Optional: Prompt login here

        try {
            // Optimistic update
            const newFavStatus = !isFav;
            setIsFav(newFavStatus);

            if (isFav) {
                await removeFromFavorites(userId, offer.id);
            } else {
                await addToFavorites(userId, offer.id);
                // Notificar al usuario que se guardó con éxito
                import('../services/notificationService').then(({ addNotification }) => {
                    addNotification({
                        userId,
                        type: 'offers',
                        title: 'Oferta Guardada',
                        body: `Has guardado "${offer.title}" en tus favoritos. Haz clic para ver los detalles.`,
                        data: { offerId: offer.id }
                    });
                });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setIsFav(!isFav); // Rollback on error
        }
    };

    const handleClick = () => {
        if (onShowOffer) onShowOffer(offer);
        if (onClick) onClick();
    };

    return (
        <div className="shopee-offer-card" onClick={handleClick}>
            <div className="shopee-card-image-wrap">
                <LazyImage
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="shopee-card-image"
                />
                {offer.discount && (
                    <div className="shopee-discount-tag">
                        <span>{offer.discount}</span>
                        <div className="shopee-discount-bg"></div>
                    </div>
                )}

                <div className="shopee-card-actions-overlay">
                    <button
                        className={`shopee-action-btn favorite-btn ${isFav ? 'active' : ''}`}
                        onClick={handleToggleFavorite}
                    >
                        <IonIcon icon={isFav ? heart : heartOutline} />
                    </button>
                    <button
                        className="shopee-action-btn track-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (userId) {
                                import('../services/notificationService').then(({ addNotification }) => {
                                    addNotification({
                                        userId,
                                        type: 'tracking',
                                        title: 'Seguimiento Activado',
                                        body: `Ahora recibirás actualizaciones sobre "${offer.title}".`,
                                        data: { offerId: offer.id }
                                    });
                                    alert('Siguiendo oferta: ' + offer.title);
                                });
                            } else {
                                alert('Inicia sesión para seguir ofertas');
                            }
                        }}
                    >
                        <IonIcon icon={timeOutline} />
                    </button>
                </div>
            </div>

            <div className="shopee-card-info">
                <div className="shopee-card-title">
                    {offer.title}
                </div>

                <div className="shopee-card-price-row">
                    <span className="shopee-card-currency">$</span>
                    <span className="shopee-card-price">
                        {/* Assuming price is handled or extracted from description/title in real app */}
                        {offer.discount ? 'Oferta' : 'Ver más'}
                    </span>
                </div>

                <div className="shopee-card-meta">
                    <div className="shopee-card-validity" style={{ color: 'var(--ion-color-primary)', fontWeight: '600', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <IonIcon icon={timeOutline} style={{ fontSize: '12px' }} />
                        {offer.isRecurring ? (
                            <span>Oferta Recurrente</span>
                        ) : offer.validUntil ? (
                            <span>Válida hasta: {new Date(offer.validUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                        ) : (
                            <span>Ver vigencia</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="shopee-card-location">
                            {company.city || 'Colombia'}
                        </div>
                        {distance && (
                            <div className="shopee-card-distance">
                                {distance}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
