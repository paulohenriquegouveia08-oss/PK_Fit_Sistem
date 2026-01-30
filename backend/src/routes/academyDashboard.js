const express = require('express');
const router = express.Router();
const academyDashboardService = require('../services/academyDashboardService');
const { authorize } = require('../middleware/auth');

// Todas as rotas requerem ADMIN_ACADEMIA
router.use(authorize('ADMIN_ACADEMIA'));

// Middleware para extrair academy_id do usuário logado
const getAcademyId = (req) => {
    if (!req.user.academy_id) {
        throw new Error('Usuário não está vinculado a nenhuma academia');
    }
    return req.user.academy_id;
};

// ============================================
// STATS & OVERVIEW
// ============================================

// GET /stats - Estatísticas da academia
router.get('/stats', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const stats = await academyDashboardService.getStats(academyId);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /activity - Atividade recente
router.get('/activity', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const activity = await academyDashboardService.getRecentActivity(academyId);
        res.json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// USERS (Professores, Personais, Alunos)
// ============================================

// GET /users - Listar usuários da academia
router.get('/users', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const users = await academyDashboardService.listUsers(academyId, req.query);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /professors - Listar professores para selects
router.get('/professors', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const professors = await academyDashboardService.listProfessors(academyId);
        res.json({ success: true, data: professors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /users - Criar usuário na academia
router.post('/users', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const user = await academyDashboardService.createUser(academyId, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /users/:id - Atualizar usuário
router.put('/users/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const user = await academyDashboardService.updateUser(academyId, req.params.id, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /users/:id - Remover usuário
router.delete('/users/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        await academyDashboardService.deleteUser(academyId, req.params.id);
        res.json({ success: true, message: 'Usuário removido com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// WORKOUTS (Treinos)
// ============================================

// GET /workouts - Listar treinos
router.get('/workouts', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workouts = await academyDashboardService.listWorkouts(academyId, req.query);
        res.json({ success: true, data: workouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /workouts - Criar treino
router.post('/workouts', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workout = await academyDashboardService.createWorkout(academyId, req.body);
        res.json({ success: true, data: workout });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /workouts/:id - Atualizar treino
router.put('/workouts/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workout = await academyDashboardService.updateWorkout(academyId, req.params.id, req.body);
        res.json({ success: true, data: workout });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /workouts/:id - Remover treino
router.delete('/workouts/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        await academyDashboardService.deleteWorkout(academyId, req.params.id);
        res.json({ success: true, message: 'Treino removido com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// REQUESTS (Solicitações)
// ============================================

// GET /requests - Listar solicitações
router.get('/requests', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const requests = await academyDashboardService.listRequests(academyId, req.query);
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /requests/:id - Processar solicitação
router.put('/requests/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const request = await academyDashboardService.processRequest(academyId, req.params.id, req.body);
        res.json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// ACADEMY SETTINGS
// ============================================

// GET /academy - Dados da academia
router.get('/academy', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const academy = await academyDashboardService.getAcademy(academyId);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /academy - Atualizar dados da academia
router.put('/academy', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const academy = await academyDashboardService.updateAcademy(academyId, req.body);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
