import { useAuth } from '../../contexts/AuthContext';

export default function AlunoDashboard() {
    const { user, logout, getRoleName } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <span className="dashboard-header-logo">PK Fit</span>
                    <nav className="dashboard-header-nav">
                        <a href="#" className="dashboard-nav-link active">Dashboard</a>
                        <a href="#" className="dashboard-nav-link">Meus Treinos</a>
                        <a href="#" className="dashboard-nav-link">Evolução</a>
                        <a href="#" className="dashboard-nav-link">Perfil</a>
                    </nav>
                </div>
                <div className="dashboard-header-right">
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{getRoleName(user?.role)}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-ghost text-error ml-2" title="Sair">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <h1 className="dashboard-title">Olá, {user?.name?.split(' ')[0]}! 💪</h1>
                <p className="dashboard-subtitle">
                    Continue focado no seu treino. Você está indo muito bem!
                </p>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon primary">🏋️</div>
                        </div>
                        <div className="stat-card-value">12</div>
                        <div className="stat-card-label">Treinos Completos</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon success">🔥</div>
                        </div>
                        <div className="stat-card-value">5</div>
                        <div className="stat-card-label">Dias Consecutivos</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon warning">📊</div>
                        </div>
                        <div className="stat-card-value">A</div>
                        <div className="stat-card-label">Treino de Hoje</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon secondary">🎯</div>
                        </div>
                        <div className="stat-card-value">78%</div>
                        <div className="stat-card-label">Meta do Mês</div>
                    </div>
                </div>

                <div className="content-card">
                    <div className="content-card-header">
                        <h3 className="content-card-title">Treino de Hoje</h3>
                        <button className="btn btn-primary">Iniciar Treino</button>
                    </div>
                    <div className="empty-state">
                        <div className="empty-state-icon">💪</div>
                        <p className="empty-state-title">Treino A - Peito e Tríceps</p>
                        <p>Seu treino do dia está pronto para ser iniciado!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
