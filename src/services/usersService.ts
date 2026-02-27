import { ref, get, update } from 'firebase/database';
import { db } from '../config';
import { User, UserLevel } from '../types';
import { sanitizeString } from '../utils/validation';

const USERS_REF = 'users';

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const usersRef = ref(db, USERS_REF);
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            return [];
        }

        const usersData = snapshot.val();
        const users: User[] = Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key]
        }));

        return users;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw new Error('Error al cargar usuarios');
    }
};

/**
 * Obtener usuario por ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const userRef = ref(db, `${USERS_REF}/${id}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return null;
        }

        return { id, ...snapshot.val() } as User;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
};

/**
 * Actualizar nivel de usuario
 */
export const updateUserLevel = async (userId: string, level: UserLevel): Promise<void> => {
    try {
        const userRef = ref(db, `${USERS_REF}/${userId}`);
        await update(userRef, {
            level: level,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar nivel de usuario:', error);
        throw new Error('Error al actualizar nivel de usuario');
    }
};

/**
 * Actualizar puntos de usuario
 */
export const updateUserPoints = async (userId: string, points: number): Promise<void> => {
    try {
        const userRef = ref(db, `${USERS_REF}/${userId}`);
        await update(userRef, {
            points: points,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar puntos de usuario:', error);
        throw new Error('Error al actualizar puntos de usuario');
    }
};

/**
 * Actualizar perfil de usuario
 */
export const updateUserProfile = async (userId: string, data: { name?: string }): Promise<void> => {
    try {
        const userRef = ref(db, `${USERS_REF}/${userId}`);
        const updates: any = {};

        if (data.name) updates.displayName = sanitizeString(data.name);

        updates.updatedAt = new Date().toISOString();

        await update(userRef, updates);
    } catch (error) {
        console.error('Error al actualizar perfil de usuario:', error);
        throw new Error('Error al actualizar perfil');
    }
};