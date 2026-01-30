# 🏋️ PK Fit System

Sistema de Gestão para Academias - SaaS completo com múltiplos perfis de usuário.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Gerar Prisma Client
npm run db:generate

# Rodar em desenvolvimento
npm run dev
```

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia frontend + backend em paralelo |
| `npm run dev:client` | Apenas frontend (Vite) |
| `npm run dev:server` | Apenas backend (Node) |
| `npm run build` | Build do frontend para produção |
| `npm start` | Inicia servidor em produção |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:push` | Atualiza banco de dados |
| `npm run db:studio` | Abre Prisma Studio |

## 🏗️ Estrutura do Projeto

```
pk-fit-system/
├── prisma/               # Schema e migrations
├── src/
│   ├── client/           # Frontend React
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   └── server/           # Backend Express
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       └── services/
├── dist/                 # Build do frontend (produção)
├── package.json
└── vite.config.js
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `JWT_SECRET` | Chave secreta para tokens |
| `PORT` | Porta do servidor (default: 3001) |
| `NODE_ENV` | Ambiente (development/production) |

## 🚂 Deploy (Railway)

1. Conecte o repositório no Railway
2. Configure as variáveis de ambiente
3. Railway detecta automaticamente o `railway.json`
4. Deploy automático em cada push

## 👥 Perfis de Usuário

- **ADMIN_GLOBAL**: Administrador do sistema
- **ADMIN_ACADEMIA**: Administrador de academia
- **PROFESSOR**: Professor da academia
- **PERSONAL**: Personal trainer
- **ALUNO**: Aluno da academia
