import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { PayPalLogo } from '../common/PayPalLogo';
import { 
  User, 
  Store, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Headphones
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'merchant'
}) => {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Form fields
  const [email, setEmail] = useState('merchant@disputepilot.demo');
  const [password, setPassword] = useState('Merchant@12345');
  const [name, setName] = useState('Acme Merchant Owner');
  const [businessName, setBusinessName] = useState('Acme Store Inc.');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setRole(initialRole);
    applyDemoCreds(initialRole);
    setErrorMessage(null);
  }, [initialMode, initialRole]);

  const applyDemoCreds = (targetRole: UserRole) => {
    setRole(targetRole);
    setErrorMessage(null);
    if (targetRole === 'merchant') {
      setEmail('merchant@disputepilot.demo');
      setPassword('Merchant@12345');
      setName('Acme Merchant Owner');
      setBusinessName('Acme Store Inc.');
    } else if (targetRole === 'buyer') {
      setEmail('rahul.sharma@example.com');
      setPassword('password123');
      setName('Rahul Sharma');
      setBusinessName('Verified Buyer');
    } else if (targetRole === 'analyst') {
      setEmail('analyst@disputepilot.demo');
      setPassword('Analyst@12345');
      setName('Dispute Analyst');
      setBusinessName('Dispute Operations Team');
    } else {
      setEmail('admin@disputepilot.demo');
      setPassword('Admin@12345');
      setName('Platform Admin');
      setBusinessName('Dispute Operations Team');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signup') {
        try {
          await register({
            fullName: name.trim(),
            businessName: businessName.trim() || `${name.trim()}'s Store`,
            email: email.trim(),
            password,
            role
          });
        } catch (regErr: any) {
          const errMsg = (regErr.message || '').toLowerCase();
          if (errMsg.includes('already exists') || errMsg.includes('duplicate') || errMsg.includes('registered')) {
            // Seamlessly log in if account was already created
            await login(role, email.trim(), password);
          } else {
            throw regErr;
          }
        }
      } else {
        await login(role, email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'buyer' as UserRole,
      title: 'Buyer',
      subtitle: 'Track orders & raise disputes',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'merchant' as UserRole,
      title: 'Merchant',
      subtitle: 'Manage payments & disputes',
      icon: Store,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      subtitle: 'Monitor & oversee platform',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-xl"
    >
      <div className="text-center pt-1 pb-4">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <PayPalLogo className="h-8" showWordmark={true} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#142B4A] tracking-tight">
          {mode === 'login' ? 'Welcome Back!' : 'Create Your PayPal Account'}
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {mode === 'login'
            ? 'Login with real JWT authentication to continue with DisputePilot AI'
            : 'Sign up to manage transactions and dispute resolution with real Neon DB'}
        </p>

        {/* Mode Toggle: Log In vs Sign Up */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#0070BA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#0070BA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-left">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;

            return (
              <div
                key={r.id}
                onClick={() => applyDemoCreds(r.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0070BA] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${r.bgColor} ${r.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#0070BA]"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-800">{r.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  {r.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* One-Click Demo Credentials Toolbar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              One-Click Demo Credentials:
            </span>
            <span className="text-[10px] text-slate-400">Autofill & authenticate</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyDemoCreds('merchant')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                role === 'merchant'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Merchant (Acme)
            </button>
            <button
              type="button"
              onClick={() => applyDemoCreds('buyer')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                role === 'buyer'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Buyer (Rahul)
            </button>
            <button
              type="button"
              onClick={() => applyDemoCreds('analyst')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                role === 'analyst'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Analyst (Claims)
            </button>
            <button
              type="button"
              onClick={() => applyDemoCreds('admin')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Admin (Platform)
            </button>
          </div>
        </div>

        {/* Error message if auth fails */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left text-xs">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Organization / Store
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                  placeholder="Business Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none text-xs"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-[10px] text-[#0070BA] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none text-xs"
              placeholder="••••••••••••"
            />
          </div>

          {/* Continue button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs shadow-md shadow-[#0070BA]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Neon DB...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? `Continue to ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
                    : `Create Account & Open Dashboard`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] text-slate-400">
            <span className="bg-white px-3 font-medium">or</span>
          </div>
        </div>

        {/* Fast Demo Login with PayPal */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <PayPalLogo className="h-4" showWordmark={false} />
          <span>Login with PayPal (1-Click JWT Demo)</span>
        </button>
      </div>
    </Modal>
  );
};
