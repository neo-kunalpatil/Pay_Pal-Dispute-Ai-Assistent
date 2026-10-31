import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PayPalLogo } from '../components/common/PayPalLogo';
import { User, Store, Shield, ArrowRight, ShieldCheck, Lock, Search, Sparkles, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoLogin = async (role: UserRole, email: string, pwd: string) => {
    setDemoLoading(role);
    setErrorMessage(null);
    try {
      await login(role, email, pwd);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleContinue = async () => {
    let email = 'merchant@disputepilot.demo';
    let pwd = 'Merchant@12345';
    if (selectedRole === 'buyer') {
      email = 'rahul.sharma@example.com';
      pwd = 'password123';
    } else if (selectedRole === 'admin') {
      email = 'admin@disputepilot.demo';
      pwd = 'Admin@12345';
    } else if (selectedRole === 'analyst') {
      email = 'analyst@disputepilot.demo';
      pwd = 'Analyst@12345';
    }
    await handleDemoLogin(selectedRole, email, pwd);
  };

  const roles = [
    {
      id: 'merchant' as UserRole,
      title: 'Merchant',
      subtitle: 'Manage payments & disputes',
      icon: Store,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'analyst' as UserRole,
      title: 'Analyst',
      subtitle: 'Audit evidence & response drafts',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      subtitle: 'Monitor & oversee platform',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'buyer' as UserRole,
      title: 'Buyer',
      subtitle: 'Track orders & raise disputes',
      icon: User,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF3FC] via-[#F4F8FD] to-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-r from-blue-100/40 via-sky-100/50 to-indigo-100/30 rounded-b-[100px] pointer-events-none -z-0"></div>

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10 py-2">
        <div className="flex items-center gap-3">
          <PayPalLogo className="h-8" showWordmark={true} />
          <span className="text-slate-300 font-light text-xl">|</span>
          <span className="text-xl font-bold text-[#142B4A] tracking-tight">DisputePilot AI</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Protected by</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
            <Lock className="w-3 h-3 text-[#0070BA]" />
            <span>PayPal Sandbox Demo</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-2xl w-full mx-auto my-auto relative z-10 pt-4 pb-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#0070BA] via-sky-400 to-[#142B4A]"></div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <PayPalLogo className="h-9" showWordmark={true} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            DisputePilot AI
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-md mx-auto">
            Smarter Dispute Resolution for a Safer Commerce
          </p>

          <div className="my-7 flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0070BA] flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#172B4D]">Welcome Back!</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your role to continue with DisputePilot AI
            </p>
          </div>

          {/* Role selector cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 sm:p-4 rounded-2xl border-2 text-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-[#0070BA] bg-[#F5F9FE] shadow-md ring-2 ring-[#0070BA]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center text-[10px] font-bold">
                      &#10003;
                    </div>
                  )}

                  <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${r.bgColor} ${r.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-sm font-bold text-[#172B4D]">{r.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {r.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleContinue}
            disabled={demoLoading !== null}
            className="w-full py-3 px-6 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm shadow-md shadow-[#0070BA]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {demoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Neon DB...</span>
              </>
            ) : (
              <>
                <span>Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Real Backend Authenticated Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-slate-200/90 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  One-Click Demo Accounts (Neon DB + JWT Auth)
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Live Backend</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Platform Admin Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'admin@disputepilot.demo', 'Admin@12345')}
                disabled={demoLoading !== null}
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">Admin</span>
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-[10px] text-purple-700 mt-1 font-mono truncate">
                  admin@disputepilot.demo
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-purple-800">
                  <span>{demoLoading === 'admin' ? 'Logging in...' : 'Sign in \u2192'}</span>
                </div>
              </button>

              {/* Merchant Owner Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('merchant', 'merchant@disputepilot.demo', 'Merchant@12345')}
                disabled={demoLoading !== null}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Merchant</span>
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 font-mono truncate">
                  merchant@disputepilot.demo
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-800">
                  <span>{demoLoading === 'merchant' ? 'Logging in...' : 'Sign in \u2192'}</span>
                </div>
              </button>

              {/* Dispute Analyst Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('analyst', 'analyst@disputepilot.demo', 'Analyst@12345')}
                disabled={demoLoading !== null}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Analyst</span>
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] text-blue-700 mt-1 font-mono truncate">
                  analyst@disputepilot.demo
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-blue-800">
                  <span>{demoLoading === 'analyst' ? 'Logging in...' : 'Sign in \u2192'}</span>
                </div>
              </button>

              {/* Verified Buyer Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer', 'rahul.sharma@example.com', 'password123')}
                disabled={demoLoading !== null}
                className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/80 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">Buyer</span>
                  <User className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <p className="text-[10px] text-sky-700 mt-1 font-mono truncate">
                  rahul.sharma@example.com
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-sky-800">
                  <span>{demoLoading === 'buyer' ? 'Logging in...' : 'Sign in \u2192'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs text-slate-400">
              <span className="bg-white px-3 font-medium">or</span>
            </div>
          </div>

          {/* PayPal Login Button */}
          <button
            onClick={handleContinue}
            disabled={demoLoading !== null}
            className="w-full py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#172B4D] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <PayPalLogo className="h-5" showWordmark={false} />
            <span>Login with PayPal (1-Click JWT Demo)</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 relative z-10">
        <p>&copy; 2026 DisputePilot AI. Built for PayPal Merchant Dispute Operations.</p>
      </footer>
    </div>
  );
};
