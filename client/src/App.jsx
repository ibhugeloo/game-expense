import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, LayoutGrid, Sun, Moon, Wallet, LogOut, Crown, Settings, Search, Bell } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
import { useProfile } from './hooks/useProfile';
import AuthScreen from './components/AuthScreen';
import UpgradeModal from './components/UpgradeModal';
import SettingsModal from './components/SettingsModal';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import BudgetWidget from './components/BudgetWidget';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { isPremium, limits, canAddTransaction, upgradeToPremium } = usePlan(user?.id);
  const { profile, updateProfile } = useProfile(user?.id);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [exchangeRate, setExchangeRate] = useState(0.92); // USD→EUR fallback
  const [budget, setBudget] = useState(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data.rates && data.rates.EUR) {
          setExchangeRate(data.rates.EUR);
        }
      } catch (err) {
        console.warn('Exchange rate fetch failed, using fallback:', err);
      }
    };
    fetchRate();
  }, []);

  // Fetch transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch budget for current month
  const fetchBudget = useCallback(async () => {
    const now = new Date();
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear())
        .single();

      if (data && !error) {
        setBudget(data);
      }
    } catch (err) {
      // No budget set — that's ok
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [fetchTransactions, fetchBudget]);

  // Get available years
  const availableYears = React.useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.purchase_date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  // Filter transactions by year
  const filteredByYear = React.useMemo(() => {
    if (yearFilter === 'All') return transactions;
    return transactions.filter(t => new Date(t.purchase_date).getFullYear() === parseInt(yearFilter));
  }, [transactions, yearFilter]);

  // Add or Update Transaction
  const handleSaveTransaction = async (transaction) => {
    const isEdit = !!editingTransaction;

    try {
      if (isEdit) {
        const { data, error } = await supabase
          .from('transactions')
          .update(transaction)
          .eq('id', editingTransaction.id)
          .select()
          .single();

        if (error) throw error;
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? data : t));
      } else {
        const { data, error } = await supabase
          .from('transactions')
          .insert({ ...transaction, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setTransactions(prev => [data, ...prev]);
      }

      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + (err.message || 'Unknown error'));
    }
  };

  // Save budget
  const handleSaveBudget = async (amount) => {
    const now = new Date();
    const budgetData = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: parseFloat(amount),
      currency: 'EUR',
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(budgetData, { onConflict: 'month,year,user_id' })
        .select()
        .single();

      if (error) throw error;
      setBudget(data);
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
      alert('Erreur budget: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet achat ?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen signIn={signIn} signUp={signUp} />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px', fontWeight: '500' }}>
            {profile.display_name || 'Solis'}
          </h2>
        </div>

        {/* Center Tabs - Solis Style */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--card-bg)',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--card-border)'
        }}>
          <button className="btn btn-secondary active" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>Overview</button>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', border: 'none' }}>Sales</button>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', border: 'none' }}>Inventory</button>
        </div>

        <div className="header-controls">
          {/* Year Filter */}
          <select
            className="year-filter-select"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="All">Toutes les années</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Search & Bell Icons */}
          <button className="btn-icon-only theme-toggle" title="Recherche">
            <Search size={18} />
          </button>
          <button className="btn-icon-only theme-toggle" title="Notifications">
            <Bell size={18} />
          </button>

          {/* User Avatar */}
          <button
            className="avatar-header-btn"
            onClick={() => setShowSettings(true)}
            title="Paramètres"
            style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--card-border)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-highlight)', cursor: 'pointer' }}
          >
            <span className="avatar-emoji" style={{ fontSize: '1.2rem' }}>{profile.avatar || '🎮'}</span>
          </button>

          {/* Budget Button — Premium only */}
          {isPremium && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowBudgetModal(true)}
              title="Définir le budget mensuel"
            >
              <Wallet size={18} />
              Budget
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => {
              if (!canAddTransaction(transactions.length)) {
                setShowUpgradeModal(true);
              } else {
                openAddModal();
              }
            }}
          >
            <Plus size={20} />
            Ajouter
          </button>

          {/* Upgrade button — Free only */}
          {!isPremium && (
            <button
              className="btn"
              onClick={() => setShowUpgradeModal(true)}
              title="Passer Premium"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: 'white',
                gap: '0.4rem',
                boxShadow: '0 2px 12px rgba(245,158,11,0.3)',
              }}
            >
              <Crown size={18} />
              Premium
            </button>
          )}

          {/* Settings button removed from header as avatar is now the trigger */}
        </div>
      </header>

      {/* Stats Cards */}
      <StatsOverview transactions={filteredByYear} exchangeRate={exchangeRate} />

      {/* Budget Widget — Premium only */}
      {isPremium && budget && (
        <BudgetWidget
          budget={budget}
          transactions={filteredByYear}
          exchangeRate={exchangeRate}
        />
      )}

      {/* Charts Section */}
      <AnalyticsCharts transactions={filteredByYear} exchangeRate={exchangeRate} isPremium={isPremium} />

      {/* Main Content */}
      <main>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : (
          <TransactionList
            transactions={filteredByYear}
            onDelete={deleteTransaction}
            onEdit={openEditModal}
            exchangeRate={exchangeRate}
            isPremium={isPremium}
          />
        )}
      </main>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="glass-modal">
            <div className="modal-header">
              <h2>{editingTransaction ? 'Modifier Transaction' : 'Nouvel Achat'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon-only modal-close">
                <X size={24} />
              </button>
            </div>
            <TransactionForm
              onAddTransaction={handleSaveTransaction}
              initialData={editingTransaction}
            />
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowBudgetModal(false) }}>
          <div className="glass-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Budget Mensuel</h2>
              <button onClick={() => setShowBudgetModal(false)} className="btn-icon-only modal-close">
                <X size={24} />
              </button>
            </div>
            <BudgetForm
              currentBudget={budget}
              onSave={handleSaveBudget}
            />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          currentPlan="free"
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          profile={profile}
          updateProfile={updateProfile}
          isPremium={isPremium}
          plan={isPremium ? 'premium' : 'free'}
          userEmail={user?.email}
          onSignOut={signOut}
          onCancelSubscription={async () => {
            try {
              await supabase
                .from('subscriptions')
                .update({ plan: 'free' })
                .eq('user_id', user.id);
              window.location.reload();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
}

// Simple inline budget form
function BudgetForm({ currentBudget, onSave }) {
  const [amount, setAmount] = useState(currentBudget?.amount || '');
  const now = new Date();
  const monthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(amount); }}>
      <p style={{ color: 'var(--color-text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Définir le budget pour <strong style={{ color: 'var(--color-text)' }}>{monthName}</strong>
      </p>
      <div className="form-group">
        <label>Montant (€)</label>
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
}

export default App;
