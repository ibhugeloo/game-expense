import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { PieChartIcon, TrendingUp, MoreHorizontal, Trophy, Gamepad2, Tag } from 'lucide-react';
import { toEUR } from '../utils/currency';

const COLORS = ['#4ade80', '#22c55e', '#facc15', '#f59e0b', '#86efac', '#eab308', '#16a34a', '#d97706', '#15803d', '#b45309'];

const AnalyticsCharts = ({ transactions, exchangeRate = 0.92, isPremium = false }) => {

    // 1. Platform donut
    const platformData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const existing = acc.find(p => p.name === t.platform);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: t.platform, value: price });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value).slice(0, 6);
    }, [transactions, exchangeRate]);

    const totalPlatformSpent = platformData.reduce((a, p) => a + p.value, 0);

    // 2. Store donut
    const storeData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const storeName = t.store || 'Inconnu';
            const existing = acc.find(s => s.name === storeName);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: storeName, value: price });
            return acc;
        }, []).sort((a, b) => b.value - a.value);
    }, [transactions, exchangeRate]);

    const topStore = storeData[0] || { name: 'N/A', value: 0 };

    // 3. Monthly evolution
    const monthlyData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const date = new Date(t.purchase_date);
            const monthYear = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
            const existing = acc.find(m => m.name === monthYear);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: monthYear, value: price, dateObj: date });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => a.dateObj - b.dateObj);
    }, [transactions, exchangeRate]);

    // 4. Cumulative spending
    const cumulativeData = useMemo(() => {
        let cumulative = 0;
        return monthlyData.map(m => {
            cumulative += m.value;
            return { name: m.name, value: cumulative };
        });
    }, [monthlyData]);

    // 5. Top games
    const gameData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const title = t.title || 'Inconnu';
            const existing = acc.find(g => g.name === title);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: title, value: price });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value).slice(0, 10);
    }, [transactions, exchangeRate]);

    // 6. Genre donut
    const genreData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const genreName = t.genre || 'Other';
            const existing = acc.find(g => g.name === genreName);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) {
                existing.value += price;
                existing.count += 1;
            } else {
                acc.push({ name: genreName, value: price, count: 1 });
            }
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value);
    }, [transactions, exchangeRate]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: 'var(--card-shadow)'
                }}>
                    <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>{label}</p>
                    <p style={{ color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: payload[0].fill || payload[0].stroke || '#f59e0b' }}></span>
                        {payload[0].value.toLocaleString('fr-FR')} €
                    </p>
                </div>
            );
        }
        return null;
    };

    const axisColor = 'var(--color-text-muted)';

    return (
        <>
            {/* Main chart grid: Platform + Monthly */}
            <div className="chart-grid">
                {/* Platform Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <span className="chart-card-title"><PieChartIcon size={18} /> Dépenses par Plateforme</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={platformData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                                        {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{transactions.length}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Total</div>
                            </div>
                        </div>
                        <div className="chart-legend" style={{ flex: 1 }}>
                            {platformData.map((item, i) => (
                                <div key={item.name} className="legend-item">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="legend-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                        <span className="legend-label">{item.name}</span>
                                    </div>
                                    <span className="legend-value">{item.value} €</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Store sub-section */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
                        <div className="chart-card-header" style={{ marginBottom: '1rem' }}>
                            <span className="chart-card-title"><PieChartIcon size={18} /> Dépenses par Lieu</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={storeData.slice(0, 5).map(s => ({ ...s, value: Math.round(s.value) }))} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                                            {storeData.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{storeData.length}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Lieux</div>
                                </div>
                            </div>
                            <div className="chart-legend" style={{ flex: 1 }}>
                                {storeData.slice(0, 5).map((item, i) => (
                                    <div key={item.name} className="legend-item">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="legend-dot" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }}></span>
                                            <span className="legend-label">{item.name}</span>
                                        </div>
                                        <span className="legend-value">{Math.round(item.value)} €</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Evolution + Highlights */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <span className="chart-card-title"><TrendingUp size={18} /> Évolution Mensuelle</span>
                    </div>

                    <div className="chart-big-stat">{totalPlatformSpent.toLocaleString('fr-FR')} €</div>
                    <div className="chart-big-stat-label">Dépense totale</div>

                    <div className="highlight-box">
                        <div className="highlight-box-title"><Trophy size={14} /> Boutique Préférée</div>
                        <div className="highlight-box-text">{topStore.name} — {Math.round(topStore.value)} € de dépenses</div>
                    </div>

                    <div style={{ height: '180px', marginTop: '1.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Extra charts: Genre + Cumulative — Premium only */}
            {isPremium && (
                <div className="charts-extra-grid">
                    {/* Genre Distribution */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <div>
                                <span className="chart-card-title"><Tag size={18} /> Dépenses par Genre</span>
                                <div className="chart-card-subtitle">{genreData.length} genres différents</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genreData.slice(0, 6)} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                                            {genreData.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>{genreData.length}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Genres</div>
                                </div>
                            </div>
                            <div className="chart-legend" style={{ flex: 1 }}>
                                {genreData.slice(0, 6).map((item, i) => (
                                    <div key={item.name} className="legend-item">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="legend-dot" style={{ backgroundColor: COLORS[(i + 4) % COLORS.length] }}></span>
                                            <span className="legend-label">{item.name} ({item.count})</span>
                                        </div>
                                        <span className="legend-value">{item.value} €</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cumulative Spending */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <div>
                                <span className="chart-card-title"><TrendingUp size={18} /> Dépenses Cumulées</span>
                                <div className="chart-card-subtitle">Progression totale dans le temps</div>
                            </div>
                        </div>
                        <div style={{ height: '220px', marginTop: '1rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cumulativeData}>
                                    <defs>
                                        <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#facc15" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="value" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#cumulGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Games Bar Chart — Premium only */}
            {isPremium && (
                <div className="chart-card" style={{ marginBottom: '2rem' }}>
                    <div className="chart-card-header">
                        <div>
                            <span className="chart-card-title"><Gamepad2 size={18} /> Dépenses par Jeu</span>
                            <div className="chart-card-subtitle">Top 10 par dépenses totales</div>
                        </div>
                    </div>
                    <div style={{ height: '400px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gameData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#facc15" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" horizontal={false} />
                                <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                <YAxis type="category" dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} width={150} tick={{ fill: 'var(--color-text-dim)' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--hover-bg)' }} />
                                <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 12, 12, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
};

export default AnalyticsCharts;
