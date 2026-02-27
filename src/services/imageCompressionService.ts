// Servicio para compresión de imágenes
export interface ImageCompressionOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // px, default 1920
  maxHeight?: number; // px, default 1080
  mimeType?: string; // default 'image/jpeg'
}

/**
 * Comprimir una imagen
 * @param file - Archivo de imagen a comprimir
 * @param options - Opciones de compresión
 * @returns Promise<Blob> - Imagen comprimida como Blob
 */
export const compressImage = (file: File, options: ImageCompressionOptions = {}): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'));
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        // Dimensiones originales
        let { width, height } = img;
        
        // Aplicar dimensiones máximas si se especifican
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Configurar dimensiones del canvas
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen en el canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Obtener imagen comprimida
        const quality = options.quality !== undefined ? options.quality : 0.8;
        const mimeType = options.mimeType || 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('No se pudo crear el blob de la imagen'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };
    
    img.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Convertir un Blob a base64
 * @param blob - Blob a convertir
 * @returns Promise<string> - Cadena base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo leer el blob'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Convertir base64 a Blob
 * @param base64 - Cadena base64
 * @param mimeType - Tipo MIME de la imagen
 * @returns Blob
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
};

/**
 * Obtener dimensiones de una imagen
 * @param file - Archivo de imagen
 * @returns Promise<{width: number, height: number}> - Dimensiones de la imagen
 */
export const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      URL.revokeObjectURL(img.src);
      resolve(dimensions);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
  });
};