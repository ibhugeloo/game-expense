import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Wallet, Crown, Search, Bell, Settings, Calendar, ChevronDown, LayoutGrid, Heart, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import OnboardingFlow from './components/OnboardingFlow';
import UpgradeModal from './components/UpgradeModal';
import SettingsModal from './components/SettingsModal';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import BudgetWidget from './components/BudgetWidget';
import BudgetForm from './components/BudgetForm';
import SearchOverlay from './components/SearchOverlay';
import NotificationDropdown from './components/NotificationDropdown';
import WishlistView from './components/WishlistView';
import Toast from './components/Toast';
import ImportModal from './components/ImportModal';
import OfflineBanner from './components/OfflineBanner';
import { exportTransactionsCsv } from './utils/exportCsv';
import { SkeletonStats, SkeletonChart, SkeletonTable } from './components/SkeletonLoader';
import { identifyUser, resetUser, trackEvent } from './posthog';

function App() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword, deleteAccount } = useAuth();
  const { isPremium, limits, canAddTransaction, createCheckoutSession, checkoutLoading, refreshPlan } = usePlan(user?.id);
  const { profile, loading: profileLoading, updateProfile, completeOnboarding } = useProfile(user?.id);
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
  const [showSearch, setShowSearch] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeView, setActiveView] = useState('all');

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  // Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setTimeout(() => refreshPlan(), 1500);
      window.history.replaceState({}, '', window.location.pathname);
    }
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

  // PostHog: identify user on login, reset on logout
  useEffect(() => {
    if (user) {
      identifyUser(user.id, { email: user.email });
    } else {
      resetUser();
    }
  }, [user]);

  // Fetch data on user change
  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [fetchTransactions, fetchBudget]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map(tx => new Date(tx.purchase_date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  // Filter transactions by year
  const filteredByYear = useMemo(() => {
    if (yearFilter === 'All') return transactions;
    return transactions.filter(tx => new Date(tx.purchase_date).getFullYear() === parseInt(yearFilter));
  }, [transactions, yearFilter]);

  // Games list (for parent game autocomplete)
  const gamesList = useMemo(() => {
    return transactions.filter(tx => tx.type === 'game' || !tx.type);
  }, [transactions]);

  // Wishlist transactions
  const wishlistTransactions = useMemo(() => {
    return transactions.filter(tx => tx.status === 'Wishlist');
  }, [transactions]);

  // Change transaction status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message }));
    }
  };

  // Add or Update Transaction
  const handleSaveTransaction = async (transaction) => {
    try {
      await saveTransaction(transaction, editingTransaction?.id);
      trackEvent(editingTransaction ? 'transaction_edited' : 'transaction_added', {
        type: transaction.type || 'game',
        currency: transaction.currency,
        platform: transaction.platform,
      });
      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message || t('errors.unknownError') }));
    }
  };

  // Save budget
  const handleSaveBudget = async (amount) => {
    try {
      await saveBudget(amount);
      trackEvent('budget_set', { amount });
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
      showToast(t('errors.budgetError', { message: err.message }));
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
    if (!window.confirm(t('transactions.confirmDelete'))) return;
    try {
      await deleteTransaction(id);
      trackEvent('transaction_deleted');
    } catch (err) {
      console.error(err);
      showToast(t('transactions.deleteError'));
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage signIn={signIn} signUp={signUp} resetPassword={resetPassword} />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  // Wait for profile to load before deciding onboarding vs dashboard
  if (profileLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!profile.onboarding_completed) {
    return <OnboardingFlow profile={profile} onComplete={completeOnboarding} />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="avatar-header-btn"
            onClick={() => setShowSettings(true)}
            title={t('header.settings')}
            style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--card-border)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-highlight)', cursor: 'pointer' }}
          >
            <span className="avatar-emoji" style={{ fontSize: '1.2rem' }}>{profile.avatar || '🎮'}</span>
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px', fontWeight: '500' }}>
            {profile.display_name || 'Solis'}
          </h2>
          <div className="view-tabs">
            <button className={`view-tab ${activeView === 'all' ? 'active' : ''}`} onClick={() => setActiveView('all')}>
              <LayoutGrid size={14} />
              {t('header.viewAll')}
            </button>
            <button className={`view-tab ${activeView === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveView('wishlist')}>
              <Heart size={14} />
              {t('header.viewWishlist')}
              {wishlistTransactions.length > 0 && (
                <span className="view-tab-count">{wishlistTransactions.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="header-controls">
          {/* Year Filter — compact pill */}
          <div className="year-pill-wrapper">
            <Calendar size={14} className="year-pill-icon" />
            <select
              className="year-pill-select"
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
            >
              <option value="All">{t('header.allYears')}</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={12} className="year-pill-chevron" />
          </div>

          {/* Icon buttons */}
          <button className="btn-icon-only theme-toggle" onClick={() => setShowSearch(true)} title={t('common.search')}>
            <Search size={18} />
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon-only theme-toggle"
              onClick={() => setShowNotifications(prev => !prev)}
              title={t('header.notifications')}
            >
              <Bell size={18} />
              {isPremium && budget && (() => {
                const now = new Date();
                const monthSpent = transactions
                  .filter(tx => { const d = new Date(tx.purchase_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
                  .reduce((sum, tx) => sum + (parseFloat(tx.price) || 0), 0);
                return monthSpent / budget.amount >= 0.8 ? <span className="notif-dot" /> : null;
              })()}
            </button>
            {showNotifications && (
              <NotificationDropdown
                transactions={transactions}
                budget={budget}
                exchangeRate={exchangeRate}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          <button className="btn-icon-only theme-toggle" onClick={() => setShowSettings(true)} title={t('header.settings')}>
            <Settings size={18} />
          </button>

          {/* Budget Button — Premium only */}
          {isPremium && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowBudgetModal(true)}
              title={t('header.setBudget')}
            >
              <Wallet size={18} />
              {t('header.budget')}
            </button>
          )}

          {/* Export CSV — Premium only */}
          {isPremium && (
            <button
              className="btn-icon-only theme-toggle"
              onClick={() => { exportTransactionsCsv(filteredByYear); trackEvent('csv_exported', { count: filteredByYear.length }); }}
              title={t('header.exportCsv')}
            >
              <Download size={18} />
            </button>
          )}

          {/* Import */}
          <button
            className="btn-icon-only theme-toggle"
            onClick={() => setShowImport(true)}
            title={t('header.import')}
          >
            <Upload size={18} />
          </button>

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
            {t('header.addTransaction')}
          </button>

          {/* Upgrade button — Free only */}
          {!isPremium && (
            <button
              className="btn"
              onClick={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }}
              title={t('header.upgradeToPremium')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: 'white',
                gap: '0.4rem',
                boxShadow: '0 2px 12px rgba(245,158,11,0.3)',
              }}
            >
              <Crown size={18} />
              {t('header.premium')}
            </button>
          )}
        </div>
      </header>

      {activeView === 'all' ? (
        loading ? (
          <>
            <SkeletonStats />
            <SkeletonChart />
            <SkeletonTable />
          </>
        ) : (
          <>
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
              <TransactionList
                transactions={filteredByYear}
                onDelete={handleDelete}
                onEdit={openEditModal}
                exchangeRate={exchangeRate}
                isPremium={isPremium}
              />
            </main>
          </>
        )
      ) : (
        <WishlistView
          transactions={wishlistTransactions}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onAdd={openAddModal}
          exchangeRate={exchangeRate}
        />
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="glass-modal">
            <div className="modal-header">
              <h2>{editingTransaction ? t('transactions.editTransaction') : t('transactions.newPurchase')}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon-only modal-close">
                <X size={24} />
              </button>
            </div>
            <TransactionForm
              onAddTransaction={handleSaveTransaction}
              initialData={editingTransaction}
              games={gamesList}
            />
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowBudgetModal(false) }}>
          <div className="glass-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{t('budget.monthlyBudget')}</h2>
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
          onCheckout={createCheckoutSession}
          checkoutLoading={checkoutLoading}
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
          onDeleteAccount={deleteAccount}
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
              showToast(t('settings.subscription.cancelError'));
            }
          }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onClose={() => { setShowImport(false); fetchTransactions(); }}
          userId={user.id}
        />
      )}

      {/* Search Overlay */}
      {showSearch && (
        <SearchOverlay
          transactions={transactions}
          onSelect={openEditModal}
          onClose={() => setShowSearch(false)}
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

      {/* Offline banner */}
      <OfflineBanner />
    </div>
  );
}

export default App;
