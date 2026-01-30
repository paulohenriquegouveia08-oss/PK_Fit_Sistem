import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rotas de autenticação
 * Limita a 10 tentativas por IP a cada 15 minutos
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    message: {
        success: false,
        error: 'Muitas tentativas de login. Por favor, aguarde 15 minutos antes de tentar novamente.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase().trim() || '';
        return `${req.ip}-${email}`;
    },
});

/**
 * Rate limiter geral para API
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100,
    message: {
        success: false,
        error: 'Muitas requisições. Por favor, aguarde um momento.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
