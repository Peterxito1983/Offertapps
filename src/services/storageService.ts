import {
    ref,
    uploadString,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { storage, auth } from '../config';

// Helper to convert Blob/File to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Subir imagen a Firebase Storage (v3.2 - Base64 Safe Mode)
 */
export const uploadImage = async (
    file: File | Blob,
    path: string,
    fileNameOriginal?: string
): Promise<string> => {
    const bucket = storage.app.options.storageBucket;

    const finalFileName = fileNameOriginal || (file as File).name || `img_${Date.now()}.jpg`;

    return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Timeout (60s). La subida se canceló.'));
        }, 60000);

        try {
            // Diagnóstico de Autenticación
            const user = auth.currentUser;
            console.log(`[Storage] Iniciando subida a path: ${path}. Usuario autenticado: ${user ? user.uid : 'NO'}`);

            if (!user) {
                console.warn('[Storage] Intento de subida sin usuario autenticado detectable por Firebase.');
            }

            // Conversión a Base64 para mayor estabilidad en Android
            const base64String = await blobToBase64(file);

            const timestamp = Date.now();
            const fileName = `${timestamp}_${finalFileName}`;
            const storageRef = ref(storage, `${path}/${fileName}`);

            // Usamos uploadString con formato 'data_url'
            uploadString(storageRef, base64String, 'data_url')
                .then(async (snapshot) => {
                    clearTimeout(timeoutId);
                    const downloadURL = await getDownloadURL(snapshot.ref);
                    resolve(downloadURL);
                })
                .catch((error) => {
                    clearTimeout(timeoutId);
                    // console.error(`Error en uploadString: ${error.code} - ${error.message}`);
                    reject(new Error(`Error Firebase: ${error.code}`));
                });

        } catch (err: any) {
            clearTimeout(timeoutId);
            // console.error(`Error General: ${err.message}`);
            reject(new Error(`Error inesperado: ${err.message}`));
        }
    });
};

/**
 * Eliminar imagen de Firebase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
        // Extraer path de la URL
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        // No lanzar error si la imagen no existe
        if ((error as any).code !== 'storage/object-not-found') {
            throw new Error('Error al eliminar imagen');
        }
    }
};

/**
 * Subir imagen de oferta
 */
export const uploadOfferImage = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'offers');
};

/**
 * Subir logo de empresa
 */
export const uploadCompanyLogo = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'companies/logos');
};

/**
 * Subir imagen de perfil de usuario
 */
export const uploadUserAvatar = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'users/avatars');
};
