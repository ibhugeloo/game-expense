import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMonth } from '../utils/formatters';

const BudgetForm = ({ currentBudget, onSave }) => {
    const { t, i18n } = useTranslation();
    const [amount, setAmount] = useState(currentBudget?.amount || '');
    const now = new Date();
    const monthName = formatMonth(now, i18n.language);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(amount); }}>
            <p style={{ color: 'var(--color-text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {t('budget.setBudgetFor')} <strong style={{ color: 'var(--color-text)' }}>{monthName}</strong>
            </p>
            <div className="form-group">
                <label>{t('budget.amount')}</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={t('budget.amountPlaceholder')}
                    step="0.01"
                    min="0"
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {t('common.save')}
            </button>
        </form>
    );
};

export default BudgetForm;
