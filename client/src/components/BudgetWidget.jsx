import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatMonth } from '../utils/formatters';

const BudgetWidget = ({ budget, transactions, exchangeRate = 0.92 }) => {
    const { t, i18n } = useTranslation();
    if (!budget) return null;

    const now = new Date();
    const currentMonthTx = transactions.filter(t => {
        const d = new Date(t.purchase_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const spent = currentMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
    const budgetAmount = parseFloat(budget.amount) || 0;
    const pct = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
    const remaining = budgetAmount - spent;
    const overBudget = spent > budgetAmount;

    let barClass = '';
    if (pct >= 100) barClass = 'danger';
    else if (pct >= 80) barClass = 'warning';

    const monthName = formatMonth(now, i18n.language);

    return (
        <div className="budget-widget">
            <div className="budget-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Wallet size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{t('budget.budgetFor', { month: monthName })}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: overBudget ? 'var(--color-error)' : 'var(--color-text)' }}>
                    {spent.toFixed(2)} € <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-dim)' }}>/ {budgetAmount.toFixed(2)} €</span>
                </div>
                {overBudget && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        <AlertTriangle size={14} />
                        {t('budget.overBudget', { amount: Math.abs(remaining).toFixed(2) })}
                    </div>
                )}
            </div>

            <div className="budget-bar-container">
                <div className="budget-bar-bg">
                    <div className={`budget-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-labels">
                    <span>{t('budget.used', { percent: pct.toFixed(0) })}</span>
                    <span>{remaining > 0 ? t('budget.remaining', { amount: remaining.toFixed(2) }) : t('budget.exhausted')}</span>
                </div>
            </div>
        </div>
    );
};

export default BudgetWidget;
