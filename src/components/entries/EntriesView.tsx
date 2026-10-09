import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Receipt,
  Trash2,
  Calendar,
  Filter,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { api } from '../../api/client';

interface EntriesViewProps {
  transactions: Transaction[];
  onOpenAddEntry: (type?: TransactionType) => void;
  onRefresh: () => void;
}

export const EntriesView: React.FC<EntriesViewProps> = ({
  transactions,
  onOpenAddEntry,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this record? Authoritative customer balances will recalculate.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.deleteTransaction(id);
      if (selectedTx?.id === id) setSelectedTx(null);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.customerName && t.customerName.toLowerCase().includes(debouncedSearch.toLowerCase().trim())) ||
      (t.billNumber && t.billNumber.toLowerCase().includes(debouncedSearch.toLowerCase().trim())) ||
      (t.items && t.items.some((it) => it.name.toLowerCase().includes(debouncedSearch.toLowerCase().trim())));

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filterTabs = [
    { id: 'all', label: 'All Records' },
    { id: 'sale', label: 'Sales' },
    { id: 'payment', label: 'Payments' },
    { id: 'purchase', label: 'Purchases' },
    { id: 'expense', label: 'Expenses' },
    { id: 'return', label: 'Returns' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Entries & Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction records, itemized bills, and payment settlements
          </p>
        </div>

        <Button onClick={() => onOpenAddEntry('sale')} icon={<Plus className="w-4 h-4" />}>
          New Entry
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative grow">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bill #, customer name, or item description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={searchTerm ? 'No matching transactions' : 'No records yet'}
          description={
            searchTerm
              ? `No transactions match your search "${searchTerm}".`
              : 'Add your first sale, purchase, or expense to start keeping your accounts.'
          }
          actionLabel="Create Entry"
          onAction={() => onOpenAddEntry('sale')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filtered.map((t) => {
            const isSale = t.type === 'sale';
            const isPayment = t.type === 'payment';
            const isExpense = t.type === 'expense';
            const isPurchase = t.type === 'purchase';

            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isPayment
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : isSale
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : isExpense
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}
                  >
                    {isPayment ? (
                      <CreditCard className="w-5 h-5" />
                    ) : isSale ? (
                      <ShoppingCart className="w-5 h-5" />
                    ) : isExpense ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.type}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-600">
                        #{t.billNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-900">
                        {t.customerName || 'Direct Counter'}
                      </span>
                    </div>

                    {/* Items preview */}
                    {t.items && t.items.length > 0 ? (
                      <p className="text-xs text-slate-500 mt-1">
                        {t.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                      </p>
                    ) : t.notes ? (
                      <p className="text-xs text-slate-500 mt-1 italic">"{t.notes}"</p>
                    ) : null}

                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-13 sm:pl-0">
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900 tabular-nums">
                      ₹{t.totalAmount.toLocaleString('en-IN')}
                    </p>
                    {t.udhaarAmount > 0 ? (
                      <p className="text-[10px] text-rose-600 font-bold">
                        ₹{t.udhaarAmount} Udhaar
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Paid ({t.paymentMode})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDelete(t.id, e)}
                    disabled={deletingId === t.id}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
