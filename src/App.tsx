import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketingPage } from './components/marketing/MarketingPage';
import { AuthPages } from './components/auth/AuthPages';
import { AppLayout, AppView } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChatView } from './components/chat/ChatView';
import { CustomersView } from './components/customers/CustomersView';
import { CustomerDetailView } from './components/customers/CustomerDetailView';
import { EntriesView } from './components/entries/EntriesView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { AIView } from './components/ai/AIView';
import { AddEntryModal, AddEntryDraftData } from './components/entries/AddEntryModal';
import { BillScanModal } from './components/entries/BillScanModal';
import { VoiceEntryModal } from './components/entries/VoiceEntryModal';
import { Customer, Transaction, TransactionType } from './types';
import { api } from './api/client';

function AppContent() {
  const { user, store, loading, logout, refreshStore, demoLogin } = useAuth();

  // Navigation states with persistence
  const [publicRoute, setPublicRoute] = useState<'marketing' | 'login' | 'signup'>('marketing');
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return (localStorage.getItem('leadgerx_view') as any) || 'dashboard';
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
    return localStorage.getItem('leadgerx_selected_customer_id');
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Modals
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [addEntryType, setAddEntryType] = useState<TransactionType>('sale');
  const [addEntryCustomerId, setAddEntryCustomerId] = useState<string | undefined>(undefined);
  const [fallbackDraftData, setFallbackDraftData] = useState<AddEntryDraftData | null>(null);

  const [isScanBillOpen, setIsScanBillOpen] = useState(false);
  const [scanBillMode, setScanBillMode] = useState<'camera' | 'upload'>('camera');
  const [isVoiceEntryOpen, setIsVoiceEntryOpen] = useState(false);

  // Load app data when user is logged in
  useEffect(() => {
    if (user) {
      const savedView = localStorage.getItem('leadgerx_view') as any;
      if (!savedView) {
        setCurrentView('dashboard');
        setSelectedCustomerId(null);
      }
      loadAppData();
    }
  }, [user]);

  const loadAppData = async () => {
    try {
      const [cList, tList, nList] = await Promise.all([
        api.getCustomers(),
        api.getTransactions(),
        api.getNotifications(),
      ]);
      setCustomers(cList);
      setTransactions(tList);
      setUnreadNotifsCount(nList.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  const handleOpenAddEntry = (type: TransactionType = 'sale', customerId?: string) => {
    setFallbackDraftData(null);
    setAddEntryType(type);
    const targetCId = customerId || selectedCustomerId || undefined;
    setAddEntryCustomerId(targetCId);
    setIsAddEntryOpen(true);
  };

  const handleSelectCustomer = (id: string | null) => {
    setSelectedCustomerId(id);
    if (id) {
      localStorage.setItem('leadgerx_selected_customer_id', id);
    } else {
      localStorage.removeItem('leadgerx_selected_customer_id');
    }
  };

  const handleSelectCustomerFromDashboard = (id: string) => {
    handleSelectCustomer(id);
    setCurrentView('chat');
    localStorage.setItem('leadgerx_view', 'chat');
  };

  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
    localStorage.removeItem('leadgerx_selected_customer_id');
    loadAppData();
  };

  const handleChangeView = (view: AppView) => {
    if (view !== 'chat' && view !== 'customers') {
      setSelectedCustomerId(null);
      localStorage.removeItem('leadgerx_selected_customer_id');
    }
    setCurrentView(view);
    localStorage.setItem('leadgerx_view', view);
  };

  const handleEntrySuccess = (customerId?: string) => {
    loadAppData();
    setRefreshKey((k) => k + 1);
    if (customerId) {
      handleSelectCustomer(customerId);
    }
  };

  // If session is loading, show minimal splash
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-display font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
            LX
          </div>
          <p className="text-xs font-semibold text-slate-500">Initializing LeadgerX...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 1. PUBLIC EXPERIENCE: Marketing Website & Separate Auth
  // -----------------------------------------------------------------
  if (!user) {
    if (publicRoute === 'login') {
      return (
        <AuthPages
          initialMode="login"
          onNavigateHome={() => setPublicRoute('marketing')}
          onSuccess={() => {
            // Logged in
          }}
        />
      );
    }

    if (publicRoute === 'signup') {
      return (
        <AuthPages
          initialMode="signup"
          onNavigateHome={() => setPublicRoute('marketing')}
          onSuccess={() => {
            // Logged in
          }}
        />
      );
    }

    return (
      <MarketingPage
        onNavigateLogin={() => setPublicRoute('login')}
        onNavigateSignup={() => setPublicRoute('signup')}
        onStartDemo={async () => {
          try {
            await demoLogin();
          } catch (err) {
            console.error('Failed demo login:', err);
          }
        }}
      />
    );
  }

  // -----------------------------------------------------------------
  // 2. AUTHENTICATED APPLICATION
  // -----------------------------------------------------------------
  return (
    <AppLayout
      currentView={currentView}
      onChangeView={handleChangeView}
      unreadNotificationsCount={unreadNotifsCount}
      onOpenAddEntry={handleOpenAddEntry}
      onOpenVoiceEntry={() => setIsVoiceEntryOpen(true)}
      onOpenScanBill={(mode) => {
        setScanBillMode(mode || 'camera');
        setIsScanBillOpen(true);
      }}
    >
      {/* 1. Dashboard (Home) View */}
      {currentView === 'dashboard' && (
        <DashboardView
          storeName={store?.name || 'My Store'}
          userName={user.name}
          customers={customers}
          transactions={transactions}
          onOpenAddEntry={handleOpenAddEntry}
          onOpenVoiceEntry={() => setIsVoiceEntryOpen(true)}
          onOpenScanBill={(mode) => {
            setScanBillMode(mode || 'camera');
            setIsScanBillOpen(true);
          }}
          onSelectCustomer={handleSelectCustomerFromDashboard}
          onNavigateEntries={() => handleChangeView('entries')}
          onNavigateCustomers={() => handleChangeView('customers')}
        />
      )}

      {/* 2. Chat-First Customer View */}
      {currentView === 'chat' && (
        <ChatView
          key={`chat_${refreshKey}`}
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onOpenAddEntry={(type, cId) => handleOpenAddEntry(type || 'sale', cId || selectedCustomerId || undefined)}
          onOpenScanBill={(mode) => {
            setScanBillMode(mode || 'camera');
            setAddEntryCustomerId(selectedCustomerId || undefined);
            setIsScanBillOpen(true);
          }}
          onOpenVoiceEntry={() => {
            setAddEntryCustomerId(selectedCustomerId || undefined);
            setIsVoiceEntryOpen(true);
          }}
          onRefresh={loadAppData}
          onNavigateCustomers={() => handleChangeView('customers')}
        />
      )}

      {/* 3. Customers View & Detail Timeline */}
      {currentView === 'customers' && (
        selectedCustomerId ? (
          <CustomerDetailView
            key={`${selectedCustomerId}_${refreshKey}`}
            customerId={selectedCustomerId}
            onBack={handleBackToCustomers}
            onAddEntryForCustomer={(cId, defType) => handleOpenAddEntry(defType || 'sale', cId)}
            onOpenScanBillForCustomer={(cId) => {
              setAddEntryCustomerId(cId);
              setScanBillMode('camera');
              setIsScanBillOpen(true);
            }}
            onOpenVoiceEntryForCustomer={(cId) => {
              setAddEntryCustomerId(cId);
              setIsVoiceEntryOpen(true);
            }}
          />
        ) : (
          <CustomersView
            customers={customers}
            onSelectCustomer={(id) => {
              setSelectedCustomerId(id);
              localStorage.setItem('leadgerx_selected_customer_id', id);
            }}
            onRefresh={loadAppData}
          />
        )
      )}

      {/* 4. AI Assistant View */}
      {currentView === 'ai' && (
        <AIView
          customers={customers}
          transactions={transactions}
          onOpenVoiceEntry={() => setIsVoiceEntryOpen(true)}
          onOpenScanBill={(mode) => {
            setScanBillMode(mode || 'camera');
            setIsScanBillOpen(true);
          }}
          onSelectCustomer={(id) => {
            handleSelectCustomer(id);
            setCurrentView('chat');
            localStorage.setItem('leadgerx_view', 'chat');
          }}
        />
      )}

      {/* 5. Entries View */}
      {currentView === 'entries' && (
        <EntriesView
          transactions={transactions}
          onOpenAddEntry={handleOpenAddEntry}
          onRefresh={loadAppData}
        />
      )}

      {/* 6. Reports View */}
      {currentView === 'reports' && <ReportsView />}

      {/* 7. Notifications View */}
      {currentView === 'notifications' && <NotificationsView />}

      {/* 8. Settings View */}
      {currentView === 'settings' && store && (
        <SettingsView
          store={store}
          currentUser={user}
          onStoreUpdated={() => {
            refreshStore();
            loadAppData();
          }}
          onLogout={() => {
            localStorage.removeItem('leadgerx_selected_customer_id');
            localStorage.removeItem('leadgerx_view');
            logout();
          }}
        />
      )}

      {/* Global Entry Modals */}
      <AddEntryModal
        isOpen={isAddEntryOpen}
        onClose={() => {
          setIsAddEntryOpen(false);
          setFallbackDraftData(null);
        }}
        onSuccess={(cId) => handleEntrySuccess(cId || addEntryCustomerId || selectedCustomerId || undefined)}
        preselectedCustomerId={addEntryCustomerId || selectedCustomerId || undefined}
        preselectedType={addEntryType}
        initialDraftData={fallbackDraftData}
      />

      <BillScanModal
        isOpen={isScanBillOpen}
        onClose={() => setIsScanBillOpen(false)}
        onSuccess={(cId) => handleEntrySuccess(cId || addEntryCustomerId || selectedCustomerId || undefined)}
        customers={customers}
        initialMode={scanBillMode}
        preselectedCustomerId={addEntryCustomerId || selectedCustomerId || undefined}
        onFallbackToManual={(partial) => {
          setIsScanBillOpen(false);
          setFallbackDraftData(partial || null);
          setAddEntryType(partial?.type || 'purchase');
          setAddEntryCustomerId(partial?.customerId || addEntryCustomerId || selectedCustomerId || undefined);
          setIsAddEntryOpen(true);
        }}
      />

      <VoiceEntryModal
        isOpen={isVoiceEntryOpen}
        onClose={() => setIsVoiceEntryOpen(false)}
        onSuccess={(cId) => handleEntrySuccess(cId || addEntryCustomerId || selectedCustomerId || undefined)}
        customers={customers}
        preselectedCustomerId={addEntryCustomerId || selectedCustomerId || undefined}
        onFallbackToManual={(partial) => {
          setIsVoiceEntryOpen(false);
          setFallbackDraftData(partial || null);
          setAddEntryType(partial?.type || 'sale');
          setAddEntryCustomerId(partial?.customerId || addEntryCustomerId || selectedCustomerId || undefined);
          setIsAddEntryOpen(true);
        }}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
