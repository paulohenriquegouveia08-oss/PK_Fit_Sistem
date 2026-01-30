import express from 'express';
import * as userService from '../services/userService.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authorize('ADMIN_GLOBAL'));

router.get('/', async (req, res) => {
    try {
        const users = await userService.listUsers(req.query);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true, message: 'Usuário removido com sucesso' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
