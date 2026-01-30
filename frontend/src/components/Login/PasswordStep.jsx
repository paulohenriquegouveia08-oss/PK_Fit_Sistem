import { useState } from 'react';

export default function PasswordStep({ email, userName, onSubmit, onBack, loading, error }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        if (!password) {
            setLocalError('Por favor, digite sua senha');
            return;
        }

        onSubmit(password);
    };

    const displayError = localError || error;

    return (
        <div className="slide-up">
            <button type="button" className="back-button" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Voltar
            </button>

            <div className="welcome-message">
                <h2>Olá, {userName}! 👋</h2>
                <p>Digite sua senha para continuar</p>
            </div>

            <div className="step-indicator">
                <div className="step-dot completed"></div>
                <div className="step-dot active"></div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">
                        Senha
                    </label>
                    <div className="input-wrapper">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`input ${displayError ? 'error' : ''}`}
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setLocalError('');
                            }}
                            disabled={loading}
                            autoComplete="current-password"
                            autoFocus
                        />
                        <button
                            type="button"
                            className="input-icon clickable"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {displayError && (
                    <div className="alert alert-error fade-in">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{displayError}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-full"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-secondary" style={{ marginTop: 'var(--space-4)' }}>
                {email}
            </p>
        </div>
    );
}
