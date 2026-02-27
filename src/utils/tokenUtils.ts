// Utilidades para el manejo seguro de tokens y autenticación

// Almacenar token de forma segura
export const storeSecureToken = (token: string, key: string = 'auth_token'): void => {
    // En lugar de localStorage, usar sessionStorage para mayor seguridad
    // o en su defecto, localStorage con cifrado básico
    sessionStorage.setItem(key, btoa(token)); // Codificar base64 simple como medida básica
};

// Obtener token de forma segura
export const getSecureToken = (key: string = 'auth_token'): string | null => {
    const encodedToken = sessionStorage.getItem(key);
    if (encodedToken) {
        try {
            return atob(encodedToken); // Decodificar base64
        } catch (e) {
            console.error('Error al decodificar token:', e);
            return null;
        }
    }
    return null;
};

// Eliminar token de forma segura
export const removeSecureToken = (key: string = 'auth_token'): void => {
    sessionStorage.removeItem(key);
};

// Verificar validez del token (simulación básica)
export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    
    try {
        // Aquí iría la lógica real para verificar la validez del token
        // Por ejemplo, decodificar JWT y verificar fecha de expiración
        return true;
    } catch (e) {
        console.error('Error al validar token:', e);
        return false;
    }
};

// Función para limpiar tokens expirados o inválidos
export const cleanupTokens = (): void => {
    const token = getSecureToken();
    if (!isTokenValid(token)) {
        removeSecureToken();
    }
};

// Función para verificar si el usuario está autenticado de forma segura
export const isAuthenticated = (): boolean => {
    const token = getSecureToken();
    return isTokenValid(token);
};