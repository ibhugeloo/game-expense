import React, { useState } from 'react';
import { Gamepad2, ArrowRight, ArrowLeft, Check, BarChart3, Wallet, Target, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AVATAR_OPTIONS } from '../constants/avatars';
import { trackEvent } from '../posthog';

const TOTAL_STEPS = 4;

const OnboardingFlow = ({ profile, onComplete }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [avatar, setAvatar] = useState(profile.avatar || '🎮');
    const [displayName, setDisplayName] = useState(profile.display_name || '');
    const [currency, setCurrency] = useState(profile.default_currency || 'EUR');
    const [saving, setSaving] = useState(false);

    const handleNext = () => {
        if (step < TOTAL_STEPS) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        setSaving(true);
        await onComplete({
            avatar,
            display_name: displayName,
            default_currency: currency,
        });
        trackEvent('onboarding_completed', { avatar, currency, step: 'finish' });
        setSaving(false);
    };

    const handleSkip = async () => {
        setSaving(true);
        await onComplete({
            avatar,
            display_name: displayName,
            default_currency: currency,
        });
        trackEvent('onboarding_completed', { avatar, currency, step: `skip_step_${step}` });
        setSaving(false);
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-bg-gradient" />

            <div className="onboarding-card glass-panel">
                {/* Step indicator */}
                <div className="onboarding-steps">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`onboarding-step-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Step 1: Welcome + Avatar */}
                {step === 1 && (
                    <div className="onboarding-step-content">
                        <div className="onboarding-step-icon">
                            <Gamepad2 size={38} color="white" />
                        </div>
                        <h2>{t('onboarding.step1Title')}</h2>
                        <p className="onboarding-step-desc">{t('onboarding.step1Desc')}</p>

                        <h3 className="onboarding-section-label">{t('onboarding.chooseAvatar')}</h3>
                        <div className="avatar-grid">
                            {AVATAR_OPTIONS.map(emoji => (
                                <button
                                    key={emoji}
                                    className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
                                    onClick={() => setAvatar(emoji)}
                                    type="button"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Display Name + Currency */}
                {step === 2 && (
                    <div className="onboarding-step-content">
                        <h2>{t('onboarding.step2Title')}</h2>
                        <p className="onboarding-step-desc">{t('onboarding.step2Desc')}</p>

                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label>{t('settings.profile.displayName')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder={t('settings.profile.displayNamePlaceholder')}
                                autoFocus
                            />
                        </div>

                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label>{t('settings.preferences.defaultCurrency')}</label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Features Tour */}
                {step === 3 && (
                    <div className="onboarding-step-content">
                        <h2>{t('onboarding.step3Title')}</h2>
                        <p className="onboarding-step-desc">{t('onboarding.step3Desc')}</p>

                        <div className="onboarding-features-list">
                            {[
                                { icon: BarChart3, key: 'onboarding.tour1' },
                                { icon: Wallet, key: 'onboarding.tour2' },
                                { icon: Target, key: 'onboarding.tour3' },
                                { icon: Globe, key: 'onboarding.tour4' },
                            ].map((f, i) => (
                                <div key={i} className="onboarding-feature-item">
                                    <f.icon size={24} />
                                    <span>{t(f.key)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: All Set */}
                {step === 4 && (
                    <div className="onboarding-step-content">
                        <div className="onboarding-ready-icon">🎉</div>
                        <h2>{t('onboarding.step4Title')}</h2>
                        <p className="onboarding-step-desc">{t('onboarding.step4Desc')}</p>
                    </div>
                )}

                {/* Navigation */}
                <div className="onboarding-nav">
                    {step > 1 && (
                        <button className="btn btn-secondary" onClick={handleBack}>
                            <ArrowLeft size={16} />
                            {t('onboarding.back')}
                        </button>
                    )}

                    {step < TOTAL_STEPS ? (
                        <button className="btn btn-primary" onClick={handleNext}>
                            {t('onboarding.next')}
                            <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleFinish}
                            disabled={saving}
                        >
                            {saving ? t('common.saving') : t('onboarding.finish')}
                            {!saving && <Check size={16} />}
                        </button>
                    )}
                </div>

                {/* Skip link */}
                {step < TOTAL_STEPS && (
                    <button className="onboarding-skip" onClick={handleSkip} disabled={saving}>
                        {t('onboarding.skip')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
