import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonAvatar,
    IonList,
    IonToast,
    IonLoading,
    IonBadge,
    IonButtons
} from '@ionic/react';
import {
    person,
    notifications,
    settings,
    chatbubbleEllipses,
    logOut,
    chevronForward,
    camera,
    save,
    close
} from 'ionicons/icons';
import { UserProfile, signOut } from '../services/authService';
import { updateUserProfile } from '../services/usersService';
import { getFilteredNotifications } from '../services/notificationService';
import { AppNotification } from '../types';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { Header } from '../components/Header';
import { Role } from '../types';

interface ProfileViewProps {
    currentUser: UserProfile | null;
    onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.displayName);
            loadNotifications();
        }
    }, [currentUser]);

    const loadNotifications = async () => {
        if (currentUser) {
            const data = await getFilteredNotifications(currentUser.uid);
            setNotificationsList(data);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setToastMessage('El nombre no puede estar vacío');
            setShowToast(true);
            return;
        }

        setIsLoading(true);
        try {
            await onUpdateProfile({ displayName: name });
            setIsEditing(false);
            setToastMessage('Perfil actualizado correctamente');
            setShowToast(true);
        } catch (error) {
            setToastMessage('Error al actualizar perfil');
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/auth';
    };

    const unreadCount = notificationsList.filter(n => !n.read).length;

    return (
        <IonPage>
            <Header currentRole={Role.USER} userId={currentUser?.uid || ''} />
            <IonContent className="ion-padding" style={{ '--background': 'var(--app-bg-color)' }}>
                <div style={{ padding: '20px 0', textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '60px',
                            background: 'linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '48px',
                            boxShadow: '0 10px 20px rgba(125, 95, 255, 0.3)',
                            margin: '0 auto'
                        }}>
                            <IonIcon icon={person} />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: 'white',
                            borderRadius: '50%',
                            padding: '8px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            color: 'var(--ion-color-primary)'
                        }}>
                            <IonIcon icon={camera} />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        {isEditing ? (
                            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                                <IonItem lines="none" className="enhanced-card" style={{ marginBottom: '10px' }}>
                                    <IonInput
                                        value={name}
                                        onIonInput={e => setName(e.detail.value!)}
                                        placeholder="Tu nombre"
                                        style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.2rem' }}
                                    />
                                </IonItem>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <IonButton fill="clear" color="medium" onClick={() => { setIsEditing(false); setName(currentUser?.displayName || ''); }}>
                                        <IonIcon icon={close} slot="start" /> Cancelar
                                    </IonButton>
                                    <IonButton shape="round" onClick={handleSave}>
                                        <IonIcon icon={save} slot="start" /> Guardar
                                    </IonButton>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontWeight: '900', fontSize: '1.8rem', margin: '0' }}>{currentUser?.displayName}</h2>
                                <p style={{ color: '#64748b', margin: '5px 0 15px 0' }}>{currentUser?.email}</p>
                                <IonButton fill="outline" shape="round" size="small" onClick={() => setIsEditing(true)}>
                                    Editar Perfil
                                </IonButton>
                            </>
                        )}
                    </div>
                </div>

                <IonList style={{ background: 'transparent' }}>
                    <div className="enhanced-card" style={{ padding: '8px', background: 'white', marginBottom: '20px' }}>
                        <IonItem button detail={false} lines="none" onClick={() => setShowNotifications(true)} style={{ '--background': 'transparent' }}>
                            <div slot="start" style={{ padding: '10px', background: '#f5f3ff', color: 'var(--ion-color-primary)', borderRadius: '12px' }}>
                                <IonIcon icon={notifications} />
                            </div>
                            <IonLabel style={{ fontWeight: '700' }}>Centro de Notificaciones</IonLabel>
                            {unreadCount > 0 && <IonBadge slot="end" color="danger">{unreadCount}</IonBadge>}
                            <IonIcon icon={chevronForward} slot="end" color="medium" />
                        </IonItem>
                    </div>

                    <div className="enhanced-card" style={{ padding: '8px', background: 'white', marginBottom: '20px' }}>
                        <IonItem button detail={false} lines="none" onClick={() => setShowSettings(true)} style={{ '--background': 'transparent' }}>
                            <div slot="start" style={{ padding: '10px', background: '#f5f3ff', color: 'var(--ion-color-primary)', borderRadius: '12px' }}>
                                <IonIcon icon={settings} />
                            </div>
                            <IonLabel style={{ fontWeight: '700' }}>Ajustes y Privacidad</IonLabel>
                            <IonIcon icon={chevronForward} slot="end" color="medium" />
                        </IonItem>

                        <IonItem
                            button
                            detail={false}
                            lines="none"
                            onClick={() => window.open('https://wa.me/573000000000?text=Hola,%20necesito%20soporte%20con%20Offertapps', '_system')}
                            style={{ '--background': 'transparent' }}
                        >
                            <div slot="start" style={{ padding: '10px', background: '#f5f3ff', color: 'var(--ion-color-primary)', borderRadius: '12px' }}>
                                <IonIcon icon={chatbubbleEllipses} />
                            </div>
                            <IonLabel style={{ fontWeight: '700' }}>Soporte Técnico</IonLabel>
                            <IonIcon icon={chevronForward} slot="end" color="medium" />
                        </IonItem>
                    </div>

                    <div className="enhanced-card" style={{ padding: '8px', background: 'white' }}>
                        <IonItem button detail={false} lines="none" onClick={handleLogout} style={{ '--background': 'transparent' }}>
                            <div slot="start" style={{ padding: '10px', background: '#fff1f2', color: 'var(--ion-color-danger)', borderRadius: '12px' }}>
                                <IonIcon icon={logOut} />
                            </div>
                            <IonLabel style={{ fontWeight: '700', color: 'var(--ion-color-danger)' }}>Cerrar Sesión</IonLabel>
                        </IonItem>
                    </div>
                </IonList>

                <NotificationCenterModal
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={notificationsList}
                    onUpdate={loadNotifications}
                    onNotificationClick={(notif) => {
                        // Aquí se podría manejar el click en la notificación
                        setShowNotifications(false);
                    }}
                />

                <UserSettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    userId={currentUser?.uid || ''}
                />

                <IonLoading isOpen={isLoading} message="Actualizando datos..." />
                <IonToast isOpen={showToast} message={toastMessage} duration={2000} onDidDismiss={() => setShowToast(false)} />
            </IonContent>
        </IonPage>
    );
};
