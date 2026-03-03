import React, { useState } from 'react';
import { IonButton, IonTextarea, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/react';
import { send } from 'ionicons/icons';
import { StarRating } from './StarRating';
import { Review } from '../types';

interface ReviewFormProps {
    onSubmit: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
    targetType: 'offer' | 'company' | 'user';
    targetId: string;
    companyId: string;
    userId: string;
    userName: string;
    offerId?: string;
    placeholder?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    onSubmit,
    targetType,
    targetId,
    companyId,
    userId,
    userName,
    offerId,
    placeholder = "Escribe tu reseña aquí..."
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (comment.length < 5) {
            alert('El comentario debe tener al menos 5 caracteres');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                targetType,
                targetId,
                companyId,
                userId,
                userName,
                offerId,
                rating,
                comment,
            });
            setComment('');
            setRating(5);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error al enviar la reseña');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-form-container" style={{ padding: '16px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontWeight: '800', margin: '0 0 16px 0', fontSize: '1.1rem' }}>Deja tu opinión</h4>

            <div style={{ marginBottom: '20px' }}>
                <IonLabel style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#64748b', fontSize: '0.9rem' }}>Calificación</IonLabel>
                <StarRating
                    rating={rating}
                    interactive={true}
                    onRatingChange={setRating}
                    size="large"
                />
            </div>

            <IonItem lines="none" style={{ '--background': '#f8fafc', borderRadius: '16px', marginBottom: '8px' }}>
                <IonTextarea
                    placeholder={placeholder}
                    value={comment}
                    onIonInput={e => setComment(e.detail.value!)}
                    rows={4}
                    style={{ fontWeight: '500' }}
                />
            </IonItem>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonNote style={{ fontSize: '0.75rem' }}>{comment.length}/500 caracteres</IonNote>
                <IonButton
                    onClick={handleSubmit}
                    disabled={isSubmitting || comment.length < 5}
                    shape="round"
                    style={{ '--border-radius': '14px', fontWeight: '700' }}
                >
                    <IonIcon icon={send} slot="start" />
                    {isSubmitting ? 'Enviando...' : 'Publicar'}
                </IonButton>
            </div>
        </div>
    );
};
