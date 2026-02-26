import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AuthForm = ({ signIn, signUp, resetPassword }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            if (isReset) {
                await resetPassword(email);
                setSuccessMessage(t('auth.resetEmailSent'));
            } else if (isLogin) {
                await signIn(email, password);
            } else {
                const data = await signUp(email, password);
                if (data?.user && !data?.session) {
                    setSuccessMessage(t('auth.checkEmail'));
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            setError(err.message || t('auth.genericError'));
        } finally {
            setLoading(false);
        }
    };

    // Reset password view
    if (isReset) {
        return (
            <>
                <button
                    className="auth-back-btn"
                    onClick={() => { setIsReset(false); clearMessages(); }}
                >
                    <ArrowLeft size={16} />
                    {t('auth.backToLogin')}
                </button>

                <div style={{ textAlign: 'center', margin: '0.5rem 0 1.25rem' }}>
                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>
                        {t('auth.resetTitle')}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
                        {t('auth.resetDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('auth.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={t('auth.emailPlaceholder')}
                                style={{ paddingLeft: '36px' }}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {successMessage && <div className="auth-success">{successMessage}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} />
                        ) : (
                            <>
                                {t('auth.resetButton')}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </>
        );
    }

    // Login / Signup view
    return (
        <>
            {/* Tab toggle */}
            <div className="auth-tabs">
                <button
                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => { setIsLogin(true); clearMessages(); }}
                >
                    <LogIn size={16} />
                    {t('auth.login')}
                </button>
                <button
                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => { setIsLogin(false); clearMessages(); }}
                >
                    <UserPlus size={16} />
                    {t('auth.signup')}
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('auth.email')}</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('auth.emailPlaceholder')}
                            style={{ paddingLeft: '36px' }}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('auth.password')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={isLogin ? t('auth.passwordPlaceholderLogin') : t('auth.passwordPlaceholderSignup')}
                            style={{ paddingLeft: '36px' }}
                            required
                            minLength={6}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>
                </div>

                {isLogin && (
                    <button
                        type="button"
                        className="auth-forgot-btn"
                        onClick={() => { setIsReset(true); clearMessages(); }}
                    >
                        {t('auth.forgotPassword')}
                    </button>
                )}

                {error && <div className="auth-error">{error}</div>}
                {successMessage && <div className="auth-success">{successMessage}</div>}

                <button
                    type="submit"
                    className="btn btn-primary auth-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} />
                    ) : (
                        <>
                            {isLogin ? t('auth.loginButton') : t('auth.signupButton')}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </>
    );
};

export default AuthForm;
