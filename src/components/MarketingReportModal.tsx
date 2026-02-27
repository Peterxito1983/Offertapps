import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonBadge,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { close, megaphoneOutline, timeOutline, personOutline, logoWhatsapp, starOutline, shareOutline, eyeOutline } from 'ionicons/icons';
import { Interaction } from '../types';

interface MarketingReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    interactions: Interaction[];
}

export const MarketingReportModal: React.FC<MarketingReportModalProps> = ({ isOpen, onClose, interactions }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredInteractions = interactions.filter(i =>
        i.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.offerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.action.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Click WhatsApp': return logoWhatsapp;
            case 'Guardó Oferta': return starOutline;
            case 'Visualización': return eyeOutline;
            case 'Compartió': return shareOutline;
            default: return megaphoneOutline;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'Click WhatsApp': return 'success';
            case 'Guardó Oferta': return 'tertiary';
            case 'Visualización': return 'primary';
            case 'Compartió': return 'secondary';
            default: return 'medium';
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('es-CO', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.9, 1]} initialBreakpoint={0.9}>
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ '--background': '#ffffff', padding: '8px' }}>
                    <IonTitle style={{ fontWeight: '900', fontSize: '1.2rem' }}>Reporte de Marketing</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="dark" onClick={onClose} style={{ '--background': '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px' }}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
                <div style={{ marginBottom: '24px' }}>
                    <IonSearchbar
                        placeholder="Buscar por usuario u oferta..."
                        value={searchTerm}
                        onIonInput={(e) => setSearchTerm(e.detail.value!)}
                        style={{ '--border-radius': '16px', '--background': '#ffffff', padding: 0 }}
                    />
                </div>

                <div className="analytics-summary" style={{ marginBottom: '24px' }}>
                    <IonGrid style={{ padding: 0 }}>
                        <IonRow>
                            <IonCol size="6">
                                <div style={{ background: 'white', padding: '16px', borderRadius: '20px', boxShadow: 'var(--offertapps-shadow-sm)', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--ion-color-primary)' }}>{interactions.length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Total Interacciones</p>
                                </div>
                            </IonCol>
                            <IonCol size="6">
                                <div style={{ background: 'white', padding: '16px', borderRadius: '20px', boxShadow: 'var(--offertapps-shadow-sm)', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--ion-color-success)' }}>
                                        {interactions.filter(i => i.action === 'Click WhatsApp').length}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Potenciales Leads</p>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>

                <h5 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '16px', paddingLeft: '4px' }}>Historial Detallado</h5>

                <IonList style={{ background: 'transparent' }}>
                    {filteredInteractions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: '#64748b' }}>No se encontraron interacciones.</p>
                        </div>
                    ) : (
                        filteredInteractions.map((interaction) => (
                            <IonItem
                                key={interaction.id}
                                style={{
                                    '--background': '#ffffff',
                                    '--border-radius': '20px',
                                    marginBottom: '12px',
                                    '--padding-start': '16px',
                                    '--inner-padding-end': '16px',
                                    '--box-shadow': 'var(--offertapps-shadow-sm)'
                                }}
                                lines="none"
                            >
                                <div slot="start" style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    backgroundColor: `var(--ion-color-${getActionColor(interaction.action)}-tint)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: `var(--ion-color-${getActionColor(interaction.action)})`
                                }}>
                                    <IonIcon icon={getActionIcon(interaction.action)} style={{ fontSize: '20px' }} />
                                </div>
                                <IonLabel>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h3 style={{ fontWeight: '800', color: '#1e293b', margin: 0 }}>{interaction.userName}</h3>
                                        <IonBadge color={getActionColor(interaction.action)} style={{ fontSize: '0.65rem', borderRadius: '6px', padding: '4px 8px' }}>
                                            {interaction.action}
                                        </IonBadge>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                                        Oferta: <b>{interaction.offerTitle}</b>
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
                                        <IonIcon icon={timeOutline} />
                                        <span>{formatTime(interaction.timestamp)}</span>
                                    </div>
                                </IonLabel>
                            </IonItem>
                        ))
                    )}
                </IonList>
            </IonContent>
        </IonModal>
    );
};
