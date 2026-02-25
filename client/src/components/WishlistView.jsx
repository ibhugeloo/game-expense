import React, { useMemo } from 'react';
import { Heart, ArrowRight, Pencil, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WishlistView = ({ transactions, onEdit, onDelete, onStatusChange, onAdd, exchangeRate }) => {
    const { t, i18n } = useTranslation();

    const totalValue = useMemo(() => {
        return transactions.reduce((sum, tx) => {
            const price = parseFloat(tx.price) || 0;
            if (tx.currency === 'USD') return sum + price * exchangeRate;
            if (tx.currency === 'GBP') return sum + price * exchangeRate * 1.27;
            if (tx.currency === 'JPY') return sum + price * exchangeRate * 0.0067;
            return sum + price;
        }, 0);
    }, [transactions, exchangeRate]);

    if (transactions.length === 0) {
        return (
            <div className="wishlist-empty">
                <div className="wishlist-empty-icon">
                    <Heart size={48} />
                </div>
                <h3>{t('wishlist.emptyTitle')}</h3>
                <p>{t('wishlist.emptyDescription')}</p>
                <button className="btn btn-primary" onClick={onAdd}>
                    <Plus size={18} />
                    {t('wishlist.addGame')}
                </button>
            </div>
        );
    }

    return (
        <div className="wishlist-section">
            <div className="wishlist-header">
                <div>
                    <h2 className="wishlist-title">{t('wishlist.title')}</h2>
                    <span className="wishlist-count">{t('wishlist.gamesCount', { count: transactions.length })}</span>
                </div>
                <div className="wishlist-value">
                    <span className="wishlist-value-label">{t('wishlist.estimatedValue')}</span>
                    <span className="wishlist-value-amount">{totalValue.toFixed(2)} &euro;</span>
                </div>
            </div>

            <div className="wishlist-grid">
                {transactions.map(tx => (
                    <div key={tx.id} className="wishlist-card">
                        {tx.cover_url ? (
                            <img src={tx.cover_url} alt={tx.title} className="wishlist-card-cover" />
                        ) : (
                            <div className="wishlist-card-placeholder">
                                <Heart size={28} />
                            </div>
                        )}
                        <div className="wishlist-card-info">
                            <h4 className="wishlist-card-title">{tx.title}</h4>
                            <div className="wishlist-card-tags">
                                {tx.platform && <span className="wishlist-tag">{tx.platform}</span>}
                                {tx.genre && <span className="wishlist-tag">{tx.genre}</span>}
                            </div>
                            {(tx.price !== null && tx.price !== undefined) && (
                                <div className="wishlist-card-price">
                                    {parseFloat(tx.price || 0).toFixed(2)} {tx.currency || 'EUR'}
                                </div>
                            )}
                        </div>
                        <div className="wishlist-card-actions">
                            <button
                                className="wishlist-action-btn wishlist-action-move"
                                onClick={() => onStatusChange(tx.id, 'Backlog')}
                                title={t('wishlist.moveToBacklog')}
                            >
                                <ArrowRight size={14} />
                            </button>
                            <button
                                className="wishlist-action-btn"
                                onClick={() => onEdit(tx)}
                                title={t('common.edit')}
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                className="wishlist-action-btn wishlist-action-delete"
                                onClick={() => onDelete(tx.id)}
                                title={t('common.delete')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistView;
