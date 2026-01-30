import { useState } from 'react';

export default function EmailStep({ onSubmit, loading, error }) {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email.trim()) {
            setLocalError('Por favor, digite seu email');
            return;
        }

        if (!validateEmail(email)) {
            setLocalError('Por favor, digite um email válido');
            return;
        }

        onSubmit(email.trim().toLowerCase());
    };

    const displayError = localError || error;

    return (
        <div className="slide-up">
            <div className="login-logo">
                <div className="login-logo-icon">PK</div>
                <div className="login-logo-text">PK Fit System</div>
                <div className="login-logo-subtitle">Sistema de Gestão para Academias</div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`input ${displayError ? 'error' : ''}`}
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setLocalError('');
                        }}
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                    />
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
                            Verificando...
                        </>
                    ) : (
                        'Continuar'
                    )}
                </button>
            </form>
        </div>
    );
}
