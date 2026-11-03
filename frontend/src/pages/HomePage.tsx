import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PayPalLogo } from '../components/common/PayPalLogo';
import { 
  Store, 
  User, 
  Shield, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Send, 
  Clock, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  CreditCard,
  Bot,
  Code2,
  HelpCircle,
  AlertTriangle,
  Layers,
  Terminal,
  ExternalLink,
  BookOpen,
  Check,
  PackageCheck,
  RefreshCw,
  Search,
  Copy,
  Sliders,
  DollarSign,
  Scale
} from 'lucide-react';

type NavTab = 'overview' | 'personal' | 'business' | 'disputes' | 'developer' | 'help';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    setIsAuthModalOpen, 
    setAuthModalMode, 
    setAuthModalRole 
  } = useApp();

  const [activeNavTab, setActiveNavTab] = useState<NavTab>('overview');
  const [activePortalTab, setActivePortalTab] = useState<UserRole>('merchant');

  // Interactive inline demo login fields
  const [demoEmail, setDemoEmail] = useState('merchant@disputepilot.demo');
  const [demoPassword, setDemoPassword] = useState('Merchant@12345');
  const [activeAgentStep, setActiveAgentStep] = useState<number>(0);

  // Tab 1: Personal Interactive Buyer Simulator state
  const [buyerSimAmount, setBuyerSimAmount] = useState<number>(120);
  const [buyerSimReason, setBuyerSimReason] = useState<'inr' | 'snad'>('inr');
  const [buyerSimShipped, setBuyerSimShipped] = useState<boolean>(true);
  const [buyerActiveStep, setBuyerActiveStep] = useState<number>(1);

  // Tab 2: Business Interactive Seller Protection Checker state
  const [sellerCheckAmount, setSellerCheckAmount] = useState<number>(800);
  const [sellerHasTracking, setSellerHasTracking] = useState<boolean>(true);
  const [sellerHasSignature, setSellerHasSignature] = useState<boolean>(false);
  const [sellerDisputeVolume, setSellerDisputeVolume] = useState<number>(12);

  // Tab 3: Dispute Resolution Interactive Case state
  const [aiActiveCase, setAiActiveCase] = useState<'case1' | 'case2'>('case1');

  // Tab 4: Developer Live API Endpoint state
  const [activeApiEndpoint, setActiveApiEndpoint] = useState<'login' | 'disputes' | 'investigate' | 'paypal'>('disputes');
  const [apiCopied, setApiCopied] = useState<boolean>(false);
  const [apiLiveOutput, setApiLiveOutput] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Tab 5: Help Accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Sync with browser URL path
  useEffect(() => {
    const path = location.pathname.toLowerCase().replace('/', '');
    if (path === 'personal') setActiveNavTab('personal');
    else if (path === 'business') setActiveNavTab('business');
    else if (path === 'dispute-resolution' || path === 'disputes') setActiveNavTab('disputes');
    else if (path === 'developer') setActiveNavTab('developer');
    else if (path === 'help') setActiveNavTab('help');
    else if (path === '' || path === 'home' || path === 'overview') setActiveNavTab('overview');
  }, [location.pathname]);

  const handlePortalTabChange = (role: UserRole) => {
    setActivePortalTab(role);
    if (role === 'merchant') {
      setDemoEmail('merchant@disputepilot.demo');
      setDemoPassword('Merchant@12345');
    } else if (role === 'buyer') {
      setDemoEmail('rahul.sharma@example.com');
      setDemoPassword('password123');
    } else {
      setDemoEmail('admin@disputepilot.demo');
      setDemoPassword('Admin@12345');
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(activePortalTab, demoEmail, demoPassword);
  };

  const openAuth = (mode: 'login' | 'signup', role: UserRole = 'merchant') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleNavClick = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'overview') {
      navigate('/');
    } else if (tab === 'disputes') {
      navigate('/dispute-resolution');
    } else {
      navigate(`/${tab}`);
    }
    const contentEl = document.getElementById('tab-content-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyApiSnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  const handleTestApiCall = async () => {
    setApiLoading(true);
    setApiLiveOutput(null);
    try {
      let url = 'http://localhost:8000/api/v1/disputes';
      let method = 'GET';
      let body: any = undefined;

      if (activeApiEndpoint === 'login') {
        url = 'http://localhost:8000/api/v1/auth/login';
        method = 'POST';
        body = JSON.stringify({ email: 'merchant@disputepilot.demo', password: 'Merchant@12345', role: 'merchant' });
      } else if (activeApiEndpoint === 'investigate') {
        url = 'http://localhost:8000/api/v1/disputes/PP-D-12345/investigate';
        method = 'POST';
      } else if (activeApiEndpoint === 'paypal') {
        url = 'http://localhost:8000/api/v1/paypal/test-connection';
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      setApiLiveOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiLiveOutput(JSON.stringify({ error: err.message || 'API call failed' }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172B4D] flex flex-col">
      {/* Official PayPal Top Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => { setActiveNavTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <PayPalLogo className="h-8" showWordmark={true} />
              <span className="text-xs font-bold text-[#0070BA] bg-[#EAF4FC] px-2.5 py-0.5 rounded-full border border-[#BDE0FE]">
                DisputePilot AI
              </span>
            </div>

            {/* Interactive Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => handleNavClick('personal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNavTab === 'personal'
                    ? 'text-[#0070BA] bg-[#EAF4FC] font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-[#0070BA] hover:bg-slate-50'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('business')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNavTab === 'business'
                    ? 'text-[#0070BA] bg-[#EAF4FC] font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-[#0070BA] hover:bg-slate-50'
                }`}
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('disputes')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNavTab === 'disputes'
                    ? 'text-[#0070BA] bg-[#EAF4FC] font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-[#0070BA] hover:bg-slate-50'
                }`}
              >
                Dispute Resolution
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('developer')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNavTab === 'developer'
                    ? 'text-[#0070BA] bg-[#EAF4FC] font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-[#0070BA] hover:bg-slate-50'
                }`}
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('help')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNavTab === 'help'
                    ? 'text-[#0070BA] bg-[#EAF4FC] font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-[#0070BA] hover:bg-slate-50'
                }`}
              >
                Help
              </button>
            </nav>
          </div>

          {/* Auth CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login', 'merchant')}
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-[#0070BA] border border-[#0070BA] hover:bg-[#EAF4FC] transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => openAuth('signup', 'merchant')}
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] transition-colors shadow-xs cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F4F9FD] to-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#0070BA]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered PayPal Payment Dispute Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#142B4A] tracking-tight leading-tight">
            The Simpler, Safer Way to Pay & <br className="hidden sm:inline" />
            <span className="text-[#0070BA]">Resolve Payment Disputes</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Monitor PayPal transactions, upload proof of shipment, let AI detect date contradictions and missing evidence, and submit merchant-approved rebuttals directly to PayPal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuth('signup', 'merchant')}
              className="px-6 py-3 rounded-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm shadow-md shadow-[#0070BA]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Sign Up for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('demo-portals');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all cursor-pointer shadow-2xs"
            >
              Explore Demo Portals ↓
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PayPal Seller Protection Compatible</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#0070BA]" />
              <span>Official PayPal Sandbox Ready</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>5-Stage AI Multi-Agent Pipeline</span>
            </span>
          </div>
        </div>
      </section>

      {/* DEDICATED TAB CONTENT SECTION (Triggered by Navbar click) */}
      <section id="tab-content-section" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          {/* Section Sub-nav Pill Filter */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Platform Overview', icon: Layers },
              { id: 'personal', label: 'Personal (Buyers)', icon: User },
              { id: 'business', label: 'Business (Merchants)', icon: Store },
              { id: 'disputes', label: 'Dispute Resolution AI', icon: Sparkles },
              { id: 'developer', label: 'Developer & API', icon: Code2 },
              { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id as NavTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#0070BA] text-white shadow-md shadow-[#0070BA]/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PERSONAL (BUYERS) */}
          {activeNavTab === 'personal' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  PayPal for Personal Buyers
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  Shop with Confidence & Track Claims Seamlessly
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every transaction processed with PayPal includes comprehensive Buyer Protection. If an order never arrives or differs significantly from description, dispute resolution is right at your fingertips.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0070BA] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">100% Purchase Protection</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Eligible goods are covered up to the full transaction value including shipping costs if an item fails to arrive.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">1-Click Claim Filing</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select your order from your account history and file an Item Not Received (INR) or SNAD claim in under 60 seconds.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">Live 4-Step Case Stepper</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Track case progress transparently: Submitted &rarr; Under Review &rarr; Merchant Responded &rarr; Resolved.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#142B4A]">Ready to test the Buyer Experience?</h4>
                  <p className="text-xs text-slate-600">Access the pre-seeded Rahul Sharma account to explore live orders and dispute filing.</p>
                </div>
                <button
                  onClick={() => login('buyer', 'rahul.sharma@example.com', 'password123')}
                  className="px-5 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Launch Buyer Portal (Rahul)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESS (MERCHANTS) */}
          {activeNavTab === 'business' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  PayPal for Business & Merchants
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  Automate Seller Protection & Win Rebuttals Faster
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Turn hours of tedious manual claim research into a streamlined 5-minute automated workflow with autonomous document retrieval and structured AI rebuttals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">Seller Protection Compliance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automatic verification of tracking GPS scans, recipient full addresses, and signature confirmation mandates on transactions exceeding $750.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0070BA] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">Evidence Vault & Text OCR</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload invoices, packing slips, freight dispatch sheets, and customer emails. Text is extracted and indexed via pgvector semantic search.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">Deadline Countdown Triage</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    High-priority alerting when disputes near the 10-day PayPal window, preventing automatic default chargeback penalties.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#142B4A]">Experience the Merchant Operations Center</h4>
                  <p className="text-xs text-slate-600">Access the Acme Store workspace to inspect dispute PP-D-12345, evidence vault, and AI rebuttal synthesis.</p>
                </div>
                <button
                  onClick={() => login('merchant', 'merchant@disputepilot.demo', 'Merchant@12345')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span>Launch Merchant Portal (Acme Store)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DISPUTE RESOLUTION AI */}
          {activeNavTab === 'disputes' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Autonomous Multi-Agent AI
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  5-Stage LangGraph AI Pipeline Architecture
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our pipeline runs 5 specialized AI agents sequentially using pgvector dense vector retrieval and Gemini models to formulate airtight merchant rebuttals.
                </p>
              </div>

              {/* 5-Agent Interactive Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { step: 1, name: 'Dispute Understanding', agent: 'Agent 1', desc: 'Parses buyer complaint, identifies dispute reason & monetary risk.' },
                  { step: 2, name: 'Evidence Retrieval', agent: 'Agent 2', desc: 'Semantic search over merchant documents via pgvector 384-dim embeddings.' },
                  { step: 3, name: 'Evidence Verification', agent: 'Agent 3', desc: 'Detects date anomalies & discrepancies between tracking and statements.' },
                  { step: 4, name: 'Policy Analysis', agent: 'Agent 4', desc: 'Evaluates claim against PayPal Seller Protection & store terms.' },
                  { step: 5, name: 'Response Generation', agent: 'Agent 5', desc: 'Synthesizes professional structured rebuttal letter citing evidence.' }
                ].map((s, idx) => (
                  <div
                    key={s.step}
                    onClick={() => setActiveAgentStep(idx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      activeAgentStep === idx
                        ? 'border-[#0070BA] bg-blue-50/50 shadow-md ring-2 ring-[#0070BA]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Step 0{s.step}</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-1">{s.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Agent Detail Callout Box */}
              <div className="p-6 rounded-2xl bg-[#0A192F] text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-300">Live Engine: LangGraph + Gemini 3.5 Flash Lite + pgvector</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deterministic Rebuttal Formulator</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="font-bold text-slate-300 block uppercase text-[10px]">Contradiction Detection In Action:</span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      Buyer asserts: "Delivery occurred on Oct 22, item missing."<br />
                      Carrier scan confirms: "FedEx Ground package dispatched on Oct 25 under tracking #794829103942."<br />
                      &rarr; <span className="text-amber-400 font-bold">Chronological Anomaly Flagged: Dispatch occurred after asserted delivery date.</span>
                    </p>
                  </div>
                  <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="font-bold text-slate-300 block uppercase text-[10px]">Seller Protection Rule Check:</span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      Order Value: $800.00 USD (Exceeds $750.00 threshold)<br />
                      Mandate: Physical or Electronic Signature Confirmation (POD) required.<br />
                      &rarr; <span className="text-cyan-300 font-bold">Requirement highlighted in missing evidence checklist for merchant review.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER & API */}
          {activeNavTab === 'developer' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Developer Platform & API
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  FastAPI REST Engine & PayPal Webhook Listeners
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full programmatic control over payment ingestion, pgvector similarity lookups, automated rebuttal drafting, and PayPal Sandbox order testing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Specs */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#0070BA]" />
                    <h3 className="font-bold text-base text-[#172B4D]">Core REST API Endpoints</h3>
                  </div>
                  <ul className="space-y-2 text-xs font-mono">
                    <li className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-blue-600">POST /api/v1/auth/login</span>
                      <span className="text-slate-400">JWT Token Auth</span>
                    </li>
                    <li className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-emerald-600">GET /api/v1/disputes</span>
                      <span className="text-slate-400">Filter & List Disputes</span>
                    </li>
                    <li className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-purple-600">POST /api/v1/disputes/:id/investigate</span>
                      <span className="text-slate-400">Execute 5 AI Agents</span>
                    </li>
                    <li className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-amber-600">POST /api/v1/paypal/test-connection</span>
                      <span className="text-slate-400">OAuth Sandbox Ping</span>
                    </li>
                  </ul>

                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] hover:underline pt-1"
                  >
                    <span>Open Interactive Swagger Docs (/docs)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Integration Details */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-[#172B4D]">Architecture Stack</h3>
                  </div>
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Database & Vectors:</strong> Neon Serverless PostgreSQL with pgvector extension enabled for 384-dimensional dense sentence embeddings.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Authentication:</strong> Stateless JWT Bearer tokens with Argon2/bcrypt password hashing and tenant isolation.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>PayPal Sandbox:</strong> Orders v2 & Disputes v1 APIs with live token generation and simulated webhook payload ingestion.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HELP & FAQ */}
          {activeNavTab === 'help' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Help Center & Guidelines
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  Frequently Asked Questions & Dispute Advice
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Best practices for resolving PayPal buyer claims, understanding Seller Protection thresholds, and leveraging automated evidence synthesis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-[#172B4D]">What is the difference between INR and SNAD disputes?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Item Not Received (INR)</strong> claims occur when a customer asserts their package never arrived. <strong>Significantly Not As Described (SNAD)</strong> claims occur when the buyer claims the delivered item arrived broken, defective, or incorrect.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-[#172B4D]">What evidence is required to win an INR dispute?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Online trackable proof of delivery showing carrier dispatch date, tracking status as delivered, and the recipient's city/state matching the PayPal transaction details. For transactions over $750, signature confirmation is mandatory.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-[#172B4D]">How does AI Contradiction Detection work?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Agent 3 scans the customer's written complaint alongside courier transit logs. If a customer asserts they were home on date X, but shipping timestamps verify delivery on date Y, the chronological inconsistency is surfaced for merchant rebuttal.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-[#172B4D]">Can I test with PayPal Sandbox credentials?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yes. The platform is pre-connected to the official PayPal Sandbox environment. You can test OAuth handshake, live connection latencies, and dispute synchronization in real time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 0: OVERVIEW (Default) */}
          {activeNavTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-xl font-bold text-[#142B4A]">Platform Capabilities at a Glance</h3>
                <p className="text-xs text-slate-500">
                  Select any tab above to inspect role workflows, AI agent architecture, developer endpoints, or dispute resolution guides.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div onClick={() => setActiveNavTab('personal')} className="p-4 rounded-xl border border-slate-200 hover:border-[#0070BA] bg-white hover:bg-blue-50/30 transition-all cursor-pointer">
                  <User className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="font-bold text-xs text-slate-800 block">Personal Portal</span>
                  <span className="text-[10px] text-slate-400">Order & claim tracking</span>
                </div>
                <div onClick={() => setActiveNavTab('business')} className="p-4 rounded-xl border border-slate-200 hover:border-[#0070BA] bg-white hover:bg-emerald-50/30 transition-all cursor-pointer">
                  <Store className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <span className="font-bold text-xs text-slate-800 block">Business Portal</span>
                  <span className="text-[10px] text-slate-400">Evidence & rebuttal hub</span>
                </div>
                <div onClick={() => setActiveNavTab('disputes')} className="p-4 rounded-xl border border-slate-200 hover:border-[#0070BA] bg-white hover:bg-purple-50/30 transition-all cursor-pointer">
                  <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <span className="font-bold text-xs text-slate-800 block">AI Investigation</span>
                  <span className="text-[10px] text-slate-400">5-stage multi-agent</span>
                </div>
                <div onClick={() => setActiveNavTab('developer')} className="p-4 rounded-xl border border-slate-200 hover:border-[#0070BA] bg-white hover:bg-indigo-50/30 transition-all cursor-pointer">
                  <Code2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <span className="font-bold text-xs text-slate-800 block">Developer API</span>
                  <span className="text-[10px] text-slate-400">pgvector & Swagger docs</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOME PAGE DEMO PORTALS */}
      <section id="demo-portals" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F6F8FB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
              Access DisputePilot AI Portals
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
              Choose your role below or test with pre-configured demo credentials. Adding your ID & password opens the dedicated dashboard.
            </p>
          </div>

          {/* 3 Tabs: Buyer, Merchant, Admin */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
              <button
                type="button"
                onClick={() => handlePortalTabChange('merchant')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activePortalTab === 'merchant'
                    ? 'bg-white text-[#0070BA] shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Store className={`w-4 h-4 ${activePortalTab === 'merchant' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Merchant</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalTabChange('buyer')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activePortalTab === 'buyer'
                    ? 'bg-white text-[#0070BA] shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <User className={`w-4 h-4 ${activePortalTab === 'buyer' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalTabChange('admin')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activePortalTab === 'admin'
                    ? 'bg-white text-[#0070BA] shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Shield className={`w-4 h-4 ${activePortalTab === 'admin' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>Admin</span>
              </button>
            </div>

            {/* Tab Body: Details + Demo ID & Pass Form */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Description */}
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {activePortalTab === 'merchant' ? 'Store Operations' : activePortalTab === 'buyer' ? 'Customer Protection' : 'Platform Governance'}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#172B4D]">
                    {activePortalTab === 'merchant' && 'Merchant Payment & Dispute Hub'}
                    {activePortalTab === 'buyer' && 'Buyer Order & Dispute Tracking'}
                    {activePortalTab === 'admin' && 'Platform Overview & Health Monitor'}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activePortalTab === 'merchant' &&
                      'Manage PayPal payments, retrieve invoices, inspect shipping carrier tracking, let AI agents detect contradictions, and submit approved rebuttal packages.'}
                    {activePortalTab === 'buyer' &&
                      'Review past purchases, monitor delivery status, open dispute claims for undelivered items, and follow PayPal resolution progress in real time.'}
                    {activePortalTab === 'admin' &&
                      'Monitor cross-merchant dispute statistics, resolution turnaround rates, weekly volume trends, and PayPal API webhook health.'}
                  </p>

                  <ul className="text-xs space-y-2 text-slate-700">
                    {activePortalTab === 'merchant' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Interactive Payment Overview Line Chart with $14,250.00 tooltip</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>5-Stage AI Multi-Agent Autonomous Investigation Pipeline</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Drag-and-Drop Evidence Vault with OCR Text Extraction</span>
                        </li>
                      </>
                    )}
                    {activePortalTab === 'buyer' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Interactive "Raise a Dispute" Modal against Orders</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Live 4-Step Case Progress Tracker</span>
                        </li>
                      </>
                    )}
                    {activePortalTab === 'admin' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Weekly Dispute Trends Bar Chart (Pending vs Resolved)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Top Merchants Volume Leaderboard & Health Monitoring</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Right Demo Form: Demo ID & Pass */}
                <div className="md:col-span-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#0070BA]" />
                      <span>Demo Sign In</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Pre-filled Demo Access
                    </span>
                  </div>

                  <form onSubmit={handleInlineLogin} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Demo User ID / Email
                      </label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:border-[#0070BA] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Demo Password
                      </label>
                      <input
                        type="password"
                        required
                        value={demoPassword}
                        onChange={(e) => setDemoPassword(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:border-[#0070BA] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs shadow-md shadow-[#0070BA]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Sign In & Open {activePortalTab.charAt(0).toUpperCase() + activePortalTab.slice(1)} Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => openAuth('signup', activePortalTab)}
                      className="text-xs font-semibold text-slate-600 hover:text-[#0070BA] cursor-pointer"
                    >
                      Don't have an account? <strong className="underline">Sign up with PayPal</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official PayPal Style Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <PayPalLogo className="h-6" showWordmark={true} />
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <button onClick={() => handleNavClick('personal')} className="hover:text-[#0070BA] cursor-pointer">Personal</button>
              <button onClick={() => handleNavClick('business')} className="hover:text-[#0070BA] cursor-pointer">Business</button>
              <button onClick={() => handleNavClick('disputes')} className="hover:text-[#0070BA] cursor-pointer">Dispute Resolution</button>
              <button onClick={() => handleNavClick('developer')} className="hover:text-[#0070BA] cursor-pointer">Developer</button>
              <button onClick={() => handleNavClick('help')} className="hover:text-[#0070BA] cursor-pointer">Help & Contact</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>&copy; 2026 PayPal, Inc. All rights reserved. DisputePilot AI platform preview environment.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavClick('help')} className="hover:underline cursor-pointer">Privacy & Policy</button>
              <button onClick={() => handleNavClick('developer')} className="hover:underline cursor-pointer">API Reference</button>
              <button onClick={() => handleNavClick('help')} className="hover:underline cursor-pointer">FAQ</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
