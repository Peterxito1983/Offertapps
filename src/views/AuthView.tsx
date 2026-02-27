import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonButton,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonLoading,
    IonToast,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonItem
} from '@ionic/react';
import { person, business } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { signIn, signUp } from '../services/authService';
import { Role } from '../types';
import { EnhancedAuthForm } from '../components/EnhancedAuthForm';

export const AuthView: React.FC = () => {
    const handleSuccess = (role: Role) => {
        if (role === Role.COMPANY) window.location.href = '/company';
        else if (role === Role.ADMIN) window.location.href = '/admin';
        else window.location.href = '/tabs/explore';
    };

    return (
        <IonPage>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                zIndex: -1,
                overflow: 'hidden'
            }}>
                {/* Círculos de Blur Decorativos */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                    filter: 'blur(60px)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-5%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                    filter: 'blur(50px)',
                    borderRadius: '50%'
                }} />
            </div>
            <EnhancedAuthForm onSuccess={handleSuccess} />
        </IonPage>
    );
};
