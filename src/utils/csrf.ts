// Generar un token CSRF
export const generateCSRFToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Validar un token CSRF
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
    return token === expectedToken;
};

// Almacenar token CSRF en sessionStorage
export const storeCSRFToken = (token: string): void => {
    sessionStorage.setItem('csrfToken', token);
};

// Obtener token CSRF de sessionStorage
export const getCSRFToken = (): string | null => {
    return sessionStorage.getItem('csrfToken');
};

// Eliminar token CSRF
export const removeCSRFToken = (): void => {
    sessionStorage.removeItem('csrfToken');
};