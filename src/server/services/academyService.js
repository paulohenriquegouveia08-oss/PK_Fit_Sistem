import prisma from '../config/database.js';

/**
 * Cria uma nova academia e seu administrador inicial
 */
export async function createAcademy(data) {
    const { name, cnpj, adminName, adminEmail, phone } = data;

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
        const academy = await tx.academy.create({
            data: {
                name,
                cnpj,
                responsible_name: adminName,
                phone,
                status: 'ACTIVE',
                payment_status: 'PENDING',
            },
        });

        const adminUser = await tx.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                role: 'ADMIN_ACADEMIA',
                academy_id: academy.id,
                first_access: true,
            },
        });

        return { academy, adminUser };
    });

    return result;
}

export async function listAcademies() {
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
export async function getAcademyById(id) {
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
export async function updateAcademy(id, data) {
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
export async function deleteAcademy(id) {
    await prisma.$transaction(async (tx) => {
        await tx.user.deleteMany({
            where: { academy_id: id }
        });

        await tx.academy.delete({
            where: { id }
        });
    });

    return { success: true };
}
