import React, { useState, useEffect, useRef } from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';

const GENRES = [
    'FPS', 'RPG', 'MOBA', 'Racing', 'Action-Adventure',
    'Rogue-like', 'Sports', 'Strategy', 'Gacha', 'Card Game',
    'Simulation', 'Horror', 'Puzzle', 'Platformer', 'Battle Royale', 'Other'
];

const TransactionForm = ({ onAddTransaction, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        platform: 'PC',
        price: '',
        currency: 'EUR',
        store: '',
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'Backlog',
        notes: '',
        genre: 'Other',
        rating: null,
        hours_played: 0,
        cover_url: null,
    });

    const [coverResults, setCoverResults] = useState([]);
    const [searchingCover, setSearchingCover] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                platform: initialData.platform || 'PC',
                price: initialData.price || '',
                currency: initialData.currency || 'EUR',
                store: initialData.store || '',
                purchase_date: initialData.purchase_date
                    ? initialData.purchase_date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                status: initialData.status || 'Backlog',
                notes: initialData.notes || '',
                genre: initialData.genre || 'Other',
                rating: initialData.rating || null,
                hours_played: initialData.hours_played || 0,
                cover_url: initialData.cover_url || null,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Debounced cover search on title change
        if (name === 'title' && value.length > 2) {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => searchCover(value), 600);
        }
    };

    const searchCover = async (query) => {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        if (!apiKey) return;

        setSearchingCover(true);
        try {
            const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=5`);
            const data = await res.json();
            if (data.results) {
                setCoverResults(data.results.map(g => ({
                    id: g.id,
                    name: g.name,
                    image: g.background_image,
                })));
            }
        } catch (err) {
            console.warn('RAWG search failed:', err);
        } finally {
            setSearchingCover(false);
        }
    };

    const selectCover = (url) => {
        setFormData(prev => ({ ...prev, cover_url: url }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddTransaction({
            ...formData,
            price: parseFloat(formData.price) || 0,
            hours_played: parseFloat(formData.hours_played) || 0,
            rating: formData.rating ? parseInt(formData.rating) : null,
        });
    };

    const setRating = (val) => {
        setFormData(prev => ({
            ...prev,
            rating: prev.rating === val ? null : val,
        }));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="form-group">
                    <label>Titre du Jeu</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-dim)' }} />
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ex: Elden Ring"
                            style={{ paddingLeft: '36px' }}
                            required
                        />
                    </div>
                    {/* Cover search results */}
                    {coverResults.length > 0 && (
                        <div className="cover-search-results">
                            {coverResults.map(g => g.image && (
                                <img
                                    key={g.id}
                                    src={g.image}
                                    alt={g.name}
                                    title={g.name}
                                    className={`cover-search-item ${formData.cover_url === g.image ? 'selected' : ''}`}
                                    onClick={() => selectCover(g.image)}
                                />
                            ))}
                        </div>
                    )}
                    {searchingCover && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Recherche de jaquettes...</p>}
                </div>

                {/* Date */}
                <div className="form-group">
                    <label>Date d'Achat</label>
                    <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Platform + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Plateforme</label>
                        <select name="platform" value={formData.platform} onChange={handleChange}>
                            <option value="PC">PC</option>
                            <option value="Steam">Steam</option>
                            <option value="PS5">PS5</option>
                            <option value="PS4">PS4</option>
                            <option value="Switch">Switch</option>
                            <option value="Xbox Series">Xbox Series</option>
                            <option value="Xbox One">Xbox One</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Statut</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Backlog">Backlog</option>
                            <option value="Playing">En Cours</option>
                            <option value="Completed">Terminé</option>
                            <option value="Wishlist">Liste de souhaits</option>
                            <option value="Abandoned">Abandonné</option>
                            <option value="DLC">DLC / Extension</option>
                        </select>
                    </div>
                </div>

                {/* Genre + Rating */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Genre</label>
                        <select name="genre" value={formData.genre} onChange={handleChange}>
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Note ({formData.rating || '—'}/10)</label>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setRating(n)}
                                    style={{ color: formData.rating >= n ? '#f59e0b' : 'var(--color-text-muted)' }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Price + Currency + Hours */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Prix</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Devise</label>
                        <select name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Heures jouées</label>
                        <input
                            type="number"
                            name="hours_played"
                            value={formData.hours_played}
                            onChange={handleChange}
                            placeholder="0"
                            step="0.5"
                            min="0"
                        />
                    </div>
                </div>

                {/* Store */}
                <div className="form-group">
                    <label>Lieu d'Achat</label>
                    <input
                        type="text"
                        name="store"
                        value={formData.store}
                        onChange={handleChange}
                        placeholder="Ex: Steam, Amazon, Instant Gaming"
                    />
                </div>

                {/* Notes */}
                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Commentaires..."
                        rows="2"
                    ></textarea>
                </div>

                {/* Selected Cover Preview */}
                {formData.cover_url && (
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={formData.cover_url} alt="Cover" style={{ width: 60, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, cover_url: null }))}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Retirer la jaquette
                        </button>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    {initialData ? 'Sauvegarder les modifications' : 'Ajouter Transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
