import React, { useState } from 'react';
import {
  Mic,
  Camera,
  FileText,
  Users,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  ShoppingBag,
  Clock,
  Smartphone,
  Layers,
  BarChart3,
  Receipt,
  Store as StoreIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MarketingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onStartDemo: () => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup,
  onStartDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'billing' | 'customers' | 'scan' | 'voice'>('billing');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annualBilling, setAnnualBilling] = useState(false);

  const faqs = [
    {
      q: 'What is LeadgerX?',
      a: 'LeadgerX is a modern AI-assisted business management SaaS specifically engineered for kirana stores, retail shops, wholesalers, and growing small businesses to manage sales, purchases, customer Udhaar, bill scanning, and voice transactions in one simple workspace.',
    },
    {
      q: 'Who is LeadgerX for?',
      a: 'LeadgerX is designed for Indian kirana store owners, retail merchants, wholesalers, grocery shops, electronics stores, and independent entrepreneurs who want quick billing, zero-loss credit tracking, and instant bill recording.',
    },
    {
      q: 'How does Udhaar / credit tracking work?',
      a: 'Every customer has an authoritative ledger profile. When you make a sale with partial or zero upfront payment, the unpaid amount is automatically recorded as Udhaar. When they pay, customer balance updates instantly with full chronological transparency.',
    },
    {
      q: 'Can I scan or upload vendor bills?',
      a: 'Yes! Tap Scan Bill or upload any invoice image. LeadgerX uses AI vision and OCR to read the supplier name, invoice date, line items, quantities, and totals into an editable structured draft for instant verification.',
    },
    {
      q: 'How does voice entry work?',
      a: 'Simply tap Speak and say a transaction in English or Hindi, such as "Sold 3 Tata Salt to Rahul for 90 rupees". LeadgerX understands your spoken words, prepares a structured transaction card, and lets you confirm and save in seconds.',
    },
    {
      q: 'Does AI automatically save records without my review?',
      a: 'Never. LeadgerX follows a strict "Human in the Loop" philosophy. All scanned bills and voice transcriptions are presented as an editable review card first. You always stay in complete control of your numbers.',
    },
    {
      q: 'Can I use LeadgerX on mobile?',
      a: 'Yes! LeadgerX features a purpose-built mobile web app experience with thumb-friendly quick actions, instant customer search, conversational ledger timelines, and mobile bottom navigation.',
    },
    {
      q: 'What happens if the internet or AI is unavailable?',
      a: 'LeadgerX never locks you out. Standard fast billing, manual customer entries, calculations, and local balance updates remain 100% accessible even when AI or camera services are unavailable.',
    },
    {
      q: 'How is my business data protected?',
      a: 'LeadgerX implements multi-tenant cryptographic isolation. Each store’s records, customer ledgers, and financial summaries are strictly accessible only by authenticated staff with role-based access control.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP BAR CONTRACT: Brand | 4-6 Links | 1-2 Actions */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Zone 1: Single Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <span className="font-display text-xl tracking-tight">LX</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
              LeadgerX
            </span>
          </div>

          {/* Zone 2: Clean nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#workspace" className="hover:text-blue-600 transition-colors">
              Workspace
            </a>
            <a href="#scan-voice" className="hover:text-blue-600 transition-colors">
              AI Tools
            </a>
            <a href="#mobile" className="hover:text-blue-600 transition-colors">
              Mobile App
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors cursor-pointer"
            >
              Log in
            </button>
            <Button onClick={onNavigateSignup} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION (Inspired by Runlight: Electric Blue, 3D Art, Mockup) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 overflow-hidden bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-900 text-white">
        {/* Subtle decorative background mesh */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="mesh" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#mesh)" />
          </svg>
        </div>

        {/* Abstract 3D SVG Ribbon Art (Runlight inspired) */}
        <div className="absolute -top-24 right-0 lg:right-10 w-96 h-96 lg:w-[600px] lg:h-[600px] pointer-events-none opacity-40 blur-sm">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path
              d="M 50,200 C 100,50 300,50 350,200 C 400,350 200,400 100,300 Z"
              fill="none"
              stroke="url(#blueGlow)"
              strokeWidth="48"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Next-Gen Operating System for Local Commerce</span>
          </div>

          {/* Huge editorial typography */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6 text-balance">
            RUN YOUR BUSINESS SMARTER WITH AI.
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Sales, bills, customers, payments and business records — all brought together in one simple, lightning-fast workspace.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onNavigateSignup}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-900 font-bold text-base hover:bg-blue-50 shadow-xl shadow-blue-950/30 transition-all duration-150 cursor-pointer active:scale-95"
            >
              Get Started Free
            </button>
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-base border border-white/30 backdrop-blur-md shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Instant Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* HERO MOCKUP: Crisp LeadgerX Browser Window with Real Cards */}
          {/* ------------------------------------------------------------- */}
          <div className="relative mx-auto max-w-5xl rounded-3xl p-3 sm:p-5 bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl">
            {/* Window chrome */}
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-left shadow-2xl text-slate-900 overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">app.leadgerx.com/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sharma Kirana & General
                </div>
              </div>

              {/* Mockup Body: Command Center Preview */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6 text-slate-900 space-y-6">
                {/* Quick actions strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">+</div>
                    <div>
                      <p className="text-xs font-bold leading-none">Add Entry</p>
                      <p className="text-[10px] text-blue-100 mt-0.5">Quick Bill</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none">Speak</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Voice Entry</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none">Scan Bill</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">OCR Extract</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none">Manual</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Form Entry</p>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Today's Sales</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-slate-900 tabular-nums">₹24,850</p>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+14% vs avg</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Outstanding Udhaar</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-rose-600 tabular-nums">₹42,500</p>
                      <span className="text-xs font-medium text-slate-500">48 customers</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Collected Today</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-emerald-700 tabular-nums">₹6,800</p>
                      <span className="text-xs font-medium text-slate-500">12 payments</span>
                    </div>
                  </div>
                </div>

                {/* Split row: Recent Customer Timeline snippet */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Latest Business Activity</span>
                    <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All Entries →</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">R</div>
                        <div>
                          <p className="font-semibold text-slate-900">Rahul Sharma</p>
                          <p className="text-[10px] text-slate-500">2 × Tata Salt, 1 × Atta 5kg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 tabular-nums">₹850</p>
                        <p className="text-[10px] text-rose-600 font-medium">₹350 Udhaar</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">A</div>
                        <div>
                          <p className="font-semibold text-slate-900">Amit Kumar</p>
                          <p className="text-[10px] text-slate-500">Payment received via UPI</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 tabular-nums">+₹1,450</p>
                        <p className="text-[10px] text-emerald-700 font-medium">No dues</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. PROBLEM & SOLUTION (Kirana reality vs LeadgerX clarity) */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Designed For Everyday Reality</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 text-balance">
              Paper registers and clunky software were slowing you down.
            </h2>
            <p className="text-base text-slate-600 mt-4 leading-relaxed">
              Kirana stores and retail counters can’t spend minutes navigating 20 nested menus during peak hours. LeadgerX simplifies everything into one unified flow.
            </p>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">5-Second Billing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Add products, auto-prefill known prices, or speak the items. Generate clean digital receipts and record customer dues without typing bottlenecks.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Authoritative Udhaar Ledger</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No more lost diaries or disputed credit notes. Every customer has a chronological timeline with exact items purchased, cash given, and balance remaining.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">AI Bill Scan & Voice</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Snap distributor invoices to extract items and wholesale costs instantly. Speak transactions aloud when your hands are busy packing groceries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. ONE WORKSPACE INTERACTIVE PREVIEW */}
      {/* ------------------------------------------------------------- */}
      <section id="workspace" className="py-20 lg:py-28 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">One Unified Flow</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              One Workspace. Infinite Speed.
            </h2>
            <p className="text-slate-600 mt-4 text-base">
              Everything in LeadgerX flows naturally from the dashboard to customer timelines.
            </p>

            {/* Interactive Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fast Billing
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer Ledger
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'scan'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bill Scan (OCR)
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Voice Entry
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm max-w-4xl mx-auto">
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">New Sale / Bill Workflow</h4>
                    <p className="text-xs text-slate-500">Auto price-prefill for known items with blank fallback for custom entries</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Live Preview</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-800">Tata Salt (1kg)</span>
                    <span className="text-xs text-slate-500">Qty: 2 × ₹30</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">₹60</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-800">Aashirvaad Atta (5kg)</span>
                    <span className="text-xs text-slate-500">Qty: 1 × ₹310</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">₹310</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-800">Basmati Rice (5kg)</span>
                    <span className="text-xs text-slate-500">Qty: 1 × ₹480</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">₹480</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Total: ₹850 · Paid: ₹500</p>
                    <p className="text-base font-bold text-rose-600 tabular-nums">Pending Udhaar: ₹350</p>
                  </div>
                  <Button size="sm" onClick={onStartDemo}>Try Live in Demo</Button>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Conversational Customer Ledger</h4>
                    <p className="text-xs text-slate-500">Rahul Sharma · +91 98765 11223 · Customer since Jan 2025</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">₹1,250 Pending</span>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>SALE · 2 hours ago</span>
                      <span className="font-bold text-slate-900">Total ₹850</span>
                    </div>
                    <p className="text-slate-500">2 × Tata Salt, 1 × Aashirvaad Atta, 1 × Basmati Rice</p>
                    <p className="text-blue-600">Paid ₹500 via UPI · Balance ₹350 added to udhaar</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-emerald-700">
                      <span>PAYMENT RECEIVED · Yesterday</span>
                      <span className="font-bold text-emerald-600">+₹500</span>
                    </div>
                    <p className="text-slate-500">Cash received at counter</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scan' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">AI Bill OCR & Line-Item Extraction</h4>
                    <p className="text-xs text-slate-500">Converts messy paper bills into editable structured business records</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">95% OCR Accuracy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">Detected Vendor</p>
                    <p className="text-slate-600">Gupta Wholesale Traders</p>
                    <p className="text-[10px] text-slate-400 mt-1">Invoice #INV-4471</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">Total Detected</p>
                    <p className="text-base font-bold text-slate-900 tabular-nums">₹9,800</p>
                    <p className="text-[10px] text-emerald-600 mt-1">All 4 line items verified</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Hands-Free Voice Entry</h4>
                    <p className="text-xs text-slate-500">Understands Hindi, English, and Hinglish spoken commands</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Mic Ready</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">"Sold 3 Tata Salt to Rahul for 90 rupees"</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Parsed: Customer Rahul · Tata Salt (Qty: 3) · ₹90</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. MOBILE APP SPOTLIGHT (Matches uploaded reference image!) */}
      {/* ------------------------------------------------------------- */}
      <section id="mobile" className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">Purpose-Built Touch App</span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                Built for the counter, not just an office desktop.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                When you're standing behind the counter with customers in line, you need giant tap targets, instant customer search, one-tap voice entry, and zero clutter.
              </p>
              <ul className="space-y-4 text-sm text-slate-300 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Thumb-friendly smart entry area: [ Add ] [ Speak ] [ Scan ] [ Manual ]</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Filters: All, Udhaar, Recent, No Dues</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Conversational customer timeline with itemized bill breakdown</span>
                </li>
              </ul>
              <div className="flex gap-4">
                <Button onClick={onStartDemo} size="lg">
                  Try Mobile Demo Now
                </Button>
              </div>
            </div>

            {/* Mobile Device Mockup */}
            <div className="flex justify-center">
              <div className="w-[320px] sm:w-[360px] rounded-[44px] p-3 bg-slate-800 border-4 border-slate-700 shadow-2xl">
                <div className="rounded-[36px] bg-slate-50 text-slate-900 overflow-hidden border border-slate-200">
                  {/* Status Bar */}
                  <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100">
                    <span>9:41</span>
                    <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto" />
                    <span>5G</span>
                  </div>

                  {/* Mobile Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
                    <span className="font-display text-lg font-bold text-slate-900">LeadgerX</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      S
                    </div>
                  </div>

                  {/* Smart Entry Action Area */}
                  <div className="p-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white m-3 rounded-2xl shadow-sm">
                    <p className="text-[11px] font-semibold text-blue-100 mb-2.5">Quick Counter Actions</p>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm cursor-pointer">
                        <span className="block font-bold text-sm">+</span>
                        <span className="text-[10px] font-semibold">Add</span>
                      </div>
                      <div className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm cursor-pointer">
                        <Mic className="w-3.5 h-3.5 mx-auto mb-0.5" />
                        <span className="text-[10px] font-semibold">Speak</span>
                      </div>
                      <div className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm cursor-pointer">
                        <Camera className="w-3.5 h-3.5 mx-auto mb-0.5" />
                        <span className="text-[10px] font-semibold">Scan</span>
                      </div>
                      <div className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm cursor-pointer">
                        <FileText className="w-3.5 h-3.5 mx-auto mb-0.5" />
                        <span className="text-[10px] font-semibold">Manual</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter chips */}
                  <div className="px-4 flex gap-1.5 text-xs pb-2 overflow-x-auto">
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold text-[11px]">All</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px]">Udhaar</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px]">Recent</span>
                  </div>

                  {/* Customer row */}
                  <div className="p-3 bg-white mx-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        R
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Rahul Sharma</p>
                        <p className="text-[10px] text-slate-500">Last sale · 2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600 tabular-nums">₹1,250</p>
                      <span className="text-[9px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. TRANSPARENT PRICING */}
      {/* ------------------------------------------------------------- */}
      <section id="pricing" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">Simple Pricing</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Clear Plans for Every Stage of Business.
            </h2>
            <p className="text-slate-600 mt-4 text-base">
              Start free with no credit card required. Upgrade as your shop grows.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-xs font-semibold ${!annualBilling ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
              <button
                type="button"
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  annualBilling ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    annualBilling ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold ${annualBilling ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly <span className="text-emerald-600 font-bold ml-1">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starter</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 tabular-nums">Free</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Perfect for single counters and new shops getting started.</p>
                <div className="my-6 border-t border-slate-100" />
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Up to 100 customer ledgers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Fast sales & billing workflow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Udhaar tracking & payments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Mobile web app access</span>
                  </li>
                </ul>
              </div>
              <Button onClick={onNavigateSignup} variant="secondary" className="w-full mt-8">
                Start Free
              </Button>
            </div>

            {/* Growth */}
            <div className="bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-3xl p-8 border border-blue-500 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Growth</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tabular-nums">
                    {annualBilling ? '₹399' : '₹499'}
                  </span>
                  <span className="text-xs text-blue-200">/ month</span>
                </div>
                <p className="text-xs text-blue-100 mt-2">For busy retail stores needing OCR scanning and voice entry.</p>
                <div className="my-6 border-t border-white/20" />
                <ul className="space-y-3 text-xs text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Unlimited customer ledgers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>AI Bill Scanner & OCR processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Voice entry in Hindi & English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Reports & export data</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onNavigateSignup}
                className="w-full py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 shadow-md transition-all cursor-pointer mt-8"
              >
                Get Started
              </button>
            </div>

            {/* Business */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Business</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 tabular-nums">
                    {annualBilling ? '₹899' : '₹1,099'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For wholesalers, multi-counter stores, and multi-staff accounts.</p>
                <div className="my-6 border-t border-slate-100" />
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Everything in Growth</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Multi-staff cashier logins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Role-based access & audit logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dedicated priority assistance</span>
                  </li>
                </ul>
              </div>
              <Button onClick={onNavigateSignup} variant="secondary" className="w-full mt-8">
                Choose Business
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">Clear Answers</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. LARGE BLUE CTA */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-6 text-balance">
            Ready to bring clarity and speed to your business?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Join forward-thinking kirana stores and retail owners managing their sales and Udhaar with LeadgerX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateSignup}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-900 font-bold text-base hover:bg-blue-50 shadow-xl transition-all cursor-pointer active:scale-95"
            >
              Create Free Account
            </button>
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-base border border-white/30 backdrop-blur-md cursor-pointer"
            >
              Test Live Store Demo
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. DARK PREMIUM FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  LX
                </div>
                <span className="font-display text-xl font-bold text-white tracking-tight">LeadgerX</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Modern AI-assisted business operating system for retail stores, kirana shops, and growing commerce.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Fast Billing</a></li>
                <li><a href="#workspace" className="hover:text-white transition-colors">Customer Ledger</a></li>
                <li><a href="#scan-voice" className="hover:text-white transition-colors">Bill Scan OCR</a></li>
                <li><a href="#scan-voice" className="hover:text-white transition-colors">Voice Entry</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Solutions</p>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-400">Kirana & Grocery</span></li>
                <li><span className="text-slate-400">Wholesale Distribution</span></li>
                <li><span className="text-slate-400">Retail Counters</span></li>
                <li><span className="text-slate-400">Udhaar Management</span></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security</p>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-400">Multi-Tenant Isolation</span></li>
                <li><span className="text-slate-400">Role-Based Access</span></li>
                <li><span className="text-slate-400">Authoritative Balance</span></li>
                <li><span className="text-slate-400">Encrypted Secrets</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} LeadgerX. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Security Overview</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
