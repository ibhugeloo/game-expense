import React from 'react';
import { Crown, Check, X, Sparkles, Zap } from 'lucide-react';

const features = [
    { name: 'Transactions', free: '50 max', premium: 'Illimité', key: 'txn' },
    { name: 'Devises', free: 'EUR uniquement', premium: 'Multi-devises', key: 'currency' },
    { name: 'Export CSV', free: false, premium: true, key: 'csv' },
    { name: 'Budget mensuel', free: false, premium: true, key: 'budget' },
    { name: 'Jaquettes RAWG', free: false, premium: true, key: 'rawg' },
    { name: 'Graphiques avancés', free: false, premium: true, key: 'charts' },
];

const UpgradeModal = ({ onClose, currentPlan }) => {
    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="glass-modal" style={{ maxWidth: '520px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                    }}>
                        <Crown size={28} color="white" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Passer Premium</h2>
                    <p style={{ color: 'var(--color-text-dim)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Débloquez toutes les fonctionnalités de Mosaic Analytics
                    </p>
                </div>

                {/* Price */}
                <div style={{
                    textAlign: 'center',
                    background: 'var(--color-primary-dim)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--color-primary)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>3,99€</span>
                        <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>/mois</span>
                    </div>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        ou 39,99€/an (économisez 17%)
                    </p>
                </div>

                {/* Feature comparison */}
                <div style={{ marginBottom: '1.5rem' }}>
                    {features.map(f => (
                        <div key={f.key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0',
                            borderBottom: '1px solid var(--card-border)',
                        }}>
                            <span style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>{f.name}</span>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                {/* Free column */}
                                <span style={{ width: 80, textAlign: 'center', fontSize: '0.85rem' }}>
                                    {typeof f.free === 'boolean' ? (
                                        f.free
                                            ? <Check size={16} style={{ color: 'var(--color-success)' }} />
                                            : <X size={16} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                                    ) : (
                                        <span style={{ color: 'var(--color-text-dim)' }}>{f.free}</span>
                                    )}
                                </span>
                                {/* Premium column */}
                                <span style={{ width: 80, textAlign: 'center', fontSize: '0.85rem' }}>
                                    {typeof f.premium === 'boolean' ? (
                                        <Check size={16} style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{f.premium}</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                    {/* Column headers */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        gap: '2rem', marginTop: '-' + (features.length * 38 + 10) + 'px',
                        position: 'relative', top: '-10px',
                    }}>
                    </div>
                </div>

                {/* CTA */}
                <button
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                    }}
                    onClick={() => {
                        // TODO: Stripe checkout integration
                        onClose();
                    }}
                >
                    <Zap size={18} />
                    Passer Premium
                </button>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%', marginTop: '0.75rem',
                        background: 'none', border: 'none',
                        color: 'var(--color-text-dim)', cursor: 'pointer',
                        fontSize: '0.85rem', padding: '0.5rem',
                        fontFamily: 'inherit',
                    }}
                >
                    Continuer avec le plan gratuit
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
