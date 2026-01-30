const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Obtém estatísticas da academia
 */
async function getStats(academyId) {
    const [studentsCount, professorsCount, personalsCount, workoutsCount, requestsCount] = await Promise.all([
        prisma.user.count({
            where: { academy_id: academyId, role: 'ALUNO', status: 'ACTIVE' }
        }),
        prisma.user.count({
            where: { academy_id: academyId, role: 'PROFESSOR', status: 'ACTIVE' }
        }),
        prisma.user.count({
            where: { academy_id: academyId, role: 'PERSONAL', status: 'ACTIVE' }
        }),
        prisma.workout.count({
            where: { academy_id: academyId, status: 'ACTIVE' }
        }),
        prisma.workoutRequest.count({
            where: { academy_id: academyId, status: 'PENDING' }
        })
    ]);

    return {
        students: studentsCount,
        professors: professorsCount,
        personals: personalsCount,
        workouts: workoutsCount,
        pendingRequests: requestsCount
    };
}

/**
 * Lista usuários da academia com filtros
 */
async function listUsers(academyId, filters = {}) {
    const { role, status, search } = filters;

    const where = { academy_id: academyId };

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Excluir ADMIN_ACADEMIA da listagem (ele gerencia, não é gerenciado)
    where.role = where.role || { not: 'ADMIN_ACADEMIA' };

    return prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            specialty: true,
            first_access: true,
            created_at: true,
            // Contar alunos vinculados para professores
            professorWorkouts: {
                select: { student_id: true },
                distinct: ['student_id']
            }
        },
        orderBy: { created_at: 'desc' }
    });
}

/**
 * Cria usuário na academia (PROFESSOR, PERSONAL ou ALUNO)
 */
async function createUser(academyId, data) {
    const { name, email, role, specialty, status } = data;

    // Validar role permitida
    const allowedRoles = ['PROFESSOR', 'PERSONAL', 'ALUNO'];
    if (!allowedRoles.includes(role)) {
        throw new Error('Tipo de usuário não permitido');
    }

    // Verificar se email já existe
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        throw new Error('Email já cadastrado');
    }

    return prisma.user.create({
        data: {
            name,
            email,
            role,
            specialty: role !== 'ALUNO' ? specialty : null,
            status: status || 'ACTIVE',
            academy_id: academyId,
            first_access: true
        }
    });
}

/**
 * Atualiza usuário da academia
 */
async function updateUser(academyId, userId, data) {
    const { name, email, specialty, status } = data;

    // Verificar se o usuário pertence à academia
    const user = await prisma.user.findFirst({
        where: { id: userId, academy_id: academyId }
    });

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    // Não permitir alterar ADMIN_ACADEMIA
    if (user.role === 'ADMIN_ACADEMIA') {
        throw new Error('Não é possível editar o administrador da academia');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (status) updateData.status = status;

    if (email && email !== user.email) {
        const existing = await prisma.user.findFirst({
            where: { email, NOT: { id: userId } }
        });
        if (existing) throw new Error('Email já em uso');
        updateData.email = email;
    }

    return prisma.user.update({
        where: { id: userId },
        data: updateData
    });
}

/**
 * Remove usuário da academia
 */
async function deleteUser(academyId, userId) {
    const user = await prisma.user.findFirst({
        where: { id: userId, academy_id: academyId }
    });

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    if (user.role === 'ADMIN_ACADEMIA') {
        throw new Error('Não é possível remover o administrador da academia');
    }

    return prisma.user.delete({
        where: { id: userId }
    });
}

/**
 * Lista treinos da academia
 */
async function listWorkouts(academyId, filters = {}) {
    const { professor_id, student_id, status } = filters;

    const where = { academy_id: academyId };

    if (professor_id) where.professor_id = professor_id;
    if (student_id) where.student_id = student_id;
    if (status) where.status = status;

    return prisma.workout.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, email: true } },
            professor: { select: { id: true, name: true } }
        },
        orderBy: { created_at: 'desc' }
    });
}

/**
 * Cria treino
 */
async function createWorkout(academyId, data) {
    const { name, description, model_type, objective, student_id, professor_id, weekly_split } = data;

    // Verificar se o aluno pertence à academia
    const student = await prisma.user.findFirst({
        where: { id: student_id, academy_id: academyId, role: 'ALUNO' }
    });

    if (!student) {
        throw new Error('Aluno não encontrado na academia');
    }

    // Verificar professor se informado
    if (professor_id) {
        const professor = await prisma.user.findFirst({
            where: {
                id: professor_id,
                academy_id: academyId,
                role: { in: ['PROFESSOR', 'PERSONAL'] }
            }
        });
        if (!professor) {
            throw new Error('Professor não encontrado na academia');
        }
    }

    return prisma.workout.create({
        data: {
            name,
            description,
            model_type,
            objective,
            student_id,
            professor_id,
            academy_id: academyId,
            weekly_split: weekly_split ? JSON.stringify(weekly_split) : null,
            status: 'ACTIVE'
        },
        include: {
            student: { select: { id: true, name: true } },
            professor: { select: { id: true, name: true } }
        }
    });
}

