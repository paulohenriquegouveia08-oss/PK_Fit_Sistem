import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { academyAPI } from '../../services/api';

export default function AdminGlobalDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, academies, payments
    const [academies, setAcademies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentAcademy, setCurrentAcademy] = useState(null); // For edit
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        adminName: '',
        adminEmail: '',
        responsible_name: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch Data
    useEffect(() => {
        fetchAcademies();
    }, []);

    const fetchAcademies = async () => {
        try {
            setLoading(true);
            const response = await academyAPI.list();
            setAcademies(response.data.data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar academias.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const handleOpenModal = (academy = null) => {
        setError('');
        setSuccess('');
        if (academy) {
            setCurrentAcademy(academy);
            setFormData({
                name: academy.name,
                cnpj: academy.cnpj,
                adminName: academy.admin?.name || '', // Read-only in edit usually
                adminEmail: academy.admin?.email || '', // Read-only in edit usually
                responsible_name: academy.responsible_name || '',
                phone: academy.phone || '',
            });
        } else {
            setCurrentAcademy(null);
            setFormData({
                name: '',
                cnpj: '',
                adminName: '',
                adminEmail: '',
                responsible_name: '',
                phone: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentAcademy(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: formData.name,
                cnpj: formData.cnpj,
                adminName: formData.adminName, // Required for creation
                adminEmail: formData.adminEmail, // Required for creation
                responsible_name: formData.responsible_name, // Mapped to adminName if empty? No, let's keep separate
                phone: formData.phone
            };

            // Se responsible_name estiver vazio, usar adminName por conveniência
            if (!payload.responsible_name) payload.responsible_name = payload.adminName;

            if (currentAcademy) {
                await academyAPI.update(currentAcademy.id, payload);
                setSuccess('Academia atualizada com sucesso!');
            } else {
                await academyAPI.create(payload);
                setSuccess('Academia criada com sucesso!');
            }
            fetchAcademies();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar academia.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('ATENÇÃO: Isso excluirá a academia e TODOS os seus usuários permanentemente. Deseja continuar?')) return;
        try {
            await academyAPI.delete(id);
            setSuccess('Academia removida.');
            fetchAcademies();
        } catch (err) {
            setError('Erro ao remover academia.');
        }
    };

    // --- Views ---

    const renderSidebar = () => (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-emerald-600 tracking-tight">PK Fit <span className="text-gray-400 font-light text-sm">Admin</span></h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <span className="text-lg">📊</span> Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('academies')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'academies' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <span className="text-lg">🏢</span> Academias
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <span className="text-lg">💰</span> Pagamentos
                </button>
            </nav>
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">Admin Global</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <span>🚪</span> Sair
                </button>
            </div>
        </aside>
    );

    const renderDashboardHome = () => {
        const total = academies.length;
        const active = academies.filter(a => a.status === 'ACTIVE').length;
        const pending = academies.filter(a => a.payment_status === 'PENDING').length;

        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
                    <p className="text-gray-500">Resumo da operação do sistema.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total de Academias</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl">🏢</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Academias Ativas</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">{active}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-xl">✅</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pagamentos Pendentes</p>
                            <p className="text-3xl font-bold text-amber-500 mt-1">{pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-xl">⚠️</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Academias Recentes</h3>
                        <button onClick={() => setActiveTab('academies')} className="text-sm text-emerald-600 font-medium hover:underline">Ver todas</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Academia</th>
                                    <th className="p-4">Responsável</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Data Cadastro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {academies.slice(0, 5).map(academy => (
                                    <tr key={academy.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{academy.name}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{academy.responsible_name || academy.admin?.name || '-'}</span>
                                                <span className="text-xs text-gray-400">{academy.phone || academy.admin?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${academy.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {academy.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(academy.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {academies.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">Nenhuma academia cadastrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderAcademies = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gerenciar Academias</h2>
                    <p className="text-gray-500">Controle total das unidades cadastradas.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-shadow shadow-lg shadow-emerald-200 font-medium flex items-center gap-2"
                >
                    <span>+</span> Nova Academia
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="p-4">Nome / CNPJ</th>
                                <th className="p-4">Responsável</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {academies.map(acc => (
                                <tr key={acc.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{acc.name}</div>
                                        <div className="text-xs text-gray-400">{acc.cnpj}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-900">{acc.responsible_name || acc.admin?.name}</div>
                                        <div className="text-xs text-gray-400">{acc.admin?.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">{acc.phone || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${acc.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {acc.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleDelete(acc.id)} className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-100 bg-red-50 px-3 py-1 rounded">
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderPayments = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestão de Pagamentos</h2>
                <p className="text-gray-500">Acompanhe a saúde financeira das academias.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💰</div>
                <h3 className="text-lg font-bold text-gray-900">Em Desenvolvimento</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                    O módulo de pagamentos automáticos (integração com Gateway) será implementado na próxima fase. Por enquanto, o status é gerido manualmente.
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {renderSidebar()}

            {/* Mobile Header (TODO: Burger Menu if needed) */}

            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
                {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">{success}</div>}

                {activeTab === 'dashboard' && renderDashboardHome()}
                {activeTab === 'academies' && renderAcademies()}
                {activeTab === 'payments' && renderPayments()}
            </main>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentAcademy ? 'Editar Academia' : 'Nova Academia'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Academia *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Smart Fit"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                        placeholder="00.000.000/0001-00"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dados do Responsável (Admin)</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                            value={formData.adminName}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                adminName: e.target.value,
                                                responsible_name: e.target.value // Auto-fill responsible
                                            })}
                                            disabled={!!currentAcademy}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de Acesso *</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                            value={formData.adminEmail}
                                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                            disabled={!!currentAcademy}
                                            placeholder="admin@academia.com"
                                        />
                                        {!currentAcademy && <p className="text-xs text-gray-500 mt-1">Uma senha será criada no primeiro acesso.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-shadow shadow-md shadow-emerald-200">
                                    {currentAcademy ? 'Salvar Alterações' : 'Criar Academia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
