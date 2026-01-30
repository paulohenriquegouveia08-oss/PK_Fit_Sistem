import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login'; //Pagina inicial do sistema
import AdminGlobalDashboard from './pages/dashboards/AdminGlobalDashboard';
import AdminAcademiaDashboard from './pages/dashboards/AdminAcademiaDashboard';
import ProfessorDashboard from './pages/dashboards/ProfessorDashboard';
import PersonalDashboard from './pages/dashboards/PersonalDashboard';
import AlunoDashboard from './pages/dashboards/AlunoDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rota pública - Login */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* Rotas protegidas - Admin Global */}
                    <Route
                        path="/admin/global/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN_GLOBAL']}>
                                <AdminGlobalDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas protegidas - Admin Academia */}
                    <Route
                        path="/admin/academia/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN_GLOBAL', 'ADMIN_ACADEMIA']}>
                                <AdminAcademiaDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas protegidas - Professor */}
                    <Route
                        path="/professor/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN_GLOBAL', 'ADMIN_ACADEMIA', 'PROFESSOR']}>
                                <ProfessorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas protegidas - Personal */}
                    <Route
                        path="/personal/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN_GLOBAL', 'ADMIN_ACADEMIA', 'PERSONAL']}>
                                <PersonalDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas protegidas - Aluno */}
                    <Route
                        path="/aluno/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN_GLOBAL', 'ADMIN_ACADEMIA', 'PROFESSOR', 'PERSONAL', 'ALUNO']}>
                                <AlunoDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirecionar raiz para login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Rota 404 */}
                    <Route
                        path="*"
                        element={
                            <div className="login-page">
                                <div className="login-card" style={{ textAlign: 'center' }}>
                                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                                        Página não encontrada
                                    </p>
                                    <a href="/login" className="btn btn-primary">
                                        Voltar ao Login
                                    </a>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
