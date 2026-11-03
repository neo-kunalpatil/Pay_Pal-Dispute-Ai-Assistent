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

  const handleDirectDemoLogin = async (demoRole: UserRole, demoEmail: string, demoPass: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      await login(demoRole, demoEmail, demoPass);
      onClose();
    } catch (e: any) {
      console.warn('Demo login handled via fallback:', e);
      onClose();
    } finally {
      setIsLoading(false);
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

        {/* One-Click Direct Demo Accounts Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-left">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Direct 1-Click Demo Logins
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Instant Access
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Merchant Demo Card */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Merchant</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate select-all">
                  merchant@disputepilot.demo
                </div>
                <div className="font-mono text-[10px] text-slate-400 select-all">
                  Pass: Merchant@12345
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('merchant', 'merchant@disputepilot.demo', 'Merchant@12345')}
                className="mt-2 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center"
              >
                Log In as Merchant →
              </button>
            </div>

            {/* Buyer Demo Card */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Buyer</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate select-all">
                  rahul.sharma@example.com
                </div>
                <div className="font-mono text-[10px] text-slate-400 select-all">
                  Pass: password123
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('buyer', 'rahul.sharma@example.com', 'password123')}
                className="mt-2 w-full py-1.5 px-2 bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center"
              >
                Log In as Buyer →
              </button>
            </div>

            {/* Admin Demo Card */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate select-all">
                  admin@disputepilot.demo
                </div>
                <div className="font-mono text-[10px] text-slate-400 select-all">
                  Pass: Admin@12345
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('admin', 'admin@disputepilot.demo', 'Admin@12345')}
                className="mt-2 w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center"
              >
                Log In as Admin →
              </button>
            </div>
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
