import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AuthForm = ({ signIn, signUp }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isLogin) {
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

    return (
        <>
            {/* Tab toggle */}
            <div className="auth-tabs">
                <button
                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                >
                    <LogIn size={16} />
                    {t('auth.login')}
                </button>
                <button
                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
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

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="auth-success">
                        {successMessage}
                    </div>
                )}

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
