import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Componente para proteger rotas que requerem autenticação
export function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="login-page">
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar se o usuário tem a role permitida
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirecionar para o dashboard correto do usuário
        const roleRoutes = {
            ADMIN_GLOBAL: '/admin/global/dashboard',
            ADMIN_ACADEMIA: '/admin/academia/dashboard',
            PROFESSOR: '/professor/dashboard',
            PERSONAL: '/personal/dashboard',
            ALUNO: '/aluno/dashboard',
        };
        return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
    }

    return children || <Outlet />;
}

// Componente para rotas públicas (redireciona se já autenticado)
export function PublicRoute({ children }) {
    const { isAuthenticated, user, loading, getDashboardRoute } = useAuth();

    if (loading) {
        return (
            <div className="login-page">
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    return children || <Outlet />;
}
