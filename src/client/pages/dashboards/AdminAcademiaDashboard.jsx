import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { academyDashboardAPI } from '../../services/api';

export default function AdminAcademiaDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Data states
    const [stats, setStats] = useState({ students: 0, professors: 0, personals: 0, workouts: 0, pendingRequests: 0 });
    const [academy, setAcademy] = useState(null);
    const [users, setUsers] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [professors, setProfessors] = useState([]);

    // Filters
    const [userFilter, setUserFilter] = useState({ role: '', status: '', search: '' });
    const [workoutFilter, setWorkoutFilter] = useState({ professor_id: '', status: '' });

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });

    // Form data
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'ALUNO', specialty: '', status: 'ACTIVE' });
    const [workoutForm, setWorkoutForm] = useState({ name: '', description: '', model_type: '', objective: '', student_id: '', professor_id: '' });
    const [academyForm, setAcademyForm] = useState({ name: '', responsible_name: '', phone: '' });

    // Initial load
    useEffect(() => {
        loadDashboard();
    }, []);

    // Load on tab change
    useEffect(() => {
        if (activeTab === 'professors' || activeTab === 'students') loadUsers();
        else if (activeTab === 'workouts') loadWorkouts();
        else if (activeTab === 'requests') loadRequests();
        else if (activeTab === 'settings') loadAcademy();
    }, [activeTab]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, academyRes, profsRes] = await Promise.all([
                academyDashboardAPI.getStats(),
                academyDashboardAPI.getAcademy(),
                academyDashboardAPI.listProfessors()
            ]);
            setStats(statsRes.data.data);
            setAcademy(academyRes.data.data);
            setProfessors(profsRes.data.data);
        } catch (err) {
            setError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const role = activeTab === 'professors' ? 'PROFESSOR' : activeTab === 'students' ? 'ALUNO' : userFilter.role;
            const res = await academyDashboardAPI.listUsers({ ...userFilter, role });
            setUsers(res.data.data);
        } catch (err) {
            setError('Erro ao carregar usuários');
        }
    };

    const loadWorkouts = async () => {
        try {
            const res = await academyDashboardAPI.listWorkouts(workoutFilter);
            setWorkouts(res.data.data);
        } catch (err) {
            setError('Erro ao carregar treinos');
        }
    };

    const loadRequests = async () => {
        try {
            const res = await academyDashboardAPI.listRequests({ status: 'PENDING' });
            setRequests(res.data.data);
        } catch (err) {
            setError('Erro ao carregar solicitações');
        }
    };

    const loadAcademy = async () => {
        try {
            const res = await academyDashboardAPI.getAcademy();
            setAcademy(res.data.data);
            setAcademyForm({ name: res.data.data.name, responsible_name: res.data.data.responsible_name || '', phone: res.data.data.phone || '' });
        } catch (err) {
            setError('Erro ao carregar academia');
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    // User CRUD
    const openUserModal = (item = null, role = 'ALUNO') => {
        setError('');
        setSuccess('');
        if (item) {
            setCurrentItem(item);
            setUserForm({ name: item.name, email: item.email, role: item.role, specialty: item.specialty || '', status: item.status });
        } else {
            setCurrentItem(null);
            setUserForm({ name: '', email: '', role, specialty: '', status: 'ACTIVE' });
        }
        setShowUserModal(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await academyDashboardAPI.updateUser(currentItem.id, userForm);
                setSuccess('Usuário atualizado!');
            } else {
                await academyDashboardAPI.createUser(userForm);
                setSuccess('Usuário criado!');
            }
            setShowUserModal(false);
            loadUsers();
            loadDashboard();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar');
        }
    };

    // Workout CRUD
    const openWorkoutModal = (item = null) => {
        setError('');
        if (item) {
            setCurrentItem(item);
            setWorkoutForm({ name: item.name, description: item.description || '', model_type: item.model_type || '', objective: item.objective || '', student_id: item.student_id, professor_id: item.professor_id || '' });
        } else {
            setCurrentItem(null);
            setWorkoutForm({ name: '', description: '', model_type: '', objective: '', student_id: '', professor_id: '' });
        }
        setShowWorkoutModal(true);
    };

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await academyDashboardAPI.updateWorkout(currentItem.id, workoutForm);
                setSuccess('Treino atualizado!');
            } else {
                await academyDashboardAPI.createWorkout(workoutForm);
                setSuccess('Treino criado!');
            }
            setShowWorkoutModal(false);
            loadWorkouts();
            loadDashboard();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar');
        }
    };

    // Delete
    const openDeleteModal = (type, id, name) => {
        setDeleteTarget({ type, id, name });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            if (deleteTarget.type === 'user') await academyDashboardAPI.deleteUser(deleteTarget.id);
            else if (deleteTarget.type === 'workout') await academyDashboardAPI.deleteWorkout(deleteTarget.id);
            setSuccess('Removido com sucesso!');
            setShowDeleteModal(false);
            if (deleteTarget.type === 'user') loadUsers();
            else loadWorkouts();
            loadDashboard();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao remover');
        }
    };

    // Request processing
    const handleProcessRequest = async (id, status) => {
        try {
            await academyDashboardAPI.processRequest(id, { status });
            setSuccess('Solicitação processada!');
            loadRequests();
            loadDashboard();
        } catch (err) {
            setError('Erro ao processar');
        }
    };

    // Academy settings
    const handleAcademySubmit = async (e) => {
        e.preventDefault();
        try {
            await academyDashboardAPI.updateAcademy(academyForm);
            setSuccess('Academia atualizada!');
            loadAcademy();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar');
        }
    };

    const getRoleName = (role) => ({ PROFESSOR: 'Professor', PERSONAL: 'Personal', ALUNO: 'Aluno' }[role] || role);
    const getStatusBadge = (status) => status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';

    // Sidebar
    const renderSidebar = () => (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-emerald-600">{academy?.name || 'Academia'}</h1>
                <p className="text-xs text-gray-400 mt-1">Painel Administrativo</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {[
                    { id: 'overview', icon: '📊', label: 'Visão Geral' },
                    { id: 'professors', icon: '👨‍🏫', label: 'Professores' },
                    { id: 'students', icon: '🧑‍🎓', label: 'Alunos' },
                    { id: 'workouts', icon: '🏋️', label: 'Treinos' },
                    { id: 'requests', icon: '🔔', label: 'Solicitações' },
                    { id: 'metrics', icon: '📈', label: 'Métricas' },
                    { id: 'settings', icon: '⚙️', label: 'Configurações' },
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <span className="text-lg">{item.icon}</span> {item.label}
                        {item.id === 'requests' && stats.pendingRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingRequests}</span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500">Admin Academia</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                    <span>🚪</span> Sair
                </button>
            </div>
        </aside>
    );

    // Overview
    const renderOverview = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
                <p className="text-gray-500">Resumo operacional da sua academia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Alunos Ativos', value: stats.students, icon: '👥', color: 'blue' },
                    { label: 'Professores', value: stats.professors + stats.personals, icon: '👨‍🏫', color: 'emerald' },
                    { label: 'Treinos Ativos', value: stats.workouts, icon: '📋', color: 'purple' },
                    { label: 'Solicitações', value: stats.pendingRequests, icon: '🔔', color: 'amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 bg-${stat.color}-50 rounded-full flex items-center justify-center text-xl`}>{stat.icon}</div>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 flex-wrap">
                <button onClick={() => { setActiveTab('professors'); openUserModal(null, 'PROFESSOR'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">+ Professor</button>
                <button onClick={() => { setActiveTab('students'); openUserModal(null, 'ALUNO'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">+ Aluno</button>
                <button onClick={() => { setActiveTab('workouts'); openWorkoutModal(); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">+ Treino</button>
            </div>
        </div>
    );

    // Users table (professors/students)
    const renderUsers = (roleFilter) => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{roleFilter === 'PROFESSOR' ? 'Professores' : 'Alunos'}</h2>
                    <p className="text-gray-500">Gerencie os {roleFilter === 'PROFESSOR' ? 'professores' : 'alunos'} da sua academia.</p>
                </div>
                <button onClick={() => openUserModal(null, roleFilter)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
                    + Novo {roleFilter === 'PROFESSOR' ? 'Professor' : 'Aluno'}
                </button>
            </div>
            <div className="flex gap-4 mb-4">
                <input type="text" placeholder="Buscar por nome ou email..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" value={userFilter.search} onChange={e => setUserFilter({ ...userFilter, search: e.target.value })} onKeyUp={loadUsers} />
                <select className="px-3 py-2 border border-gray-300 rounded-lg" value={userFilter.status} onChange={e => { setUserFilter({ ...userFilter, status: e.target.value }); loadUsers(); }}>
                    <option value="">Todos</option>
                    <option value="ACTIVE">Ativos</option>
                    <option value="INACTIVE">Inativos</option>
                </select>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 font-semibold border-b">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Email</th>
                            {roleFilter === 'PROFESSOR' && <th className="p-4">Especialidade</th>}
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.filter(u => u.role === roleFilter || (roleFilter === 'PROFESSOR' && u.role === 'PERSONAL')).map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{u.name}</td>
                                <td className="p-4 text-gray-500">{u.email}</td>
                                {roleFilter === 'PROFESSOR' && <td className="p-4">{u.specialty || '-'}</td>}
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(u.status)}`}>{u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span></td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openUserModal(u)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                    <button onClick={() => openDeleteModal('user', u.id, u.name)} className="text-red-600 hover:underline text-xs">Excluir</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={roleFilter === 'PROFESSOR' ? 5 : 4} className="p-8 text-center text-gray-400">Nenhum registro encontrado.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Workouts
    const renderWorkouts = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Treinos</h2>
                    <p className="text-gray-500">Gerencie os treinos da academia.</p>
                </div>
                <button onClick={() => openWorkoutModal()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">+ Novo Treino</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 font-semibold border-b">
                        <tr>
                            <th className="p-4">Treino</th>
                            <th className="p-4">Aluno</th>
                            <th className="p-4">Professor</th>
                            <th className="p-4">Modelo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {workouts.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{w.name}</td>
                                <td className="p-4">{w.student?.name}</td>
                                <td className="p-4">{w.professor?.name || '-'}</td>
                                <td className="p-4">{w.model_type || '-'}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(w.status)}`}>{w.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span></td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openWorkoutModal(w)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                    <button onClick={() => openDeleteModal('workout', w.id, w.name)} className="text-red-600 hover:underline text-xs">Excluir</button>
                                </td>
                            </tr>
                        ))}
                        {workouts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum treino cadastrado.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Requests
    const renderRequests = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Solicitações</h2>
                <p className="text-gray-500">Gerencie pedidos dos alunos.</p>
            </div>
            <div className="space-y-4">
                {requests.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{r.student?.name}</p>
                            <p className="text-sm text-gray-500">{r.type === 'NOVO_TREINO' ? 'Novo Treino' : r.type === 'TROCA_TREINO' ? 'Troca de Treino' : 'Vínculo'}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleProcessRequest(r.id, 'APPROVED')} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded font-medium text-sm">Aprovar</button>
                            <button onClick={() => handleProcessRequest(r.id, 'REJECTED')} className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm">Rejeitar</button>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && <div className="bg-white p-8 rounded-xl border text-center text-gray-400">Nenhuma solicitação pendente.</div>}
            </div>
        </div>
    );

    // Metrics (placeholder)
    const renderMetrics = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Métricas</h2>
                <p className="text-gray-500">Análise de desempenho da academia.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-bold">Em Desenvolvimento</h3>
                <p className="text-gray-500 mt-2">Gráficos e análises detalhadas serão implementados em breve.</p>
            </div>
        </div>
    );

    // Settings
    const renderSettings = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-500">Edite as informações da sua academia.</p>
            </div>
            <form onSubmit={handleAcademySubmit} className="bg-white p-6 rounded-xl border max-w-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome da Academia</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" value={academyForm.name} onChange={e => setAcademyForm({ ...academyForm, name: e.target.value })} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Responsável</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" value={academyForm.responsible_name} onChange={e => setAcademyForm({ ...academyForm, responsible_name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" value={academyForm.phone} onChange={e => setAcademyForm({ ...academyForm, phone: e.target.value })} />
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Salvar</button>
            </form>
        </div>
    );

    // User Modal
    const renderUserModal = () => showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">{currentItem ? 'Editar' : 'Novo'} {getRoleName(userForm.role)}</h3>
                    <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input type="email" required className="w-full px-3 py-2 border rounded-lg" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} disabled={!!currentItem} />
                    </div>
                    {!currentItem && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                <option value="ALUNO">Aluno</option>
                                <option value="PROFESSOR">Professor</option>
                                <option value="PERSONAL">Personal</option>
                            </select>
                        </div>
                    )}
                    {(userForm.role === 'PROFESSOR' || userForm.role === 'PERSONAL') && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Especialidade</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg" value={userForm.specialty} onChange={e => setUserForm({ ...userForm, specialty: e.target.value })} placeholder="Ex: Musculação, Funcional" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select className="w-full px-3 py-2 border rounded-lg" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                            <option value="ACTIVE">Ativo</option>
                            <option value="INACTIVE">Inativo</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">{currentItem ? 'Salvar' : 'Criar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Workout Modal
    const renderWorkoutModal = () => showWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">{currentItem ? 'Editar' : 'Novo'} Treino</h3>
                    <button onClick={() => setShowWorkoutModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleWorkoutSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Treino *</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={workoutForm.name} onChange={e => setWorkoutForm({ ...workoutForm, name: e.target.value })} />
                    </div>
                    {!currentItem && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Aluno *</label>
                            <select required className="w-full px-3 py-2 border rounded-lg" value={workoutForm.student_id} onChange={e => setWorkoutForm({ ...workoutForm, student_id: e.target.value })}>
                                <option value="">Selecione...</option>
                                {users.filter(u => u.role === 'ALUNO').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Professor Responsável</label>
                        <select className="w-full px-3 py-2 border rounded-lg" value={workoutForm.professor_id} onChange={e => setWorkoutForm({ ...workoutForm, professor_id: e.target.value })}>
                            <option value="">Nenhum</option>
                            {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Modelo</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={workoutForm.model_type} onChange={e => setWorkoutForm({ ...workoutForm, model_type: e.target.value })}>
                                <option value="">Selecione...</option>
                                <option value="PPL">PPL</option>
                                <option value="ABC">ABC</option>
                                <option value="ABCDE">ABCDE</option>
                                <option value="FULLBODY">Full Body</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Objetivo</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={workoutForm.objective} onChange={e => setWorkoutForm({ ...workoutForm, objective: e.target.value })}>
                                <option value="">Selecione...</option>
                                <option value="HIPERTROFIA">Hipertrofia</option>
                                <option value="EMAGRECIMENTO">Emagrecimento</option>
                                <option value="FORCA">Força</option>
                                <option value="RESISTENCIA">Resistência</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={workoutForm.description} onChange={e => setWorkoutForm({ ...workoutForm, description: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowWorkoutModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">{currentItem ? 'Salvar' : 'Criar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Delete confirmation modal
    const renderDeleteModal = () => showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold mb-2">Confirmar Exclusão</h3>
                <p className="text-gray-500 mb-6">Deseja realmente excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Excluir</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {renderSidebar()}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
                {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error} <button onClick={() => setError('')} className="float-right">✕</button></div>}
                {success && <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">{success} <button onClick={() => setSuccess('')} className="float-right">✕</button></div>}
                {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'professors' && renderUsers('PROFESSOR')}
                        {activeTab === 'students' && renderUsers('ALUNO')}
                        {activeTab === 'workouts' && renderWorkouts()}
                        {activeTab === 'requests' && renderRequests()}
                        {activeTab === 'metrics' && renderMetrics()}
                        {activeTab === 'settings' && renderSettings()}
                    </>
                )}
            </main>
            {renderUserModal()}
            {renderWorkoutModal()}
            {renderDeleteModal()}
        </div>
    );
}
