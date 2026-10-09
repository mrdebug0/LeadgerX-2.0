import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
  ChevronRight,
  Phone,
  Clock,
  Filter,
} from 'lucide-react';
import { Customer } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { api } from '../../api/client';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  onRefresh: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'udhaar' | 'recent' | 'nodues'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newName.trim() || !newPhone.trim()) {
      setErrorMsg('Customer name and phone number are required.');
      return;
    }

    setLoadingAdd(true);
    try {
      const created = await api.createCustomer({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim() || undefined,
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      onRefresh();
      onSelectCustomer(created.id);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create customer');
    } finally {
      setLoadingAdd(false);
    }
  };

  // Filter & Search
  let filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase().trim()) ||
      c.phone.includes(debouncedSearch.trim())
  );

  if (activeFilter === 'udhaar') {
    filtered = filtered.filter((c) => c.pendingUdhaar > 0);
  } else if (activeFilter === 'nodues') {
    filtered = filtered.filter((c) => c.pendingUdhaar === 0);
  } else if (activeFilter === 'recent') {
    filtered = [...filtered].sort((a, b) => {
      const tA = a.lastTransactionAt ? new Date(a.lastTransactionAt).getTime() : 0;
      const tB = b.lastTransactionAt ? new Date(b.lastTransactionAt).getTime() : 0;
      return tB - tA;
    });
  }

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.pendingUdhaar || 0), 0);
  const udhaarCount = customers.filter((c) => c.pendingUdhaar > 0).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers & Udhaar Ledgers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customers.length} total customers ·{' '}
            <span className="text-rose-600 font-semibold tabular-nums">
              ₹{totalOutstanding.toLocaleString('en-IN')} pending Udhaar
            </span>{' '}
            across {udhaarCount} accounts
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          New Customer
        </Button>
      </div>

      {/* 2. Search & Filter Bar (Matching reference mockup!) */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative grow">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setActiveFilter('udhaar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'udhaar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Udhaar ({udhaarCount})
          </button>
          <button
            onClick={() => setActiveFilter('recent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'recent'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveFilter('nodues')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'nodues'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            No Dues
          </button>
        </div>
      </div>

      {/* 3. Customer List Rows */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No matching customers found' : 'No customers in your store yet'}
          description={
            searchTerm
              ? `No customer records matched "${searchTerm}". Try a different name or phone number.`
              : 'Add your first customer to start tracking bills, payment history, and Udhaar.'
          }
          actionLabel="Add Customer"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filtered.map((cust) => {
            const initial = cust.name.charAt(0).toUpperCase();
            const hasUdhaar = cust.pendingUdhaar > 0;

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
                      hasUdhaar
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
                    {initial}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cust.name}
                      </h3>
                      {hasUdhaar && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{cust.phone}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">
                        {cust.lastTransactionType
                          ? `${cust.lastTransactionType} ${
                              cust.lastTransactionAt
                                ? '· ' +
                                  new Date(cust.lastTransactionAt).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''
                            }`
                          : 'No entries yet'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {hasUdhaar ? (
                      <div>
                        <p className="text-sm sm:text-base font-bold text-rose-600 tabular-nums">
                          ₹{cust.pendingUdhaar.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                          Pending
                        </span>
                      </div>
                    ) : cust.pendingUdhaar < 0 ? (
                      <div>
                        <p className="text-sm sm:text-base font-bold text-emerald-600 tabular-nums">
                          ₹{Math.abs(cust.pendingUdhaar).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          Advance
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                          ₹0
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400">
                          No dues
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Customer Profile"
        subtitle="Create a customer ledger to record bills and udhaar"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <Input
            label="Customer Full Name *"
            type="text"
            placeholder="e.g. Ramesh Sharma"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="Phone Number *"
            type="tel"
            placeholder="+91 98765 43210"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />

          <Input
            label="Address / Area (Optional)"
            type="text"
            placeholder="e.g. Flat 102, Block B, Main Market"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loadingAdd}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
