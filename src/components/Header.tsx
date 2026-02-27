import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonSearchbar } from '@ionic/react';
import { logOut, settingsOutline, chatbubbleEllipsesOutline, notificationsOutline } from 'ionicons/icons';
import { Role, AppNotification } from '../types';
import { signOut } from '../services/authService';
import { getFilteredNotifications } from '../services/notificationService';
import { UserSettingsModal } from './UserSettingsModal';
import { NotificationCenterModal } from './NotificationCenterModal';
import './Header.css';

interface HeaderProps {
    currentRole: Role;
    userId: string;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onNotificationClick?: (notif: AppNotification) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, userId, searchTerm, onSearchChange, onNotificationClick }) => {
    const [showSettings, setShowSettings] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

    const loadNotifications = React.useCallback(async () => {
        if (currentRole === Role.USER && userId) {
            const data = await getFilteredNotifications(userId);
            setNotifications(data);
        }
    }, [userId, currentRole]);

    React.useEffect(() => {
        loadNotifications();
        // Recargar cada 30 segundos para simular tiempo real
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/auth';
    };

    return (
        <IonHeader className="ion-no-border shopee-header">
            <div className="shopee-top-bar">
                <div className="top-bar-content">
                    <div className="top-bar-links">
                        <span>Vender en Offertapps</span>
                        <span>Ayuda</span>
                        <span>Notificaciones</span>
                    </div>
                </div>
            </div>
            <IonToolbar className="shopee-toolbar">
                <div className="header-main-container">
                    <div className="brand-container">
                        <span className="brand-text">
                            OffertApps
                        </span>
                    </div>

                    <div className="header-actions">
                        <IonButtons>
                            {/* Actions moved to Profile View for USER and COMPANY role to keep UI clean */}
                            {currentRole === Role.ADMIN && (
                                <>
                                    <IonButton
                                        className="header-icon-btn"
                                        onClick={() => window.open('https://wa.me/573000000000?text=Hola,%20necesito%20soporte%20con%20Offertapps', '_system')}
                                    >
                                        <IonIcon icon={chatbubbleEllipsesOutline} slot="icon-only" />
                                    </IonButton>

                                    <IonButton
                                        onClick={() => setShowNotifications(true)}
                                        className="header-icon-btn notification-btn"
                                        style={{ position: 'relative' }}
                                    >
                                        <IonIcon icon={notificationsOutline} slot="icon-only" />
                                        {unreadCount > 0 && (
                                            <div className="notification-badge">{unreadCount}</div>
                                        )}
                                    </IonButton>

                                    <IonButton
                                        onClick={() => setShowSettings(true)}
                                        className="header-icon-btn"
                                    >
                                        <IonIcon icon={settingsOutline} slot="icon-only" />
                                    </IonButton>

                                    <IonButton
                                        onClick={handleLogout}
                                        className="header-logout-btn"
                                    >
                                        <IonIcon icon={logOut} slot="icon-only" />
                                    </IonButton>
                                </>
                            )}
                        </IonButtons>
                    </div>
                </div>
            </IonToolbar>
            <UserSettingsModal
                isOpen={showSettings}
                onClose={() => {
                    setShowSettings(false);
                    loadNotifications(); // Recargar al cerrar por si cambiaron preferencias
                }}
                userId={userId}
            />
            <NotificationCenterModal
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onUpdate={loadNotifications}
                onNotificationClick={(notif) => {
                    if (onNotificationClick) onNotificationClick(notif);
                    setShowNotifications(false);
                }}
            />
        </IonHeader>
    );
};
