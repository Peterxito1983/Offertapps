import React, { useState, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonCard,
    IonCardContent,
    IonBadge,
    IonFooter,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonInput
} from '@ionic/react';
import {
    megaphoneOutline,
    logoFacebook,
    logoInstagram,
    logoWhatsapp,
    logoTiktok,
    logoGoogle,
    chevronForward,
    chevronBack,
    checkmarkCircle,
    colorPaletteOutline,
    cashOutline,
    star
} from 'ionicons/icons';
import { Offer, CampaignData } from '../types';
import { createMetaCampaign } from '../services/metaAdsService';
import { createGoogleCampaign } from '../services/googleAdsService';
import { createTikTokCampaign } from '../services/tiktokAdsService';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: Offer | null;
    subscriptionPlan: 'basico' | 'premium';
    onUpgrade?: () => void;
}

type CampaignStep = 'channel' | 'template' | 'budget' | 'summary';

export const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, offer, subscriptionPlan, onUpgrade }) => {
    const [step, setStep] = useState<CampaignStep>('channel');
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['meta']);
    const [budget, setBudget] = useState<string>('medium');
    const [customAmount, setCustomAmount] = useState<number | null>(null);

    // Calcular monto actual basado en la selección
    // Estado inicial de budget puede ser omitido o usado para highlights
    useEffect(() => {
        if (isOpen && customAmount === null) {
            setCustomAmount(80000); // Default budget
        }
    }, [isOpen]);

    if (!offer) return null;

    const toggleChannel = (channelId: string) => {
        setSelectedChannels(prev =>
            prev.includes(channelId)
                ? (prev.length > 1 ? prev.filter(c => c !== channelId) : prev)
                : [...prev, channelId]
        );
    };

    const renderChannelSelection = () => (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontWeight: '800', margin: '20px 0', textAlign: 'center' }}>¿Dónde quieres anunciarte?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {[
                    { id: 'meta', name: 'Meta (FB)', icon: logoFacebook, color: '#1877F2' },
                    { id: 'instagram', name: 'Instagram', icon: logoInstagram, color: '#E4405F' },
                    { id: 'tiktok', name: 'TikTok', icon: logoTiktok, color: '#000000' },
                    { id: 'whatsapp', name: 'WhatsApp', icon: logoWhatsapp, color: '#25D366' },
                    { id: 'google', name: 'Google Ads', icon: logoGoogle, color: '#DB4437' }
                ].map((channel) => (
                    <div
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        style={{
                            border: selectedChannels.includes(channel.id) ? `2.5px solid ${channel.color}` : '1px solid #e2e8f0',
                            backgroundColor: selectedChannels.includes(channel.id) ? `${channel.color}10` : 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            transform: selectedChannels.includes(channel.id) ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: selectedChannels.includes(channel.id) ? `0 8px 15px -3px ${channel.color}30` : 'none'
                        }}
                    >
                        <IonIcon icon={channel.icon} style={{ fontSize: '32px', color: channel.color, marginBottom: '8px' }} />
                        <span style={{ fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>{channel.name}</span>
                        {selectedChannels.includes(channel.id) && (
                            <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: channel.color, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IonIcon icon={checkmarkCircle} style={{ fontSize: '14px' }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '20px' }}>
                Puedes seleccionar <b>varias redes simultáneamente</b> para mayor alcance.
            </p>
        </div>
    );

    const getPrimaryChannelIcon = () => {
        const first = selectedChannels[0];
        if (first === 'meta') return logoFacebook;
        if (first === 'instagram') return logoInstagram;
        if (first === 'tiktok') return logoTiktok;
        if (first === 'whatsapp') return logoWhatsapp;
        return logoGoogle;
    };

    const renderTemplatePreview = () => (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontWeight: '800', margin: '20px 0' }}>Previsualización</h3>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IonIcon icon={getPrimaryChannelIcon()} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Tu Comercio (Publicidad)</span>
                </div>
                <img src={offer.imageUrl} alt="Ad" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <div style={{ padding: '16px' }}>
                    <IonBadge color="primary" style={{ marginBottom: '8px' }}>{offer.discount}</IonBadge>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: '800' }}>{offer.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{offer.description}</p>
                </div>
            </div>
        </div>
    );

    const renderBudgetSelection = () => (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontWeight: '800', margin: '20px 0' }}>Define tu Inversión</h3>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
                <IonLabel position="stacked" style={{ color: '#64748b', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Monto total (COP)</IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #6366f1', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginRight: '5px' }}>$</span>
                    <IonInput
                        type="number"
                        value={customAmount}
                        placeholder="0"
                        onIonChange={e => {
                            const val = parseFloat(e.detail.value!);
                            setCustomAmount(isNaN(val) ? 0 : val);
                            setBudget('custom');
                        }}
                        style={{ fontSize: '24px', fontWeight: 'bold', '--padding-start': '0' }}
                    />
                </div>
            </div>

            <p style={{ fontWeight: '600', color: '#64748b', marginBottom: '10px' }}>O elige una opción rápida:</p>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                {[
                    { val: 35000, label: 'Básico' },
                    { val: 80000, label: 'Popular' },
                    { val: 200000, label: 'Pro' }
                ].map((opt) => (
                    <div
                        key={opt.val}
                        onClick={() => { setCustomAmount(opt.val); setBudget('custom'); }}
                        style={{
                            minWidth: '100px',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: customAmount === opt.val ? '#e0e7ff' : 'white',
                            border: customAmount === opt.val ? '2px solid #6366f1' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontWeight: '800', color: '#1e293b' }}>${(opt.val / 1000)}k</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{opt.label}</div>
                    </div>
                ))}
            </div>

            <IonCard style={{ margin: '20px 0 0 0', borderRadius: '16px', boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                <IonCardContent style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ALCANCE ESTIMADO</p>
                            <h2 style={{ margin: '5px 0 0 0', color: '#6366f1', fontWeight: '800' }}>
                                {customAmount ? `${Math.floor(customAmount / 20) * selectedChannels.length} - ${Math.floor(customAmount / 8) * selectedChannels.length}` : '0'}
                            </h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>personas verán tu anuncio</p>
                        </div>
                        <IonIcon icon={megaphoneOutline} style={{ fontSize: '32px', color: '#e2e8f0' }} />
                    </div>
                </IonCardContent>
            </IonCard>
        </div>
    );

    const renderSummary = () => (
        <div style={{ animation: 'fadeIn 0.3s', textAlign: 'center', padding: '40px 0' }}>
            <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '80px' }} />
            <h2 style={{ fontWeight: '900', marginTop: '20px' }}>¡Todo Listo!</h2>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', textAlign: 'left', marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#64748b' }}>Canales:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {selectedChannels.map(c => (
                            <IonBadge key={c} color="primary">{c.toUpperCase()}</IonBadge>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Inversión Total:</span>
                    <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#6366f1' }}>
                        $ {customAmount?.toLocaleString('es-CO') || 0}
                    </span>
                </div>
            </div>
        </div>
    );

    const stepsArray: CampaignStep[] = ['channel', 'template', 'budget', 'summary'];
    const currentStepIndex = stepsArray.indexOf(step);

    const handleNext = async () => {
        if (currentStepIndex < stepsArray.length - 1) {
            setStep(stepsArray[currentStepIndex + 1]);
        } else {
            // Lógica final de creación de campaña
            try {
                // Use customAmount directly as simplified source of truth
                const amount = customAmount || 0;

                if (amount <= 0) {
                    alert('Por favor ingresa un presupuesto válido para continuar.');
                    return;
                }

                const campaignData: CampaignData = {
                    channels: selectedChannels as any,
                    budget: budget as any,
                    budgetAmount: amount,
                    durationDays: 7,
                    status: 'pending'
                };

                console.log(`Lanzando campaña múltiple en ${selectedChannels.join(', ')} con presupuesto total ${amount}...`);

                // Iterar sobre todos los canales seleccionados
                const uploadPromises = selectedChannels.map(async (channel) => {
                    const singleData = {
                        ...campaignData,
                        channel: channel as any // Map array to single for legacy service support if needed
                    };

                    if (channel === 'meta' || channel === 'instagram') {
                        return createMetaCampaign(offer, singleData as any);
                    } else if (channel === 'tiktok') {
                        return createTikTokCampaign(offer, singleData as any);
                    } else if (channel === 'google') {
                        return createGoogleCampaign(offer, singleData as any);
                    } else {
                        // WhatsApp u otros
                        console.log(`Simulando lanzamiento en ${channel}...`);
                        return new Promise(resolve => setTimeout(resolve, 800));
                    }
                });

                await Promise.all(uploadPromises);

                onClose();
                alert(`¡Éxito! Tu campaña se ha lanzado simultáneamente en: ${selectedChannels.map(c => c.toUpperCase()).join(', ')}.\n\nSerás redirigido a tu panel.`);
            } catch (error: any) {
                console.error('Error al lanzar campaña:', error);
                alert('Hubo un error al conectar con las plataformas publicitarias: ' + error.message);
            }
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setStep(stepsArray[currentStepIndex - 1]);
        }
    };

    const isPremium = subscriptionPlan === 'premium';

    const renderLockedPlan = () => (
        <div style={{
            animation: 'fadeIn 0.3s',
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <IonIcon icon={star} style={{ fontSize: '40px' }} />
            </div>

            <div>
                <h2 style={{ fontWeight: '900', color: '#1e293b', margin: '0 0 12px 0' }}>Funcionalidad Premium</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
                    Las campañas digitales en redes sociales son exclusivas para usuarios con <b>Plan Premium</b>.
                </p>
            </div>

            <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                width: '100%'
            }}>
                <h4 style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b', marginBottom: '16px', textAlign: 'left' }}>Con Premium podrás:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        "Publicar anuncios en Facebook e Instagram",
                        "Llegar a miles de clientes potenciales",
                        "Campañas en TikTok Ads",
                        "Reportes detallados de alcance"
                    ].map((text, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <IonIcon icon={checkmarkCircle} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: '0.9rem', color: '#475569', textAlign: 'left' }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <IonButton
                expand="block"
                shape="round"
                style={{ '--background': '#7c3aed', width: '100%', '--height': '56px', fontWeight: '800' }}
                onClick={() => {
                    onClose();
                    if (onUpgrade) onUpgrade();
                }}
            >
                Mejorar a Premium ahora
            </IonButton>
        </div>
    );

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.9, 1]} initialBreakpoint={0.9}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Impulsar Oferta</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose} color="medium">Cerrar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {stepsArray.map((s, idx) => (
                            <React.Fragment key={s}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: idx <= currentStepIndex ? '#6366f1' : '#e2e8f0',
                                    transition: 'all 0.3s'
                                }}></div>
                                {idx < stepsArray.length - 1 && <div style={{ width: '20px', height: '2px', backgroundColor: idx < currentStepIndex ? '#6366f1' : '#e2e8f0' }}></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {!isPremium ? renderLockedPlan() : (
                    <>
                        {step === 'channel' && renderChannelSelection()}
                        {step === 'template' && renderTemplatePreview()}
                        {step === 'budget' && renderBudgetSelection()}
                        {step === 'summary' && renderSummary()}
                    </>
                )}
            </IonContent>
            {isPremium && (
                <IonFooter style={{ padding: '16px', background: 'white' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {step !== 'channel' && (
                            <IonButton expand="block" fill="outline" style={{ flex: 1 }} onClick={handleBack}>
                                <IonIcon icon={chevronBack} slot="start" />
                                Atrás
                            </IonButton>
                        )}
                        <IonButton expand="block" style={{ flex: 2 }} onClick={handleNext}>
                            {step === 'summary' ? 'Lanzar Campaña' : 'Continuar'}
                            <IonIcon icon={step === 'summary' ? checkmarkCircle : chevronForward} slot="end" />
                        </IonButton>
                    </div>
                </IonFooter>
            )}
        </IonModal>
    );
};
