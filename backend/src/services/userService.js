const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Lista usuários com filtros
 */
async function listUsers(filters = {}) {
    const { role, academy_id, search } = filters;

    const where = {};

    if (role) where.role = role;
    if (academy_id) where.academy_id = academy_id;
    if (search) {
        where.OR = [
            { name: { contains: search } }, // SQLite não suporta mode: insensitive nativamente bem com Prisma às vezes, mas p/ dev ok
            { email: { contains: search } },
        ];
    }

    return prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            academy_id: true,
            academy: {
                select: { name: true },
            },
            created_at: true,
            first_access: true,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
}

/**
 * Cria usuário manualmente (Admin)
 */
async function createUser(data) {
    const { name, email, role, academy_id, password } = data;

    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        throw new Error('Email já cadastrado');
    }

    let password_hash = null;
    let first_access = true;

    if (password) {
        password_hash = await bcrypt.hash(password, 12);
        first_access = false;
    }

    return prisma.user.create({
        data: {
            name,
            email,
            role,
            academy_id,
            password_hash,
            first_access,
        },
    });
}

/**
 * Atualiza usuário
 */
async function updateUser(id, data) {
    const { name, email, role, academy_id, password } = data;

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (academy_id !== undefined) updateData.academy_id = academy_id; // pode ser null

    if (email) {
        const existing = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id },
            },
        });
        if (existing) throw new Error('Email já em uso');
        updateData.email = email;
    }

    if (password) {
        updateData.password_hash = await bcrypt.hash(password, 12);
        updateData.first_access = false;
    }

    return prisma.user.update({
        where: { id },
        data: updateData,
    });
}

/**
 * Remove usuário
 */
async function deleteUser(id) {
    return prisma.user.delete({
        where: { id },
    });
}

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
};
