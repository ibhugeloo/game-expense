import React, { useMemo } from 'react';
import { Gamepad2, TrendingUp, TrendingDown, Minus, DollarSign, Tag, ShoppingCart } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

const StatsOverview = ({ transactions, exchangeRate = 0.92 }) => {
    const { t, i18n } = useTranslation();

    const totalGames = transactions.length;
    const totalSpent = transactions.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
    const avgPrice = totalGames > 0 ? totalSpent / totalGames : 0;

    const microTransactions = transactions.filter(t => t.type && t.type !== 'game');
    const microTotal = microTransactions.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);

    const trends = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTx = transactions.filter(t => {
            const d = new Date(t.purchase_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthTx = transactions.filter(t => {
            const d = new Date(t.purchase_date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });

        const currentCount = currentMonthTx.length;
        const prevCount = prevMonthTx.length;
        const currentSpent = currentMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
        const prevSpent = prevMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
        const currentMicro = currentMonthTx.filter(t => t.type && t.type !== 'game').reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
        const prevMicro = prevMonthTx.filter(t => t.type && t.type !== 'game').reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);

        const pct = (curr, prev) => {
            if (prev === 0 && curr === 0) return 0;
            if (prev === 0) return 100;
            return Math.round(((curr - prev) / prev) * 100);
        };

        return {
            games: pct(currentCount, prevCount),
            spent: pct(currentSpent, prevSpent),
            micro: pct(currentMicro, prevMicro),
        };
    }, [transactions]);

    const cards = [
        {
            label: t('stats.gamesPurchased'),
            value: totalGames,
            trend: trends.games,
            icon: Gamepad2,
        },
        {
            label: t('stats.totalSpent'),
            value: `${formatCurrency(totalSpent, i18n.language)}\u00A0€`,
            trend: trends.spent,
            icon: DollarSign,
        },
        {
            label: t('stats.averagePrice'),
            value: `${formatCurrency(avgPrice, i18n.language)}\u00A0€`,
            trend: null,
            icon: Tag,
        },
        {
            label: t('stats.microTransactions'),
            value: `${formatCurrency(microTotal, i18n.language)}\u00A0€`,
            trend: trends.micro,
            icon: ShoppingCart,
        },
    ];

    return (
        <div className="stats-grid">
            {cards.map((card, index) => {
                const IconComponent = card.icon;
                const isPositive = card.trend > 0;
                const isNegative = card.trend < 0;
                const isNeutral = card.trend === 0;
                const hasTrend = card.trend !== null;

                return (
                    <div key={index} className="stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-title">
                                <IconComponent size={16} />
                                {card.label}
                            </span>
                        </div>
                        <div className="stat-card-value">{card.value}</div>
                        {hasTrend && (
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                                <div className={`stat-card-trend-pill ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                                    {isPositive && <TrendingUp size={14} />}
                                    {isNegative && <TrendingDown size={14} />}
                                    {isNeutral && <Minus size={14} />}
                                    {isPositive ? '+' : ''}{card.trend}%
                                </div>
                                <span className="stat-card-trend-label">{t('stats.vsLastMonth')}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatsOverview;
