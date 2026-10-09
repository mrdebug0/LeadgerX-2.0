import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Plus,
  Users,
  ChevronRight,
  UserPlus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Customer, TransactionType } from '../../types';
import { CustomerConversation } from './CustomerConversation';
import { Button } from '../ui/Button';

interface ChatViewProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string | null) => void;
  onOpenAddEntry: (type?: TransactionType, customerId?: string) => void;
  onOpenScanBill: (mode?: 'camera' | 'upload') => void;
  onOpenVoiceEntry: () => void;
  onRefresh: () => void;
  onNavigateCustomers?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenAddEntry,
  onOpenScanBill,
  onOpenVoiceEntry,
  onRefresh,
  onNavigateCustomers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'udhaar' | 'recent' | 'nodues'>('all');

  // Filter and sort customer conversations
  let filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.phone.includes(searchQuery.trim())
  );

  if (filterMode === 'udhaar') {
    filtered = filtered.filter((c) => c.pendingUdhaar > 0);
  } else if (filterMode === 'nodues') {
    filtered = filtered.filter((c) => c.pendingUdhaar <= 0);
  } else if (filterMode === 'recent') {
    filtered = [...filtered].sort((a, b) => {
      const tA = a.lastTransactionAt ? new Date(a.lastTransactionAt).getTime() : 0;
      const tB = b.lastTransactionAt ? new Date(b.lastTransactionAt).getTime() : 0;
      return tB - tA;
    });
  }

  // Conversation list sidebar / left panel
  const renderConversationList = () => (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Chats</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {customers.length}
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Timelines & Ledgers</p>
        </div>

        {onNavigateCustomers && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateCustomers}
            icon={<UserPlus className="w-3.5 h-3.5" />}
            className="text-xs py-1.5 px-2.5"
          >
            New
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-slate-100 space-y-2 shrink-0 bg-slate-50/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('udhaar')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'udhaar'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Udhaar
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('recent')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('nodues')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'nodues'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            No Dues
          </button>
        </div>
      </div>

      {/* Customer Conversation List Items */}
      <div className="grow overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-500" />
            <p className="text-xs font-semibold text-slate-700">No conversations found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {searchQuery ? 'Try another search term' : 'Add a customer to begin'}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = selectedCustomerId === c.id;
            const initial = c.name.charAt(0).toUpperCase();

            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.lastTransactionType ? (
                        <span className="capitalize">Last: {c.lastTransactionType}</span>
                      ) : (
                        c.phone
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {c.pendingUdhaar > 0 ? (
                    <span className="text-xs font-bold text-rose-600 tabular-nums block">
                      ₹{c.pendingUdhaar}
                    </span>
                  ) : c.pendingUdhaar < 0 ? (
                    <span className="text-xs font-bold text-emerald-600 tabular-nums block">
                      Advance
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 block">
                      No dues
                    </span>
                  )}
                  {c.lastTransactionAt && (
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {new Date(c.lastTransactionAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-7xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP 2-PANEL LAYOUT (md: and above) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:grid md:grid-cols-12 gap-5 h-full">
        {/* Left Panel: Conversation List (4 cols) */}
        <div className="col-span-4 h-full overflow-hidden">
          {renderConversationList()}
        </div>

        {/* Right Panel: Selected Conversation (8 cols) */}
        <div className="col-span-8 h-full overflow-hidden">
          {selectedCustomerId ? (
            <CustomerConversation
              key={selectedCustomerId}
              customerId={selectedCustomerId}
              onBack={() => onSelectCustomer(null)}
              onAddEntry={(type) => onOpenAddEntry(type, selectedCustomerId)}
              onOpenScanBill={onOpenScanBill}
              onOpenVoiceEntry={onOpenVoiceEntry}
              onRefreshParent={onRefresh}
              isTwoPanel={true}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/10">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Customer Conversation Workspace</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Select a customer from the left list to review their chronological ledger timeline, bill records, voice notes, and balances.
              </p>
              {customers.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => onSelectCustomer(customers[0].id)}
                  className="mt-4"
                >
                  Open {customers[0].name}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE LAYOUT (< md) */}
      {/* If customer is selected: full-screen conversation with back */}
      {/* If no customer is selected: conversation list */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden h-full">
        {selectedCustomerId ? (
          <CustomerConversation
            key={selectedCustomerId}
            customerId={selectedCustomerId}
            onBack={() => onSelectCustomer(null)}
            onAddEntry={(type) => onOpenAddEntry(type, selectedCustomerId)}
            onOpenScanBill={onOpenScanBill}
            onOpenVoiceEntry={onOpenVoiceEntry}
            onRefreshParent={onRefresh}
            isTwoPanel={false}
          />
        ) : (
          renderConversationList()
        )}
      </div>
    </div>
  );
};
