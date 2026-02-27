// src/components/FavoriteOffersList.tsx

import React, { useState, useEffect } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonToast
} from '@ionic/react';
import { heart, heartOutline, star, pricetag, location } from 'ionicons/icons';
import { Offer, Company } from '../types';
import { getUserFavoriteOffers } from '../services/favoritesService';
import { getCompanies } from '../services/companiesService';
import { LazyImage } from './LazyImage';

interface FavoriteOffersListProps {
  userId: string;
  onRemoveFromFavorites: (offerId: string) => void;
  onShowOffer: (offer: Offer) => void;
}

export const FavoriteOffersList: React.FC<FavoriteOffersListProps> = ({
  userId,
  onRemoveFromFavorites,
  onShowOffer
}) => {
  const [favoriteOffers, setFavoriteOffers] = useState<Offer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Obtener ofertas favoritas y empresas
  useEffect(() => {
    loadFavoriteOffers();
  }, [userId]);

  const loadFavoriteOffers = async () => {
    try {
      setLoading(true);
      const offers = await getUserFavoriteOffers(userId);
      setFavoriteOffers(offers);

      // Obtener todas las empresas para mostrar información
      const allCompanies = await getCompanies();
      setCompanies(allCompanies);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setToastMessage('Error al cargar tus ofertas favoritas');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyById = (id: string) => {
    return companies.find(c => c.id === id) || {
      id: 'unknown',
      name: 'Empresa Externa',
      logoUrl: 'https://via.placeholder.com/40',
      branches: [],
      subscriptionPlan: 'basico',
      isVerified: false
    };
  };

  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);
    await loadFavoriteOffers();
    (event.target as HTMLIonRefresherElement).complete();
    setRefreshing(false);
  };

  const handleRemoveFromFavorites = (offerId: string) => {
    onRemoveFromFavorites(offerId);
    // Actualizar la lista localmente
    setFavoriteOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  return (
    <div>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent pullingText="Desliza para actualizar" refreshingText="Actualizando...">
        </IonRefresherContent>
      </IonRefresher>

      {loading ? (
        <IonGrid>
          <IonRow>
            {[...Array(3)].map((_, index) => (
              <IonCol key={index} size="12" sizeMd="6" sizeLg="4">
                <IonCard>
                  <div style={{ position: 'relative' }}>
                    <IonSkeletonText style={{ width: '100%', height: '200px' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <IonSkeletonText style={{ width: '60px', height: '20px', borderRadius: '10px' }} />
                    </div>
                  </div>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonSkeletonText style={{ width: '70%', height: '20px' }} />
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonSkeletonText style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
                    <IonSkeletonText style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonSkeletonText style={{ width: '40px', height: '20px' }} />
                      <IonSkeletonText style={{ width: '80px', height: '40px' }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      ) : favoriteOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <IonIcon
            icon={heartOutline}
            color="medium"
            style={{ fontSize: '64px', marginBottom: '16px' }}
          />
          <h3 style={{ margin: '16px 0', color: 'var(--ion-color-medium)' }}>Sin favoritos aún</h3>
          <p style={{ color: 'var(--ion-color-medium-shade)' }}>
            Añade ofertas a tus favoritos para verlas aquí
          </p>
        </div>
      ) : (
        <IonGrid>
          <IonRow>
            {favoriteOffers.map(offer => {
              const company = getCompanyById(offer.companyId);
              return (
                <IonCol key={offer.id} size="12" sizeMd="6" sizeLg="4">
                  <IonCard className="offer-card enhanced-card" onClick={() => onShowOffer(offer)}>
                    <div style={{ position: 'relative' }}>
                      <LazyImage
                        src={offer.imageUrl}
                        alt={offer.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        quality={0.7}
                      />
                      <IonButton
                        fill="clear"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          '--background': 'rgba(0, 0, 0, 0.3)',
                          '--border-radius': '50%'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(offer.id);
                        }}
                      >
                        <IonIcon icon={heart} color="danger" />
                      </IonButton>
                    </div>

                    <IonCardHeader>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <LazyImage
                          src={company.logoUrl || 'https://via.placeholder.com/40'}
                          alt={company.name || 'Empresa'}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: '12px'
                          }}
                          quality={0.7}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{company.name || 'Empresa'}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Favorito</div>
                        </div>
                      </div>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0' }}>
                        {offer.title}
                      </h2>
                    </IonCardHeader>

                    <IonCardContent>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                        {offer.description.substring(0, 100)}{offer.description.length > 100 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonBadge color="primary" style={{ fontSize: '16px', padding: '8px 16px' }}>
                          {offer.discount}
                        </IonBadge>
                        <IonButton onClick={(e) => { e.stopPropagation(); onShowOffer(offer); }} color="primary">
                          Ver Oferta
                        </IonButton>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>
      )}

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        color="danger"
        onDidDismiss={() => setShowToast(false)}
      />
    </div>
  );
};