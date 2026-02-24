import React, { useMemo } from 'react';
import { Gamepad2, TrendingUp, TrendingDown, Minus, DollarSign, Tag, BarChart3, Clock } from 'lucide-react';

const StatsOverview = ({ transactions, exchangeRate = 0.92 }) => {
    // Normalize price to EUR
    const toEUR = (price, currency) => {
        if (currency === 'EUR') return price;
        if (currency === 'USD') return price * exchangeRate;
        if (currency === 'GBP') return price * 1.17;
        if (currency === 'JPY') return price * 0.0062;
        return price;
    };

    const totalGames = transactions.length;
    const totalSpent = transactions.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency), 0);
    const avgPrice = totalGames > 0 ? totalSpent / totalGames : 0;
    const completedGames = transactions.filter(t => t.status === 'Completed').length;
    const totalHours = transactions.reduce((acc, t) => acc + (parseFloat(t.hours_played) || 0), 0);
    const avgCostPerHour = totalHours > 0 ? totalSpent / totalHours : 0;

    // Calculate REAL trends: current month vs previous month
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
        const currentSpent = currentMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency), 0);
        const prevSpent = prevMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency), 0);
        const currentCompleted = currentMonthTx.filter(t => t.status === 'Completed').length;
        const prevCompleted = prevMonthTx.filter(t => t.status === 'Completed').length;
        const currentHours = currentMonthTx.reduce((acc, t) => acc + (parseFloat(t.hours_played) || 0), 0);
        const prevHours = prevMonthTx.reduce((acc, t) => acc + (parseFloat(t.hours_played) || 0), 0);

        const pct = (curr, prev) => {
            if (prev === 0 && curr === 0) return 0;
            if (prev === 0) return 100;
            return Math.round(((curr - prev) / prev) * 100);
        };

        return {
            games: pct(currentCount, prevCount),
            spent: pct(currentSpent, prevSpent),
            completed: pct(currentCompleted, prevCompleted),
            hours: pct(currentHours, prevHours),
        };
    }, [transactions]);

    const cards = [
        {
            label: 'Jeux achetés',
            value: totalGames,
            trend: trends.games,
            icon: Gamepad2,
        },
        {
            label: 'Dépense totale',
            value: `${totalSpent.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
            trend: trends.spent,
            icon: DollarSign,
        },
        {
            label: 'Prix moyen',
            value: `${avgPrice.toFixed(2)} €`,
            trend: null, // No trend for average
            icon: Tag,
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
                                <span className="stat-card-trend-label">vs mois dernier</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatsOverview;
