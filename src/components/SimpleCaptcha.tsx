import React, { useState, useEffect } from 'react';
import {
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonButton
} from '@ionic/react';

interface CaptchaProps {
    onValidate: (isValid: boolean) => void;
    label?: string;
}

export const SimpleCaptcha: React.FC<CaptchaProps> = ({ onValidate, label = 'Ingrese el texto de la imagen:' }) => {
    const [captchaText, setCaptchaText] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Generar un texto aleatorio para el captcha
    useEffect(() => {
        generateNewCaptcha();
    }, []);

    const generateNewCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(result);
        setUserInput('');
        setError('');
        onValidate(false);
    };

    const validateCaptcha = () => {
        const isValid = userInput.toUpperCase() === captchaText.toUpperCase();
        onValidate(isValid);
        if (!isValid) {
            setError('Texto de captcha incorrecto');
        } else {
            setError('');
        }
        return isValid;
    };

    const handleChange = (e: any) => {
        setUserInput(e.target.value);
        if (error) {
            setError('');
        }
    };

    return (
        <div>
            <IonItem>
                <IonLabel position="stacked">{label}</IonLabel>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '1.2em',
                    letterSpacing: '3px',
                    marginBottom: '10px',
                    userSelect: 'none'
                }}>
                    <span>{captchaText}</span>
                    <IonButton 
                        fill="clear" 
                        size="small" 
                        onClick={generateNewCaptcha}
                        style={{ margin: 0 }}
                    >
                        🔄
                    </IonButton>
                </div>
                <IonInput
                    value={userInput}
                    onIonChange={handleChange}
                    placeholder="Ingrese el texto mostrado"
                    onIonBlur={validateCaptcha}
                />
                {error && <IonText color="danger"><p>{error}</p></IonText>}
            </IonItem>
        </div>
    );
};