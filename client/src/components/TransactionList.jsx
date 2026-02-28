import React, { useState, useMemo } from 'react';
import { Filter, Search, Trash2, Edit2, Download, ChevronLeft, ChevronRight, Gamepad2, Clock } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatDate, getLocale } from '../utils/formatters';

const ITEMS_PER_PAGE = 20;

const TYPE_KEYS = {
    game: 'transactionTypesShort.game',
    dlc: 'transactionTypesShort.dlc',
    skin: 'transactionTypesShort.skin',
    battle_pass: 'transactionTypesShort.battle_pass',
    currency: 'transactionTypesShort.currency',
    loot_box: 'transactionTypesShort.loot_box',
    subscription: 'transactionTypesShort.subscription',
};

const TransactionList = ({ transactions, onDelete, onEdit, exchangeRate = 0.92, isPremium = false }) => {
    const { t, i18n } = useTranslation();
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
    const platforms = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.platform).filter(Boolean))], [transactions]);
    const genres = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.genre).filter(Boolean))], [transactions]);
    const stores = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.store).filter(Boolean))], [transactions]);
    const currencies = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.currency).filter(Boolean))], [transactions]);

    // Filter
    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const matchSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchPlatform = platform === 'All' || tx.platform === platform;
            const matchStatus = status === 'All' || tx.status === status;
            const matchStore = store === 'All' || tx.store === store;
            const matchCurrency = currency === 'All' || tx.currency === currency;
            const matchGenre = genre === 'All' || tx.genre === genre;
            const matchType = type === 'All' || (tx.type || 'game') === type;

            let matchDate = true;
            if (dateStart) matchDate = matchDate && new Date(tx.purchase_date) >= new Date(dateStart);
            if (dateEnd) matchDate = matchDate && new Date(tx.purchase_date) <= new Date(dateEnd);

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

    const totalSpent = filtered.reduce((acc, tx) => acc + toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate), 0);

    // CSV Export
    const exportCSV = () => {
        const headers = [
            t('transactions.date'), t('transactions.game'), t('transactions.type'),
            t('transactions.platform'), t('transactions.price'), t('transactions.currency'),
            t('transactions.store'), t('transactions.status'), t('transactions.genre'),
            t('transactions.rating'), t('form.hoursPlayed'), t('form.notes')
        ];
        const rows = sortedData.map(tx => [
            tx.purchase_date,
            `"${tx.title}"`,
            tx.type || 'game',
            tx.platform,
            tx.price,
            tx.currency,
            `"${tx.store || ''}"`,
            tx.status,
            tx.genre || '',
            tx.rating || '',
            tx.hours_played || 0,
            `"${(tx.notes || '').replace(/"/g, '""')}"`,
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

    const getCostPerHour = (tx) => {
        const hours = parseFloat(tx.hours_played) || 0;
        if (hours === 0) return null;
        const priceEur = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
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
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>{t('transactions.filteredExpenses')}</h4>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                        {sortedData.length} {t('transactions.transactions')}
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
                    <h3>{t('common.filters')}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label>{t('common.search')}</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                            <input type="text" placeholder={t('transactions.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '36px' }} />
                        </div>
                    </div>
                    <div>
                        <label>{t('transactions.platform')}</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)}>
                            {platforms.map(p => <option key={p} value={p}>{p === 'All' ? t('transactions.allPlatforms') : p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>{t('transactions.status')}</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="All">{t('transactions.allStatuses')}</option>
                            <option value="Backlog">{t('statusLabels.Backlog')}</option>
                            <option value="Playing">{t('statusLabels.Playing')}</option>
                            <option value="Completed">{t('statusLabels.Completed')}</option>
                            <option value="Wishlist">{t('statusLabels.Wishlist')}</option>
                            <option value="Abandoned">{t('statusLabels.Abandoned')}</option>
                        </select>
                    </div>
                    <div>
                        <label>{t('transactions.type')}</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="All">{t('transactions.allTypes')}</option>
                            {Object.entries(TYPE_KEYS).map(([val, key]) => (
                                <option key={val} value={val}>{t(key)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>{t('transactions.genre')}</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)}>
                            {genres.map(g => <option key={g} value={g}>{g === 'All' ? t('transactions.allGenres') : g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>{t('transactions.store')}</label>
                        <select value={store} onChange={e => setStore(e.target.value)}>
                            {stores.map(s => <option key={s} value={s}>{s === 'All' ? t('transactions.allStores') : s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>{t('transactions.dateFrom')}</label>
                        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                    </div>
                    <div>
                        <label>{t('transactions.dateTo')}</label>
                        <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                    </div>
                    <div>
                        <label>{t('transactions.currency')}</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value)}>
                            {currencies.map(c => <option key={c} value={c}>{c === 'All' ? t('transactions.allCurrencies') : c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('purchase_date')}>{t('transactions.date')}{getSortIndicator('purchase_date')}</th>
                            <th onClick={() => requestSort('title')}>{t('transactions.game')}{getSortIndicator('title')}</th>
                            <th onClick={() => requestSort('platform')}>{t('transactions.platform')}{getSortIndicator('platform')}</th>
                            <th onClick={() => requestSort('price')}>{t('transactions.price')}{getSortIndicator('price')}</th>
                            <th onClick={() => requestSort('rating')}>{t('transactions.rating')}{getSortIndicator('rating')}</th>

                            <th onClick={() => requestSort('status')}>{t('transactions.status')}{getSortIndicator('status')}</th>
                            <th>{t('transactions.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(tx => {
                            const cph = getCostPerHour(tx);
                            return (
                                <tr key={tx.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.purchase_date, i18n.language)}</td>
                                    <td>
                                        <div className="game-cell">
                                            {tx.cover_url ? (
                                                <img src={tx.cover_url} alt={tx.title} className="game-cover-mini" />
                                            ) : (
                                                <div className="game-cover-placeholder">
                                                    <Gamepad2 size={16} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="game-title-text">{tx.title}</div>
                                                {tx.genre && tx.genre !== 'Other' && (
                                                    <div className="game-genre-tag">{tx.genre}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`badge badge-platform-${tx.platform.toLowerCase().replace(/\s+/g, '-')}`}>{tx.platform}</span></td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{parseFloat(tx.price).toFixed(2)} {tx.currency}</td>
                                    <td>
                                        {tx.rating ? (
                                            <div className="rating-display">
                                                <span className="rating-star">{'★'.repeat(Math.min(tx.rating, 5))}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>{tx.rating}/10</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                        )}
                                    </td>

                                    <td>
                                        {(tx.type && tx.type !== 'game') ? (
                                            <span className={`badge-type badge-type-${tx.type}`}>
                                                {TYPE_KEYS[tx.type] ? t(TYPE_KEYS[tx.type]) : tx.type}
                                            </span>
                                        ) : (
                                            <span className={`badge badge-${tx.status}`}>{t(`statusLabels.${tx.status}`)}</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn-icon-only" onClick={() => onEdit(tx)}
                                                style={{ color: 'var(--color-primary)', background: 'var(--color-primary-dim)' }} title={t('common.edit')}>
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="btn-icon-only" onClick={() => onDelete(tx.id)}
                                                style={{ color: 'var(--color-error)', background: 'var(--color-error-dim)' }} title={t('common.delete')}>
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
                        <p>{t('transactions.noGamesFound')}</p>
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
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)} {t('transactions.of')} {sortedData.length}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
