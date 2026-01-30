import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';
import CreatePasswordStep from './CreatePasswordStep';

// Estados do fluxo de login
const STEPS = {
    EMAIL: 'EMAIL',
    PASSWORD: 'PASSWORD',
    CREATE_PASSWORD: 'CREATE_PASSWORD',
};

export default function LoginForm() {
    const navigate = useNavigate();
    const { checkEmail, login, createPassword, getDashboardRoute, clearError } = useAuth();

    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Limpar erros ao mudar de step
    const goToStep = (newStep) => {
        setError('');
        clearError();
        setStep(newStep);
    };

    // Redirecionar após login bem-sucedido
    const handleLoginSuccess = (user) => {
        const dashboardRoute = getDashboardRoute(user.role);
        navigate(dashboardRoute, { replace: true });
    };

    // Step 1: Verificar email
    const handleEmailSubmit = async (emailValue) => {
        setLoading(true);
        setError('');

        try {
            const result = await checkEmail(emailValue);

            if (result.success && result.exists) {
                setEmail(emailValue);
                setUserName(result.user.name.split(' ')[0]); // Primeiro nome

                if (result.hasPassword) {
                    goToStep(STEPS.PASSWORD);
                } else {
                    goToStep(STEPS.CREATE_PASSWORD);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2a: Login com senha
    const handlePasswordSubmit = async (password) => {
        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            if (result.success) {
                handleLoginSuccess(result.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2b: Criar senha (primeiro acesso)
    const handleCreatePasswordSubmit = async (password, confirmPassword) => {
        setLoading(true);
        setError('');

        try {
            const result = await createPassword(email, password, confirmPassword);
            if (result.success) {
                handleLoginSuccess(result.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Voltar para o step de email
    const handleBack = () => {
        goToStep(STEPS.EMAIL);
        setEmail('');
        setUserName('');
    };

    // Renderizar o step atual
    const renderStep = () => {
        switch (step) {
            case STEPS.EMAIL:
                return (
                    <EmailStep
                        onSubmit={handleEmailSubmit}
                        loading={loading}
                        error={error}
                    />
                );

            case STEPS.PASSWORD:
                return (
                    <PasswordStep
                        email={email}
                        userName={userName}
                        onSubmit={handlePasswordSubmit}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                );

            case STEPS.CREATE_PASSWORD:
                return (
                    <CreatePasswordStep
                        email={email}
                        userName={userName}
                        onSubmit={handleCreatePasswordSubmit}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {renderStep()}
            </div>
        </div>
    );
}
