import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../api/client';

export const ReportsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [timeframe]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsSummary(timeframe);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!summary || !summary.recentTransactions) return;

    const headers = ['Date', 'Bill Number', 'Customer', 'Type', 'Total Amount', 'Paid Amount', 'Udhaar Amount', 'Payment Mode'];
    const rows = summary.recentTransactions.map((t: any) => [
      t.date,
      t.billNumber,
      `"${t.customerName || ''}"`,
      t.type,
      t.totalAmount,
      t.paidAmount,
      t.udhaarAmount,
      t.paymentMode,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadgerx_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative cash flow, sales summaries, and credit receivable metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
            {(['today', '7days', '30days', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
                  timeframe === t ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '7days' ? 'Last 7 Days' : t === '30days' ? 'Last 30 Days' : t}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Calculating financial summaries...
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Gross Sales</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                ₹{summary.totalSales.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{summary.salesCount} sale transactions</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Payments Collected</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                ₹{summary.totalPaymentsReceived.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">Direct cash & UPI deposits</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Udhaar Outstanding</span>
              <p className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
                ₹{summary.totalOutstandingUdhaar.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {summary.customersWithUdhaarCount} customers with active dues
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Operating Expenses</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Rent, electricity & overhead</p>
            </div>
          </div>

          {/* Cashflow breakdown card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cashflow & Balance Breakdown
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Revenue Generated</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{summary.totalSales.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Restock & Purchases</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{summary.totalPurchases.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <span className="text-slate-600">Shop Operating Expenses</span>
                <span className="font-bold text-rose-600 tabular-nums">
                  -₹{summary.totalExpenses.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 pt-3 font-bold text-slate-900">
                <span>Estimated Net Operational Balance</span>
                <span className="text-emerald-700 text-base tabular-nums">
                  ₹{(summary.totalSales - summary.totalExpenses - summary.totalPurchases).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