/**
 * Atualiza treino
 */
async function updateWorkout(academyId, workoutId, data) {
    const workout = await prisma.workout.findFirst({
        where: { id: workoutId, academy_id: academyId }
    });

    if (!workout) {
        throw new Error('Treino não encontrado');
    }

    const { name, description, model_type, objective, professor_id, weekly_split, status } = data;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (model_type) updateData.model_type = model_type;
    if (objective) updateData.objective = objective;
    if (status) updateData.status = status;
    if (professor_id !== undefined) updateData.professor_id = professor_id;
    if (weekly_split !== undefined) {
        updateData.weekly_split = weekly_split ? JSON.stringify(weekly_split) : null;
    }

    return prisma.workout.update({
        where: { id: workoutId },
        data: updateData,
        include: {
            student: { select: { id: true, name: true } },
            professor: { select: { id: true, name: true } }
        }
    });
}

/**
 * Remove treino
 */
async function deleteWorkout(academyId, workoutId) {
    const workout = await prisma.workout.findFirst({
        where: { id: workoutId, academy_id: academyId }
    });

    if (!workout) {
        throw new Error('Treino não encontrado');
    }

    return prisma.workout.delete({
        where: { id: workoutId }
    });
}

/**
 * Lista solicitações pendentes
 */
async function listRequests(academyId, filters = {}) {
    const { status } = filters;

    const where = { academy_id: academyId };
    if (status) where.status = status;

    return prisma.workoutRequest.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, email: true } }
        },
        orderBy: { created_at: 'desc' }
    });
}

/**
 * Processa solicitação (aprovar, rejeitar, encaminhar)
 */
async function processRequest(academyId, requestId, action) {
    const request = await prisma.workoutRequest.findFirst({
        where: { id: requestId, academy_id: academyId }
    });

    if (!request) {
        throw new Error('Solicitação não encontrada');
    }

    const { status, response, assigned_to } = action;

    const validStatuses = ['APPROVED', 'REJECTED', 'FORWARDED'];
    if (!validStatuses.includes(status)) {
        throw new Error('Status inválido');
    }

    return prisma.workoutRequest.update({
        where: { id: requestId },
        data: {
            status,
            response,
            assigned_to
        },
        include: {
            student: { select: { id: true, name: true, email: true } }
        }
    });
}

/**
 * Obtém dados da academia
 */
async function getAcademy(academyId) {
    return prisma.academy.findUnique({
        where: { id: academyId },
        select: {
            id: true,
            name: true,
            cnpj: true,
            responsible_name: true,
            phone: true,
            logo_url: true,
            status: true,
            created_at: true
        }
    });
}

/**
 * Atualiza dados da academia (apenas dados permitidos)
 */
async function updateAcademy(academyId, data) {
    const { name, responsible_name, phone, logo_url } = data;

    const updateData = {};
    if (name) updateData.name = name;
    if (responsible_name !== undefined) updateData.responsible_name = responsible_name;
    if (phone !== undefined) updateData.phone = phone;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    return prisma.academy.update({
        where: { id: academyId },
        data: updateData,
        select: {
            id: true,
            name: true,
            cnpj: true,
            responsible_name: true,
            phone: true,
            logo_url: true,
            status: true
        }
    });
}

/**
 * Obtém atividade recente da academia
 */
async function getRecentActivity(academyId, limit = 10) {
    const [recentUsers, recentWorkouts, recentRequests] = await Promise.all([
        prisma.user.findMany({
            where: { academy_id: academyId },
            select: {
                id: true,
                name: true,
                role: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' },
            take: limit
        }),
        prisma.workout.findMany({
            where: { academy_id: academyId },
            select: {
                id: true,
                name: true,
                student: { select: { name: true } },
                created_at: true
            },
            orderBy: { created_at: 'desc' },
            take: limit
        }),
        prisma.workoutRequest.findMany({
            where: { academy_id: academyId },
            select: {
                id: true,
                type: true,
                status: true,
                student: { select: { name: true } },
                created_at: true
            },
            orderBy: { created_at: 'desc' },
            take: limit
        })
    ]);

    return { recentUsers, recentWorkouts, recentRequests };
}

/**
 * Lista professores da academia (para selects)
 */
async function listProfessors(academyId) {
    return prisma.user.findMany({
        where: {
            academy_id: academyId,
            role: { in: ['PROFESSOR', 'PERSONAL'] },
            status: 'ACTIVE'
        },
        select: {
            id: true,
            name: true,
            role: true,
            specialty: true
        },
        orderBy: { name: 'asc' }
    });
}

module.exports = {
    getStats,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    listWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    listRequests,
    processRequest,
    getAcademy,
    updateAcademy,
    getRecentActivity,
    listProfessors
};
