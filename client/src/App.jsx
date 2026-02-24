import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Wallet, Crown, Search, Bell } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import AuthScreen from './components/AuthScreen';
import UpgradeModal from './components/UpgradeModal';
import SettingsModal from './components/SettingsModal';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import BudgetWidget from './components/BudgetWidget';
import BudgetForm from './components/BudgetForm';
import Toast from './components/Toast';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { isPremium, limits, canAddTransaction, refreshPlan } = usePlan(user?.id);
  const { profile, updateProfile } = useProfile(user?.id);
  const { transactions, loading, fetchTransactions, saveTransaction, deleteTransaction } = useTransactions(user?.id);
  const { budget, fetchBudget, saveBudget } = useBudget(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [exchangeRate, setExchangeRate] = useState(0.92);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

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

  // Fetch data on user change
  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [fetchTransactions, fetchBudget]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.purchase_date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  // Filter transactions by year
  const filteredByYear = useMemo(() => {
    if (yearFilter === 'All') return transactions;
    return transactions.filter(t => new Date(t.purchase_date).getFullYear() === parseInt(yearFilter));
  }, [transactions, yearFilter]);

  // Add or Update Transaction
  const handleSaveTransaction = async (transaction) => {
    try {
      await saveTransaction(transaction, editingTransaction?.id);
      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      showToast('Erreur: ' + (err.message || 'Erreur inconnue'));
    }
  };

  // Save budget
  const handleSaveBudget = async (amount) => {
    try {
      await saveBudget(amount);
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
      showToast('Erreur budget: ' + err.message);
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
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet achat ?')) return;
    try {
      await deleteTransaction(id);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression');
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
            onDelete={handleDelete}
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
              await refreshPlan();
              setShowSettings(false);
            } catch (err) {
              console.error(err);
              showToast('Erreur lors de l\'annulation');
            }
          }}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
