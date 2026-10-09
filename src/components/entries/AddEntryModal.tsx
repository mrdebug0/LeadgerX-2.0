import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Plus,
  Trash2,
  UserPlus,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Customer, Product, TransactionType } from '../../types';
import { api } from '../../api/client';

export interface AddEntryDraftData {
  customerId?: string;
  customerName?: string;
  type?: TransactionType;
  items?: Array<{ name: string; quantity: number; unitPrice: number | ''; total: number }>;
  totalAmount?: number;
  paidAmount?: number;
  udhaarAmount?: number;
  notes?: string;
  billNumber?: string;
}

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerId?: string) => void;
  preselectedCustomerId?: string;
  preselectedType?: TransactionType;
  initialDraftData?: AddEntryDraftData | null;
}

interface EditableItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | '';
  total: number;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
  preselectedType = 'sale',
  initialDraftData,
}) => {
  const [type, setType] = useState<TransactionType>(preselectedType);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Items for sale/purchase/return
  const [items, setItems] = useState<EditableItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: '', total: 0 },
  ]);

  // Direct payment or single-amount entry
  const [directAmount, setDirectAmount] = useState<number | ''>('');

  // Payment state for sale: 'full' | 'udhaar' | 'partial'
  const [paymentChoice, setPaymentChoice] = useState<'full' | 'udhaar' | 'partial'>('full');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'credit' | 'bank_transfer'>('cash');

  // Progressive disclosure: Advanced fields hidden by default
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [notes, setNotes] = useState('');
  const [billNumber, setBillNumber] = useState('');

  // Review mode toggle for high-confidence review
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setError(null);
      setIsReviewOpen(false);

      if (initialDraftData) {
        if (initialDraftData.type) setType(initialDraftData.type);
        if (initialDraftData.customerId) setSelectedCustomerId(initialDraftData.customerId);
        if (initialDraftData.items && initialDraftData.items.length > 0) {
          setItems(
            initialDraftData.items.map((it, idx) => ({
              id: String(idx + 1),
              name: it.name,
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice,
              total: it.total || (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
            }))
          );
        }
        if (initialDraftData.totalAmount !== undefined) {
          setDirectAmount(initialDraftData.totalAmount);
        }
        if (initialDraftData.paidAmount !== undefined) {
          setPaidAmount(initialDraftData.paidAmount);
          if (initialDraftData.paidAmount === 0 && (initialDraftData.udhaarAmount || 0) > 0) {
            setPaymentChoice('udhaar');
          } else if (initialDraftData.udhaarAmount && initialDraftData.udhaarAmount > 0) {
            setPaymentChoice('partial');
          } else {
            setPaymentChoice('full');
          }
        }
        if (initialDraftData.notes) setNotes(initialDraftData.notes);
        if (initialDraftData.billNumber) setBillNumber(initialDraftData.billNumber);
      } else {
        setType(preselectedType);
        setSelectedCustomerId(preselectedCustomerId || '');
        setBillNumber(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
        setItems([{ id: '1', name: '', quantity: 1, unitPrice: '', total: 0 }]);
        setDirectAmount('');
        setPaidAmount('');
        setPaymentChoice('full');
        setNotes('');
        setShowMoreOptions(false);
      }
    }
  }, [isOpen, preselectedCustomerId, preselectedType, initialDraftData]);

  const loadData = async () => {
    try {
      const [cList, pList] = await Promise.all([api.getCustomers(), api.getProducts()]);
      setCustomers(cList);
      setProducts(pList);
    } catch (err) {
      console.error('Failed to load customers or products:', err);
    }
  };

  const handleCreateCustomerInline = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      setError('Please provide customer name and phone number');
      return;
    }
    try {
      const newC = await api.createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
      });
      setCustomers((prev) => [newC, ...prev]);
      setSelectedCustomerId(newC.id);
      setIsCreatingCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to create customer');
    }
  };

  // Mandatory Price Behavior:
  // When user selects a known product, prefill its authoritative defaultPrice.
  // When price is unknown, leave it blank (never default to ₹0 to represent blank).
  const handleItemProductSelect = (index: number, productName: string) => {
    const foundProd = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
    const newItems = [...items];
    const qty = newItems[index].quantity || 1;

    if (foundProd && foundProd.defaultPrice !== undefined) {
      const price = foundProd.defaultPrice;
      newItems[index] = {
        ...newItems[index],
        name: foundProd.name,
        unitPrice: price,
        total: Math.round(qty * price * 100) / 100,
      };
    } else {
      const existingPrice = newItems[index].unitPrice !== undefined ? newItems[index].unitPrice : '';
      newItems[index] = {
        ...newItems[index],
        name: productName,
        unitPrice: existingPrice,
        total: typeof existingPrice === 'number' ? Math.round(qty * existingPrice * 100) / 100 : 0,
      };
    }
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: 'name' | 'quantity' | 'unitPrice', val: any) => {
    const newItems = [...items];
    const current = newItems[index];

    if (field === 'quantity') {
      const qty = Math.max(1, Number(val) || 1);
      const price = typeof current.unitPrice === 'number' ? current.unitPrice : 0;
      newItems[index] = {
        ...current,
        quantity: qty,
        total: Math.round(qty * price * 100) / 100,
      };
    } else if (field === 'unitPrice') {
      const priceVal = val === '' ? '' : Math.max(0, Number(val));
      const qty = current.quantity || 1;
      const numPrice = typeof priceVal === 'number' ? priceVal : 0;
      newItems[index] = {
        ...current,
        unitPrice: priceVal,
        total: Math.round(qty * numPrice * 100) / 100,
      };
    } else if (field === 'name') {
      newItems[index] = {
        ...current,
        name: val,
      };
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { id: String(Date.now()), name: '', quantity: 1, unitPrice: '', total: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal =
    type === 'payment' || type === 'expense' || type === 'income'
      ? typeof directAmount === 'number'
        ? directAmount
        : 0
      : items.reduce((sum, item) => sum + (item.total || 0), 0);

  // Compute effective paid and udhaar amounts
  let effectivePaidAmount = calculatedSubtotal;
  let effectiveUdhaarAmount = 0;

  if (type === 'sale') {
    if (paymentChoice === 'full') {
      effectivePaidAmount = calculatedSubtotal;
      effectiveUdhaarAmount = 0;
    } else if (paymentChoice === 'udhaar') {
      effectivePaidAmount = 0;
      effectiveUdhaarAmount = calculatedSubtotal;
    } else if (paymentChoice === 'partial') {
      const numPaid = typeof paidAmount === 'number' ? paidAmount : 0;
      effectivePaidAmount = numPaid;
      effectiveUdhaarAmount = Math.max(0, calculatedSubtotal - numPaid);
    } else {
      effectivePaidAmount = typeof paidAmount === 'number' ? paidAmount : calculatedSubtotal;
      effectiveUdhaarAmount = Math.max(0, calculatedSubtotal - effectivePaidAmount);
    }
  } else if (type === 'payment') {
    effectivePaidAmount = calculatedSubtotal;
    effectiveUdhaarAmount = 0;
  }

  const selectedCust = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (calculatedSubtotal <= 0) {
      setError('Please enter at least one item with a valid price or amount.');
      return;
    }

    if (type === 'sale' && !selectedCustomerId && effectiveUdhaarAmount > 0) {
      setError('A customer must be selected to record Udhaar.');
      return;
    }

    setLoading(true);
    try {
      const cleanedItems = items
        .filter((it) => it.name.trim() !== '')
        .map((it) => ({
          id: it.id,
          name: it.name.trim(),
          quantity: it.quantity,
          unitPrice: typeof it.unitPrice === 'number' ? it.unitPrice : 0,
          total: it.total,
        }));

      await api.createTransaction({
        customerId: selectedCustomerId || undefined,
        customerName: selectedCust ? selectedCust.name : (type === 'payment' ? 'Payment' : 'Counter Sale'),
        type: type,
        items: type === 'payment' || type === 'expense' || type === 'income' ? [] : cleanedItems,
        totalAmount: calculatedSubtotal,
        paidAmount: effectivePaidAmount,
        udhaarAmount: effectiveUdhaarAmount,
        paymentMode: effectiveUdhaarAmount > 0 && effectivePaidAmount === 0 ? 'credit' : paymentMode,
        billNumber: billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: notes.trim(),
        date: new Date().toISOString(),
      });

      onSuccess(selectedCustomerId || preselectedCustomerId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const types: { id: TransactionType; label: string; icon: any; desc: string }[] = [
    { id: 'sale', label: 'Sale', icon: ShoppingCart, desc: 'Sell to customer' },
    { id: 'payment', label: 'Payment', icon: CreditCard, desc: 'Settle udhaar dues' },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag, desc: 'Vendor restock' },
    { id: 'expense', label: 'Expense', icon: TrendingDown, desc: 'Shop bills & tea' },
    { id: 'income', label: 'Income', icon: TrendingUp, desc: 'Other earnings' },
    { id: 'return', label: 'Return', icon: RotateCcw, desc: 'Item returned' },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Business Entry"
      subtitle="Fast transaction entry with instant udhaar calculation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: WHAT ARE YOU RECORDING? (RADICAL SIMPLIFICATION) */}
        {/* ------------------------------------------------------------- */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1. What are you recording?
            </span>
            <span className="text-xs font-bold text-blue-600 capitalize">{type}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    if (t.id === 'payment') {
                      setPaidAmount('');
                      setPaymentChoice('full');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: WHO IS THIS FOR? (CUSTOMER CONTEXT) */}
        {/* ------------------------------------------------------------- */}
        {type !== 'expense' && type !== 'income' && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                2. Who is this for?
              </span>

              {!isCreatingCustomer && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ New Customer</span>
                </button>
              )}
            </div>

            {/* Selected customer pill banner if chosen */}
            {selectedCust ? (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                    {selectedCust.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{selectedCust.name}</span>
                    <span className="text-slate-500 ml-1.5 font-medium">({selectedCust.phone})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCust.pendingUdhaar > 0 && (
                    <span className="text-rose-600 font-bold tabular-nums">
                      ₹{selectedCust.pendingUdhaar} due
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerId('')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : isCreatingCustomer ? (
              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Add New Customer</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomer(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name (e.g. Ramesh Sharma)"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 font-medium"
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Phone Number (e.g. 98765 43210)"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomer(false)}
                    className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <Button size="sm" type="button" onClick={handleCreateCustomerInline}>
                    Save Customer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search customer by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerId('')}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      selectedCustomerId === '' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <span>Counter / Walk-in Customer</span>
                    {selectedCustomerId === '' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {filteredCustomers.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        selectedCustomerId === c.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-slate-400 ml-1.5 text-[11px]">({c.phone})</span>
                      </div>
                      <div className="text-right">
                        {c.pendingUdhaar > 0 ? (
                          <span className="text-rose-600 font-bold tabular-nums text-[11px]">
                            ₹{c.pendingUdhaar} due
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No dues</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: WHAT DID THEY BUY / ENTER AMOUNT */}
        {/* ------------------------------------------------------------- */}
        {type === 'payment' || type === 'expense' || type === 'income' ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              3. Enter Amount
            </span>
            <div>
              <Input
                label={`${type === 'payment' ? 'Payment Received' : 'Amount'} (₹) *`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Enter amount..."
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                required
              />
            </div>
            {/* Quick Presets for Shopkeeper */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDirectAmount(amt)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                3. Line Items
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
                >
                  {/* Product Search Input */}
                  <div className="w-full sm:grow">
                    <input
                      type="text"
                      list="product-suggestions"
                      placeholder="Product or item description..."
                      value={item.name}
                      onChange={(e) => {
                        handleItemChange(idx, 'name', e.target.value);
                        handleItemProductSelect(idx, e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Quantity */}
                    <div className="w-20">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        title="Quantity"
                      />
                    </div>

                    {/* Unit Price (Blank if unknown, mandatory rule!) */}
                    <div className="grow sm:w-28">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        placeholder="Price (₹)"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 text-right font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        title="Unit Price"
                      />
                    </div>

                    {/* Total */}
                    <div className="text-right pr-1 min-w-[65px] shrink-0">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        ₹{item.total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <datalist id="product-suggestions">
              {products.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: PAYMENT (PAID | PARTIAL | UDHAAR) */}
        {/* ------------------------------------------------------------- */}
        {type === 'sale' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                4. Payment Status
              </span>
              <span className="font-bold text-slate-900 text-base tabular-nums">
                Total: ₹{calculatedSubtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Quick 3-way choice */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentChoice('full');
                  setPaidAmount(calculatedSubtotal);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                  paymentChoice === 'full'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Paid in Full
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentChoice('udhaar');
                  setPaidAmount(0);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                  paymentChoice === 'udhaar'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Udhaar (Credit)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentChoice('partial');
                  if (typeof paidAmount !== 'number' || paidAmount === 0 || paidAmount === calculatedSubtotal) {
                    setPaidAmount('');
                  }
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                  paymentChoice === 'partial'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Partial Paid
              </button>
            </div>

            {/* Partial input & live Udhaar balance */}
            {paymentChoice === 'partial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Amount Paid Upfront (₹)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={calculatedSubtotal}
                    step="any"
                    placeholder="Amount paid upfront (₹)..."
                    value={paidAmount}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setPaidAmount(v);
                    }}
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Remaining Udhaar (₹)
                  </label>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-right">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        effectiveUdhaarAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      ₹{effectiveUdhaarAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* COLLAPSIBLE MORE OPTIONS (TAX, NOTES, BILL #) */}
        {/* ------------------------------------------------------------- */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <span>More options (Payment mode, Bill #, Notes)</span>
            {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMoreOptions && (
            <div className="p-4 pt-1 space-y-3 border-t border-slate-100 bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 py-2.5 px-3"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / QR Code</option>
                    <option value="card">Debit / Credit Card</option>
                    <option value="credit">Udhaar / Credit</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <Input
                  label="Bill / Invoice #"
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                />
              </div>

              <Input
                label="Optional Notes"
                type="text"
                placeholder="e.g. Paid partial amount via Google Pay, rest promised on Sunday"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 5: REVIEW MODAL / INLINE REVIEW SUMMARY & SUBMISSION */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            {type === 'sale' && (
              <span>
                Total: <strong className="text-slate-900">₹{calculatedSubtotal}</strong> ·{' '}
                {effectiveUdhaarAmount > 0 ? (
                  <span className="text-rose-600 font-bold">₹{effectiveUdhaarAmount} Udhaar</span>
                ) : (
                  <span className="text-emerald-600 font-bold">Paid in full</span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            {/* Quick Review dialog button */}
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Review
            </button>

            <Button type="submit" loading={loading}>
              Save Entry
            </Button>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------- */}
      {/* STRUCTURED REVIEW DIALOG (FIFTH SCREEN IN PROGRESSIVE FLOW) */}
      {/* ------------------------------------------------------------- */}
      {isReviewOpen && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title="Review Entry Summary"
          subtitle="Confirm details before saving authoritative ledger record"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Transaction Type</span>
                <span className="text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {type}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Customer</span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedCust ? selectedCust.name : 'Counter Sale'}
                </span>
              </div>

              {items.length > 0 && items[0].name && (
                <div className="space-y-1 pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Items
                  </span>
                  {items.filter((it) => it.name.trim()).map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-800">
                      <span>
                        {it.name} ({it.quantity} × ₹{it.unitPrice})
                      </span>
                      <span className="font-bold tabular-nums">₹{it.total}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="tabular-nums">₹{calculatedSubtotal}</span>
              </div>

              {type === 'sale' && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Payment State</span>
                  <span
                    className={`font-bold tabular-nums ${
                      effectiveUdhaarAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {effectiveUdhaarAmount > 0
                      ? `₹${effectiveUdhaarAmount} Udhaar (Paid: ₹${effectivePaidAmount})`
                      : 'Paid in Full'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsReviewOpen(false)}
              >
                Edit
              </Button>
              <Button
                type="button"
                loading={loading}
                onClick={() => {
                  setIsReviewOpen(false);
                  handleSubmit();
                }}
              >
                Confirm & Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
