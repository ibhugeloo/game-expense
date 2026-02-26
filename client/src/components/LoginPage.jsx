import React from 'react';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

const LoginPage = ({ signIn, signUp, resetPassword }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <div className="landing-bg-gradient" />
            <div className="landing-auth" style={{ paddingTop: '3rem' }}>
                <button
                    className="landing-back-btn"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft size={16} />
                    {t('landing.back') || 'Retour'}
                </button>
                <div className="auth-card glass-panel">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="auth-logo">
                            <Gamepad2 size={32} color="white" />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>Mosaic</h1>
                        <p style={{ color: 'var(--color-text-dim)', fontSize: '0.95rem' }}>
                            {t('auth.subtitle')}
                        </p>
                    </div>
                    <AuthForm signIn={signIn} signUp={signUp} resetPassword={resetPassword} />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
