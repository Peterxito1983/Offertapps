import React, { useState } from 'react';
import {
    IonModal,
    IonContent,
    IonIcon,
    IonLabel,
    IonAlert,
    IonLoading,
    IonToast,
    IonButton
} from '@ionic/react';
import { close, trash, person, notifications, documentText, shieldCheckmark, logOut } from 'ionicons/icons';
import { NotificationPreferences } from './NotificationPreferences';
import { deleteAccount, signOut } from '../services/authService';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, userId }) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await deleteAccount();
            setToastMessage('Cuenta eliminada');
            setShowToast(true);
            setTimeout(() => window.location.href = '/auth', 2000);
        } catch (error: any) {
            setToastMessage(error.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonContent className="ion-padding" style={{ '--background': 'var(--app-bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontWeight: '800', margin: 0 }}>Ajustes</h2>
                    <IonButton fill="clear" color="dark" onClick={onClose}>
                        <IonIcon icon={close} slot="icon-only" />
                    </IonButton>
                </div>

                <div className="enhanced-card" style={{ padding: '20px', background: 'white', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={notifications} color="primary" /> Notificaciones
                    </h3>
                    <NotificationPreferences userId={userId} />
                </div>

                <div className="enhanced-card" style={{ padding: '20px', background: 'white' }}>
                    <IonButton expand="block" fill="outline" color="dark" onClick={signOut} style={{ marginBottom: '12px' }}>
                        <IonIcon icon={logOut} slot="start" /> Cerrar Sesión
                    </IonButton>
                    <IonButton expand="block" fill="outline" color="danger" onClick={() => setShowDeleteAlert(true)}>
                        <IonIcon icon={trash} slot="start" /> Eliminar Cuenta
                    </IonButton>
                </div>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Confirmar"
                    message="¿Eliminar permanentemente?"
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Eliminar', handler: handleDeleteAccount }
                    ]}
                />
                <IonLoading isOpen={loading} message="Procesando..." />
                <IonToast isOpen={showToast} message={toastMessage} duration={2000} onDidDismiss={() => setShowToast(false)} />
            </IonContent>
        </IonModal>
    );
};
