import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Criar instância do axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pk-fit-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('pk-fit-token');
            localStorage.removeItem('pk-fit-user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API - faz a comunicação com o backend para a autenticação
export const authAPI = {
    checkEmail: (email) =>
        api.post('/auth/check-email', { email }),

    createPassword: (email, password, confirmPassword) =>
        api.post('/auth/create-password', { email, password, confirmPassword }),

    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    me: () =>
        api.get('/auth/me'),

    logout: () =>
        api.post('/auth/logout'),
};

// Academy API - faz a comunicação com o backend para a gestão das academias
export const academyAPI = {
    list: () => api.get('/academies'),
    get: (id) => api.get(`/academies/${id}`),
    create: (data) => api.post('/academies', data),
    update: (id, data) => api.put(`/academies/${id}`, data),
    delete: (id) => api.delete(`/academies/${id}`),
};

// User API - faz a comunicação com o backend para a gestão dos usuários
export const userAPI = {
    list: (params) => api.get('/users', { params }),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Academy Dashboard API - faz a comunicação com o backend para o dashboard da academia
export const academyDashboardAPI = {
    // Stats & Overview
    getStats: () => api.get('/academy-dashboard/stats'),
    getActivity: () => api.get('/academy-dashboard/activity'),

    // Users (Professores, Personais, Alunos)
    listUsers: (params) => api.get('/academy-dashboard/users', { params }),
    listProfessors: () => api.get('/academy-dashboard/professors'),
    createUser: (data) => api.post('/academy-dashboard/users', data),
    updateUser: (id, data) => api.put(`/academy-dashboard/users/${id}`, data),
    deleteUser: (id) => api.delete(`/academy-dashboard/users/${id}`),

    // Workouts
    listWorkouts: (params) => api.get('/academy-dashboard/workouts', { params }),
    createWorkout: (data) => api.post('/academy-dashboard/workouts', data),
    updateWorkout: (id, data) => api.put(`/academy-dashboard/workouts/${id}`, data),
    deleteWorkout: (id) => api.delete(`/academy-dashboard/workouts/${id}`),

    // Requests
    listRequests: (params) => api.get('/academy-dashboard/requests', { params }),
    processRequest: (id, action) => api.put(`/academy-dashboard/requests/${id}`, action),

    // Academy Settings
    getAcademy: () => api.get('/academy-dashboard/academy'),
    updateAcademy: (data) => api.put('/academy-dashboard/academy', data),
};

export default api;
