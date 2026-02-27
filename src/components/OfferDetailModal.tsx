import React, { useState } from 'react';
import {
    IonModal,
    IonContent,
    IonIcon,
    IonBadge,
    IonButton
} from '@ionic/react';
import { close, locationOutline, timeOutline, star, starOutline, logoWhatsapp, heart, heartOutline } from 'ionicons/icons';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';
import { Offer, Company, Review } from '../types';
import { UserProfile } from '../services/authService';
import { Share } from '@capacitor/share';
import { sanitizePhoneNumber } from '../utils/validation';

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
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
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

    const handleAddReview = () => {
        if (!currentUser || !comment.trim()) return;
        onAddReview({
            offerId: offer.id,
            companyId: offer.companyId,
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Usuario',
            rating,
            comment,
            date: new Date().toISOString()
        });
        setComment('');
        setRating(5);
    };

    const renderStars = (currentRating: number, interactive: boolean = false) => {
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: interactive ? 'center' : 'flex-start' }}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <IonIcon
                        key={starValue}
                        icon={starValue <= currentRating ? star : starOutline}
                        onClick={() => interactive && setRating(starValue)}
                        style={{
                            color: starValue <= currentRating ? 'var(--ion-color-tertiary)' : '#d1d5db',
                            fontSize: interactive ? '32px' : '18px',
                            cursor: interactive ? 'pointer' : 'default'
                        }}
                    />
                ))}
            </div>
        );
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
                        <h3 style={{ fontWeight: '800', marginBottom: '20px' }}>Reseñas</h3>

                        {currentUser ? (
                            <div className="enhanced-card" style={{ padding: '20px', background: 'white', marginBottom: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>{renderStars(rating, true)}</div>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Deja tu comentario..."
                                    style={{ width: '100%', height: '100px', border: '1px solid #eee', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}
                                />
                                <IonButton expand="block" shape="round" onClick={handleAddReview} disabled={!comment.trim()}>Publicar</IonButton>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', background: '#eee', borderRadius: '12px', marginBottom: '24px' }}>
                                Inicia sesión para calificar esta oferta.
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.map(review => (
                                <div key={review.id} className="enhanced-card" style={{ padding: '16px', background: 'white' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '700' }}>{review.userName}</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    {renderStars(review.rating)}
                                    <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', opacity: 0.8 }}>"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};
