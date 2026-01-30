const express = require('express');
const { authLimiter } = require('../middleware/rateLimit');
const { authenticate: authMiddleware } = require('../middleware/auth');
const authService = require('../services/authService');

const router = express.Router();

/**
 * POST /api/auth/check-email
 * Verifica se o email existe e se possui senha
 */
router.post('/check-email', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'O email é obrigatório',
            });
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido',
            });
        }

        const result = await authService.checkEmail(email);

        if (!result.exists) {
            return res.status(404).json({
                success: false,
                error: 'E-mail não encontrado. Entre em contato com a administração.',
                exists: false,
            });
        }

        return res.json({
            success: true,
            exists: true,
            hasPassword: result.hasPassword,
            user: {
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
            },
        });
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
        });
    }
});

/**
 * POST /api/auth/create-password
 * Cria senha para primeiro acesso
 */
router.post('/create-password', authLimiter, async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios',
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'As senhas não conferem',
            });
        }

        const result = await authService.createPassword(email, password);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
            });
        }

        return res.json({
            success: true,
            message: 'Senha criada com sucesso!',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('Erro ao criar senha:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
        });
    }
});

/**
 * POST /api/auth/login
 * Autentica com email e senha
 */
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios',
            });
        }

        const result = await authService.authenticate(email, password);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                error: result.error,
            });
        }

        return res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            success: false,
            error: `Erro interno do servidor: ${error.message}`,
        });
    }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        return res.json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout (invalida token no cliente)
 */
router.post('/logout', authMiddleware, (req, res) => {
    // O logout é feito no cliente removendo o token
    // Aqui podemos adicionar lógica de blacklist se necessário
    return res.json({
        success: true,
        message: 'Logout realizado com sucesso',
    });
});

module.exports = router;
