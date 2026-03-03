import React, { useState, useRef } from 'react';
import {
    IonIcon,
    IonButton,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonList,
    IonToast,
    IonSpinner
} from '@ionic/react';
import {
    camera,
    locationOutline,
    businessOutline,
    timeOutline,
    logoFacebook,
    logoInstagram,
    logoTiktok,
    logoTwitter,
    callOutline,
    saveOutline,
    globeOutline
} from 'ionicons/icons';
import { Company } from '../types';

interface CompanyProfileEditorProps {
    company: Company | null;
    onUpdate: (data: Partial<Company>, imageFile?: File | Blob) => Promise<void>;
}

export const CompanyProfileEditor: React.FC<CompanyProfileEditorProps> = ({ company, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [formData, setFormData] = useState<Partial<Company>>({
        name: company?.name || '',
        address: company?.address || '',
        city: company?.city || '',
        whatsapp: company?.whatsapp || '',
        openingHours: company?.openingHours || '',
        facebookUrl: company?.facebookUrl || '',
        instagramUrl: company?.instagramUrl || '',
        tiktokUrl: company?.tiktokUrl || '',
        xUrl: company?.xUrl || ''
    });

    const [imagePreview, setImagePreview] = useState<string | null>(company?.logoUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sincronizar estado cuando la empresa finalmente se carga o cambia el ID
    React.useEffect(() => {
        if (company) {
            console.log("CompanyProfileEditor: Sincronizando datos de empresa", company.name);
            setFormData({
                name: company.name || '',
                address: company.address || '',
                city: company.city || '',
                whatsapp: company.whatsapp || '',
                openingHours: company.openingHours || '',
                facebookUrl: company.facebookUrl || '',
                instagramUrl: company.instagramUrl || '',
                tiktokUrl: company.tiktokUrl || '',
                xUrl: company.xUrl || ''
            });
            setImagePreview(company.logoUrl || null);
        }
    }, [company?.id, company?.logoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!company) {
            window.alert('DIAGNÓSTICO: Error - No hay empresa cargada en el editor.');
            return;
        }

        // Confirmación visual inmediata
        const confirmSave = window.confirm(`¿Deseas guardar los cambios para "${formData.name}"?`);
        if (!confirmSave) return;

        setLoading(true);
        try {
            console.log("CompanyProfileEditor: Iniciando guardado...", formData);
            // Alerta de diagnóstico
            const dataPreview = `ID: ${company.id}\nNombre: ${formData.name}\nLogo: ${selectedFile ? 'Nuevo archivo' : 'Sin cambios'}`;
            console.log("DIAGNÓSTICO Enviando:", dataPreview);

            await onUpdate(formData, selectedFile || undefined);

            window.alert('¡ÉXITO! Perfil actualizado correctamente en el servidor.');
            setToastMessage('Perfil actualizado con éxito');
            setShowToast(true);
        } catch (error: any) {
            console.error("CompanyProfileEditor: Error al guardar:", error);
            window.alert(`ERROR CRÍTICO: ${error.message || 'Error desconocido'}\nDetalles en consola.`);
            setToastMessage(`Error: ${error.message || 'No se pudo guardar el perfil'}`);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        '--background': '#f8fafc',
        '--padding-start': '16px',
        '--border-radius': '14px',
        '--border-color': '#e2e8f0',
        '--highlight-color-focused': '#6366f1',
        marginBottom: '16px'
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Logo Upload Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '28px',
                boxShadow: 'var(--offertapps-shadow-sm)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '40px',
                        overflow: 'hidden',
                        border: '4px solid white',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Logo"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'opacity 0.3s'
                                }}
                            />
                        ) : (
                            <IonIcon icon={businessOutline} style={{ fontSize: '56px', color: '#94a3b8' }} />
                        )}

                        {loading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}>
                                <IonSpinner name="crescent" color="primary" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: '-8px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: '4px solid white',
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            cursor: 'pointer',
                            zIndex: 11
                        }}
                    >
                        <IonIcon icon={camera} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>
                <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>Logo de la Tienda</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                    Sube una imagen cuadrada para mejores resultados.
                </p>
            </div>

            {/* Basic Info */}
            <h4 style={{ fontWeight: '800', color: '#334155', marginBottom: '16px', paddingLeft: '8px' }}>Información Básica</h4>
            <div className="business-card" style={{ marginBottom: '24px', padding: '12px' }}>
                <IonList lines="none">
                    <IonItem style={inputStyle}>
                        <IonIcon icon={businessOutline} slot="start" color="primary" />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Nombre de la Tienda</IonLabel>
                        <IonInput
                            value={formData.name}
                            onIonInput={e => setFormData({ ...formData, name: e.detail.value! })}
                            placeholder="Ej: Burger Master"
                        />
                    </IonItem>

                    <IonItem style={inputStyle}>
                        <IonIcon icon={locationOutline} slot="start" color="primary" />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Dirección</IonLabel>
                        <IonInput
                            value={formData.address}
                            onIonInput={e => setFormData({ ...formData, address: e.detail.value! })}
                            placeholder="Calle 123 #45-67"
                        />
                    </IonItem>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        <IonItem style={inputStyle}>
                            <IonIcon icon={locationOutline} slot="start" color="primary" />
                            <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Ciudad</IonLabel>
                            <IonInput
                                value={formData.city}
                                onIonInput={e => setFormData({ ...formData, city: e.detail.value! })}
                                placeholder="Bogotá"
                            />
                        </IonItem>

                        <IonItem style={inputStyle}>
                            <IonIcon icon={callOutline} slot="start" color="primary" />
                            <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>WhatsApp (Número completo)</IonLabel>
                            <IonInput
                                type="tel"
                                value={formData.whatsapp}
                                onIonInput={e => {
                                    const val = e.detail.value || '';
                                    // Filtrar para permitir solo números
                                    const numericVal = val.replace(/\D/g, '');
                                    setFormData({ ...formData, whatsapp: numericVal });
                                }}
                                placeholder="Ej: 3001234567"
                                style={{ fontSize: '1.1rem', fontWeight: '600' }}
                            />
                        </IonItem>
                    </div>

                    <IonItem style={inputStyle}>
                        <IonIcon icon={timeOutline} slot="start" color="primary" />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Horarios de Atención</IonLabel>
                        <IonTextarea
                            value={formData.openingHours}
                            onIonInput={e => setFormData({ ...formData, openingHours: e.detail.value! })}
                            placeholder="Lunes a Viernes 8am - 8pm"
                            rows={2}
                        />
                    </IonItem>
                </IonList>
            </div>

            {/* Social Media */}
            <h4 style={{ fontWeight: '800', color: '#334155', marginBottom: '16px', paddingLeft: '8px' }}>Redes Sociales</h4>
            <div className="business-card" style={{ marginBottom: '32px', padding: '12px' }}>
                <IonList lines="none">
                    <IonItem style={inputStyle}>
                        <IonIcon icon={logoFacebook} slot="start" style={{ color: '#1877F2' }} />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Facebook URL</IonLabel>
                        <IonInput
                            value={formData.facebookUrl}
                            onIonInput={e => setFormData({ ...formData, facebookUrl: e.detail.value! })}
                            placeholder="facebook.com/tienda"
                        />
                    </IonItem>

                    <IonItem style={inputStyle}>
                        <IonIcon icon={logoInstagram} slot="start" style={{ color: '#E4405F' }} />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>Instagram URL</IonLabel>
                        <IonInput
                            value={formData.instagramUrl}
                            onIonInput={e => setFormData({ ...formData, instagramUrl: e.detail.value! })}
                            placeholder="instagram.com/tienda"
                        />
                    </IonItem>

                    <IonItem style={inputStyle}>
                        <IonIcon icon={logoTiktok} slot="start" style={{ color: '#000000' }} />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>TikTok URL</IonLabel>
                        <IonInput
                            value={formData.tiktokUrl}
                            onIonInput={e => setFormData({ ...formData, tiktokUrl: e.detail.value! })}
                            placeholder="tiktok.com/@tienda"
                        />
                    </IonItem>

                    <IonItem style={inputStyle}>
                        <IonIcon icon={logoTwitter} slot="start" style={{ color: '#1DA1F2' }} />
                        <IonLabel position="stacked" style={{ fontWeight: '700', color: '#64748b' }}>X (Twitter) URL</IonLabel>
                        <IonInput
                            value={formData.xUrl}
                            onIonInput={e => setFormData({ ...formData, xUrl: e.detail.value! })}
                            placeholder="x.com/tienda"
                        />
                    </IonItem>
                </IonList>
            </div>

            {/* Save Button */}
            <IonButton
                expand="block"
                shape="round"
                onClick={handleSave}
                disabled={loading}
                style={{
                    '--background': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    height: '56px',
                    fontWeight: '800',
                    fontSize: '1rem',
                    boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)',
                    marginBottom: '40px'
                }}
            >
                {loading ? <IonSpinner name="crescent" /> : (
                    <>
                        <IonIcon icon={saveOutline} slot="start" />
                        Guardar Cambios
                    </>
                )}
            </IonButton>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={3000}
                position="bottom"
                color={toastMessage.includes('éxito') ? 'success' : 'danger'}
                style={{ fontWeight: '600' }}
            />
        </div>
    );
};
