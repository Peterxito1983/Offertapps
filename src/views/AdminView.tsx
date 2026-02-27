import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonLabel, IonModal, IonInput, IonToast, IonLoading, IonGrid, IonRow, IonCol, IonIcon, IonBadge, IonButton } from '@ionic/react';
import { checkmarkCircle, closeCircle, trash, people, barChart, business, pricetag, star, alertCircleOutline, shieldCheckmarkOutline, cashOutline, syncOutline, statsChartOutline, close } from 'ionicons/icons';
import { Company, Offer, Review, Role } from '../types';
import { getAllUsers } from '../services/usersService';
import { Header } from '../components/Header';
import { KpiCard } from '../components/KpiCard';
import { getAppConfig, updateSubscriptionPrices, getGlobalReportData, AppConfig, getAllOffers } from '../services/adminService';
import { SubscriptionPlan } from '../types/paymentTypes';

interface AdminViewProps {
    companies: Company[];
    offers: Offer[];
    reviews: Review[];
    onDeleteOffer: (id: string) => void;
    onDeleteReview: (id: string) => void;
    onUpdateCompanyStatus: (id: string, isVerified: boolean) => void;
    onDeleteCompany: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
    companies, offers, reviews, onDeleteOffer, onDeleteReview, onUpdateCompanyStatus, onDeleteCompany
}) => {
    const [segment, setSegment] = useState<'companies' | 'offers' | 'reviews' | 'dashboard' | 'users'>('dashboard');
    const [userCount, setUserCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPricesModal, setShowPricesModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const [reportData, setReportData] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [adminOffers, setAdminOffers] = useState<any[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [users, config, o] = await Promise.all([
                getAllUsers(),
                getAppConfig(),
                getAllOffers()
            ]);
            setAllUsers(users);
            setUserCount(users.length);
            setAppConfig(config);
            setAdminOffers(o);
        } catch (error) {
            setUserCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSyncUsers = async () => {
        setIsLoading(true);
        await loadData();
        setToast({ show: true, message: 'Base de datos sincronizada correctamente' });
    };

    const handleShowReport = async () => {
        setIsLoading(true);
        const data = await getGlobalReportData(companies, offers, reviews);
        setReportData(data);
        setShowReportModal(true);
        setIsLoading(false);
    };

    const handleSavePrices = async (prices: Record<SubscriptionPlan, number>) => {
        if (!prices || !appConfig) {
            setToast({ show: true, message: 'Datos de configuración no cargados' });
            return;
        }

        try {
            await updateSubscriptionPrices(prices);
            setAppConfig(prev => prev ? { ...prev, subscriptionPrices: prices } : null);
            setShowPricesModal(false);
            setToast({ show: true, message: 'Precios actualizados exitosamente' });
        } catch (error: any) {
            setToast({ show: true, message: `Error al actualizar precios: ${error.message || 'Error de servidor'}` });
        }
    };

    const kpis = [
        { title: 'Usuarios', value: userCount?.toString() || '...', growth: 15, icon: people },
        { title: 'Empresas', value: companies.length.toString(), growth: 8, icon: business },
        { title: 'Ofertas', value: offers.length.toString(), growth: 12, icon: pricetag },
        { title: 'Reseñas', value: reviews.length.toString(), growth: 5, icon: star },
    ];

    return (
        <IonPage>
            <Header currentRole={Role.ADMIN} userId="admin" />

            <IonContent fullscreen style={{ '--background': 'var(--app-bg-color)' }}>
                <div className="shopee-hero">
                    <h1 style={{ color: 'var(--ion-color-primary)', fontWeight: '800', marginBottom: '8px' }}>Panel Administrativo</h1>
                    <p style={{ color: 'var(--app-text-color)', opacity: 0.7, fontWeight: '500' }}>Control total sobre OffertApps</p>
                </div>

                <div className="ion-padding" style={{ paddingTop: 0 }}>
                    <div className="segment-pills-container" style={{
                        display: 'flex',
                        padding: '4px',
                        marginBottom: '32px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        gap: '12px',
                        scrollbarWidth: 'none'
                    }}>
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: barChart },
                            { id: 'companies', label: 'Empresas', icon: business },
                            { id: 'offers', label: 'Ofertas', icon: pricetag },
                            { id: 'reviews', label: 'Reseñas', icon: star },
                            { id: 'users', label: 'Usuarios', icon: people }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setSegment(item.id as any)}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: segment === item.id ? 'var(--ion-color-primary)' : 'white',
                                    color: segment === item.id ? 'white' : 'var(--app-text-color)',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <IonIcon icon={item.icon} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {segment === 'dashboard' && (
                        <div className="fade-in">
                            <IonGrid style={{ padding: 0 }}>
                                <IonRow>
                                    {kpis.map((kpi, idx) => (
                                        <IonCol size="12" sizeSm="6" sizeLg="3" key={idx}>
                                            <KpiCard kpi={kpi as any} icon={<IonIcon icon={kpi.icon} />} />
                                        </IonCol>
                                    ))}
                                </IonRow>
                            </IonGrid>

                            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div className="enhanced-card" style={{ padding: '24px', background: 'white' }}>
                                    <h3 style={{ fontWeight: '800', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <IonIcon icon={shieldCheckmarkOutline} color="tertiary" />
                                        Estado de Plataforma
                                    </h3>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1, padding: '16px', background: 'var(--ion-color-light-tint)', borderRadius: '16px', textAlign: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'var(--ion-color-tertiary)' }}>{companies.filter(c => c.isVerified).length}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', opacity: 0.6 }}>Verificadas</p>
                                        </div>
                                        <div style={{ flex: 1, padding: '16px', background: 'var(--ion-color-light-tint)', borderRadius: '16px', textAlign: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'var(--ion-color-secondary)' }}>{companies.filter(c => !c.isVerified).length}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', opacity: 0.6 }}>Pendientes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="enhanced-card" style={{ padding: '24px', background: 'white' }}>
                                    <h3 style={{ fontWeight: '800', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <IonIcon icon={alertCircleOutline} color="primary" />
                                        Configuración
                                    </h3>
                                    <IonButton expand="block" shape="round" color="primary" onClick={() => setShowPricesModal(true)} style={{ marginBottom: '12px' }}>
                                        <IonIcon icon={cashOutline} slot="start" />
                                        Ajustar Tarifas
                                    </IonButton>
                                    <IonButton fill="outline" expand="block" shape="round" onClick={handleSyncUsers}>
                                        <IonIcon icon={syncOutline} slot="start" />
                                        Sincronizar Usuarios
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    )}

                    {segment === 'companies' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {companies.map(company => (
                                <div key={company.id} className="enhanced-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ background: 'var(--ion-color-primary-tint)', color: 'var(--ion-color-primary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <IonIcon icon={business} style={{ fontSize: '24px' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: '700' }}>{company.name}</h4>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <IonBadge color="light" style={{ fontSize: '0.7rem' }}>{company.subscriptionPlan}</IonBadge>
                                                <IonBadge color={company.isVerified ? 'tertiary' : 'secondary'} style={{ fontSize: '0.7rem' }}>
                                                    {company.isVerified ? 'VERIFICADA' : 'PENDIENTE'}
                                                </IonBadge>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <IonButton fill="clear" color={company.isVerified ? 'secondary' : 'tertiary'} onClick={() => onUpdateCompanyStatus(company.id, !company.isVerified)}>
                                            <IonIcon icon={company.isVerified ? closeCircle : checkmarkCircle} slot="icon-only" />
                                        </IonButton>
                                        <IonButton fill="clear" color="primary" onClick={() => onDeleteCompany(company.id)}>
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {segment === 'offers' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {adminOffers.map(offer => (
                                <div key={offer.id} className="enhanced-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <img src={offer.imageUrl} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: '700' }}>{offer.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>{offer.companyName}</p>
                                        </div>
                                    </div>
                                    <IonButton fill="clear" color="primary" onClick={() => onDeleteOffer(offer.id)}>
                                        <IonIcon icon={trash} slot="icon-only" />
                                    </IonButton>
                                </div>
                            ))}
                        </div>
                    )}

                    {segment === 'users' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {allUsers.map(user => (
                                <div key={user.id} className="enhanced-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '24px', overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <IonIcon icon={people} />}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: '700' }}>{user.name || 'Usuario'}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>{user.email}</p>
                                        </div>
                                    </div>
                                    <IonBadge color="primary">{user.level || 'Bronce'}</IonBadge>
                                </div>
                            ))}
                        </div>
                    )}

                    {segment === 'reviews' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontWeight: '800' }}>Reseñas ({reviews.length})</h3>
                            {reviews.map(review => (
                                <div key={review.id} className="enhanced-card" style={{ padding: '20px', background: 'white' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <h5 style={{ margin: 0, fontWeight: '700' }}>{review.userName}</h5>
                                            <div style={{ fontSize: '0.9rem', color: '#fbc531' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                        </div>
                                        <IonButton fill="clear" color="primary" onClick={() => onDeleteReview(review.id)}>
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonButton>
                                    </div>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontStyle: 'italic' }}>"{review.comment}"</p>
                                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                                        <IonBadge fill="outline" style={{ fontSize: '0.7rem' }}>🏢 {companies.find(c => c.id === review.companyId)?.name}</IonBadge>
                                        <IonBadge fill="outline" style={{ fontSize: '0.7rem' }}>🏷️ {offers.find(o => o.id === review.offerId)?.title}</IonBadge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal de Precios */}
                <IonModal isOpen={showPricesModal} onDidDismiss={() => setShowPricesModal(false)}>
                    <IonContent className="ion-padding">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontWeight: '800', margin: 0 }}>Ajustar Tarifas</h2>
                            <IonButton fill="clear" onClick={() => setShowPricesModal(false)}>
                                <IonIcon icon={close} slot="icon-only" />
                            </IonButton>
                        </div>
                        {/* Simplificado para el revert */}
                        <IonButton expand="block" onClick={() => setShowPricesModal(false)}>Cerrar</IonButton>
                    </IonContent>
                </IonModal>

                <IonLoading isOpen={isLoading} message="Cargando..." />
                <IonToast isOpen={toast.show} message={toast.message} duration={2000} onDidDismiss={() => setToast({ show: false, message: '' })} />
            </IonContent>
        </IonPage>
    );
};
