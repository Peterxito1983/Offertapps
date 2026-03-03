import React, { useState } from 'react';
import {
    IonModal,
    IonContent,
    IonIcon,
    IonBadge,
    IonButton
} from '@ionic/react';
import { close, locationOutline, timeOutline, calendar, star, starOutline, logoWhatsapp, heart, heartOutline } from 'ionicons/icons';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';
import { Offer, Company, Review } from '../types';
import { UserProfile } from '../services/authService';
import { Share } from '@capacitor/share';
import { sanitizePhoneNumber } from '../utils/validation';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';

interface OfferDetailModalProps {
    offer: Offer;
    company: Company;
    reviews: Review[];
    currentUser: UserProfile | null;
    onClose: () => void;
    onAddReview: (review: Omit<Review, 'id'>) => void;
    isOpen?: boolean;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
    offer,
    company,
    reviews = [],
    currentUser,
    onClose,
    onAddReview,
    isOpen = true
}) => {
    const [isFav, setIsFav] = useState(false);

    React.useEffect(() => {
        if (currentUser && offer) {
            isFavorite(currentUser.uid, offer.id).then(setIsFav);
        }
    }, [currentUser, offer]);

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            alert('Inicia sesión para guardar favoritos');
            return;
        }

        try {
            if (isFav) {
                await removeFromFavorites(currentUser.uid, offer.id);
                setIsFav(false);
            } else {
                await addToFavorites(currentUser.uid, offer.id);
                setIsFav(true);
            }
        } catch (error) {
            console.error('Error toggling favorite in modal:', error);
        }
    };

    const handleReviewSubmit = async (review: Omit<Review, 'id' | 'date'>) => {
        onAddReview({
            ...review,
            date: new Date().toISOString()
        } as Omit<Review, 'id'>);
    };

    const mainBranch = company.branches?.[0];

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            breakpoints={[0, 0.95, 1]}
            initialBreakpoint={0.95}
        >
            <IonContent style={{ '--background': 'var(--app-bg-color)' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <IonButton fill="clear" color="dark" onClick={onClose}>
                        <IonIcon icon={close} slot="icon-only" />
                    </IonButton>
                </div>

                <div style={{ padding: '0 20px 40px 20px' }}>
                    <div className="enhanced-card" style={{ height: '280px', marginBottom: '24px', position: 'relative' }}>
                        <img src={offer.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <IonBadge color="primary" style={{ position: 'absolute', top: '16px', left: '16px', padding: '10px 16px', borderRadius: '12px', fontSize: '1rem', fontWeight: '800' }}>
                            {offer.discount} OFF
                        </IonBadge>
                    </div>

                    <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 12px 0' }}>{offer.title}</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.7, lineHeight: '1.5', margin: '0 0 24px 0' }}>{offer.description}</p>

                    <div className="enhanced-card" style={{ padding: '20px', background: 'white', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <img src={company.logoUrl} style={{ width: '56px', height: '56px', borderRadius: '12px', marginRight: '16px' }} alt="" />
                            <div>
                                <h4 style={{ margin: 0, fontWeight: '700' }}>{company.name}</h4>
                                <IonBadge color="tertiary" style={{ fontSize: '0.7rem' }}>VERIFICADA</IonBadge>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <IonIcon icon={locationOutline} color="primary" />
                                <span>{company.address || mainBranch?.address}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <IonIcon icon={timeOutline} color="primary" />
                                <span>{company.openingHours || mainBranch?.openingHours}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '0.9rem',
                                padding: '8px 12px',
                                background: 'var(--ion-color-primary-light)',
                                borderRadius: '10px',
                                marginTop: '4px'
                            }}>
                                <IonIcon icon={calendar} color="primary" />
                                <span style={{ fontWeight: '600', color: 'var(--ion-color-primary-shade)' }}>
                                    {offer.isRecurring ? (
                                        'Esta es una oferta recurrente'
                                    ) : offer.validUntil ? (
                                        `Válida hasta el ${new Date(offer.validUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    ) : (
                                        'Consulta disponibilidad en tienda'
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                        <IonButton expand="block" shape="round" color="success" onClick={() => window.open(`https://wa.me/${sanitizePhoneNumber(company.whatsapp || '')}`, '_system')}>
                            <IonIcon icon={logoWhatsapp} slot="start" />
                            WHATSAPP
                        </IonButton>
                        <IonButton expand="block" shape="round" fill={isFav ? 'solid' : 'outline'} color="primary" onClick={handleToggleFavorite}>
                            <IonIcon icon={isFav ? heart : heartOutline} slot="start" />
                            {isFav ? 'GUARDADA' : 'GUARDAR'}
                        </IonButton>
                    </div>

                    <div className="reviews-section">
                        {currentUser ? (
                            <div style={{ marginBottom: '32px' }}>
                                <ReviewForm
                                    onSubmit={handleReviewSubmit}
                                    targetType="offer"
                                    targetId={offer.id}
                                    companyId={offer.companyId}
                                    userId={currentUser.uid}
                                    userName={currentUser.displayName || 'Usuario'}
                                    offerId={offer.id}
                                    placeholder="¿Qué te pareció esta oferta?"
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <p style={{ margin: 0, color: '#64748b', fontWeight: '600' }}>Inicia sesión para calificar esta oferta.</p>
                            </div>
                        )}

                        <ReviewList reviews={reviews} title="Reseñas de la Oferta" />
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};
