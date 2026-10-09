import React, { useState } from 'react';
import {
  Mic,
  Camera,
  Upload,
  Sparkles,
  Search,
  MessageSquare,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { Customer, Transaction } from '../../types';
import { Button } from '../ui/Button';

interface AIViewProps {
  customers: Customer[];
  transactions: Transaction[];
  onOpenVoiceEntry: () => void;
  onOpenScanBill: (mode?: 'camera' | 'upload') => void;
  onSelectCustomer: (customerId: string) => void;
}

export const AIView: React.FC<AIViewProps> = ({
  customers,
  transactions,
  onOpenVoiceEntry,
  onOpenScanBill,
  onSelectCustomer,
}) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{ question: string; text: string; relatedCustomerId?: string } | null>(null);

  // Authoritative computations for contextual insights
  const customersWithUdhaar = [...customers]
    .filter((c) => c.pendingUdhaar > 0)
    .sort((a, b) => b.pendingUdhaar - a.pendingUdhaar);

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.pendingUdhaar || 0), 0);
  const totalSales = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const handleRunQuery = (qText: string) => {
    const q = qText.toLowerCase().trim();

    if (q.includes('highest') || q.includes('most') || q.includes('who owes')) {
      if (customersWithUdhaar.length > 0) {
        const top = customersWithUdhaar[0];
        setAnswer({
          question: qText,
          text: `${top.name} currently has the highest pending Udhaar at ₹${top.pendingUdhaar.toLocaleString('en-IN')} (${top.phone}). Total business with this customer is ₹${top.totalBusiness.toLocaleString('en-IN')}.`,
          relatedCustomerId: top.id,
        });
      } else {
        setAnswer({
          question: qText,
          text: 'Great news! All customers currently have zero outstanding dues.',
        });
      }
    } else if (q.includes('sale') || q.includes('today') || q.includes('total')) {
      setAnswer({
        question: qText,
        text: `Total recorded sales amount to ₹${totalSales.toLocaleString('en-IN')} across ${transactions.filter((t) => t.type === 'sale').length} bills. Total outstanding Udhaar across all customers is ₹${totalOutstanding.toLocaleString('en-IN')}.`,
      });
    } else if (q.includes('udhaar') || q.includes('dues') || q.includes('balance')) {
      setAnswer({
        question: qText,
        text: `There are currently ${customersWithUdhaar.length} customers with pending dues totaling ₹${totalOutstanding.toLocaleString('en-IN')}. Top accounts: ${customersWithUdhaar.slice(0, 3).map((c) => `${c.name} (₹${c.pendingUdhaar})`).join(', ')}.`,
      });
    } else {
      setAnswer({
        question: qText,
        text: `Found ${customers.length} total customer accounts and ${transactions.length} recorded business entries. Speak or scan documents to record new entries, or click any customer to view their timeline.`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assistant & Tools</h1>
            <p className="text-xs text-slate-500">Contextual speech, bill extraction, and smart store queries</p>
          </div>
        </div>
      </div>

      {/* 1. Core AI Entry Tools */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Lightweight AI Input Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Voice Tool */}
          <div
            onClick={onOpenVoiceEntry}
            className="p-5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Voice Transaction</h3>
            <p className="text-xs text-slate-500 mt-1">
              Speak in Hindi or English (e.g., "Sold 2 Atta to Ramesh for 600") to parse sale and udhaar.
            </p>
            <span className="inline-block mt-3 text-xs font-bold text-blue-600 group-hover:underline">
              Launch Voice →
            </span>
          </div>

          {/* Camera OCR Tool */}
          <div
            onClick={() => onOpenScanBill('camera')}
            className="p-5 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Camera Bill OCR</h3>
            <p className="text-xs text-slate-500 mt-1">
              Capture a photo of wholesale bills or paper invoices to extract items and prices.
            </p>
            <span className="inline-block mt-3 text-xs font-bold text-indigo-600 group-hover:underline">
              Open Camera →
            </span>
          </div>

          {/* Upload Bill Tool */}
          <div
            onClick={() => onOpenScanBill('upload')}
            className="p-5 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Upload Document</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload PDF receipts or gallery photos for automated line item extraction.
            </p>
            <span className="inline-block mt-3 text-xs font-bold text-sky-600 group-hover:underline">
              Upload File →
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fast Smart Store Query */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Smart Business Query</h2>
          <p className="text-xs text-slate-500">Ask questions about your ledger, sales, or customer dues</p>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2">
          {[
            'Who owes the highest Udhaar?',
            'What is today’s total sales?',
            'Summarize customer dues',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                handleRunQuery(prompt);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) handleRunQuery(query.trim());
          }}
          className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500/50 focus-within:bg-white transition-colors"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your store records..."
            className="grow px-3 py-1.5 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800"
          />
          <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
            Ask
          </Button>
        </form>

        {/* Answer Box */}
        {answer && (
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs animate-in fade-in duration-150">
            <p className="font-bold text-blue-900">Q: {answer.question}</p>
            <p className="text-slate-700 leading-relaxed">{answer.text}</p>
            {answer.relatedCustomerId && (
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => onSelectCustomer(answer.relatedCustomerId!)}
                >
                  Open Customer Conversation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
