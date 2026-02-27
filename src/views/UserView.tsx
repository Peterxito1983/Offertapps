import React, { useState, useMemo } from 'react';
import {
    IonPage,
    IonContent,
    IonSearchbar,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon
} from '@ionic/react';
import { search, sparkles, flash, fitness, shirt, laptop, car, home, map } from 'ionicons/icons';
import { Header } from '../components/Header';
import { OfferCard } from '../components/OfferCard';
import { OfferDetailModal } from '../components/OfferDetailModal';
import { Offer, Company, OfferCategory, Review, CATEGORIES, Role, AppNotification } from '../types';
import { signOut, UserProfile } from '../services/authService';
import { getCurrentLocation, calculateDistance, formatDistance } from '../services/locationService';
import './UserView.css';

interface UserViewProps {
    offers: Offer[];
    companies: Company[];
    reviews: Review[];
    userId: string;
    currentUser: UserProfile | null;
    onAddReview: (review: Omit<Review, 'id'>) => void;
    onShowOffer: (offer: Offer) => void;
    onCloseOffer: () => void;
    selectedOffer: Offer | null;
}

const categoriesInfo: { name: OfferCategory | 'Todos', icon: string }[] = [
    { name: 'Todos', icon: flash },
    { name: 'Comida', icon: sparkles },
    { name: 'Moda', icon: shirt },
    { name: 'Tecnología', icon: laptop },
    { name: 'Servicios', icon: fitness },
    { name: 'Viajes', icon: car },
    { name: 'Hogar', icon: home },
    { name: 'Cerca de mí' as any, icon: map }
];

