import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Plus,
  Mic,
  Camera,
  Upload,
  Sparkles,
  UserPlus,
  CreditCard,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  ChevronRight,
  User,
  Sliders,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { TransactionType } from '../../types';

export type AppView = 'dashboard' | 'chat' | 'customers' | 'entries' | 'reports' | 'notifications' | 'settings' | 'ai';

interface AppLayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  unreadNotificationsCount?: number;
  onOpenAddEntry: (type?: TransactionType) => void;
  onOpenVoiceEntry: () => void;
  onOpenScanBill: (mode?: 'camera' | 'upload') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onChangeView,
  unreadNotificationsCount = 0,
  onOpenAddEntry,
  onOpenVoiceEntry,
  onOpenScanBill,
  children,
}) => {
  const { user, store, logout } = useAuth();
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  // Desktop sidebar navigation items:
  // Dashboard, Chat, Customers, Entries, Reports, Notifications, Settings
  const desktopNavItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as AppView, label: 'Chat', icon: MessageSquare },
    { id: 'customers' as AppView, label: 'Customers', icon: Users },
    { id: 'entries' as AppView, label: 'Entries', icon: Receipt },
    { id: 'reports' as AppView, label: 'Reports', icon: BarChart3 },
    { id: 'notifications' as AppView, label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
  ];

  const creationOptions = [
    { id: 'customer', label: 'New Customer', icon: UserPlus, desc: 'Create new customer profile' },
    { id: 'sale', label: 'New Entry / Bill', icon: Receipt, desc: 'Record itemized customer sale' },
    { id: 'payment', label: 'Payment', icon: CreditCard, desc: 'Settle customer Udhaar' },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag, desc: 'Restock inventory from vendor' },
    { id: 'expense', label: 'Expense', icon: TrendingDown, desc: 'Shop rent, electricity, bills' },
    { id: 'income', label: 'Income', icon: TrendingUp, desc: 'Other business earnings' },
    { id: 'return', label: 'Return', icon: RotateCcw, desc: 'Returned items & credit' },
  ];

  const handleSelectPlusAction = (id: string) => {
    setIsPlusMenuOpen(false);
    if (id === 'customer') {
      onChangeView('customers');
    } else {
      onOpenAddEntry(id as TransactionType);
    }
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (Visible on md: and above) */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <span className="font-display text-sm tracking-tight">LX</span>
          </div>
          <div className="overflow-hidden">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              LeadgerX
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px]">
              {store?.name || 'Kirana Store'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="p-4 space-y-1 grow overflow-y-auto">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Bottom Card */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div
              onClick={() => setIsAccountMenuOpen(true)}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user?.name || 'Owner'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Staff'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOP HEADER (< md) */}
      {/* LeadgerX identity | Notifications | Avatar Account Button */}
      {/* ------------------------------------------------------------- */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            LX
          </div>
          <div>
            <span className="font-display text-base font-bold text-slate-900 tracking-tight block leading-tight">
              LeadgerX
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[130px]">
              {store?.name || 'Kirana Store'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => onChangeView('notifications')}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Profile / Avatar Button in top header */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
              aria-label="Account Menu"
            >
              {user?.name?.charAt(0) || 'S'}
            </button>

            {/* Compact Header Account Menu Popover */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {user?.role} · {store?.name}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onChangeView('settings');
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Store Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onChangeView('settings');
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span>Business Preferences</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Sign Out"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      <main className="grow p-3 sm:p-5 lg:p-6 pb-24 md:pb-6 overflow-y-auto">
        {children}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* REDESIGNED MOBILE BOTTOM NAVIGATION: Home | Chat | + | Customers | AI */}
      {/* ------------------------------------------------------------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 h-16 px-2 flex items-center justify-around z-40 pb-safe shadow-lg">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center w-14 py-1 cursor-pointer transition-colors ${
            currentView === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Chat */}
        <button
          type="button"
          onClick={() => onChangeView('chat')}
          className={`flex flex-col items-center justify-center w-14 py-1 cursor-pointer transition-colors ${
            currentView === 'chat' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        {/* 3. Center + Button (Primary Action Standout) */}
        <div className="relative -top-4">
          <button
            type="button"
            onClick={() => setIsPlusMenuOpen(true)}
            className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white active:scale-95 transition-transform cursor-pointer"
            aria-label="Create New Entry"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Customers */}
        <button
          type="button"
          onClick={() => onChangeView('customers')}
          className={`flex flex-col items-center justify-center w-14 py-1 cursor-pointer transition-colors ${
            currentView === 'customers' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Customers</span>
        </button>

        {/* 5. AI (Lightweight Entry Point) */}
        <button
          type="button"
          onClick={() => onChangeView('ai')}
          className={`flex flex-col items-center justify-center w-14 py-1 cursor-pointer transition-colors ${
            currentView === 'ai' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">AI</span>
        </button>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE + CREATION BOTTOM SHEET MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isPlusMenuOpen}
        onClose={() => setIsPlusMenuOpen(false)}
        title="Quick Create Action"
        subtitle="Record a transaction or create a customer"
        maxWidth="sm"
      >
        <div className="space-y-2 pt-1">
          {creationOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectPlusAction(opt.id)}
                className="w-full p-3 rounded-2xl border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-200 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                    <p className="text-[10px] text-slate-400">{opt.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
