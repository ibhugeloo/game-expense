import React, { useState, useMemo } from 'react';
import { Filter, Search, Trash2, Edit2, Download, ChevronLeft, ChevronRight, Gamepad2, Clock } from 'lucide-react';
import { toEUR } from '../utils/currency';

const ITEMS_PER_PAGE = 20;

const TYPE_LABELS = {
    game: 'Jeu',
    dlc: 'DLC',
    skin: 'Skin',
    battle_pass: 'Battle Pass',
    currency: 'Monnaie',
    loot_box: 'Loot Box',
    subscription: 'Abo',
};

const TransactionList = ({ transactions, onDelete, onEdit, exchangeRate = 0.92, isPremium = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('All');
    const [status, setStatus] = useState('All');
    const [store, setStore] = useState('All');
    const [genre, setGenre] = useState('All');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [currency, setCurrency] = useState('All');
    const [type, setType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'purchase_date', direction: 'descending' });

    // Extract unique filter values from transactions
    const platforms = useMemo(() => ['All', ...new Set(transactions.map(t => t.platform).filter(Boolean))], [transactions]);
    const genres = useMemo(() => ['All', ...new Set(transactions.map(t => t.genre).filter(Boolean))], [transactions]);
    const stores = useMemo(() => ['All', ...new Set(transactions.map(t => t.store).filter(Boolean))], [transactions]);
    const currencies = useMemo(() => ['All', ...new Set(transactions.map(t => t.currency).filter(Boolean))], [transactions]);

    // Filter
    const filtered = useMemo(() => {
        return transactions.filter(t => {
            const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchPlatform = platform === 'All' || t.platform === platform;
            const matchStatus = status === 'All' || t.status === status;
            const matchStore = store === 'All' || t.store === store;
            const matchCurrency = currency === 'All' || t.currency === currency;
            const matchGenre = genre === 'All' || t.genre === genre;
            const matchType = type === 'All' || (t.type || 'game') === type;

            let matchDate = true;
            if (dateStart) matchDate = matchDate && new Date(t.purchase_date) >= new Date(dateStart);
            if (dateEnd) matchDate = matchDate && new Date(t.purchase_date) <= new Date(dateEnd);

            return matchSearch && matchPlatform && matchStatus && matchStore && matchCurrency && matchGenre && matchType && matchDate;
        });
    }, [transactions, searchTerm, platform, status, store, currency, genre, type, dateStart, dateEnd]);

    // Sort
    const sortedData = useMemo(() => {
        let items = [...filtered];
        if (sortConfig.key) {
            items.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'price') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                }
                if (sortConfig.key === 'purchase_date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                if (sortConfig.key === 'hours_played' || sortConfig.key === 'rating') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filtered, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset page on filter change
    React.useEffect(() => { setCurrentPage(1); }, [searchTerm, platform, status, store, genre, currency, type, dateStart, dateEnd]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '';

    const totalSpent = filtered.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);

    // CSV Export
    const exportCSV = () => {
        const headers = ['Date', 'Titre', 'Type', 'Plateforme', 'Prix', 'Devise', 'Lieu', 'Statut', 'Genre', 'Note', 'Heures', 'Notes'];
        const rows = sortedData.map(t => [
            t.purchase_date,
            `"${t.title}"`,
            t.type || 'game',
            t.platform,
            t.price,
            t.currency,
            `"${t.store || ''}"`,
            t.status,
            t.genre || '',
            t.rating || '',
            t.hours_played || 0,
            `"${(t.notes || '').replace(/"/g, '""')}"`,
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mosaic_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getCostPerHour = (t) => {
        const hours = parseFloat(t.hours_played) || 0;
        if (hours === 0) return null;
        const priceEur = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
        return priceEur / hours;
    };

    const getCostClass = (cph) => {
        if (cph === null) return '';
        if (cph <= 1) return 'great';
        if (cph <= 3) return 'good';
        if (cph <= 5) return 'okay';
        return 'expensive';
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            {/* Summary Banner */}
            <div style={{
                background: 'var(--color-primary-dim)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                borderLeft: '4px solid var(--color-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>Dépenses Filtrées</h4>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                        {sortedData.length} transactions
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {totalSpent.toFixed(2)} €
                    </div>
                    {isPremium && (
                        <button className="btn-export" onClick={exportCSV}>
                            <Download size={16} />
                            CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <Filter size={20} />
                    <h3>Filtres</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label>Rechercher</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                            <input type="text" placeholder="Titre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '36px' }} />
                        </div>
                    </div>
                    <div>
                        <label>Plateforme</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)}>
                            {platforms.map(p => <option key={p} value={p}>{p === 'All' ? 'Toutes' : p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Statut</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="All">Tous</option>
                            <option value="Backlog">Backlog</option>
                            <option value="Playing">En Cours</option>
                            <option value="Completed">Terminé</option>
                            <option value="Wishlist">Wishlist</option>
                            <option value="Abandoned">Abandonné</option>
                        </select>
                    </div>
                    <div>
                        <label>Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="All">Tous</option>
                            {Object.entries(TYPE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Genre</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)}>
                            {genres.map(g => <option key={g} value={g}>{g === 'All' ? 'Tous' : g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Lieu d'achat</label>
                        <select value={store} onChange={e => setStore(e.target.value)}>
                            {stores.map(s => <option key={s} value={s}>{s === 'All' ? 'Tous' : s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Du</label>
                        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                    </div>
                    <div>
                        <label>Au</label>
                        <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                    </div>
                    <div>
                        <label>Devise</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value)}>
                            {currencies.map(c => <option key={c} value={c}>{c === 'All' ? 'Toutes' : c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('purchase_date')}>Date{getSortIndicator('purchase_date')}</th>
                            <th onClick={() => requestSort('title')}>Jeu{getSortIndicator('title')}</th>
                            <th onClick={() => requestSort('platform')}>Plateforme{getSortIndicator('platform')}</th>
                            <th onClick={() => requestSort('price')}>Prix{getSortIndicator('price')}</th>
                            <th onClick={() => requestSort('rating')}>Note{getSortIndicator('rating')}</th>

                            <th onClick={() => requestSort('status')}>Statut{getSortIndicator('status')}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(t => {
                            const cph = getCostPerHour(t);
                            return (
                                <tr key={t.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.purchase_date).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div className="game-cell">
                                            {t.cover_url ? (
                                                <img src={t.cover_url} alt={t.title} className="game-cover-mini" />
                                            ) : (
                                                <div className="game-cover-placeholder">
                                                    <Gamepad2 size={16} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span className="game-title-text">{t.title}</span>
                                                    {(t.type && t.type !== 'game') && (
                                                        <span className={`badge-type badge-type-${t.type}`}>
                                                            {TYPE_LABELS[t.type] || t.type}
                                                        </span>
                                                    )}
                                                </div>
                                                {t.genre && t.genre !== 'Other' && (
                                                    <div className="game-genre-tag">{t.genre}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge" style={{ background: 'var(--card-highlight)' }}>{t.platform}</span></td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{parseFloat(t.price).toFixed(2)} {t.currency}</td>
                                    <td>
                                        {t.rating ? (
                                            <div className="rating-display">
                                                <span className="rating-star">{'★'.repeat(Math.min(t.rating, 5))}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>{t.rating}/10</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                        )}
                                    </td>

                                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn-icon-only" onClick={() => onEdit(t)}
                                                style={{ color: 'var(--color-primary)', background: 'var(--color-primary-dim)' }} title="Modifier">
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="btn-icon-only" onClick={() => onDelete(t.id)}
                                                style={{ color: 'var(--color-error)', background: 'var(--color-error-dim)' }} title="Supprimer">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {sortedData.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-dim)' }}>
                        <Gamepad2 size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>Aucun jeu trouvé.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let page;
                        if (totalPages <= 7) {
                            page = i + 1;
                        } else if (currentPage <= 4) {
                            page = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                            page = totalPages - 6 + i;
                        } else {
                            page = currentPage - 3 + i;
                        }
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page ? 'active' : ''}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight size={16} />
                    </button>

                    <span className="pagination-info">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)} sur {sortedData.length}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
