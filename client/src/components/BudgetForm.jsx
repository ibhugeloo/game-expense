import React, { useState } from 'react';

const BudgetForm = ({ currentBudget, onSave }) => {
    const [amount, setAmount] = useState(currentBudget?.amount || '');
    const now = new Date();
    const monthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(amount); }}>
            <p style={{ color: 'var(--color-text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Definir le budget pour <strong style={{ color: 'var(--color-text)' }}>{monthName}</strong>
            </p>
            <div className="form-group">
                <label>Montant (EUR)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Ex: 100"
                    step="0.01"
                    min="0"
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Sauvegarder
            </button>
        </form>
    );
};

export default BudgetForm;
