import React from 'react';
import { IonIcon } from '@ionic/react';
import { star, starOutline, starHalf } from 'ionicons/icons';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'small' | 'medium' | 'large';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'medium',
    interactive = false,
    onRatingChange,
    color = 'var(--ion-color-warning)'
}) => {
    const stars = [];
    const iconSize = size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px';

    for (let i = 1; i <= maxRating; i++) {
        let icon = starOutline;
        if (rating >= i) {
            icon = star;
        } else if (rating > i - 1) {
            icon = starHalf;
        }

        stars.push(
            <IonIcon
                key={i}
                icon={icon}
                style={{
                    fontSize: iconSize,
                    color: color,
                    cursor: interactive ? 'pointer' : 'default',
                    marginRight: '2px'
                }}
                onClick={() => interactive && onRatingChange && onRatingChange(i)}
            />
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {stars}
        </div>
    );
};
