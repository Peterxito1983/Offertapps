import React, { useState } from 'react';
import {
    IonModal,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonIcon,
    IonButton
} from '@ionic/react';
import { close, pricetag, text, cut, list, image, sync } from 'ionicons/icons';
import { Offer, CATEGORIES } from '../types';

interface CreateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (offer: Omit<Offer, 'id'>) => void;
    companyId: string;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    companyId
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discount, setDiscount] = useState('');
    const [category, setCategory] = useState('Comida');
    const [imageUrl, setImageUrl] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    const handleSubmit = () => {
        onSubmit({
            companyId,
            branchId: 'default',
            title,
            description,
            discount,
            category: category as any,
            imageUrl: imageUrl || 'https://picsum.photos/400/300',
            offerType: discount.includes('%') || discount.includes('$') ? 'descuento' : '2x1',
            isRecurring
        });

        setTitle('');
        setDescription('');
        setDiscount('');
        setCategory('Comida');
        setImageUrl('');
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.9, 1]} initialBreakpoint={0.9}>
            <IonContent className="ion-padding" style={{ '--background': 'var(--app-bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontWeight: '800', margin: 0 }}>Nueva Oferta</h2>
                    <IonButton fill="clear" color="dark" onClick={onClose}>
                        <IonIcon icon={close} slot="icon-only" />
                    </IonButton>
                </div>

                <div className="enhanced-card" style={{ padding: '20px', background: 'white' }}>
                    <IonItem lines="none" className="validated-input-container" style={{ background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                        <IonLabel position="stacked" style={{ fontWeight: '700' }}>Título</IonLabel>
                        <IonInput value={title} onIonChange={e => setTitle(e.detail.value!)} placeholder="Ej. 2x1 en Pizza" />
                    </IonItem>

                    <IonItem lines="none" className="validated-input-container" style={{ background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                        <IonLabel position="stacked" style={{ fontWeight: '700' }}>Descripción</IonLabel>
                        <IonTextarea value={description} onIonChange={e => setDescription(e.detail.value!)} rows={3} placeholder="Detalles de la oferta" />
                    </IonItem>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <IonItem lines="none" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                            <IonLabel position="stacked" style={{ fontWeight: '700' }}>Descuento</IonLabel>
                            <IonInput value={discount} onIonChange={e => setDiscount(e.detail.value!)} placeholder="Ej. 50%" />
                        </IonItem>
                        <IonItem lines="none" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                            <IonLabel position="stacked" style={{ fontWeight: '700' }}>Categoría</IonLabel>
                            <IonSelect value={category} onIonChange={e => setCategory(e.detail.value!)}>
                                {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                                    <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </div>

                    <IonItem lines="none" style={{ background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                        <IonLabel position="stacked" style={{ fontWeight: '700' }}>Imagen (URL)</IonLabel>
                        <IonInput value={imageUrl} onIonChange={e => setImageUrl(e.detail.value!)} placeholder="https://..." />
                    </IonItem>

                    <IonItem lines="none" style={{ marginBottom: '24px' }}>
                        <IonLabel style={{ fontWeight: '600' }}>Oferta Recurrente</IonLabel>
                        <IonToggle checked={isRecurring} onIonChange={e => setIsRecurring(e.detail.checked)} color="primary" />
                    </IonItem>

                    <IonButton expand="block" shape="round" size="large" onClick={handleSubmit} disabled={!title || !description || !discount}>
                        Publicar Oferta
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};
