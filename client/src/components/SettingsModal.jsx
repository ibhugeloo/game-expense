import React, { useState } from 'react';
import { X, User, Crown, CreditCard, Palette, Shield, LogOut, AlertTriangle, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AVATAR_OPTIONS = [
    '🎮', '🕹️', '👾', '🎯', '🏆', '⚔️', '🎲', '🧩',
    '🐉', '🦊', '🐺', '🦁', '🐱', '🐶', '🦅', '🐙',
    '🚀', '💎', '🔥', '⭐', '🌙', '🌊', '🌸', '🍀',
    '😎', '🤖', '👻', '💀', '🎃', '🦇', '🧙', '🥷',
];

const SettingsModal = ({ onClose, profile, updateProfile, plan, isPremium, onCancelSubscription, onSignOut, userEmail }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState(profile.display_name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🎮');
    const [defaultCurrency, setDefaultCurrency] = useState(profile.default_currency || 'EUR');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveError('');
        const success = await updateProfile({
            display_name: displayName,
            avatar: selectedAvatar,
            default_currency: defaultCurrency,
        });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } else {
            setSaveError('Erreur lors de la sauvegarde. Vérifie la console pour les détails.');
        }
    };


    const handleChangePassword = async () => {
        setPasswordMessage({ type: '', text: '' });

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setPasswordSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.message || 'Erreur lors du changement.' });
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (onCancelSubscription) {
            await onCancelSubscription();
        }
        setShowCancelConfirm(false);
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'subscription', label: 'Abonnement', icon: CreditCard },
        { id: 'preferences', label: 'Préférences', icon: Palette },
        { id: 'security', label: 'Sécurité', icon: Shield },
    ];

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="glass-modal" style={{ maxWidth: '600px', minHeight: '400px' }}>
                <div className="modal-header">
                    <h2>Paramètres</h2>
                    <button onClick={onClose} className="btn-icon-only modal-close">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab navigation */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div>
                            <h3 className="settings-section-title">Avatar</h3>
                            <div className="avatar-grid">
                                {AVATAR_OPTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        className={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                                        onClick={() => setSelectedAvatar(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            <h3 className="settings-section-title" style={{ marginTop: '1.5rem' }}>Nom d'affichage</h3>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="Ton pseudo..."
                                style={{ width: '100%' }}
                            />

                            {saveError && (
                                <div className="auth-error" style={{ marginTop: '1rem' }}>{saveError}</div>
                            )}

                            <button
                                className="btn btn-primary"
                                onClick={handleSaveProfile}
                                disabled={saving}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : 'Sauvegarder'}
                            </button>
                        </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div>
                            <div className="settings-plan-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 44, height: 44,
                                        background: isPremium
                                            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                                            : 'var(--input-bg)',
                                        borderRadius: 12,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Crown size={22} color={isPremium ? 'white' : 'var(--color-text-dim)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            Plan {isPremium ? 'Premium' : 'Gratuit'}
                                        </div>
                                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
                                            {isPremium ? 'Toutes les fonctionnalités débloquées' : 'Limité à 50 transactions'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isPremium ? (
                                <div style={{ marginTop: '1.5rem' }}>
                                    {!showCancelConfirm ? (
                                        <button
                                            className="btn"
                                            onClick={() => setShowCancelConfirm(true)}
                                            style={{
                                                width: '100%',
                                                background: 'var(--color-error-dim)',
                                                color: 'var(--color-error)',
                                                border: '1px solid var(--color-error)',
                                            }}
                                        >
                                            Résilier l'abonnement
                                        </button>
                                    ) : (
                                        <div className="settings-cancel-confirm">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                <AlertTriangle size={18} color="var(--color-error)" />
                                                <strong style={{ color: 'var(--color-error)' }}>Confirmer la résiliation ?</strong>
                                            </div>
                                            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                                Tu perdras l'accès aux fonctionnalités Premium (graphiques avancés, export CSV, budget, jaquettes).
                                                Tes données seront conservées.
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    className="btn"
                                                    onClick={() => setShowCancelConfirm(false)}
                                                    style={{ flex: 1, background: 'var(--input-bg)', color: 'var(--color-text)' }}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    className="btn"
                                                    onClick={handleCancelSubscription}
                                                    style={{ flex: 1, background: 'var(--color-error)', color: 'white' }}
                                                >
                                                    Résilier
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                                    Passe Premium pour débloquer toutes les fonctionnalités !
                                </p>
                            )}
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div>
                            <h3 className="settings-section-title">Devise par défaut</h3>
                            <select
                                value={defaultCurrency}
                                onChange={e => setDefaultCurrency(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="EUR">🇪🇺 EUR — Euro</option>
                                <option value="USD">🇺🇸 USD — Dollar</option>
                                <option value="GBP">🇬🇧 GBP — Livre</option>
                                <option value="JPY">🇯🇵 JPY — Yen</option>
                            </select>

                            <button
                                className="btn btn-primary"
                                onClick={handleSaveProfile}
                                disabled={saving}
                                style={{ width: '100%', marginTop: '1.5rem' }}
                            >
                                {saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : 'Sauvegarder'}
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
                            <h3 className="settings-section-title">Compte</h3>
                            <div style={{
                                background: 'var(--input-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1.5rem',
                            }}>
                                <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email</div>
                                <div style={{ fontWeight: 500 }}>{userEmail}</div>
                            </div>

                            <h3 className="settings-section-title">Modifier le mot de passe</h3>
                            <div className="form-group">
                                <label>Nouveau mot de passe</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 caractères"
                                        style={{ paddingLeft: '36px', paddingRight: '40px', width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '8px', top: '8px',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--color-text-dim)', padding: '4px',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirmer le mot de passe</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirmer..."
                                        style={{ paddingLeft: '36px', width: '100%' }}
                                    />
                                </div>
                            </div>

                            {passwordMessage.text && (
                                <div className={passwordMessage.type === 'error' ? 'auth-error' : 'auth-success'}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <button
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                                disabled={passwordSaving || !newPassword}
                                style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
                            >
                                {passwordSaving ? 'Modification...' : 'Changer le mot de passe'}
                            </button>

                            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                                <button
                                    className="btn"
                                    onClick={onSignOut}
                                    style={{
                                        width: '100%',
                                        background: 'var(--input-bg)',
                                        color: 'var(--color-text)',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <LogOut size={18} />
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
