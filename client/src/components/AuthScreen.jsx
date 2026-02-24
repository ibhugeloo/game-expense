import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const AuthScreen = ({ onAuth, signIn, signUp }) => {
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
                    setSuccessMessage('Vérifie ta boîte mail pour confirmer ton compte !');
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-gradient" />

            <div className="auth-card glass-panel">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="auth-logo">
                        <Gamepad2 size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>Mosaic</h1>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.95rem' }}>
                        Game Expense Tracker
                    </p>
                </div>

                {/* Tab toggle */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                    >
                        <LogIn size={16} />
                        Connexion
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
                    >
                        <UserPlus size={16} />
                        Inscription
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="ton@email.com"
                                style={{ paddingLeft: '36px' }}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={isLogin ? '••••••••' : 'Min. 6 caractères'}
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
                                {isLogin ? 'Se connecter' : "S'inscrire"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
