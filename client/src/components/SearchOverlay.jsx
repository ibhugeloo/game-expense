import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';

const TYPE_KEYS = {
    game: 'transactionTypesShort.game',
    dlc: 'transactionTypesShort.dlc',
    skin: 'transactionTypesShort.skin',
    battle_pass: 'transactionTypesShort.battle_pass',
    currency: 'transactionTypesShort.currency',
    loot_box: 'transactionTypesShort.loot_box',
    subscription: 'transactionTypesShort.subscription',
};

const SearchOverlay = ({ transactions, onSelect, onClose }) => {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const results = useMemo(() => {
        if (query.length < 2) return [];
        const q = query.toLowerCase();
        return transactions
            .filter(tx => tx.title.toLowerCase().includes(q))
            .slice(0, 12);
    }, [query, transactions]);

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ alignItems: 'flex-start', paddingTop: '12vh' }}>
            <div className="search-overlay-panel">
                {/* Search input */}
                <div className="search-overlay-input-wrap">
                    <Search size={20} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="search-overlay-input"
                    />
                    <kbd className="search-overlay-kbd">ESC</kbd>
                </div>

                {/* Results */}
                {query.length >= 2 && (
                    <div className="search-overlay-results">
                        {results.length === 0 ? (
                            <div className="search-overlay-empty">
                                {t('search.noResults')}
                            </div>
                        ) : (
                            results.map(tx => (
                                <button
                                    key={tx.id}
                                    className="search-overlay-item"
                                    onClick={() => { onSelect(tx); onClose(); }}
                                >
                                    {tx.cover_url ? (
                                        <img src={tx.cover_url} alt="" className="search-overlay-cover" />
                                    ) : (
                                        <div className="search-overlay-cover-placeholder">
                                            <Gamepad2 size={14} />
                                        </div>
                                    )}
                                    <div className="search-overlay-item-info">
                                        <div className="search-overlay-item-title">{tx.title}</div>
                                        <div className="search-overlay-item-meta">
                                            <span className={`badge-type badge-type-${tx.type || 'game'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                                {TYPE_KEYS[tx.type] ? t(TYPE_KEYS[tx.type]) : tx.type}
                                            </span>
                                            <span>{tx.platform}</span>
                                            <span>{formatDate(tx.purchase_date, i18n.language)}</span>
                                        </div>
                                    </div>
                                    <div className="search-overlay-item-price">
                                        {parseFloat(tx.price || 0).toFixed(2)} {tx.currency || '€'}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {query.length < 2 && (
                    <div className="search-overlay-hint">
                        {t('search.hint')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
