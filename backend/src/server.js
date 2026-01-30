require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimit');

// Rotas
const authRoutes = require('./routes/auth');
const academyRoutes = require('./routes/academies');
const userRoutes = require('./routes/users');
const academyDashboardRoutes = require('./routes/academyDashboard');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/academies', authenticate, academyRoutes); // Protegidas globalmente por auth + role interna
app.use('/api/users', authenticate, userRoutes);
app.use('/api/academy-dashboard', authenticate, academyDashboardRoutes); // Dashboard da academia

// Rota 404
app.use((req, res) => {
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
║     🏋️ PK Fit System - Backend API 🏋️     ║
╠════════════════════════════════════════════╣
║  Servidor rodando em:                      ║
║  → http://localhost:${PORT}                     ║
║                                            ║
║  Rotas disponíveis:                        ║
║  → POST /api/auth/check-email              ║
║  → POST /api/auth/create-password          ║
║  → POST /api/auth/login                    ║
║  → GET  /api/auth/me                       ║
║  → POST /api/auth/logout                   ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
