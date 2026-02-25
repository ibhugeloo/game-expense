import React, { useEffect, useRef, useMemo } from 'react';
import { AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';

const NotificationDropdown = ({ transactions, budget, exchangeRate, onClose }) => {
    const { t, i18n } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const budgetAlert = useMemo(() => {
        if (!budget || !budget.amount) return null;

        const now = new Date();
        const monthTransactions = transactions.filter(tx => {
            const d = new Date(tx.purchase_date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const spent = monthTransactions.reduce((sum, tx) => {
            const price = parseFloat(tx.price) || 0;
            if (tx.currency === 'USD') return sum + price * exchangeRate;
            if (tx.currency === 'GBP') return sum + price * exchangeRate * 1.27;
            if (tx.currency === 'JPY') return sum + price * exchangeRate * 0.0067;
            return sum + price;
        }, 0);

        const percent = Math.round((spent / budget.amount) * 100);

        if (percent >= 100) {
            return { type: 'danger', message: t('notifications.budgetExceeded', { amount: (spent - budget.amount).toFixed(0) }), percent };
        }
        if (percent >= 80) {
            return { type: 'warning', message: t('notifications.budgetAlmost', { percent }), percent };
        }
        return null;
    }, [budget, transactions, exchangeRate, t]);

    const recentPurchases = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
            .slice(0, 5);
    }, [transactions]);

    const hasNotifications = budgetAlert || recentPurchases.length > 0;

    return (
        <div className="notif-dropdown" ref={ref}>
            <div className="notif-dropdown-header">
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t('notifications.title')}</span>
            </div>

            {!hasNotifications && (
                <div className="notif-dropdown-empty">
                    {t('notifications.empty')}
                </div>
            )}

            {/* Budget alert */}
            {budgetAlert && (
                <div className={`notif-item notif-item-${budgetAlert.type}`}>
                    <div className="notif-item-icon" style={{
                        background: budgetAlert.type === 'danger' ? 'var(--color-error-dim)' : 'var(--color-warning-dim)',
                        color: budgetAlert.type === 'danger' ? 'var(--color-error)' : 'var(--color-warning)',
                    }}>
                        <AlertTriangle size={16} />
                    </div>
                    <div className="notif-item-content">
                        <div className="notif-item-title">{t('notifications.budgetAlert')}</div>
                        <div className="notif-item-text">{budgetAlert.message}</div>
                    </div>
                </div>
            )}

            {/* Recent purchases */}
            {recentPurchases.length > 0 && (
                <>
                    <div className="notif-section-label">{t('notifications.recentActivity')}</div>
                    {recentPurchases.map(tx => (
                        <div key={tx.id} className="notif-item">
                            <div className="notif-item-icon" style={{
                                background: 'var(--color-primary-dim)',
                                color: 'var(--color-primary)',
                            }}>
                                <ShoppingCart size={14} />
                            </div>
                            <div className="notif-item-content">
                                <div className="notif-item-title">{tx.title}</div>
                                <div className="notif-item-text">
                                    {parseFloat(tx.price || 0).toFixed(2)} {tx.currency || '€'} · {formatDate(tx.purchase_date, i18n.language)}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
