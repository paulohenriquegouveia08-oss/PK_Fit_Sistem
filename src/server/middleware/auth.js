import jwt from 'jsonwebtoken';
import { getUserById } from '../services/authService.js';

/**
 * Middleware de autenticação JWT
 */
export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Token não fornecido',
            });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({
                success: false,
                error: 'Token mal formatado',
            });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({
                success: false,
                error: 'Token mal formatado',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuário atualizado do banco
        const user = await getUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não encontrado',
            });
        }

        req.user = user;
        req.token = token;

        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expirado',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido',
            });
        }

        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
        });
    }
}

/**
 * Middleware para verificar roles permitidas
 * @param  {...string} allowedRoles 
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
            });
        }

        return next();
    };
}
