// src/components/EnhancedCreateOfferModal.tsx

import React, { useState, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonButtons,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  IonDatetime,
  IonText,
  IonIcon,
  IonAlert
} from '@ionic/react';
import { ValidatedInput, DestructiveActionForm } from './EnhancedFormComponents';
import { Offer, OfferCategory, OfferType, CATEGORIES } from '../types';
import { image, camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface EnhancedCreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: Omit<Offer, 'id'>, imageFile?: File | Blob) => void;
  companyId: string;
  initialOffer?: Offer;
}

// Validaciones específicas para ofertas
const titleValidation = {
  validate: (value: string) => value.length >= 3 && value.length <= 100,
  errorMessage: 'El título debe tener entre 3 y 100 caracteres'
};

const descriptionValidation = {
  validate: (value: string) => value.length >= 10 && value.length <= 500,
  errorMessage: 'La descripción debe tener entre 10 y 500 caracteres'
};

const discountValidation = {
  validate: (value: string) => {
    if (value.length < 1) return false;
    const allowedRegex = /^([\d\s%.,x]|OFF)+$/i;
    const cleanValue = value.trim().toUpperCase();
    if (!allowedRegex.test(cleanValue)) return false;

    const discountValue = parseFloat(cleanValue.replace(/[^\d.-]/g, ''));
    // El límite solo aplica si no es un formato 2x1 (X)
    if (discountValue > 90 && !cleanValue.includes('X')) return false;
    return true;
  },
  errorMessage: 'Solo números, %, OFF, x (ej: 2x1) y máx 90%'
};

// Validación para la imagen
const validateImage = (file: File | null): string | null => {
  if (!file) {
    return 'La imagen es requerida';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Solo se permiten imágenes JPG y PNG';
  }

  if (file.size > maxSize) {
    return 'La imagen debe pesar menos de 5MB';
  }

  return null;
};

const compressImage = async (file: File): Promise<Blob> => {
  const originalSizeNum = file.size / 1024;
  const originalSize = originalSizeNum.toFixed(1);
  console.log(`[DEBUG] Tamaño original: ${originalSize} KB`);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Ajuste de calidad para ALTA DEFINICIÓN (FHD)
        const MAX_DIM = 1920;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Usar algoritmo de suavizado para evitar pixelado al redimensionar
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              const compressedSizeNum = blob.size / 1024;
              const compressedSize = compressedSizeNum.toFixed(1);
              console.log(`[DEBUG] Tamaño final: ${compressedSize} KB`);
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob falló.'));
            }
          },
          'image/jpeg',
          0.95
        );
      } catch (err: any) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error cargando imagen en memoria.'));
    };
  });
};

