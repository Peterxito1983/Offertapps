import {
    ref,
    get,
    set,
    update,
    remove,
    push
} from 'firebase/database';
import { db } from '../config';
import { Company } from '../types';
import { validateCompany, sanitizeString, validateAndSanitizeUrl } from '../utils/validation';

const COMPANIES_REF = 'companies';

/**
 * Obtener todas las empresas
 */
export const getCompanies = async (filters?: {
    isVerified?: boolean;
}): Promise<Company[]> => {
    try {
        const companiesRef = ref(db, COMPANIES_REF);
        const snapshot = await get(companiesRef);

        if (!snapshot.exists()) {
            return [];
        }

        const companiesData = snapshot.val();
        let companies: Company[] = Object.keys(companiesData).map(key => ({
            id: key,
            ...companiesData[key]
        }));

        // Aplicar filtros
        if (filters?.isVerified !== undefined) {
            companies = companies.filter(company => company.isVerified === filters.isVerified);
        }

        return companies;
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        throw new Error('Error al cargar empresas');
    }
};

/**
 * Obtener empresa por ID
 */
export const getCompanyById = async (id: string): Promise<Company | null> => {
    try {
        const companyRef = ref(db, `${COMPANIES_REF}/${id}`);
        const snapshot = await get(companyRef);

        if (!snapshot.exists()) {
            return null;
        }

        return { id, ...snapshot.val() } as Company;
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        return null;
    }
};

/**
 * Crear nueva empresa
 */
export const createCompany = async (company: Omit<Company, 'id'>): Promise<string> => {
    try {
        // Validación de datos
        const validationErrors = validateCompany(company);
        if (validationErrors.length > 0) {
            throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
        }

        // Sanitización de datos
        const sanitizedCompany = {
            ...company,
            name: sanitizeString(company.name),
            logoUrl: company.logoUrl ? validateAndSanitizeUrl(company.logoUrl) : '',
            address: company.address ? sanitizeString(company.address) : '',
            city: company.city ? sanitizeString(company.city) : '',
            whatsapp: company.whatsapp ? sanitizeString(company.whatsapp) : '',
            openingHours: company.openingHours ? sanitizeString(company.openingHours) : '',
            branches: company.branches ? company.branches.map(branch => ({
                ...branch,
                name: sanitizeString(branch.name),
                address: sanitizeString(branch.address),
                city: sanitizeString(branch.city),
                whatsapp: sanitizeString(branch.whatsapp),
                openingHours: sanitizeString(branch.openingHours),
                mapUrl: branch.mapUrl ? validateAndSanitizeUrl(branch.mapUrl) : ''
            })) : []
        };

        const companiesRef = ref(db, COMPANIES_REF);
        const newCompanyRef = push(companiesRef);

        await set(newCompanyRef, {
            ...sanitizedCompany,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return newCompanyRef.key!;
    } catch (error: any) {
        console.error('Error al crear empresa:', error);
        throw new Error(error.message || 'Error al crear empresa');
    }
};

import { uploadCompanyLogo } from './storageService';

/**
 * Actualizar empresa
 */
export const updateCompany = async (id: string, data: Partial<Company>, imageFile?: File | Blob): Promise<string | void> => {
    if (!id) {
        console.error("companiesService: ID de empresa ausente");
        throw new Error('No se puede actualizar el perfil: ID de empresa no encontrado. Por favor, cierra sesión e inicia de nuevo.');
    }
    try {
        // Validación de datos (opcional, dependiendo de lo estricto que sea validateCompany)
        // const validationErrors = validateCompany(data);

        // Sanitización de datos
        const sanitizedData: any = {};

        if (data.name !== undefined) sanitizedData.name = sanitizeString(data.name);
        if (data.address !== undefined) sanitizedData.address = sanitizeString(data.address);
        if (data.city !== undefined) sanitizedData.city = sanitizeString(data.city);
        if (data.whatsapp !== undefined) sanitizedData.whatsapp = sanitizeString(data.whatsapp);
        if (data.openingHours !== undefined) sanitizedData.openingHours = sanitizeString(data.openingHours);

        // Redes Sociales
        if (data.facebookUrl !== undefined) sanitizedData.facebookUrl = validateAndSanitizeUrl(data.facebookUrl) || '';
        if (data.instagramUrl !== undefined) sanitizedData.instagramUrl = validateAndSanitizeUrl(data.instagramUrl) || '';
        if (data.tiktokUrl !== undefined) sanitizedData.tiktokUrl = validateAndSanitizeUrl(data.tiktokUrl) || '';
        if (data.xUrl !== undefined) sanitizedData.xUrl = validateAndSanitizeUrl(data.xUrl) || '';

        if (data.branches !== undefined) {
            sanitizedData.branches = data.branches.map(branch => ({
                ...branch,
                name: sanitizeString(branch.name),
                address: sanitizeString(branch.address),
                city: sanitizeString(branch.city),
                whatsapp: sanitizeString(branch.whatsapp),
                openingHours: sanitizeString(branch.openingHours),
                mapUrl: branch.mapUrl ? validateAndSanitizeUrl(branch.mapUrl) : ''
            }));
        }

        if (data.subscriptionPlan !== undefined) sanitizedData.subscriptionPlan = data.subscriptionPlan;
        if (data.isVerified !== undefined) sanitizedData.isVerified = data.isVerified;

        let finalLogoUrl = data.logoUrl || '';

        // Subida de Logo
        if (imageFile) {
            console.log("companiesService: Subiendo logo...");
            finalLogoUrl = await uploadCompanyLogo(imageFile);
            sanitizedData.logoUrl = finalLogoUrl;
            console.log("companiesService: Logo subido con éxito:", finalLogoUrl);
        } else if (data.logoUrl !== undefined) {
            sanitizedData.logoUrl = validateAndSanitizeUrl(data.logoUrl) || '';
        }

        // ELIMINAR CAMPOS UNDEFINED del payload de Firebase para evitar errores de escritura
        const finalPayload = Object.fromEntries(
            Object.entries(sanitizedData).filter(([_, v]) => v !== undefined)
        );

        console.log("companiesService: Actualizando en base de datos con payload:", finalPayload);
        const companyRef = ref(db, `${COMPANIES_REF}/${id}`);

        // ALERTA DE DIAGNÓSTICO PARA EL USUARIO
        // window.alert(`Enviando a Firebase DB (ID: ${id})`);

        await update(companyRef, {
            ...finalPayload,
            updatedAt: new Date().toISOString()
        });
        console.log("companiesService: Perfil actualizado exitosamente");

        return finalLogoUrl;
    } catch (error: any) {
        console.error('Error al actualizar empresa:', error);
        throw error;
    }
};

/**
 * Eliminar empresa
 */
export const deleteCompany = async (id: string): Promise<void> => {
    try {
        const companyRef = ref(db, `${COMPANIES_REF}/${id}`);
        await remove(companyRef);
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        throw new Error('Error al eliminar empresa');
    }
};

/**
 * Actualizar estado de verificación de empresa
 */
export const updateCompanyVerificationStatus = async (
    id: string,
    isVerified: boolean
): Promise<string | void> => {
    return updateCompany(id, { isVerified });
};
