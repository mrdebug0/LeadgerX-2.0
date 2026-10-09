import React, { useState } from 'react';
import {
  Plus,
  Mic,
  Camera,
  Upload,
  FileText,
  Search,
  MessageSquare,
  Users,
  ChevronRight,
  Receipt,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Customer, Transaction } from '../../types';

interface DashboardViewProps {
  storeName: string;
  userName: string;
  customers: Customer[];
  transactions: Transaction[];
  onOpenAddEntry: (defaultType?: any) => void;
  onOpenVoiceEntry: () => void;
  onOpenScanBill: (mode?: 'camera' | 'upload') => void;
  onSelectCustomer: (customerId: string) => void;
  onNavigateEntries: () => void;
  onNavigateCustomers: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  storeName,
  userName,
  customers,
  transactions,
  onOpenAddEntry,
  onOpenVoiceEntry,
  onOpenScanBill,
  onSelectCustomer,
  onNavigateEntries,
  onNavigateCustomers,
}) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'udhaar' | 'recent' | 'nodues'>('all');

  // Time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Calculations for empty-state indicators and verified counter state
  const saleTransactionsCount = transactions.filter((t) => t.type === 'sale').length;
  const customersWithUdhaarCount = customers.filter((c) => c.pendingUdhaar > 0).length;
  const totalBalanceNumber = customers.reduce((sum, c) => sum + (c.pendingUdhaar || 0), 0);

  // Filtered customer list for quick counter search
  let filteredCusts = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase().trim()) ||
      c.phone.includes(customerSearch.trim())
  );

  if (filterMode === 'udhaar') {
    filteredCusts = filteredCusts.filter((c) => c.pendingUdhaar > 0);
  } else if (filterMode === 'nodues') {
    filteredCusts = filteredCusts.filter((c) => c.pendingUdhaar <= 0);
  } else if (filterMode === 'recent') {
    filteredCusts = [...filteredCusts].sort((a, b) => {
      const tA = a.lastTransactionAt ? new Date(a.lastTransactionAt).getTime() : 0;
      const tB = b.lastTransactionAt ? new Date(b.lastTransactionAt).getTime() : 0;
      return tB - tA;
    });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER: IDENTITY, BUSINESS CONTEXT & GREETING */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {greeting}, {userName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Store: <strong className="text-slate-800">{storeName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle status strip (guarantees e2e fresh account match when 0) */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-600 text-xs font-semibold border border-slate-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {saleTransactionsCount} bills recorded · {customersWithUdhaarCount} customers with dues · ₹{totalBalanceNumber.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PRIMARY ENTRY AREA: COMPACT POLISHED ACTION GROUP */}
      {/* Add Entry · Speak · Scan Bill · Upload Bill · Manual */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Business Actions
          </span>
          <span
            className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => onOpenAddEntry('sale')}
          >
            All Entry Types →
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* 1. Add Entry */}
          <button
            type="button"
            onClick={() => onOpenAddEntry('sale')}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border border-blue-500 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Add Entry</p>
              <p className="text-[10px] text-blue-100 mt-0.5">Quick Bill</p>
            </div>
          </button>

          {/* 2. Speak (Voice Entry) */}
          <button
            type="button"
            onClick={onOpenVoiceEntry}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Speak</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Voice Entry</p>
            </div>
          </button>

          {/* 3. Scan Bill */}
          <button
            type="button"
            onClick={() => onOpenScanBill('camera')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Scan Bill</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Camera OCR</p>
            </div>
          </button>

          {/* 4. Upload Bill */}
          <button
            type="button"
            onClick={() => onOpenScanBill('upload')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Upload Bill</p>
              <p className="text-[10px] text-slate-500 mt-0.5">PDF / Photo</p>
            </div>
          </button>

          {/* 5. Manual Entry */}
          <button
            type="button"
            onClick={() => onOpenAddEntry('sale')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center col-span-2 sm:col-span-1 group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Manual</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Form Entry</p>
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. DEDICATED CHAT SECTION: RECENT CHATS / CUSTOMER CONVERSATIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Customer Conversations</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {customers.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Recent chats, activity & ledgers</p>
          </div>

          {/* Customer Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative grow sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="search"
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterMode === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('udhaar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterMode === 'udhaar' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Udhaar
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('recent')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterMode === 'recent' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('nodues')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterMode === 'nodues' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Dues
              </button>
            </div>
          </div>
        </div>

        {/* Customer Conversation Items */}
        {filteredCusts.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Users className="w-9 h-9 mx-auto mb-2 opacity-30 text-blue-500" />
            <p className="text-xs font-bold text-slate-700">
              {customerSearch ? 'No matching customer chats found' : 'No customer conversations yet'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
              Add your first customer to start tracking bills, itemized sales, and chronological ledgers.
            </p>
            <button
              type="button"
              onClick={onNavigateCustomers}
              className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              + Create First Customer
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCusts.slice(0, 7).map((c) => {
              const initial = c.name.charAt(0).toUpperCase();
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCustomer(c.id)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.lastTransactionType ? (
                          <span className="capitalize">Last activity: {c.lastTransactionType}</span>
                        ) : (
                          c.phone
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      {c.pendingUdhaar > 0 ? (
                        <span className="text-xs font-bold text-rose-600 tabular-nums block">
                          ₹{c.pendingUdhaar} Udhaar
                        </span>
                      ) : c.pendingUdhaar < 0 ? (
                        <span className="text-xs font-bold text-emerald-600 tabular-nums block">
                          Advance Credit: ₹{Math.abs(c.pendingUdhaar)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 block">
                          No dues
                        </span>
                      )}
                      {c.lastTransactionAt && (
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(c.lastTransactionAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RECENT STORE ACTIVITY */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-400">Latest recorded business events</p>
          </div>
          <button
            type="button"
            onClick={onNavigateEntries}
            className="text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
          >
            All Entries ({transactions.length}) →
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-500" />
            <p className="text-xs font-semibold text-slate-600">No entries recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Record a sale bill or payment above to start your ledger.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((t) => {
              const isSale = t.type === 'sale';
              const isPayment = t.type === 'payment';
              const isNote = t.type === 'note';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (t.customerId) onSelectCustomer(t.customerId);
                    else onNavigateEntries();
                  }}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPayment
                          ? 'bg-emerald-50 text-emerald-600'
                          : isSale
                          ? 'bg-blue-50 text-blue-600'
                          : isNote
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPayment ? 'P' : isSale ? 'S' : isNote ? 'N' : 'E'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{t.customerName}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        #{t.billNumber} ·{' '}
                        {new Date(t.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 tabular-nums">
                      ₹{t.totalAmount.toLocaleString('en-IN')}
                    </p>
                    {t.udhaarAmount > 0 && (
                      <p className="text-[10px] text-rose-600 font-semibold tabular-nums">
                        ₹{t.udhaarAmount} Udhaar
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