export const UserView: React.FC<UserViewProps> = ({ offers, companies, reviews, userId, currentUser, onAddReview, onShowOffer, onCloseOffer, selectedOffer: globalSelectedOffer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<OfferCategory | 'Todos' | 'Cerca de mí'>('Todos');
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    const [loadingLocation, setLoadingLocation] = React.useState(false);

    const loadLocation = async () => {
        setLoadingLocation(true);
        const loc = await getCurrentLocation();
        if (loc) setUserLocation(loc);
        setLoadingLocation(false);
    };

    React.useEffect(() => {
        loadLocation();
    }, []);

    const getCompanyById = (id: string): Company => companies.find(c => c.id === id) || {
        id: 'unknown',
        name: 'Empresa',
        logoUrl: 'https://via.placeholder.com/100',
        address: '',
        city: '',
        whatsapp: '',
        openingHours: '',
        branches: [],
        subscriptionPlan: 'basico' as const,
        isVerified: false
    };

    const getReviewsForOffer = (offerId: string) => reviews.filter(review => review.offerId === offerId);

    const filteredOffers = useMemo(() => {
        let result = activeCategory === 'Todos'
            ? offers
            : activeCategory === 'Cerca de mí'
                ? offers.filter(offer => {
                    const company = getCompanyById(offer.companyId);
                    const branches = company.branches || [];
                    const branch = offer.branchId ? branches.find(b => b.id === offer.branchId) : branches[0];
                    if (!branch || !branch.latitude || !branch.longitude || !userLocation) return false;
                    const dist = calculateDistance(userLocation.latitude, userLocation.longitude, branch.latitude, branch.longitude);
                    return dist < 10; // 10km a la redonda para "Cerca de mí"
                })
                : offers.filter(offer => offer.category === activeCategory);

        return result.filter(offer => {
            const company = getCompanyById(offer.companyId);
            const searchTermLower = searchTerm.toLowerCase();
            return offer.title.toLowerCase().includes(searchTermLower) ||
                offer.description.toLowerCase().includes(searchTermLower) ||
                offer.category.toLowerCase().includes(searchTermLower) ||
                (company && company.name.toLowerCase().includes(searchTermLower));
        });
    }, [searchTerm, activeCategory, offers, companies]);

    const handleShowOffer = (offer: Offer) => onShowOffer(offer);
    const handleCloseModal = () => onCloseOffer();

    const handleNotificationRedirect = (notif: AppNotification) => {
        console.log("UserView: handleNotificationRedirect disparado", notif);
        if (notif.data?.offerId) {
            const offer = offers.find(o => o.id === notif.data.offerId);
            if (offer) {
                console.log("UserView: Oferta encontrada, llamando a onShowOffer", offer.id);
                onShowOffer(offer);
            } else {
                console.error("UserView: No se encontró la oferta con ID", notif.data.offerId);
                alert("No se encontró la oferta: " + notif.data.offerId);
            }
        }
    };

    return (
        <IonPage>
            <Header
                currentRole={Role.USER}
                userId={userId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNotificationClick={handleNotificationRedirect}
            />

            <IonContent fullscreen style={{ '--background': '#f5f5f5' }}>
                {/* Shopee Banner / Hero */}
                <div className="shopee-hero">
                    <div className="shopee-banner-placeholder" style={{ background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary))', borderRadius: '20px', padding: '40px', color: 'white', marginBottom: '24px' }}>
                        <div className="banner-slide">
                            <h2 style={{ fontWeight: '800', fontSize: '2rem', margin: '0 0 8px 0' }}>OFERTAS<br />RELÁMPAGO</h2>
                            <p style={{ margin: 0, opacity: 0.9 }}>Descuentos que te harán volar</p>
                        </div>
                    </div>
                </div>

                {/* New Prominent Search Section */}
                <div className="user-search-section">
                    <IonSearchbar
                        value={searchTerm}
                        onIonInput={(e) => setSearchTerm(e.detail.value!)}
                        placeholder="Buscar ofertas y descuentos"
                        className="user-main-searchbar"
                        animated={true}
                    />
                </div>

                {/* Shopee Categories (Round Icons) */}
                <div className="shopee-categories-container">
                    <div className="shopee-categories-scroll">
                        {categoriesInfo.map(cat => (
                            <div
                                key={cat.name}
                                className={`shopee-category-item ${activeCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                <div className="icon-wrap" style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '30px',
                                    background: activeCategory === cat.name ? 'var(--ion-color-primary)' : 'white',
                                    color: activeCategory === cat.name ? 'white' : 'var(--app-text-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    fontSize: '24px'
                                }}>
                                    <IonIcon icon={cat.icon} />
                                </div>
                                <span className="category-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offers Grid */}
                <div style={{ padding: '0 12px 32px 12px' }}>
                    {activeCategory === 'Cerca de mí' && !userLocation ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '24px', margin: '0 8px 24px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📍</div>
                            <h3 style={{ fontWeight: '800', margin: '0 0 8px 0' }}>Ubicación necesaria</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
                                Para ver ofertas cerca de ti, necesitamos acceder a tu ubicación.
                            </p>
                            <button
                                onClick={loadLocation}
                                disabled={loadingLocation}
                                style={{
                                    backgroundColor: 'var(--ion-color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)'
                                }}
                            >
                                {loadingLocation ? 'Cargando...' : 'Activar Ubicación'}
                            </button>
                        </div>
                    ) : filteredOffers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <IonIcon icon={search} style={{ fontSize: '32px', color: '#94a3b8' }} />
                            </div>
                            <h3 style={{ fontWeight: '800', margin: '0 0 8px 0', color: 'var(--ion-color-dark)' }}>
                                Sin resultados
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0' }}>
                                No encontramos ofertas que coincidan con tu búsqueda.
                            </p>
                        </div>
                    ) : (
                        <IonGrid className="shopee-product-grid">
                            <IonRow>
                                {filteredOffers.map(offer => {
                                    const company = getCompanyById(offer.companyId);
                                    let distanceStr = undefined;

                                    if (userLocation) {
                                        const branches = company.branches || [];
                                        const branch = offer.branchId ? branches.find(b => b.id === offer.branchId) : branches[0];
                                        if (branch && branch.latitude && branch.longitude) {
                                            const dist = calculateDistance(userLocation.latitude, userLocation.longitude, branch.latitude, branch.longitude);
                                            distanceStr = formatDistance(dist);
                                        }
                                    }

                                    return (
                                        <IonCol key={offer.id} size="6" sizeMd="4" sizeLg="2" className="shopee-product-col">
                                            <OfferCard
                                                offer={offer}
                                                company={company}
                                                userId={userId}
                                                distance={distanceStr}
                                                onShowOffer={handleShowOffer}
                                            />
                                        </IonCol>
                                    );
                                })}
                            </IonRow>
                        </IonGrid>
                    )}
                </div>

                {/* El modal ahora se maneja globalmente en App.tsx */}
            </IonContent>
        </IonPage>
    );
};
