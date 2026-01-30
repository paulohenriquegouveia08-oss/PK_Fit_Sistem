const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Cria uma nova academia e seu administrador inicial
 */
async function createAcademy(data) {
    const { name, cnpj, adminName, adminEmail } = data;

    const existingAcademy = await prisma.academy.findUnique({
        where: { cnpj },
    });

    if (existingAcademy) {
        throw new Error('CNPJ já cadastrado');
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingUser) {
        throw new Error('Email do administrador já está em uso por outro usuário');
    }

    const result = await prisma.$transaction(async (tx) => {
        // 1. Criar a Academia
        const academy = await tx.academy.create({
            data: {
                name: data.name,
                cnpj: data.cnpj,
                responsible_name: data.adminName, // Using adminName as responsible if not provided, or separate? Form uses adminName for user. Let's map adminName to responsible_name for now as per requirement "Nome do responsável".
                phone: data.phone,
                status: 'ACTIVE',
                payment_status: 'PENDING',
            },
        });

        // 2. Criar o Usuário Admin da Academia
        const adminUser = await tx.user.create({
            data: {
                name: data.adminName,
                email: data.adminEmail,
                role: 'ADMIN_ACADEMIA',
                academy_id: academy.id,
                first_access: true,
            },
        });

        return { academy, adminUser };
    });

    return result;
}

async function listAcademies() {
    const academies = await prisma.academy.findMany({
        include: {
            users: {
                where: { role: 'ADMIN_ACADEMIA' },
                select: {
                    name: true,
                    email: true,
                },
                take: 1,
            },
        },
        orderBy: { created_at: 'desc' },
    });

    return academies.map((academy) => ({
        ...academy,
        admin: academy.users[0] || null,
    }));
}

/**
 * Busca academia por ID
 */
async function getAcademyById(id) {
    return prisma.academy.findUnique({
        where: { id },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

/**
 * Atualiza dados da academia
 */
async function updateAcademy(id, data) {
    const { name, cnpj } = data;

    if (cnpj) {
        const existing = await prisma.academy.findFirst({
            where: {
                cnpj,
                NOT: { id },
            },
        });

        if (existing) {
            throw new Error('CNPJ já cadastrado em outra academia');
        }
    }

    return prisma.academy.update({
        where: { id },
        data: { name, cnpj },
    });
}

/**
 * Remove academia e seus usuários
 */
async function deleteAcademy(id) {
    await prisma.$transaction(async (tx) => {
        // Remove todos os usuários da academia primeiro
        await tx.user.deleteMany({
            where: { academy_id: id }
        });

        // Remove a academia
        await tx.academy.delete({
            where: { id }
        });
    });

    return { success: true };
}

module.exports = {
    createAcademy,
    listAcademies,
    getAcademyById,
    updateAcademy,
    deleteAcademy,
};
