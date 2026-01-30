import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiLimiter } from './middleware/rateLimit.js';
import { authenticate } from './middleware/auth.js';

// Rotas
import authRoutes from './routes/auth.js';
import academyRoutes from './routes/academies.js';
import userRoutes from './routes/users.js';
import academyDashboardRoutes from './routes/academyDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middlewares globais
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/academies', authenticate, academyRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/academy-dashboard', authenticate, academyDashboardRoutes);

// Em produção, serve o frontend buildado
if (isProduction) {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));

    // SPA fallback - todas as rotas não-API retornam index.html
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Rota 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
    });
});

// Error handler global
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     🏋️ PK Fit System - API Server 🏋️      ║
╠════════════════════════════════════════════╣
║  Servidor rodando em:                      ║
║  → http://localhost:${PORT}                     ║
║  Modo: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}                       ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
