import express from 'express';
import * as academyDashboardService from '../services/academyDashboardService.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authorize('ADMIN_ACADEMIA'));

const getAcademyId = (req) => {
    if (!req.user.academy_id) {
        throw new Error('Usuário não está vinculado a nenhuma academia');
    }
    return req.user.academy_id;
};

// STATS & OVERVIEW
router.get('/stats', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const stats = await academyDashboardService.getStats(academyId);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/activity', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const activity = await academyDashboardService.getRecentActivity(academyId);
        res.json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// USERS
router.get('/users', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const users = await academyDashboardService.listUsers(academyId, req.query);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/professors', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const professors = await academyDashboardService.listProfessors(academyId);
        res.json({ success: true, data: professors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const user = await academyDashboardService.createUser(academyId, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const user = await academyDashboardService.updateUser(academyId, req.params.id, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        await academyDashboardService.deleteUser(academyId, req.params.id);
        res.json({ success: true, message: 'Usuário removido com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// WORKOUTS
router.get('/workouts', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workouts = await academyDashboardService.listWorkouts(academyId, req.query);
        res.json({ success: true, data: workouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/workouts', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workout = await academyDashboardService.createWorkout(academyId, req.body);
        res.json({ success: true, data: workout });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/workouts/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const workout = await academyDashboardService.updateWorkout(academyId, req.params.id, req.body);
        res.json({ success: true, data: workout });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/workouts/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        await academyDashboardService.deleteWorkout(academyId, req.params.id);
        res.json({ success: true, message: 'Treino removido com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// REQUESTS
router.get('/requests', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const requests = await academyDashboardService.listRequests(academyId, req.query);
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/requests/:id', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const request = await academyDashboardService.processRequest(academyId, req.params.id, req.body);
        res.json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ACADEMY SETTINGS
router.get('/academy', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const academy = await academyDashboardService.getAcademy(academyId);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/academy', async (req, res) => {
    try {
        const academyId = getAcademyId(req);
        const academy = await academyDashboardService.updateAcademy(academyId, req.body);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
