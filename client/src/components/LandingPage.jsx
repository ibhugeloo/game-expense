import React, { useRef } from 'react';
import { Gamepad2, ArrowRight, BarChart3, Wallet, Target, Globe, Crown, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthForm from './AuthForm';

const PRICING_FEATURES = [
    { key: 'transactions', freeKey: 'pricingFeature50', premiumKey: 'pricingFeatureUnlimited' },
    { key: 'currencies', freeKey: 'pricingFeature1Currency', premiumKey: 'pricingFeatureMultiCurrency' },
    { key: 'charts', freeKey: 'pricingFeatureBasicCharts', premiumKey: 'pricingFeatureAdvancedCharts' },
    { key: 'budget', freeKey: null, premiumKey: 'pricingFeatureBudget' },
    { key: 'export', freeKey: null, premiumKey: 'pricingFeatureExport' },
    { key: 'covers', freeKey: null, premiumKey: 'pricingFeatureCovers' },
];

const LandingPage = ({ signIn, signUp }) => {
    const { t, i18n } = useTranslation();
    const authRef = useRef(null);

    const scrollToAuth = () => {
        authRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page">
            <div className="landing-bg-gradient" />

            {/* ── NAV ── */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-nav-brand">
                        <div className="landing-logo">
                            <Gamepad2 size={20} color="white" />
                        </div>
                        <span className="landing-nav-title">Mosaic</span>
                    </div>
                    <div className="landing-nav-links">
                        <button
                            className="landing-lang-btn"
                            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
                        >
                            {i18n.language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
                        </button>
                        <button className="btn btn-primary" onClick={scrollToAuth}>
                            {t('landing.cta')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="landing-hero">
                <div className="landing-hero-badge">
                    <Gamepad2 size={14} />
                    Game Expense Tracker
                </div>
                <h1 className="landing-hero-title">
                    {t('landing.heroTitle')}
                </h1>
                <p className="landing-hero-tagline">
                    {t('landing.heroTagline')}
                </p>
                <button className="btn btn-primary landing-hero-cta" onClick={scrollToAuth}>
                    {t('landing.heroCta')}
                    <ArrowRight size={18} />
                </button>
            </section>

            {/* ── FEATURES ── */}
            <section className="landing-features">
                <h2 className="landing-section-title">{t('landing.featuresTitle')}</h2>
                <div className="landing-features-grid">
                    {[
                        { icon: BarChart3, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
                        { icon: Wallet, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
                        { icon: Target, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
                        { icon: Globe, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
                    ].map((feature, i) => (
                        <div key={i} className="landing-feature-card glass-panel">
                            <div className="landing-feature-icon">
                                <feature.icon size={24} />
                            </div>
                            <h3>{t(feature.titleKey)}</h3>
                            <p>{t(feature.descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="landing-pricing">
                <h2 className="landing-section-title">{t('landing.pricingTitle')}</h2>
                <div className="landing-pricing-grid">
                    {/* Free */}
                    <div className="landing-pricing-card glass-panel">
                        <h3>{t('landing.pricingFreeTitle')}</h3>
                        <div className="landing-pricing-price">{t('landing.pricingFreePrice')}</div>
                        <p className="landing-pricing-desc">{t('landing.pricingFreeDesc')}</p>
                        <ul className="landing-pricing-list">
                            {PRICING_FEATURES.map((f, i) => (
                                <li key={i} className={f.freeKey ? 'included' : 'excluded'}>
                                    {f.freeKey ? <Check size={14} /> : <X size={14} />}
                                    <span>{f.freeKey ? t(`landing.${f.freeKey}`) : t(`landing.${f.premiumKey}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="btn btn-secondary landing-pricing-btn" onClick={scrollToAuth}>
                            {t('landing.heroCta')}
                        </button>
                    </div>
                    {/* Premium */}
                    <div className="landing-pricing-card glass-panel landing-pricing-premium">
                        <div className="landing-pricing-badge">
                            <Crown size={12} />
                            Popular
                        </div>
                        <h3>{t('landing.pricingPremiumTitle')}</h3>
                        <div className="landing-pricing-price">
                            {t('landing.pricingPremiumPrice')}
                            <span className="landing-pricing-unit">{t('landing.pricingPremiumPriceUnit')}</span>
                        </div>
                        <p className="landing-pricing-desc">
                            {t('landing.pricingPremiumDesc')}
                            <br />
                            <span className="landing-pricing-yearly">{t('landing.pricingPremiumYearly')}</span>
                        </p>
                        <ul className="landing-pricing-list">
                            {PRICING_FEATURES.map((f, i) => (
                                <li key={i} className="included">
                                    <Check size={14} />
                                    <span>{t(`landing.${f.premiumKey}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="btn btn-primary landing-pricing-btn" onClick={scrollToAuth}>
                            {t('landing.cta')}
                        </button>
                    </div>
                </div>
            </section>

            {/* ── AUTH ── */}
            <section className="landing-auth" ref={authRef}>
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
                    <AuthForm signIn={signIn} signUp={signUp} />
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <p>{t('landing.footerText')}</p>
            </footer>
        </div>
    );
};

export default LandingPage;
