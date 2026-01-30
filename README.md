# PK Fit System 1.0

Sistema de Gestão para Academias com autenticação multi-etapa e controle de acesso por perfil.

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express** - Servidor API REST
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **bcryptjs** - Criptografia de senhas
- **jsonwebtoken** - Autenticação JWT
- **express-rate-limit** - Proteção contra brute force

### Frontend
- **React 18** - Interface do usuário
- **React Router DOM** - Navegação SPA
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **CSS Vanilla** - Estilização moderna

## 📦 Instalação

### 1. Backend

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Frontend

```bash
cd frontend
npm install
```

## 🏃 Executando

### 1. Iniciar Tudo (Recomendado)

Na pasta raiz do projeto:

```bash
npm run dev
```

Isso iniciará tanto o backend quanto o frontend simultaneamente.
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### 2. Iniciar Separadamente (Opcional)

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 🔑 Credenciais de Teste

### Admin Global
- **Email:** paulohenriquegouveia08@gmail.com
- **Senha:** 15Paulohg

### Usuários de Teste (primeiro acesso - criar senha)
- admin@academiademo.com
- professor@academiademo.com
- personal@academiademo.com
- aluno@academiademo.com

## 📱 Fluxo de Login

1. **Tela inicial**: Usuário digita o email
2. **Verificação**: Sistema consulta o banco de dados
3. **Se email não existe**: Mensagem de erro
4. **Se email existe sem senha**: Tela de criação de senha (primeiro acesso)
5. **Se email existe com senha**: Tela de autenticação
6. **Após login**: Redirecionamento para dashboard do perfil

## 👥 Perfis de Usuário

| Perfil | Rota | Descrição |
|--------|------|-----------|
| ADMIN_GLOBAL | /admin/global/dashboard | Acesso total ao sistema |
| ADMIN_ACADEMIA | /admin/academia/dashboard | Gerencia uma academia |
| PROFESSOR | /professor/dashboard | Gerencia alunos e treinos |
| PERSONAL | /personal/dashboard | Gerencia clientes particulares |
| ALUNO | /aluno/dashboard | Acessa seus treinos |

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt (12 salt rounds)
- ✅ Autenticação via JWT (24h de expiração)
- ✅ Rate limiting (10 tentativas/15min por email)
- ✅ Proteção de rotas por perfil
- ✅ Mensagens genéricas para evitar enumeração
- ✅ CORS configurado

## 📁 Estrutura do Projeto

```
PK Fit System 1.0/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── middleware/     # Middlewares (auth, rate limit)
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Lógica de negócio
│   │   └── server.js       # Servidor Express
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── seed.js         # Dados iniciais
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos (Auth)
│   │   ├── pages/          # Páginas
│   │   ├── services/       # API client
│   │   ├── App.jsx         # App principal
│   │   └── index.css       # Estilos globais
│   └── package.json
│
└── README.md
```

## 🛠️ API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/check-email | Verifica status do email |
| POST | /api/auth/create-password | Cria senha (primeiro acesso) |
| POST | /api/auth/login | Autenticação |
| GET | /api/auth/me | Dados do usuário logado |
| POST | /api/auth/logout | Logout |

## 📄 Licença

Este projeto é privado e de uso exclusivo.
