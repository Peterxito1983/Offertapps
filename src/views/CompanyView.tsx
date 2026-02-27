import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBadge,
    IonButton,
    IonFab,
    IonFabButton,
    IonModal
} from '@ionic/react';
import { search, sparkles, flash, fitness, shirt, laptop, car, home, pencil, add, trash, chatbubbleEllipses, barChartOutline, listOutline, card, close, logOut, megaphoneOutline, peopleOutline, starOutline, alertCircle, logoFacebook, logoInstagram, logoTiktok, person, chevronForward } from 'ionicons/icons';
import { Header } from '../components/Header';
import { Offer, Review, KpiData, Company, Role } from '../types';
import { signOut } from '../services/authService';
import { EnhancedCreateOfferModal } from '../components/EnhancedCreateOfferModal';
import { KpiCard } from '../components/KpiCard';
import { CompanyProfileEditor } from '../components/CompanyProfileEditor';
import { SubscriptionManagement } from '../components/SubscriptionManagement';
import { PaymentForm } from '../components/PaymentForm';
import { CampaignModal } from '../components/CampaignModal';
import { MarketingReportModal } from '../components/MarketingReportModal';
import { SUBSCRIPTION_TIERS, syncSubscriptionPrices } from '../services/paymentService';
import { getInteractionsByCompany } from '../services/analyticsService';
import { Interaction } from '../types';
import './CompanyView.css';

