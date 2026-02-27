import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonToast
} from '@ionic/react';
import { FavoriteOffersList } from '../components/FavoriteOffersList';
import { Offer, Company, Review } from '../types';
import { UserProfile } from '../services/authService';
import { removeFromFavorites } from '../services/favoritesService';
import { OfferDetailModal } from '../components/OfferDetailModal';

interface FavoritesViewProps {
    userId: string;
    currentUser: UserProfile | null;
    companies: Company[];
    reviews: Review[];
    onAddReview: (review: Omit<Review, 'id'>) => void;
    onShowOffer: (offer: Offer) => void;
    onCloseOffer: () => void;
    selectedOffer: Offer | null;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
    userId,
    currentUser,
    companies,
    reviews,
    onAddReview,
    onShowOffer,
    onCloseOffer,
    selectedOffer: globalSelectedOffer
}) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleRemoveFromFavorites = async (offerId: string) => {
        try {
            await removeFromFavorites(userId, offerId);
            setToastMessage('Oferta eliminada de favoritos');
            setShowToast(true);
        } catch (error) {
            console.error('Error al eliminar de favoritos:', error);
            setToastMessage('Error al eliminar de favoritos');
            setShowToast(true);
        }
    };

    const handleShowOffer = (offer: Offer) => {
        onShowOffer(offer);
    };

    const getCompanyForOffer = (offer: Offer) => {
        return companies.find(c => c.id === offer.companyId) || {
            id: 'unknown',
            name: 'Empresa',
            logoUrl: 'https://via.placeholder.com/150',
            branches: [],
            subscriptionPlan: 'basico',
            isVerified: false
        } as Company;
    };

    const getReviewsForOffer = (offerId: string) => {
        return reviews.filter(r => r.offerId === offerId);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Mis Favoritos</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <FavoriteOffersList
                    userId={userId}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    onShowOffer={handleShowOffer}
                />

                {/* El modal ahora se maneja globalmente en App.tsx */}

                <IonToast
                    isOpen={showToast}
                    message={toastMessage}
                    duration={2000}
                    onDidDismiss={() => setShowToast(false)}
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};
