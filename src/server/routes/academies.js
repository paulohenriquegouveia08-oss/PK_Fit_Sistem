import express from 'express';
import * as academyService from '../services/academyService.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authorize('ADMIN_GLOBAL'));

router.get('/', async (req, res) => {
    try {
        const academies = await academyService.listAcademies();
        res.json({ success: true, data: academies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const academy = await academyService.getAcademyById(req.params.id);
        if (!academy) return res.status(404).json({ success: false, error: 'Academia não encontrada' });
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const academy = await academyService.createAcademy(req.body);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const academy = await academyService.updateAcademy(req.params.id, req.body);
        res.json({ success: true, data: academy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await academyService.deleteAcademy(req.params.id);
        res.json({ success: true, message: 'Academia removida com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