export const EnhancedCreateOfferModal: React.FC<EnhancedCreateOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  companyId,
  initialOffer
}) => {
  const [title, setTitle] = useState(initialOffer?.title || '');
  const [description, setDescription] = useState(initialOffer?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialOffer?.imageUrl || null);
  const [discount, setDiscount] = useState(initialOffer?.discount || '');
  const [category, setCategory] = useState<OfferCategory>(initialOffer?.category || 'Comida');
  const [offerType, setOfferType] = useState<OfferType>(initialOffer?.offerType || 'descuento');
  const [isRecurring, setIsRecurring] = useState(initialOffer?.isRecurring ?? true);
  const [validUntil, setValidUntil] = useState(initialOffer?.validUntil ? new Date(initialOffer.validUntil).toISOString().split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showFallbackAlert, setShowFallbackAlert] = useState(false);
  const [pendingOfferData, setPendingOfferData] = useState<Omit<Offer, 'id'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado cuando initialOffer cambia (aplica para edición)
  React.useEffect(() => {
    if (isOpen) {
      if (initialOffer) {
        setTitle(initialOffer.title || '');
        setDescription(initialOffer.description || '');
        setImagePreview(initialOffer.imageUrl || null);
        setDiscount(initialOffer.discount || '');
        setCategory(initialOffer.category || 'Comida');
        setOfferType(initialOffer.offerType || 'descuento');
        setIsRecurring(initialOffer.isRecurring ?? true);
        setValidUntil(initialOffer.validUntil ? new Date(initialOffer.validUntil).toISOString().split('T')[0] : '');
      } else {
        // Si no hay initialOffer, es una creación nueva, limpiar campos
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        setDiscount('');
        setCategory('Comida');
        setOfferType('descuento');
        setIsRecurring(true);
        setValidUntil('');
      }
      setErrors({});
    }
  }, [isOpen, initialOffer]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (title.length < 3) newErrors.title = 'El título debe tener al menos 3 caracteres';
    if (description.length < 10) newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    if (!discount) {
      newErrors.discount = 'El descuento es obligatorio';
    } else {
      const allowedRegex = /^([\d\s%.,x]|OFF)+$/i;
      const cleanDiscount = discount.trim().toUpperCase();

      if (!allowedRegex.test(cleanDiscount)) {
        newErrors.discount = 'Solo se permiten números, %, OFF y x (ej: 2x1)';
      } else {
        const discountValue = parseFloat(cleanDiscount.replace(/[^\d.-]/g, ''));
        if (discountValue > 90 && !cleanDiscount.includes('X')) {
          newErrors.discount = 'El descuento no puede ser superior al 90%';
        }
      }
    }

    // Solo validar imagen si no hay una previa (caso edición)
    if (!imagePreview && !imageFile) {
      newErrors.image = 'La imagen es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Prompt allows both camera and gallery
        promptLabelHeader: 'Seleccionar Imagen',
        promptLabelPhoto: 'Desde la Galería',
        promptLabelPicture: 'Tomar Foto'
      });

      if (image.webPath) {
        setImagePreview(image.webPath);
        // Convert webPath (blob URL) to a File object for consistency
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
      }
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      // Fallback to trigger file input if camera is rejected or fails
      if ((error as any).message !== 'User cancelled photos app') {
        triggerFileInput();
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    let finalImageFile: File | Blob | null = imageFile;

    try {
      let finalImageUrl = imagePreview && !imageFile ? imagePreview : '';

      if (imageFile) {
        try {
          // COMPRESIÓN MANDATORIA
          alert('DEBUG: Iniciando compresión...');
          finalImageFile = await compressImage(imageFile);
          alert('DEBUG: Compresión terminada.');

          // INTENTO DE SUBIDA
          // Pasamos el archivo al servicio, pero aquí manejaremos el fallback si falla
        } catch (compErr: any) {
          console.error('Error comprimiendo:', compErr);
        }
      }

      const offerData: Omit<Offer, 'id'> = {
        companyId,
        title,
        description,
        imageUrl: finalImageUrl,
        discount,
        category,
        offerType,
        isRecurring,
        validUntil: validUntil ? new Date(validUntil) : undefined
      };

      try {
        await onSubmit(offerData, finalImageFile || undefined);
        resetForm();
        onClose();
      } catch (uploadError: any) {
        console.error('Error en el proceso de subida:', uploadError);

        // Lógica de Fallback
        setPendingOfferData({
          ...offerData,
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'
        });
        setShowFallbackAlert(true);
      }
    } catch (error: any) {
      console.error('Error crítico al crear oferta:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFallbackConfirm = async () => {
    if (pendingOfferData) {
      setIsSubmitting(true);
      try {
        await onSubmit(pendingOfferData, undefined);
        resetForm();
        setShowFallbackAlert(false);
        onClose();
      } catch (err: any) {
        alert("Error al publicar incluso sin foto: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    // Confirmar cancelación si hay cambios
    const hasChanges =
      title !== (initialOffer?.title || '') ||
      description !== (initialOffer?.description || '') ||
      discount !== (initialOffer?.discount || '') ||
      category !== (initialOffer?.category || 'Comida') ||
      offerType !== (initialOffer?.offerType || 'descuento') ||
      isRecurring !== (initialOffer?.isRecurring ?? true) ||
      validUntil !== (initialOffer?.validUntil ? new Date(initialOffer.validUntil).toISOString() : '') ||
      imageFile !== null;

    if (hasChanges) {
      if (window.confirm('¿Estás seguro que deseas cancelar? Perderás los cambios no guardados.')) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    if (initialOffer) {
      // Si es edición, restaurar valores originales
      setTitle(initialOffer.title || '');
      setDescription(initialOffer.description || '');
      setImagePreview(initialOffer.imageUrl || null);
      setDiscount(initialOffer.discount || '');
      setCategory(initialOffer.category || 'Comida');
      setOfferType(initialOffer.offerType || 'descuento');
      setIsRecurring(initialOffer.isRecurring ?? true);
      setValidUntil(initialOffer.validUntil ? new Date(initialOffer.validUntil).toISOString() : '');
    } else {
      // Si es creación, limpiar todo
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setDiscount('');
      setCategory('Comida');
      setOfferType('descuento');
      setIsRecurring(true);
      setValidUntil('');
    }
    setErrors({});
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{initialOffer ? 'Editar Oferta' : 'Crear Nueva Oferta'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCancel}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <ValidatedInput
                    value={title}
                    onValueChange={setTitle}
                    label="Título de la Oferta"
                    placeholder="Ej: 2x1 en hamburguesas"
                    validations={[titleValidation]}
                    required
                    helperText="Entre 3 y 100 caracteres"
                  />
                  {errors.title && (
                    <IonText color="danger">
                      <p>{errors.title}</p>
                    </IonText>
                  )}
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Descripción</IonLabel>
                    <IonTextarea
                      value={description}
                      onIonInput={e => setDescription(e.detail.value!)}
                      placeholder="Describe los detalles de la oferta..."
                      rows={4}
                    />
                  </IonItem>
                  {errors.description && (
                    <IonText color="danger">
                      <p>{errors.description}</p>
                    </IonText>
                  )}
                  <IonText color="medium" style={{ fontSize: '12px' }}>
                    <p>Entre 10 y 500 caracteres</p>
                  </IonText>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <ValidatedInput
                    value={discount}
                    onValueChange={setDiscount}
                    label="Descuento"
                    placeholder="Ej: 50% OFF, 2x1, etc."
                    validations={[discountValidation]}
                    required
                  />
                  {errors.discount && (
                    <IonText color="danger">
                      <p>{errors.discount}</p>
                    </IonText>
                  )}
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel>Categoría</IonLabel>
                    <IonSelect
                      value={category}
                      onIonChange={e => setCategory(e.detail.value)}
                      interface="popover"
                    >
                      {CATEGORIES.filter(cat => cat !== 'Todos').map(category => (
                        <IonSelectOption key={category} value={category}>
                          {category}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel>¿Es recurrente?</IonLabel>
                    <IonToggle
                      checked={isRecurring}
                      onIonChange={e => setIsRecurring(e.detail.checked)}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Imagen del Producto</IonLabel>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '20px',
                        cursor: 'pointer',
                        minHeight: '200px',
                        backgroundColor: '#fafafa'
                      }}
                      onClick={takePicture}
                    >
                      <IonIcon
                        icon={camera}
                        style={{
                          fontSize: '48px',
                          color: '#ccc',
                          marginBottom: '10px'
                        }}
                      />
                      <p style={{ textAlign: 'center', margin: '10px 0' }}>
                        {imagePreview
                          ? 'Haz clic para cambiar la imagen'
                          : 'Haz clic para seleccionar una imagen (JPG, PNG)'}
                      </p>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            marginTop: '10px'
                          }}
                        />
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                      />
                    </div>
                    {errors.image && (
                      <IonText color="danger">
                        <p style={{ marginTop: '8px' }}>{errors.image}</p>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>

              {!isRecurring && (
                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="stacked">Válida hasta</IonLabel>
                      <IonDatetime
                        value={validUntil}
                        onIonChange={e => {
                          const val = e.detail.value;
                          if (typeof val === 'string') {
                            setValidUntil(val);
                          } else if (Array.isArray(val) && val.length > 0) {
                            setValidUntil(val[0]);
                          }
                        }}
                        presentation="date"
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </IonContent>

      <IonAlert
        isOpen={showFallbackAlert}
        onDidDismiss={() => setShowFallbackAlert(false)}
        header={'Fallo de Conexión'}
        subHeader={'Tu internet está muy lento'}
        message={'No pudimos subir la foto, pero podemos publicar tu oferta con una imagen genérica para que no pierdas tiempo. ¿Deseas hacerlo?'}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => { setShowFallbackAlert(false); }
          },
          {
            text: 'Sí, publicar con imagen genérica',
            handler: handleFallbackConfirm
          }
        ]}
      />

      <IonFooter style={{ zIndex: 9999, background: 'white' }}>
        <IonToolbar>
          <IonButtons slot="start">
            <DestructiveActionForm
              actionName="Cancelar"
              actionDescription="¿Estás seguro que deseas cancelar? Perderás los cambios no guardados."
              onConfirm={onClose}
              onCancel={() => { }}
            >
              <IonButton fill="clear" color="medium">Cancelar</IonButton>
            </DestructiveActionForm>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              color="primary"
            >
              {isSubmitting ? 'Guardando...' : initialOffer ? 'Actualizar Oferta' : 'Crear Oferta'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};