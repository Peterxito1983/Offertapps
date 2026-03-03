import React from 'react';
import { IonIcon, IonAvatar, IonBadge } from '@ionic/react';
import { chatbubbleEllipses } from 'ionicons/icons';
import { Review } from '../types';
import { StarRating } from './StarRating';

interface ReviewListProps {
    reviews: Review[];
    onReply?: (reviewId: string, reply: string) => void;
    canReply?: boolean;
    emptyMessage?: string;
    title?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    onReply,
    canReply = false,
    emptyMessage = "Aún no hay reseñas.",
    title
}) => {
    if (reviews.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: 'white', borderRadius: '24px', boxShadow: 'var(--offertapps-shadow-sm)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <IonIcon icon={chatbubbleEllipses} style={{ fontSize: '32px', color: '#94a3b8' }} />
                </div>
                <h4 style={{ fontWeight: '800', margin: '0 0 8px 0', color: 'var(--ion-color-dark)' }}>Sin reseñas</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="review-list-container">
            {title && (
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ion-color-dark)', marginBottom: '16px' }}>
                    {title} ({reviews.length})
                </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map(review => (
                    <div key={review.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {review.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h5 style={{ margin: 0, fontWeight: '800', color: 'var(--ion-color-dark)', fontSize: '0.95rem' }}>{review.userName}</h5>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                                        {new Date(review.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <StarRating rating={review.rating} size="small" />
                        </div>

                        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.5', paddingLeft: '52px' }}>
                            "{review.comment}"
                        </p>

                        {review.reply ? (
                            <div style={{ marginTop: '16px', marginLeft: '52px', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', borderLeft: '4px solid var(--ion-color-primary)' }}>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '0.8rem', color: 'var(--ion-color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Respuesta:</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{review.reply}</p>
                            </div>
                        ) : canReply && onReply && (
                            <div style={{ marginLeft: '52px', marginTop: '12px' }}>
                                <button
                                    onClick={() => {
                                        const reply = prompt('Escribe tu respuesta a esta reseña:');
                                        if (reply) onReply(review.id, reply);
                                    }}
                                    style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--ion-color-primary)', backgroundColor: 'transparent', color: 'var(--ion-color-primary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Responder
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
