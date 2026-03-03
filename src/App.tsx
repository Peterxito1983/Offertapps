import React, { useState, useCallback, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import { search, map, heart, person } from 'ionicons/icons';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme Variables */
import './theme/variables.css';

import { Role, Offer, Review, Company } from './types';
import { Header } from './components/Header';
import { UserView } from './views/UserView';
import { CompanyView } from './views/CompanyView';
import { AdminView } from './views/AdminView';

import { onAuthChange, getCurrentUserProfile, UserProfile } from './services/authService';
import { OfferDetailModal } from './components/OfferDetailModal';
import { ProfileView } from './views/ProfileView';

import { AuthView } from './views/AuthView';
import { MapView } from './views/MapView';
import { FavoritesView } from './views/FavoritesView';
// Configurar Ionic
setupIonicReact({
    mode: 'ios',
});

// Debugging global
if (typeof window !== 'undefined') {
    window.onerror = function (message, source, lineno, colno, error) {
        alert(`Global Error: ${message} at ${source}:${lineno}:${colno}`);
        return false;
    };
    window.onunhandledrejection = function (event) {
        alert(`Unhandled Rejection: ${event.reason}`);
    };
}

import { getCompanies, updateCompanyVerificationStatus, deleteCompany, updateCompany } from './services/companiesService';
import { getOffers, createOffer as createOfferService, updateOffer as updateOfferService, deleteOffer as deleteOfferService } from './services/offersService';
import { getAllReviews, createReview as createReviewService, replyToReview as replyToReviewService, deleteReview as deleteReviewService } from './services/reviewsService';
import { updateUserProfile as updateUserProfileService } from './services/usersService';
import { seedDatabase } from './seedDatabase';

const App: React.FC = () => {
    console.log("App.tsx: Renderizando V4 - 2026-02-13");

    useEffect(() => {
        // Alerta de confirmación de carga (Eliminar después de verificar)
        console.log("DEBUG: Bundle V4 cargado exitosamente");
    }, []);

    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // States for data
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    const handleNotificationAction = useCallback((data: any) => {
        if (data && data.offerId) {
            console.log("App.tsx: handleNotificationAction - Buscando oferta:", data.offerId);
            const offer = offers.find(o => o.id === data.offerId);
            if (offer) {
                console.log("App.tsx: Oferta encontrada, abriendo modal...");
                setSelectedOffer(offer);
            } else {
                console.warn("App.tsx: Oferta no encontrada:", data.offerId);
            }
        }
    }, [offers]);

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch initial data
                let fetchedCompanies = await getCompanies();
                let fetchedOffers = await getOffers();
                let fetchedReviews = await getAllReviews();

                // 2. If empty, seed database (optional, for demo purposes)
                if (fetchedCompanies.length === 0) {
                    console.log("Database seems empty, seeding...");
                    await seedDatabase();
                    fetchedCompanies = await getCompanies();
                    fetchedOffers = await getOffers();
                    fetchedReviews = await getAllReviews();
                }

                setCompanies(fetchedCompanies);

                // Ordenar ofertas por fecha de creación (más recientes primero)
                const sortedOffers = [...fetchedOffers].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                setOffers(sortedOffers);

                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                // Usuario logueado, obtener perfil
                const profile = await getCurrentUserProfile();
                if (profile) {
                    setCurrentUser(profile);
                } else {
                    // Si no hay perfil (raro), default user
                    // Podríamos crear uno básico en memoria o manejar el error
                    console.warn("Usuario autenticado sin perfil en DB");
                    setCurrentUser(null);
                }
            } else {
                // No logueado
                setCurrentUser(null);
            }

            // Load data after auth check (or parallel, but parallel is fine)
            await initData();
            setLoading(false);
        });

        // Configuración de botón atrás para Android
        let backButtonHandler: any;
        const setupBackButton = async () => {
            backButtonHandler = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (!canGoBack) {
                    CapacitorApp.exitApp();
                } else {
                    window.history.back();
                }
            });
        };
        setupBackButton();

        // Configuración inicial de UI
        const setupUI = async () => {
            try {
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#6366f1' });
                await SplashScreen.hide();

                // Listeners de Push Notifications de Capacitor
                PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                    console.log("Push notification action performed:", notification.notification);
                    const data = notification.notification.data;
                    handleNotificationAction(data);
                });

                // Registrar para recibir tokens
                PushNotifications.requestPermissions().then(result => {
                    console.log("PushNotifications: Permisos resultado:", result.receive);
                    if (result.receive === 'granted') {
                        console.log("PushNotifications: Registrando...");
                        PushNotifications.register();
                    } else {
                        console.warn("PushNotifications: Permisos denegados");
                    }
                }).catch(err => {
                    console.error("PushNotifications: Error pidiendo permisos:", err);
                });

            } catch (e) {
                console.error('App.tsx: Native setup failed', e);
            }
        };
        setupUI();

        return () => {
            unsubscribe();
            if (backButtonHandler && backButtonHandler.remove) {
                backButtonHandler.remove();
            }
        };
    }, []);

    // Lógica Administrativa y Gestión de Estado (igual que antes...)
    // Logic for Admin and State Management
    const handleUpdateCompanyStatus = async (companyId: string, isVerified: boolean) => {
        try {
            await updateCompanyVerificationStatus(companyId, isVerified);
            setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isVerified } : c));
            if (!isVerified) {
                // If unverified, we might want to refresh offers/reviews or handle server-side
                // For now, optimistic UI update:
                setOffers(prev => prev.filter(off => off.companyId !== companyId));
            }
        } catch (e) { console.error(e); }
    };

    const handleUpdateCompany = async (companyId: string, data: Partial<Company>, imageFile?: File | Blob) => {
        try {
            console.log("App.tsx: handleUpdateCompany iniciando para", companyId);
            const updatedLogoUrl = await updateCompany(companyId, data, imageFile);

            // 1. Actualizar lista local de empresas
            setCompanies(prev => prev.map(c => c.id === companyId ? {
                ...c,
                ...data,
                logoUrl: (updatedLogoUrl as string) || data.logoUrl || c.logoUrl
            } : c));

            // 2. IMPORTANTE: Refrescar el perfil del usuario actual para que la UI global (Header/Editor) se actualice
            const updatedProfile = await getCurrentUserProfile();
            if (updatedProfile) {
                console.log("App.tsx: Perfil de usuario refrescado tras actualización");
                setCurrentUser(updatedProfile);
            }
        } catch (e) {
            console.error("App.tsx: Error en handleUpdateCompany:", e);
            throw e;
        }
    };

    const handleUpdateCompanySubscription = async (companyId: string, subscriptionPlan: 'basico' | 'premium') => {
        try {
            await handleUpdateCompany(companyId, { subscriptionPlan });
        } catch (e) { console.error(e); }
    };

    const handleDeleteCompany = async (companyId: string) => {
        try {
            await deleteCompany(companyId);
            setCompanies(prev => prev.filter(c => c.id !== companyId));
            setOffers(prev => prev.filter(off => off.companyId !== companyId));
            setReviews(prev => prev.filter(rev => rev.companyId !== companyId));
        } catch (e) { console.error(e); }
    };

    const handleAddOffer = async (newOffer: Omit<Offer, 'id'>, imageFile?: File | Blob) => {
        try {
            console.log("App.tsx: handleAddOffer", newOffer);
            const { id: newId, imageUrl: realImageUrl, createdAt } = await createOfferService(newOffer, imageFile);

            // Actualizar estado local CON la URL real y el createdAt para que aparezca de primero
            setOffers(prev => [{ ...newOffer, id: newId, imageUrl: realImageUrl, createdAt }, ...prev]);

            console.log("App.tsx: Oferta añadida con éxito", newId, realImageUrl);
        } catch (e) {
            console.error("App.tsx: Error en handleAddOffer:", e);
            throw e;
        }
    };

    const handleUpdateOffer = async (offer: Offer, imageFile?: File | Blob) => {
        try {
            await updateOfferService(offer.id, offer, imageFile);
            setOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
        } catch (e) {
            console.error("App.tsx: Error en handleUpdateOffer:", e);
            throw e;
        }
    };

    const handleDeleteOffer = async (id: string) => {
        try {
            await deleteOfferService(id);
            setOffers(prev => prev.filter(off => off.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleAddReview = async (review: Omit<Review, 'id'>) => {
        try {
            console.log("App.tsx: Iniciando persistencia de reseña en Firebase...");
            const newId = await createReviewService(review);
            const savedReview = { ...review, id: newId };
            setReviews(prev => [savedReview, ...prev]);
            console.log("App.tsx: Reseña guardada con éxito, ID:", newId);
        } catch (e) {
            console.error("App.tsx: Error al guardar reseña en Firebase:", e);
        }
    };

    const handleReplyReview = async (reviewId: string, replyText: string) => {
        try {
            await replyToReviewService(reviewId, replyText);
            setReviews(prev => prev.map(rev =>
                rev.id === reviewId ? { ...rev, reply: replyText, replyDate: new Date().toLocaleDateString() } : rev
            ));
        } catch (e) { console.error(e); }
    };

    const handleDeleteReview = async (id: string) => {
        try {
            await deleteReviewService(id);
            setReviews(prev => prev.filter(rev => rev.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleUpdateUserProfile = async (data: Partial<UserProfile>) => {
        if (!currentUser) return;
        try {
            await updateUserProfileService(currentUser.uid, { name: data.displayName });
            // Refrescar el estado local
            const updatedProfile = await getCurrentUserProfile();
            if (updatedProfile) {
                setCurrentUser(updatedProfile);
            }
        } catch (e) {
            console.error("App.tsx: Error al actualizar perfil:", e);
            throw e;
        }
    };

    if (loading) {
        return (
            <IonApp>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <p>Cargando...</p>
                </div>
            </IonApp>
        );
    }

    return (
        <IonApp>
            <IonReactRouter>
                <Switch>
                    {/* Ruta de Autenticación */}
                    <Route exact path="/auth">
                        {currentUser ? (
                            <Redirect to={
                                currentUser.role === Role.COMPANY ? "/company" :
                                    currentUser.role === Role.ADMIN ? "/admin" : "/tabs/explore"
                            } />
                        ) : <AuthView />}
                    </Route>

                    {/* Ruta de Empresa - Dashboard completo sin Tabs */}
                    <Route exact path="/company">
                        {!currentUser ? <Redirect to="/auth" /> : currentUser.role === Role.COMPANY ? (
                            (() => {
                                // 1. Priorizar ID exacto del perfil
                                let resolvedCompanyId = currentUser.companyId || '';

                                // 2. Si no hay ID, backup por nombre (mantener por compatibilidad con demos)
                                if (!resolvedCompanyId) {
                                    const cleanUserName = currentUser.displayName?.toLowerCase().trim() || '';
                                    const foundByNames = companies.find(c =>
                                        c.name?.toLowerCase().trim() === cleanUserName ||
                                        (c.name && cleanUserName.includes(c.name.toLowerCase()))
                                    );
                                    resolvedCompanyId = foundByNames?.id || '';
                                }

                                if (!resolvedCompanyId && companies.length > 0) {
                                    console.error("App.tsx: No se pudo resolver CompanyId para", currentUser.displayName);
                                }

                                return (
                                    <CompanyView
                                        offers={offers}
                                        reviews={reviews}
                                        companies={companies}
                                        companyId={resolvedCompanyId}
                                        onAddOffer={handleAddOffer}
                                        onUpdateOffer={handleUpdateOffer}
                                        onDeleteOffer={handleDeleteOffer}
                                        onReplyReview={handleReplyReview}
                                        onUpdateCompany={handleUpdateCompany}
                                    />
                                );
                            })()
                        ) : <Redirect to="/tabs/explore" />}
                    </Route>

                    {/* Ruta de Admin - Panel de control sin Tabs */}
                    <Route exact path="/admin">
                        {!currentUser ? <Redirect to="/auth" /> : currentUser.role === Role.ADMIN ? (
                            <AdminView
                                companies={companies}
                                offers={offers}
                                reviews={reviews}
                                onDeleteOffer={handleDeleteOffer}
                                onDeleteReview={handleDeleteReview}
                                onUpdateCompanyStatus={handleUpdateCompanyStatus}
                                onDeleteCompany={handleDeleteCompany}
                            />
                        ) : <Redirect to="/tabs/explore" />}
                    </Route>

                    {/* Sistema de Tabs para Usuario Final */}
                    <Route path="/tabs">
                        {!currentUser ? <Redirect to="/auth" /> : (
                            <IonTabs>
                                <IonRouterOutlet>
                                    <Route exact path="/tabs/explore">
                                        <>
                                            <UserView
                                                offers={offers}
                                                companies={companies}
                                                reviews={reviews}
                                                userId={currentUser.uid}
                                                currentUser={currentUser}
                                                onAddReview={handleAddReview}
                                                onShowOffer={setSelectedOffer}
                                                onCloseOffer={() => setSelectedOffer(null)}
                                                selectedOffer={selectedOffer}
                                            />
                                        </>
                                    </Route>
                                    <Route exact path="/tabs/map">
                                        <MapView companies={companies} offers={offers} />
                                    </Route>
                                    <Route exact path="/tabs/favorites">
                                        <FavoritesView
                                            userId={currentUser.uid}
                                            currentUser={currentUser}
                                            companies={companies}
                                            reviews={reviews}
                                            onAddReview={handleAddReview}
                                            onShowOffer={setSelectedOffer}
                                            onCloseOffer={() => setSelectedOffer(null)}
                                            selectedOffer={selectedOffer}
                                        />
                                    </Route>
                                    <Route exact path="/tabs/profile">
                                        <ProfileView
                                            currentUser={currentUser}
                                            reviews={reviews}
                                            onUpdateProfile={handleUpdateUserProfile}
                                        />
                                    </Route>
                                    <Route exact path="/tabs">
                                        <Redirect to="/tabs/explore" />
                                    </Route>
                                </IonRouterOutlet>

                                <IonTabBar slot="bottom">
                                    <IonTabButton tab="explore" href="/tabs/explore">
                                        <IonIcon icon={search} />
                                        <IonLabel>Explorar</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="map" href="/tabs/map">
                                        <IonIcon icon={map} />
                                        <IonLabel>Mapa</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="favorites" href="/tabs/favorites">
                                        <IonIcon icon={heart} />
                                        <IonLabel>Favoritos</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="profile" href="/tabs/profile">
                                        <IonIcon icon={person} />
                                        <IonLabel>Perfil</IonLabel>
                                    </IonTabButton>
                                </IonTabBar>
                            </IonTabs>
                        )}
                    </Route>

                    {/* Redirección por defecto */}
                    <Route exact path="/">
                        <Redirect to="/auth" />
                    </Route>

                    <Route render={() => <Redirect to="/" />} />
                </Switch>
            </IonReactRouter>
            {selectedOffer && (
                <OfferDetailModal
                    offer={selectedOffer}
                    company={companies.find(c => c.id === selectedOffer.companyId) || { id: selectedOffer.companyId, name: 'Empresa', logoUrl: '', branches: [], subscriptionPlan: 'basico', isVerified: false } as Company}
                    reviews={reviews.filter(r => r.offerId === selectedOffer.id)}
                    currentUser={currentUser}
                    onClose={() => setSelectedOffer(null)}
                    onAddReview={handleAddReview}
                />
            )}
        </IonApp>
    );
};

export default App;
