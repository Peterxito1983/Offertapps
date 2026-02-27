import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    updateProfile as updateFirebaseProfile,
    deleteUser
} from 'firebase/auth';
import { ref, set, get, child, remove, update } from 'firebase/database';
import { auth, db } from '../config';
import { Role } from '../types';
import { createCompany } from './companiesService';
import { validateEmail, validatePassword, validateUser, sanitizeString } from '../utils/validation';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: Role;
    createdAt: string;
    companyId?: string; // Para usuarios tipo empresa
}

/**
 * Registrar nuevo usuario
 */
export const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: Role = Role.USER,
    companyDetails?: {
        address: string;
        city: string;
        whatsapp: string;
        openingHours: string;
        logoUrl: string;
    }
): Promise<UserProfile> => {
    try {
        // Validación de entradas
        if (!validateEmail(email)) {
            throw new Error('Correo electrónico inválido');
        }

        if (!validatePassword(password)) {
            throw new Error('La contraseña debe tener al menos 6 caracteres, incluyendo mayúscula, minúscula y número');
        }

        if (!displayName || displayName.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        const sanitizedDisplayName = sanitizeString(displayName);

        console.log('[SignUp] Step 1: Creating Auth User');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('[SignUp] Auth User created:', user.uid);

        // Actualizar perfil con nombre
        console.log('[SignUp] Step 2: Updating Firebase Profile');
        await updateFirebaseProfile(user, { displayName: sanitizedDisplayName });

        // --- LÓGICA DE SUPER ADMIN ---
        const adminEmails = ['jupiter.soluciones@gmail.com', 'admin@offertapps.com'];
        if (adminEmails.includes(email)) {
            role = Role.ADMIN;
        }
        // -----------------------------

        // Crear documento de perfil en Realtime Database
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: sanitizedDisplayName,
            role,
            createdAt: new Date().toISOString()
        };

        // Si es Rol EMPRESA, creamos la entidad Company automáticamente
        if (role === Role.COMPANY) {
            console.log('[SignUp] Step 3: Creating Company record');
            try {
                const companyId = await createCompany({
                    name: sanitizedDisplayName,
                    logoUrl: companyDetails?.logoUrl || '',
                    address: companyDetails?.address || '',
                    city: companyDetails?.city || '',
                    whatsapp: companyDetails?.whatsapp || '',
                    openingHours: companyDetails?.openingHours || '',
                    branches: [],
                    subscriptionPlan: 'basico',
                    isVerified: false // Debe ser verificado por Admin
                });
                console.log('[SignUp] Company created successfully:', companyId);
                userProfile.companyId = companyId;
            } catch (companyErr: any) {
                console.error('[SignUp] Failed to create Company record:', companyErr);
                // LIMPIEZA: Si falla la base de datos, borramos el usuario de Auth por seguridad
                try { await deleteUser(user); } catch (e) { console.error('Error al limpiar usuario:', e); }
                throw new Error(`Error al crear datos de empresa: ${companyErr.message}. Por favor intente de nuevo.`);
            }
        }

        console.log('[SignUp] Step 4: Storing User Profile in DB');
        try {
            const userRef = ref(db, 'users/' + user.uid);
            await set(userRef, userProfile);
        } catch (dbErr: any) {
            console.error('[SignUp] Failed to create User Profile record:', dbErr);
            // LIMPIEZA: Si falla la base de datos, borramos el usuario de Auth
            try { await deleteUser(user); } catch (e) { console.error('Error al limpiar usuario:', e); }
            throw new Error(`Error al guardar perfil: ${dbErr.message}. Por favor intente de nuevo.`);
        }

        console.log('[SignUp] Process completed successfully');
        return userProfile;
    } catch (error: any) {
        console.error('Error detallado en signUp:', error);
        throw error;
    }
};

/**
 * Iniciar sesión
 */
export const signIn = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Obtener perfil de Realtime Database
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));

        let userProfile: UserProfile;

        if (!snapshot.exists()) {
            // Si no existe perfil (raro), creamos uno básico
            console.warn('Perfil no encontrado, creando uno por defecto...');
            userProfile = {
                uid: user.uid,
                email: user.email!,
                displayName: user.displayName || 'Usuario',
                role: Role.USER, // Se sobreescribirá abajo si es admin
                createdAt: new Date().toISOString()
            };
        } else {
            userProfile = snapshot.val() as UserProfile;
        }

        // --- LÓGICA DE SUPER ADMIN ---
        // Si es el correo maestro (o el de respaldo), forzar rol de ADMIN siempre
        const adminEmails = ['jupiter.soluciones@gmail.com', 'admin@offertapps.com'];
        if (adminEmails.includes(user.email!) && userProfile.role !== Role.ADMIN) {
            console.log('👑 Detectado Super Admin, actualizando privilegios...');
            userProfile.role = Role.ADMIN;
            // Actualizar en DB
            await set(ref(db, 'users/' + user.uid), userProfile);
        }
        // -----------------------------

        if (!snapshot.exists()) {
            // Guardar el perfil nuevo (ya con el rol correcto)
            await set(ref(db, 'users/' + user.uid), userProfile);
        }

        return userProfile;
    } catch (error: any) {
        console.error('Error en signIn:', error);
        throw new Error(error.message || 'Error al iniciar sesión');
    }
};

/**
 * Cerrar sesión
 */
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Error en signOut:', error);
        throw new Error(error.message || 'Error al cerrar sesión');
    }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Obtener perfil del usuario actual
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
    const user = getCurrentUser();
    if (!user) return null;

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));

        if (!snapshot.exists()) return null;

        return snapshot.val() as UserProfile;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return null; // Retornar null en vez de lanzar error para no romper la UI
    }
};

/**
 * Actualizar preferencias de notificación del usuario
 */
export const updateUserNotificationPreferences = async (
    userId: string,
    preferences: {
        offers?: boolean;
        promotions?: boolean;
        reminders?: boolean;
        tracking?: boolean;
    }
): Promise<void> => {
    try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            throw new Error('Usuario no encontrado');
        }

        const userData = snapshot.val();
        const currentPrefs = userData.notificationPreferences || {};
        const updatedPrefs = { ...currentPrefs, ...preferences };

        await update(userRef, {
            notificationPreferences: updatedPrefs
        });
    } catch (error) {
        console.error('Error al actualizar preferencias de notificación:', error);
        throw error;
    }
};

/**
 * Eliminar cuenta de usuario
 */
export const deleteAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay una sesión activa');

    try {
        // 1. Eliminar datos de la base de datos
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val() as UserProfile;

            // Si es una empresa, podríamos querer manejar la eliminación de la empresa también
            if (userData.companyId) {
                // Opcional: Marcar empresa como inactiva o eliminarla
                const companyRef = ref(db, `companies/${userData.companyId}`);
                await remove(companyRef);
            }
        }

        await remove(userRef);

        // 2. Eliminar el usuario de Firebase Auth
        await deleteUser(user);
    } catch (error: any) {
        console.error('Error al eliminar cuenta:', error);
        if (error.code === 'auth/requires-recent-login') {
            throw new Error('Por seguridad, debes haber iniciado sesión recientemente para eliminar tu cuenta. Por favor, cierra sesión e inicia sesión de nuevo.');
        }
        throw new Error(error.message || 'Error al eliminar la cuenta');
    }
};

/**
 * Observar cambios en autenticación
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
