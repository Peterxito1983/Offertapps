import React from 'react';
import { IonSkeletonText, IonItem, IonThumbnail, IonLabel } from '@ionic/react';

interface SkeletonScreenProps {
  type?: 'card' | 'list-item' | 'avatar' | 'text';
  count?: number;
  width?: string;
  height?: string;
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ 
  type = 'card', 
  count = 1,
  width,
  height 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => {
    switch (type) {
      case 'list-item':
        return (
          <IonItem key={index} lines="none" style={{ marginBottom: '16px' }}>
            <IonThumbnail slot="start">
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '8px' 
                }} 
              />
            </IonThumbnail>
            <IonLabel>
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '80%', 
                  height: '20px', 
                  marginBottom: '8px' 
                }} 
              />
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '60%', 
                  height: '16px' 
                }} 
              />
            </IonLabel>
          </IonItem>
        );
      
      case 'avatar':
        return (
          <IonSkeletonText
            key={index}
            animated={true}
            style={{
              width: width || '50px',
              height: height || '50px',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '4px'
            }}
          />
        );
      
      case 'text':
        return (
          <IonSkeletonText
            key={index}
            animated={true}
            style={{
              width: width || '100%',
              height: height || '16px',
              margin: '8px 0'
            }}
          />
        );
      
      case 'card':
      default:
        return (
          <div 
            key={index} 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '16px'
            }}
          >
            <IonSkeletonText 
              animated={true} 
              style={{ 
                width: '100%', 
                height: '200px' 
              }} 
            />
            <div style={{ padding: '16px' }}>
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '60%', 
                  height: '24px', 
                  marginBottom: '8px' 
                }} 
              />
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '100%', 
                  height: '16px', 
                  marginBottom: '4px' 
                }} 
              />
              <IonSkeletonText 
                animated={true} 
                style={{ 
                  width: '80%', 
                  height: '16px' 
                }} 
              />
            </div>
          </div>
        );
    }
  });

  return <>{skeletons}</>;
};