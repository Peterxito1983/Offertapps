import React, { useState, useEffect, useRef } from 'react';
import { IonImg } from '@ionic/react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  width?: string | number;
  height?: string | number;
  quality?: number; // Factor de calidad para compresión (0-1)
  usePlaceholder?: boolean; // Si se debe usar un placeholder mientras carga
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNmZmYiPkltYWdlPC90ZXh0Pjwvc3ZnPg==', // Placeholder SVG genérico
  width,
  height,
  quality = 0.8,
  usePlaceholder = true
}) => {
  const [imageSrc, setImageSrc] = useState<string>(usePlaceholder ? fallbackSrc : '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLIonImgElement>(null);

  // Función para optimizar la URL de la imagen (simulación de compresión)
  const getOptimizedImageUrl = (originalSrc: string): string => {
    // Esta es una simulación - en un entorno real, usarías un servicio como Cloudinary o similar
    // que pueda manipular imágenes en tiempo real
    if (quality < 1) {
      // Simular compresión añadiendo parámetros a la URL (esto dependería del servicio de imágenes)
      const url = new URL(originalSrc);
      url.searchParams.set('q', Math.round(quality * 100).toString());
      return url.toString();
    }
    return originalSrc;
  };

  useEffect(() => {
    let observer: IntersectionObserver;
    let currentImgRef = imgRef.current;

    const loadImage = () => {
      setIsLoading(true);
      setHasError(false);
      
      const img = new Image();
      img.src = getOptimizedImageUrl(src);
      
      img.onload = () => {
        setImageSrc(img.src);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
        setIsLoading(false);
        setHasError(true);
      };
    };

    // Si Intersection Observer está disponible, usarlo para lazy loading
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadImage();
          observer.unobserve(currentImgRef!);
        }
      });

      if (currentImgRef) {
        observer.observe(currentImgRef);
      }
    } else {
      // Fallback: cargar inmediatamente si no hay soporte para Intersection Observer
      loadImage();
    }

    // Cleanup
    return () => {
      if (observer && currentImgRef) {
        observer.unobserve(currentImgRef);
      }
    };
  }, [src, fallbackSrc, quality]);

  return (
    <IonImg
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'lazy-image-loading' : 'lazy-image-loaded'}`}
      style={{
        ...style,
        width: width || style.width || 'auto',
        height: height || style.height || 'auto',
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  );
};