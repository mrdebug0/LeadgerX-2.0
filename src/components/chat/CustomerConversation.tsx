import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  CreditCard,
  ShoppingCart,
  Send,
  Camera,
  Upload,
  Mic,
  Receipt,
  RotateCcw,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Customer, Transaction, TransactionType } from '../../types';
import { api } from '../../api/client';

interface CustomerConversationProps {
  customerId: string;
  onBack?: () => void;
  onAddEntry: (type?: TransactionType) => void;
  onOpenScanBill: (mode?: 'camera' | 'upload') => void;
  onOpenVoiceEntry: () => void;
  onRefreshParent?: () => void;
  isTwoPanel?: boolean;
}

export const CustomerConversation: React.FC<CustomerConversationProps> = ({
  customerId,
  onBack,
  onAddEntry,
  onOpenScanBill,
  onOpenVoiceEntry,
  onRefreshParent,
  isTwoPanel = false,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Composer states
  const [messageText, setMessageText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const plusMenuRef = useRef<HTMLDivElement | null>(null);

  // Close plus menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    }
    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlusMenuOpen]);

  useEffect(() => {
    loadConversation();
  }, [customerId]);

  const loadConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomer(customerId);
      setCustomer(data.customer);
      setTimeline(data.timeline || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customer conversation');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text || isPosting || !customer) return;

    setIsPosting(true);
    try {
      // Check if user entered a payment shorthand e.g. "Received 500" or "Paid 200" or just "500"
      const lower = text.toLowerCase();
      const numMatch = text.match(/\d+(\.\d+)?/);
      const isPaymentKeyword = lower.includes('received') || lower.includes('jama') || lower.includes('paid') || lower.includes('payment');

      if (numMatch && (isPaymentKeyword || text.startsWith('₹'))) {
        const amount = parseFloat(numMatch[0]);
        if (amount > 0) {
          await api.createTransaction({
            customerId: customer.id,
            customerName: customer.name,
            type: 'payment',
            items: [],
            totalAmount: amount,
            paidAmount: amount,
            udhaarAmount: 0,
            paymentMode: lower.includes('upi') ? 'upi' : 'cash',
            billNumber: `REC-${Math.floor(100 + Math.random() * 900)}`,
            notes: text,
            date: new Date().toISOString(),
          });
          setMessageText('');
          await loadConversation();
          if (onRefreshParent) onRefreshParent();
          setTimeout(scrollToBottom, 100);
          return;
        }
      }

      // Otherwise post as an authoritative Internal Note linked to this customer
      await api.createTransaction({
        customerId: customer.id,
        customerName: customer.name,
        type: 'note',
        items: [],
        totalAmount: 0,
        paidAmount: 0,
        udhaarAmount: 0,
        paymentMode: 'cash',
        billNumber: `NOTE-${Math.floor(100 + Math.random() * 900)}`,
        notes: text,
        date: new Date().toISOString(),
      });

      setMessageText('');
      await loadConversation();
      if (onRefreshParent) onRefreshParent();
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      alert(err?.message || 'Failed to save message');
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-200/80">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Opening customer ledger & timeline...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-200/80">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-sm text-rose-600 font-bold mb-3">{error || 'Customer not found'}</p>
        {onBack && (
          <Button onClick={onBack} size="sm">
            Back to Customers
          </Button>
        )}
      </div>
    );
  }

  const initial = customer.name.charAt(0).toUpperCase();

  // Group transactions chronologically by date label (Today, Yesterday, or formatted date)
  // timeline from API is sorted desc; reverse to chronological ascending for chat
  const chronological = [...timeline].reverse();

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group events into day buckets
  const groupedEvents: { [key: string]: Transaction[] } = {};
  for (const tx of chronological) {
    const day = getDayLabel(tx.date);
    if (!groupedEvents[day]) groupedEvents[day] = [];
    groupedEvents[day].push(tx);
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/70 rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
      {/* ------------------------------------------------------------- */}
      {/* 1. CUSTOMER HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200/90 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-display font-bold text-base flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
                {customer.name}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Customer" />
            </div>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {customer.phone}
              {customer.address ? ` · ${customer.address}` : ''}
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddEntry('payment')}
            icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
            className="hidden sm:inline-flex text-xs px-2.5 py-1.5"
          >
            Record Payment
          </Button>

          <Button
            size="sm"
            onClick={() => onAddEntry('sale')}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs px-3 py-1.5"
          >
            New Bill
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PINNED FINANCIAL SUMMARY (STICKY & VISIBLE WHILE SCROLLING) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3 border-b border-slate-200/80 shadow-xs shrink-0 z-20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance:</span>
            {customer.pendingUdhaar > 0 ? (
              <span className="text-sm sm:text-base font-bold text-rose-600 tabular-nums">
                ₹{customer.pendingUdhaar.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-semibold text-rose-500">Udhaar</span>
              </span>
            ) : customer.pendingUdhaar < 0 ? (
              <span className="text-sm sm:text-base font-bold text-emerald-600 tabular-nums">
                ₹{Math.abs(customer.pendingUdhaar).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-semibold text-emerald-600">Advance (Credit)</span>
              </span>
            ) : (
              <span className="text-sm sm:text-base font-bold text-emerald-600 tabular-nums">
                ₹0 <span className="text-xs font-semibold text-emerald-500">No dues</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500">
            <div>
              <span>Total Business: </span>
              <strong className="text-slate-900 tabular-nums">
                ₹{customer.totalBusiness.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="hidden sm:block text-slate-300">·</div>
            <div className="hidden sm:block">
              <span>Entries: </span>
              <strong className="text-slate-900 tabular-nums">{timeline.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CHRONOLOGICAL TIMELINE OF BUSINESS EVENTS */}
      {/* ------------------------------------------------------------- */}
      <div
        ref={scrollRef}
        className="grow overflow-y-auto px-4 py-4 sm:px-6 space-y-5"
      >
        {/* Subtle section label for verification */}
        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
            Ledger Activity Timeline
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="py-14 text-center text-slate-400 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Receipt className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">No transactions yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Start billing or recording payments using the actions above or the composer below.
            </p>
          </div>
        ) : (
          Object.keys(groupedEvents).map((dayLabel) => (
            <div key={dayLabel} className="space-y-3">
              {/* Day divider */}
              <div className="flex items-center justify-center my-2">
                <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs">
                  {dayLabel}
                </span>
              </div>

              {groupedEvents[dayLabel].map((tx) => {
                const isSale = tx.type === 'sale';
                const isPayment = tx.type === 'payment';
                const isReturn = tx.type === 'return';
                const isNote = tx.type === 'note';

                const timeStr = new Date(tx.date).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className={`max-w-xl rounded-2xl p-3.5 sm:p-4 text-xs transition-all shadow-xs ${
                      isNote
                        ? 'ml-auto bg-blue-600 text-white border border-blue-600'
                        : isPayment
                        ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 mr-auto'
                        : isSale && tx.udhaarAmount > 0
                        ? 'bg-white border border-rose-200/80 mr-auto'
                        : 'bg-white border border-slate-200/80 mr-auto'
                    }`}
                  >
                    {/* Event Header */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-black/5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isNote
                              ? 'bg-blue-200'
                              : isPayment
                              ? 'bg-emerald-500'
                              : isSale && tx.udhaarAmount > 0
                              ? 'bg-rose-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className={`font-bold uppercase tracking-wider text-[10px] ${isNote ? 'text-blue-100' : 'text-slate-600'}`}>
                          {isNote ? 'Internal Note' : tx.type}
                        </span>
                        {tx.billNumber && (
                          <span className={`font-mono text-[10px] ${isNote ? 'text-blue-200' : 'text-slate-400'}`}>
                            #{tx.billNumber}
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] ${isNote ? 'text-blue-200' : 'text-slate-400'}`}>
                        {timeStr}
                      </span>
                    </div>

                    {/* Note Content */}
                    {isNote && (
                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                        {tx.notes}
                      </p>
                    )}

                    {/* Sale / Purchase Line Items Breakdown */}
                    {tx.items && tx.items.length > 0 && (
                      <div className="my-2 space-y-1 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                        {tx.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-800 text-[11px]">
                            <span>
                              {it.quantity} × <strong className="font-semibold">{it.name}</strong>
                            </span>
                            <span className="font-bold tabular-nums">
                              ₹{it.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment or Bill Financial Summary */}
                    {!isNote && (
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <div>
                          {isSale && (
                            <p className="text-[11px] text-slate-600">
                              Total: <strong className="text-slate-900 tabular-nums">₹{tx.totalAmount}</strong>
                              {tx.paidAmount > 0 && (
                                <span> · Paid: <strong className="text-emerald-700 tabular-nums">₹{tx.paidAmount}</strong></span>
                              )}
                            </p>
                          )}
                          {isPayment && (
                            <p className="text-[11px] text-emerald-800 font-semibold">
                              Payment received towards udhaar dues ({tx.paymentMode || 'cash'})
                            </p>
                          )}
                          {tx.notes && !isNote && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5">
                              "{tx.notes}"
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          {isPayment ? (
                            <span className="text-sm font-bold text-emerald-700 tabular-nums">
                              +₹{tx.paidAmount.toLocaleString('en-IN')}
                            </span>
                          ) : tx.udhaarAmount > 0 ? (
                            <span className="text-sm font-bold text-rose-600 tabular-nums">
                              ₹{tx.udhaarAmount.toLocaleString('en-IN')} Udhaar
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              ₹{tx.totalAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. COMPACT FAMILIAR CHAT COMPOSER WITH INTEGRATED + BUTTON */}
      {/* ------------------------------------------------------------- */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0 z-30 pb-safe">
        <div className="relative">
          {/* Contextual + Action Popover (Desktop / Mobile Touch Sheet) */}
          {isPlusMenuOpen && (
            <div
              ref={plusMenuRef}
              className="absolute bottom-14 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Counter Actions for {customer.name}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onOpenScanBill('camera');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span>Scan Bill (Camera OCR)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onOpenScanBill('upload');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <span>Upload Bill (Image / PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onOpenVoiceEntry();
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span>Speak (Voice Entry)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onAddEntry('sale');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span>Manual Entry (Sale Form)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onAddEntry('payment');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span>Record Payment (Settle Udhaar)</span>
              </button>
            </div>
          )}

          {/* Compact Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white rounded-2xl border border-slate-200/90 focus-within:border-blue-500/50 p-1.5 transition-all shadow-2xs"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type internal note or 'Received 500'..."
              className="grow px-3 py-1.5 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            />

            {/* Send button when text is present */}
            {messageText.trim().length > 0 && (
              <button
                type="submit"
                disabled={isPosting}
                className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                title="Send note or quick payment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Clear Integrated + Action Button (Right Side of Composer) */}
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${
                isPlusMenuOpen
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
              title="Add attachment or start transaction"
              aria-label="Add transaction action"
            >
              <Plus className={`w-4 h-4 transition-transform ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
