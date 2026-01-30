import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const SALT_ROUNDS = 12;

/**
 * Verifica se um email existe no banco e retorna seu status
 */
export async function checkEmail(email) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
            id: true,
            name: true,
            email: true,
            password_hash: true,
            role: true,
            first_access: true,
        },
    });

    if (!user) {
        return { exists: false, hasPassword: false, user: null };
    }

    return {
        exists: true,
        hasPassword: !!user.password_hash,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            first_access: user.first_access,
        },
    };
}

/**
 * Valida as regras da senha
 */
export function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('A senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('A senha deve conter pelo menos um número');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Cria senha para um usuário (primeiro acesso)
 */
export async function createPassword(email, password) {
    const validation = validatePassword(password);
    if (!validation.valid) {
        return {
            success: false,
            user: null,
            token: null,
            error: validation.errors.join('. '),
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
        return {
            success: false,
            user: null,
            token: null,
            error: 'Usuário não encontrado',
        };
    }

    if (user.password_hash) {
        return {
            success: false,
            user: null,
            token: null,
            error: 'Este usuário já possui uma senha cadastrada',
        };
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const updatedUser = await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: {
            password_hash,
            first_access: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            academy_id: true,
        },
    });

    const token = generateToken(updatedUser);

    return {
        success: true,
        user: updatedUser,
        token,
        error: null,
    };
}

/**
 * Autentica um usuário com email e senha
 */
export async function authenticate(email, password) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
            id: true,
            name: true,
            email: true,
            password_hash: true,
            role: true,
            academy_id: true,
        },
    });

    if (!user) {
        return {
            success: false,
            user: null,
            token: null,
            error: 'Credenciais inválidas',
        };
    }

    if (!user.password_hash) {
        return {
            success: false,
            user: null,
            token: null,
            error: 'Este usuário ainda não possui senha cadastrada',
        };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        return {
            success: false,
            user: null,
            token: null,
            error: 'Credenciais inválidas',
        };
    }

    const { password_hash, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return {
        success: true,
        user: userWithoutPassword,
        token,
        error: null,
    };
}

/**
 * Gera um token JWT
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            academy_id: user.academy_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
}

/**
 * Busca um usuário pelo ID
 */
export async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            academy_id: true,
            first_access: true,
            created_at: true,
        },
    });

    return user;
}
