import React, { useState } from 'react';
import { Crown, Check, X, Zap, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PRICE_IDS = {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
};

const FEATURES = [
    { nameKey: 'upgrade.features.transactions', freeKey: 'upgrade.features.transactionsFree', premiumKey: 'upgrade.features.transactionsPremium', key: 'txn' },
    { nameKey: 'upgrade.features.currencies', freeKey: 'upgrade.features.currenciesFree', premiumKey: 'upgrade.features.currenciesPremium', key: 'currency' },
    { nameKey: 'upgrade.features.csvExport', free: false, premium: true, key: 'csv' },
    { nameKey: 'upgrade.features.monthlyBudget', free: false, premium: true, key: 'budget' },
    { nameKey: 'upgrade.features.rawgCovers', free: false, premium: true, key: 'rawg' },
    { nameKey: 'upgrade.features.advancedCharts', free: false, premium: true, key: 'charts' },
];

const UpgradeModal = ({ onClose, onCheckout, checkoutLoading }) => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const handleCheckout = async () => {
        try {
            await onCheckout(PRICE_IDS[selectedPlan]);
        } catch (err) {
            console.error('Checkout failed:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="glass-modal" style={{ maxWidth: '520px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'var(--color-premium-gradient)',
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 24px rgba(212, 168, 83, 0.3)',
                    }}>
                        <Crown size={28} color="white" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('upgrade.title')}</h2>
                    <p style={{ color: 'var(--color-text-dim)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {t('upgrade.subtitle')}
                    </p>
                </div>

                {/* Plan toggle */}
                <div style={{
                    display: 'flex', gap: '0.75rem',
                    marginBottom: '1.5rem',
                }}>
                    <button
                        onClick={() => setSelectedPlan('monthly')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${selectedPlan === 'monthly' ? 'var(--color-primary)' : 'var(--card-border)'}`,
                            background: selectedPlan === 'monthly' ? 'var(--color-primary-dim)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontFamily: 'inherit',
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedPlan === 'monthly' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            3,99€
                        </div>
                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>{t('upgrade.monthly')}</div>
                    </button>

                    <button
                        onClick={() => setSelectedPlan('yearly')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${selectedPlan === 'yearly' ? 'var(--color-primary)' : 'var(--card-border)'}`,
                            background: selectedPlan === 'yearly' ? 'var(--color-primary-dim)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'center',
                            position: 'relative',
                            fontFamily: 'inherit',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: -10, right: 10,
                            background: 'var(--color-premium-gradient)',
                            color: 'white', fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 8px', borderRadius: 20,
                        }}>
                            -17%
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedPlan === 'yearly' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            39,99€
                        </div>
                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>{t('upgrade.yearly')}</div>
                    </button>
                </div>

                {/* Feature comparison */}
                <div style={{ marginBottom: '1.5rem' }}>
                    {FEATURES.map(f => (
                        <div key={f.key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0',
                            borderBottom: '1px solid var(--card-border)',
                        }}>
                            <span style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>{t(f.nameKey)}</span>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <span style={{ width: 80, textAlign: 'center', fontSize: '0.85rem' }}>
                                    {typeof f.free === 'boolean' ? (
                                        f.free
                                            ? <Check size={16} style={{ color: 'var(--color-success)' }} />
                                            : <X size={16} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                                    ) : (
                                        <span style={{ color: 'var(--color-text-dim)' }}>{t(f.freeKey)}</span>
                                    )}
                                </span>
                                <span style={{ width: 80, textAlign: 'center', fontSize: '0.85rem' }}>
                                    {typeof f.premium === 'boolean' ? (
                                        <Check size={16} style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{t(f.premiumKey)}</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '1rem',
                        background: 'var(--color-premium-gradient)',
                        boxShadow: '0 4px 16px rgba(212, 168, 83, 0.3)',
                        opacity: checkoutLoading ? 0.7 : 1,
                    }}
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                >
                    {checkoutLoading ? (
                        <><Loader size={18} className="spin" /> {t('upgrade.redirecting')}</>
                    ) : (
                        <><Zap size={18} /> {t('upgrade.ctaButton')}</>
                    )}
                </button>

                <button
                    onClick={onClose}
                    disabled={checkoutLoading}
                    style={{
                        width: '100%', marginTop: '0.75rem',
                        background: 'none', border: 'none',
                        color: 'var(--color-text-dim)', cursor: 'pointer',
                        fontSize: '0.85rem', padding: '0.5rem',
                        fontFamily: 'inherit',
                    }}
                >
                    {t('upgrade.continueFree')}
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