interface CompanyViewProps {
    offers: Offer[];
    reviews: Review[];
    companies: Company[];
    companyId: string;
    onAddOffer: (offer: Omit<Offer, 'id'>, imageFile?: File | Blob) => void;
    onUpdateOffer: (offer: Offer, imageFile?: File | Blob) => void;
    onDeleteOffer: (id: string) => void;
    onReplyReview: (reviewId: string, reply: string) => void;
    onUpdateCompany: (companyId: string, data: Partial<Company>, imageFile?: File | Blob) => Promise<void>;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
    offers,
    reviews,
    companies,
    companyId,
    onAddOffer,
    onUpdateOffer,
    onDeleteOffer,
    onReplyReview,
    onUpdateCompany
}) => {
    const myOffers = offers.filter(o => o.companyId === companyId);
    const myReviews = reviews.filter(r => r.companyId === companyId);
    const currentCompany = companies.find(c => c.id === companyId) || null;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [segment, setSegment] = useState<'offers' | 'reviews' | 'marketing' | 'profile' | 'membership'>('offers');

    // Diagnóstico de Carga de Empresa
    React.useEffect(() => {
        if (segment === 'profile') {
            console.log("DIAGNÓSTICO PERFIL:");
            console.log("- Buscando CompanyId:", companyId);
            console.log("- Total empresas cargadas:", companies.length);
            console.log("- IDs disponibles:", companies.map(c => c.id).join(', '));

            if (!currentCompany && companies.length > 0) {
                window.alert(`DIAGNÓSTICO: No se encontró la empresa con ID "${companyId}" en la lista de ${companies.length} empresas.`);
            }
        }
    }, [segment, companyId, companies.length, currentCompany]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isMarketingReportOpen, setIsMarketingReportOpen] = useState(false);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [paymentTargetPlan, setPaymentTargetPlan] = useState<'basico' | 'premium' | null>(null);

    const handleUpgradeFromCampaign = () => {
        setPaymentTargetPlan('premium');
        setShowPaymentModal(true);
    };

    React.useEffect(() => {
        // Sincronizar precios globales al entrar a la vista de empresa
        syncSubscriptionPrices();

        if (segment === 'marketing' && companyId) {
            getInteractionsByCompany(companyId).then(setInteractions);
        }
    }, [segment, companyId]);

    const kpis = [
        { title: 'Visualizaciones', value: '1,284', icon: barChartOutline, growth: 12, color: 'var(--ion-color-primary)' },
        { title: 'Clicks WhatsApp', value: '156', icon: peopleOutline, growth: 5, color: 'var(--ion-color-success)' },
        { title: 'CTR Promedio', value: '12.1%', icon: starOutline, growth: 2, color: 'var(--ion-color-tertiary)' },
    ];

    return (
        <IonPage>
            <Header currentRole={Role.COMPANY} userId={companyId} />

            <IonContent fullscreen style={{ '--background': 'var(--app-bg-color)' }}>
                {/* Professional Dashboard Header */}
                <div className="company-dashboard-header">
                    <div className="company-title-section">
                        <h1>OffertApps</h1>
                        <p className="company-subtitle">
                            Controla tu presencia digital y maximiza tus ventas
                        </p>
                    </div>

                    {/* Dashboard Navigation Pills */}
                    <div className="nav-scroll-wrapper">
                        <div
                            className={`professional-nav-container ${hasScrolled ? 'scrolled' : ''}`}
                            onScroll={() => !hasScrolled && setHasScrolled(true)}
                        >
                            <div
                                className={`nav-pill ${segment === 'offers' ? 'active' : ''}`}
                                onClick={() => setSegment('offers')}
                            >
                                <IonIcon icon={listOutline} />
                                Mis Ofertas
                            </div>
                            <div
                                className={`nav-pill ${segment === 'reviews' ? 'active' : ''}`}
                                onClick={() => setSegment('reviews')}
                            >
                                <IonIcon icon={chatbubbleEllipses} />
                                Reseñas
                            </div>
                            <div
                                className={`nav-pill ${segment === 'marketing' ? 'active' : ''}`}
                                onClick={() => setSegment('marketing')}
                            >
                                <IonIcon icon={megaphoneOutline} />
                                Marketing
                            </div>
                            <div
                                className={`nav-pill ${segment === 'profile' ? 'active' : ''}`}
                                onClick={() => setSegment('profile')}
                            >
                                <IonIcon icon={person} />
                                Perfil
                            </div>
                            <div
                                className={`nav-pill ${segment === 'membership' ? 'active' : ''}`}
                                onClick={() => setSegment('membership')}
                            >
                                <IonIcon icon={card} />
                                Suscripción
                            </div>
                        </div>

                        {!hasScrolled && (
                            <div className="scroll-hint">
                                <IonIcon icon={chevronForward} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="ion-padding" style={{ paddingTop: 0 }}>
                    {segment === 'offers' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* KPIs Grid - Solo visible en Ofertas/Métricas */}
                            <div style={{ marginBottom: '32px' }}>
                                <IonGrid style={{ padding: 0 }}>
                                    <IonRow style={{ margin: '0 -8px' }}>
                                        {kpis.map((kpi, idx) => (
                                            <IonCol size="12" sizeMd="4" key={idx} style={{ padding: '8px' }}>
                                                <KpiCard kpi={kpi as any} icon={<IonIcon icon={kpi.icon} />} />
                                            </IonCol>
                                        ))}
                                    </IonRow>
                                </IonGrid>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ion-color-dark)', margin: 0 }}>
                                    Ofertas Publicadas ({myOffers.length})
                                </h3>
                                <IonButton fill="clear" color="primary" onClick={() => setIsCreateModalOpen(true)} style={{ fontWeight: '700' }}>
                                    <IonIcon icon={add} slot="start" />
                                    Nueva
                                </IonButton>
                            </div>

                            {/* Alerta de Membresía Vencida en Listado de Ofertas */}
                            {currentCompany?.paymentStatus !== 'active' && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '16px',
                                    borderRadius: '20px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{ backgroundColor: '#ef4444', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <IonIcon icon={alertCircle} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>Membresía Vencida</h5>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Tus ofertas no son visibles para los usuarios hasta que renueves.</p>
                                    </div>
                                    <button
                                        onClick={() => setSegment('membership')}
                                        style={{ background: 'white', border: 'none', padding: '8px 12px', borderRadius: '10px', color: '#ef4444', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                    >
                                        Renovar
                                    </button>
                                </div>
                            )}

                            {myOffers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: 'white', borderRadius: '32px', boxShadow: 'var(--offertapps-shadow-sm)' }}>
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <IonIcon icon={megaphoneOutline} style={{ fontSize: '40px', color: '#94a3b8' }} />
                                    </div>
                                    <h4 style={{ fontWeight: '900', margin: '0 0 12px 0', color: '#1e293b', fontSize: '1.2rem' }}>Comienza a crecer</h4>
                                    <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 32px 0', fontWeight: '500' }}>Publica tu primera oferta para atraer clientes hoy mismo.</p>
                                    <IonButton expand="block" shape="round" onClick={() => setIsCreateModalOpen(true)} style={{ '--height': '56px', fontWeight: '800' }}>Crear mi primera oferta</IonButton>
                                </div>
                            ) : (
                                <div className="offer-management-grid">
                                    {myOffers.map(offer => (
                                        <div key={offer.id} className="business-card">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                                <div style={{
                                                    width: '90px',
                                                    height: '90px',
                                                    borderRadius: '16px',
                                                    backgroundImage: `url(${offer.imageUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontWeight: '800', margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{offer.title}</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        <IonBadge color="primary" style={{ fontSize: '0.7rem', fontWeight: '800', borderRadius: '6px', padding: '4px 8px' }}>{offer.discount} OFF</IonBadge>
                                                        <IonBadge style={{ '--background': '#f1f5f9', '--color': '#475569', fontSize: '0.7rem', fontWeight: '700', borderRadius: '6px', padding: '4px 8px' }}>{offer.category}</IonBadge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {offer.socialMediaPosted ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ion-color-success)', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ion-color-success)' }} />
                                                            Compartido
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ion-color-warning)', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ion-color-warning)' }} />
                                                            Pendiente
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => { setSelectedOffer(offer); setIsCampaignModalOpen(true); }}
                                                        className="action-icon-btn boost"
                                                        title="Impulsar Campaña"
                                                    >
                                                        <IonIcon icon={megaphoneOutline} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedOffer(offer); setIsEditModalOpen(true); }}
                                                        className="action-icon-btn primary"
                                                        title="Editar"
                                                    >
                                                        <IonIcon icon={pencil} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteOffer(offer.id)}
                                                        className="action-icon-btn danger"
                                                        title="Eliminar"
                                                    >
                                                        <IonIcon icon={trash} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Espaciador de seguridad para el FAB */}
                                    <div style={{ height: '100px', gridColumn: '1 / -1' }} />
                                </div>
                            )}
                        </div>
                    ) : segment === 'marketing' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>Estrategia de Marketing</h3>
                                <IonBadge style={{ '--background': '#fef9c3', '--color': '#854d0e', padding: '6px 12px', borderRadius: '10px', fontWeight: '700' }}>Beta: IA Assistant</IonBadge>
                            </div>

                            {/* AI Copywriter Card */}
                            <div className="business-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IonIcon icon={sparkles} style={{ fontSize: '24px' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>Asistente de Copys con IA</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Genera títulos y descripciones irresistibles para tus ofertas.</p>
                                    </div>
                                </div>
                                <div style={{ background: '#f1f5f9', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        "🌟 ¡Mega Oferta solo por hoy! Llévate el segundo a mitad de precio y vive la experiencia que todos aman. No te quedes fuera. ⚡"
                                    </p>
                                </div>
                                <IonButton expand="block" shape="round" color="secondary" style={{ '--background': '#1e293b', fontWeight: '700' }}>
                                    Generar nueva sugerencia
                                </IonButton>
                            </div>

                            {/* Social Media reach status */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                <div className="business-card" style={{ textAlign: 'center', padding: '20px' }}>
                                    <IonIcon icon={logoFacebook} style={{ fontSize: '28px', color: '#1877F2', marginBottom: '8px' }} />
                                    <h5 style={{ margin: 0, fontWeight: '800' }}>Facebook</h5>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>● Activo</p>
                                </div>
                                <div className="business-card" style={{ textAlign: 'center', padding: '20px' }}>
                                    <IonIcon icon={logoInstagram} style={{ fontSize: '28px', color: '#E4405F', marginBottom: '8px' }} />
                                    <h5 style={{ margin: 0, fontWeight: '800' }}>Instagram</h5>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>● Activo</p>
                                </div>
                                <div className="business-card" style={{ textAlign: 'center', padding: '20px' }}>
                                    <IonIcon icon={logoTiktok} style={{ fontSize: '28px', color: '#000000', marginBottom: '8px' }} />
                                    <h5 style={{ margin: 0, fontWeight: '800' }}>TikTok</h5>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Pendiente</p>
                                </div>
                            </div>

                            {/* Marketing Tips */}
                            <h4 style={{ fontWeight: '800', marginBottom: '16px', color: '#334155' }}>Consejos de Posicionamiento</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { tip: "Usa fotos con luz natural para aumentar el CTR un 20%.", icon: flash },
                                    { tip: "Publica nuevas ofertas los martes y jueves para mayor alcance.", icon: sparkles },
                                    { tip: "Responde reseñas en menos de 24h para mejorar tu ranking.", icon: chatbubbleEllipses }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#6366f1' }}><IonIcon icon={item.icon} /></div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{item.tip}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Leads Panel */}
                            <div className="business-card" style={{ marginTop: '32px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>Interacciones Recientes</h4>
                                    <IonBadge color="success" style={{ fontWeight: '700' }}>+12 hoy</IonBadge>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { user: "Juan Pérez", action: "Click WhatsApp", time: "hace 5 min", offer: "Combo Almuerzo" },
                                        { user: "María García", action: "Guardó Oferta", time: "hace 22 min", offer: "Pizza 2x1" },
                                        { user: "Carlos Ruiz", action: "Click WhatsApp", time: "hace 1h", offer: "Combo Almuerzo" }
                                    ].map((lead, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>{lead.user}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Interesado en: <b>{lead.offer}</b></p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.8rem', color: lead.action.includes('WhatsApp') ? '#10b981' : '#6366f1' }}>{lead.action}</p>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>{lead.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <IonButton
                                    fill="clear"
                                    expand="block"
                                    style={{ marginTop: '12px', fontWeight: '700', fontSize: '0.85rem' }}
                                    onClick={() => setIsMarketingReportOpen(true)}
                                >
                                    Ver reporte detallado
                                </IonButton>
                            </div>
                        </div>
                    ) : segment === 'reviews' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ion-color-dark)', marginBottom: '16px' }}>
                                Reseñas de Clientes ({myReviews.length})
                            </h3>
                            {myReviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: 'white', borderRadius: '24px', boxShadow: 'var(--offertapps-shadow-sm)' }}>
                                    <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <IonIcon icon={chatbubbleEllipses} style={{ fontSize: '32px', color: '#94a3b8' }} />
                                    </div>
                                    <h4 style={{ fontWeight: '800', margin: '0 0 8px 0', color: 'var(--ion-color-dark)' }}>Aún no hay reseñas</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Las opiniones de tus clientes aparecerán aquí.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {myReviews.map(review => (
                                        <div key={review.id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '24px',
                                            padding: '20px',
                                            boxShadow: 'var(--offertapps-shadow-sm)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div>
                                                    <h5 style={{ margin: 0, fontWeight: '800', color: 'var(--ion-color-dark)' }}>{review.userName}</h5>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>{review.date}</span>
                                                </div>
                                                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--ion-color-warning)', padding: '4px 8px', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem' }}>
                                                    {review.rating} ⭐
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.5' }}>"{review.comment}"</p>

                                            {review.reply ? (
                                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', borderLeft: '4px solid var(--ion-color-primary)' }}>
                                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '0.8rem', color: 'var(--ion-color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tu respuesta:</p>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{review.reply}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        const reply = prompt('Escribe tu respuesta a esta reseña:');
                                                        if (reply) onReplyReview(review.id, reply);
                                                    }}
                                                    style={{ marginTop: '16px', width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--ion-color-primary)', backgroundColor: 'transparent', color: 'var(--ion-color-primary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                                >
                                                    Responder ahora
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : segment === 'profile' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <CompanyProfileEditor
                                company={currentCompany}
                                onUpdate={(data, file) => onUpdateCompany(companyId, data, file)}
                            />

                            {/* Acciones de Empresa Centralizadas */}
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    background: 'white',
                                    padding: '16px',
                                    borderRadius: '24px',
                                    boxShadow: 'var(--offertapps-shadow-sm)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <h4 style={{ margin: '0 0 8px 8px', fontWeight: '800', color: '#64748b', fontSize: '0.9rem' }}>Centro de Gestión</h4>

                                    <IonButton
                                        fill="clear"
                                        expand="block"
                                        style={{ '--color': 'var(--ion-color-dark)', justifyContent: 'flex-start', fontWeight: '700' }}
                                        onClick={() => window.open('https://wa.me/573000000000?text=Soporte%20Empresa:%20' + currentCompany?.name, '_system')}
                                    >
                                        <div style={{ padding: '8px', background: '#f5f3ff', color: 'var(--ion-color-primary)', borderRadius: '12px', marginRight: '12px' }}>
                                            <IonIcon icon={chatbubbleEllipses} />
                                        </div>
                                        Soporte Técnico
                                        <IonIcon icon={chevronForward} slot="end" color="medium" style={{ fontSize: '18px' }} />
                                    </IonButton>

                                    <IonButton
                                        fill="clear"
                                        expand="block"
                                        style={{ '--color': 'var(--ion-color-danger)', justifyContent: 'flex-start', fontWeight: '700' }}
                                        onClick={async () => { await signOut(); window.location.href = '/auth'; }}
                                    >
                                        <div style={{ padding: '8px', background: '#fff1f2', color: 'var(--ion-color-danger)', borderRadius: '12px', marginRight: '12px' }}>
                                            <IonIcon icon={logOut} />
                                        </div>
                                        Cerrar Sesión
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--ion-color-dark)', margin: 0 }}>
                                    Gestión de Membresía
                                </h3>
                                <IonBadge
                                    style={{
                                        '--background': currentCompany?.subscriptionPlan === 'premium' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#64748b',
                                        '--color': 'white',
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    PLAN {currentCompany?.subscriptionPlan?.toUpperCase()}
                                </IonBadge>
                            </div>

                            <SubscriptionManagement
                                companyId={companyId}
                                currentPlan={currentCompany?.subscriptionPlan || 'basico'}
                                onPlanChange={() => { }}
                                onRequestPayment={() => setShowPaymentModal(true)}
                            />

                            {/* Resumen de Próximo Pago Dinámico */}
                            <div style={{
                                marginTop: '24px',
                                padding: '24px',
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                boxShadow: 'var(--offertapps-shadow-sm)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <h4 style={{ fontWeight: '800', margin: '0 0 16px 0', color: 'var(--ion-color-dark)', fontSize: '1rem' }}>Siguiente Facturación</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                                            {currentCompany?.subscriptionEndDate
                                                ? `Vence el ${new Date(currentCompany.subscriptionEndDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                                : 'Sin suscripción activa'}
                                        </p>
                                        <p style={{ margin: '6px 0 0 0', fontWeight: '900', fontSize: '1.4rem', color: 'var(--ion-color-dark)' }}>
                                            $ {(SUBSCRIPTION_TIERS[currentCompany?.subscriptionPlan || 'basico'].price).toLocaleString('es-CO')}
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px', fontWeight: '600' }}>COP</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        style={{
                                            backgroundColor: 'var(--ion-color-dark)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px 24px',
                                            borderRadius: '16px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        Pagar ahora
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ bottom: '20px', right: '20px' }}>
                    <IonFabButton style={{ '--box-shadow': '0 8px 16px rgba(79, 70, 229, 0.4)' }}>
                        <IonIcon icon={add} onClick={() => setIsCreateModalOpen(true)} />
                    </IonFabButton>
                </IonFab>

                {/* Modal Unificado para Crear/Editar Oferta con Renderizado Condicional */}
                {(isCreateModalOpen || isEditModalOpen) && (
                    <EnhancedCreateOfferModal
                        key={isEditModalOpen ? (selectedOffer?.id || 'edit') : 'create'}
                        isOpen={true}
                        onClose={() => {
                            setIsCreateModalOpen(false);
                            setIsEditModalOpen(false);
                            setSelectedOffer(null);
                        }}
                        onSubmit={(offerData, imageFile) => {
                            if (isEditModalOpen && selectedOffer) {
                                onUpdateOffer({ ...selectedOffer, ...offerData }, imageFile);
                            } else {
                                onAddOffer(offerData, imageFile);
                            }
                            setIsCreateModalOpen(false);
                            setIsEditModalOpen(false);
                            setSelectedOffer(null);
                        }}
                        companyId={companyId}
                        initialOffer={isEditModalOpen ? selectedOffer || undefined : undefined}
                    />
                )}

                <CampaignModal
                    isOpen={isCampaignModalOpen}
                    onClose={() => {
                        setIsCampaignModalOpen(false);
                        setSelectedOffer(null);
                    }}
                    offer={selectedOffer}
                    subscriptionPlan={currentCompany?.subscriptionPlan || 'basico'}
                    onUpgrade={handleUpgradeFromCampaign}
                />

                <IonModal
                    isOpen={showPaymentModal}
                    onDidDismiss={() => setShowPaymentModal(false)}
                    breakpoints={[0, 0.9, 1]}
                    initialBreakpoint={0.9}
                    handleBehavior="cycle"
                >
                    <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontWeight: '900', margin: 0 }}>Renovar Plan</h2>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <IonIcon icon={close} />
                            </button>
                        </div>
                        <PaymentForm
                            companyId={companyId}
                            currentPlan={paymentTargetPlan || currentCompany?.subscriptionPlan}
                            onSuccess={() => {
                                setShowPaymentModal(false);
                                setPaymentTargetPlan(null);
                            }}
                            onCancel={() => {
                                setShowPaymentModal(false);
                                setPaymentTargetPlan(null);
                            }}
                        />
                    </div>
                </IonModal>

                <MarketingReportModal
                    isOpen={isMarketingReportOpen}
                    onClose={() => setIsMarketingReportOpen(false)}
                    interactions={interactions}
                />
            </IonContent>
        </IonPage >
    );
};
