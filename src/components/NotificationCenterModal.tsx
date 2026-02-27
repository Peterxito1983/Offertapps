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
    IonIcon,
    IonNote,
    IonBadge
} from '@ionic/react';
import { close, notificationsOutline, megaphoneOutline, timeOutline, alertCircleOutline, chatbubbleEllipsesOutline, sparklesOutline } from 'ionicons/icons';
import { AppNotification, NotificationType } from '../types';
import { markNotificationAsRead } from '../services/notificationService';

interface NotificationCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: AppNotification[];
    onUpdate: () => void;
    onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose, notifications, onUpdate, onNotificationClick }) => {

    const handleRead = (notif: AppNotification) => {
        console.log("NotificationCenterModal: Clic en notificación", notif.id);
        markNotificationAsRead(notif.id);
        onUpdate();

        if (notif.data?.offerId) {
            console.log("NotificationCenterModal: Llamando a onNotificationClick con offerId", notif.data.offerId);
            onNotificationClick(notif);
        } else {
            console.warn("NotificationCenterModal: Notificación sin offerId");
            // Aún así cerramos el modal
            onNotificationClick(notif);
        }
    };

    const getTypeIcon = (type: NotificationType) => {
        switch (type) {
            case 'offers': return sparklesOutline;
            case 'promotions': return megaphoneOutline;
            case 'reminders': return alertCircleOutline;
            case 'tracking': return chatbubbleEllipsesOutline;
            default: return notificationsOutline;
        }
    };

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case 'offers': return 'primary';
            case 'promotions': return 'secondary';
            case 'reminders': return 'warning';
            case 'tracking': return 'tertiary';
            default: return 'medium';
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.7, 1]} initialBreakpoint={0.7}>
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ '--background': '#ffffff', padding: '8px' }}>
                    <IonTitle style={{ fontWeight: '900', fontSize: '1.2rem' }}>Notificaciones</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="dark" onClick={onClose} style={{ '--background': '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px' }}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <IonIcon icon={notificationsOutline} style={{ fontSize: '40px', color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ fontWeight: '800', margin: '0 0 8px 0' }}>Todo al día</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No tienes notificaciones activas según tus preferencias de perfil.</p>
                    </div>
                ) : (
                    <IonList style={{ background: 'transparent' }}>
                        <h5 style={{ fontWeight: '800', marginBottom: '16px', fontSize: '0.9rem', color: '#475569' }}>
                            Recientes {unreadCount > 0 && <IonBadge color="danger" style={{ marginLeft: '8px' }}>{unreadCount}</IonBadge>}
                        </h5>
                        {notifications.map(notif => (
                            <IonItem
                                key={notif.id}
                                onClick={() => handleRead(notif)}
                                style={{
                                    '--background': notif.read ? 'transparent' : '#ffffff',
                                    '--border-radius': '16px',
                                    marginBottom: '10px',
                                    '--padding-start': '12px',
                                    '--inner-padding-end': '12px',
                                    opacity: notif.read ? 0.7 : 1,
                                    boxShadow: notif.read ? 'none' : 'var(--offertapps-shadow-sm)'
                                }}
                                lines="none"
                            >
                                <div slot="start" style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: `var(--ion-color-${getTypeColor(notif.type)}-tint)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: `var(--ion-color-${getTypeColor(notif.type)})`
                                }}>
                                    <IonIcon icon={getTypeIcon(notif.type)} style={{ fontSize: '20px' }} />
                                </div>
                                <IonLabel>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontWeight: '800', fontSize: '0.95rem', margin: '0 0 4px 0' }}>{notif.title}</h3>
                                        {!notif.read && <div style={{ width: '8px', height: '8px', background: 'var(--ion-color-danger)', borderRadius: '50%', flexShrink: 0, marginTop: '5px' }} />}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'normal' }}>{notif.body}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        <IonIcon icon={timeOutline} style={{ fontSize: '14px' }} />
                                        <span>{formatTime(notif.timestamp)}</span>
                                    </div>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonModal>
    );
};
