import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Mapeamento de roles para rotas de dashboard
const ROLE_ROUTES = {
    ADMIN_GLOBAL: '/admin/global/dashboard',
    ADMIN_ACADEMIA: '/admin/academia/dashboard',
    PROFESSOR: '/professor/dashboard',
    PERSONAL: '/personal/dashboard',
    ALUNO: '/aluno/dashboard',
};

// Mapeamento de roles para nomes legíveis
const ROLE_NAMES = {
    ADMIN_GLOBAL: 'Administrador Global',
    ADMIN_ACADEMIA: 'Administrador da Academia',
    PROFESSOR: 'Professor',
    PERSONAL: 'Personal Trainer',
    ALUNO: 'Aluno',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carregar dados do localStorage ao iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('pk-fit-token');
        const storedUser = localStorage.getItem('pk-fit-user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Verificar email
    const checkEmail = useCallback(async (email) => {
        try {
            setError(null);
            const response = await authAPI.checkEmail(email);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Erro ao verificar email';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Criar senha (primeiro acesso)
    const createPassword = useCallback(async (email, password, confirmPassword) => {
        try {
            setError(null);
            const response = await authAPI.createPassword(email, password, confirmPassword);

            if (response.data.success) {
                const { user: userData, token: authToken } = response.data;

                // Salvar no state e localStorage
                setUser(userData);
                setToken(authToken);
                localStorage.setItem('pk-fit-token', authToken);
                localStorage.setItem('pk-fit-user', JSON.stringify(userData));

                return { success: true, user: userData };
            }

            throw new Error(response.data.error);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar senha';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Login
    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login(email, password);

            if (response.data.success) {
                const { user: userData, token: authToken } = response.data;

                // Salvar no state e localStorage
                setUser(userData);
                setToken(authToken);
                localStorage.setItem('pk-fit-token', authToken);
                localStorage.setItem('pk-fit-user', JSON.stringify(userData));

                return { success: true, user: userData };
            }

            throw new Error(response.data.error);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Credenciais inválidas';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        } finally {
            // Limpar estado e localStorage
            setUser(null);
            setToken(null);
            localStorage.removeItem('pk-fit-token');
            localStorage.removeItem('pk-fit-user');
        }
    }, []);

    // Obter rota de dashboard para o perfil do usuário
    const getDashboardRoute = useCallback((role) => {
        return ROLE_ROUTES[role] || '/';
    }, []);

    // Obter nome legível do perfil
    const getRoleName = useCallback((role) => {
        return ROLE_NAMES[role] || role;
    }, []);

    // Verificar se usuário está autenticado
    const isAuthenticated = !!token && !!user;

    // Verificar se usuário tem determinada role
    const hasRole = useCallback((roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }, [user]);

    // Limpar erro
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        checkEmail,
        createPassword,
        login,
        logout,
        getDashboardRoute,
        getRoleName,
        hasRole,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

export { ROLE_ROUTES, ROLE_NAMES };
