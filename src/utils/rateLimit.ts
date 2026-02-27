// Mapa para almacenar contadores de solicitudes por IP o usuario
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Limite de solicitudes por período (por ejemplo, 10 solicitudes por minuto)
const RATE_LIMIT = 10;
const TIME_WINDOW = 60000; // 1 minuto en milisegundos

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

export const checkRateLimit = (identifier: string): RateLimitResult => {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record) {
        // Primera solicitud del identificador
        requestCounts.set(identifier, { count: 1, timestamp: now });
        return {
            allowed: true,
            remaining: RATE_LIMIT - 1,
            resetTime: now + TIME_WINDOW
        };
    }

    // Verificar si el período de tiempo ha expirado
    if (now - record.timestamp > TIME_WINDOW) {
        // Reiniciar contador
        requestCounts.set(identifier, { count: 1, timestamp: now });
        return {
            allowed: true,
            remaining: RATE_LIMIT - 1,
            resetTime: now + TIME_WINDOW
        };
    }

    // Incrementar contador
    record.count++;
    requestCounts.set(identifier, record);

    const remaining = Math.max(0, RATE_LIMIT - record.count);
    const resetTime = record.timestamp + TIME_WINDOW;

    return {
        allowed: record.count <= RATE_LIMIT,
        remaining,
        resetTime
    };
};

// Limpiar registros antiguos periódicamente para evitar fugas de memoria
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
        if (now - value.timestamp > TIME_WINDOW) {
            requestCounts.delete(key);
        }
    }
}, TIME_WINDOW);