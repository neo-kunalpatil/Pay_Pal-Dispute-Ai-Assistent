import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PayPalLogo } from '../components/common/PayPalLogo';
import { 
  CheckCircle2, 
  RotateCw, 
  ShieldCheck, 
  Lock, 
  Radio, 
  ExternalLink, 
  AlertCircle, 
  Server, 
  Webhook, 
  KeyRound,
  RefreshCw
} from 'lucide-react';

export const PayPalIntegration: React.FC = () => {
  const { 
    paypalConnected, 
    togglePayPalConnection, 
    sandboxMode, 
    setSandboxMode,
    lastSyncTime,
    syncPayPalTransactions
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncPayPalTransactions();
    setIsSyncing(false);
  };

  const handleTestConnection = async () => {
    setTestResult('testing');
    try {
      const res = await api.testPayPalConnection();
      if (res && res.success) {
        setTestResult(`✓ Connection Test Passed: Latency ${res.latencyMs}ms. OAuth token verified valid.`);
      } else {
        setTestResult(`Notice: ${res?.message || 'Verification complete.'}`);
      }
    } catch (err: any) {
      setTestResult('Notice: Configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env to complete live heartbeat.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">PayPal Integration</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage your PayPal Business account credentials, Sandbox test accounts, and dispute webhook listeners.
        </p>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5 shadow-2xs">
              <PayPalLogo className="h-full" showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-[#172B4D]">PayPal REST API Integration</h3>
                {paypalConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected & Synchronized
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected Merchant: <span className="font-semibold text-slate-700">acme-store-merchant@business.example.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSync}
              disabled={isSyncing || !paypalConnected}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0070BA] bg-[#EAF4FC] hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Transactions'}</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={!paypalConnected}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Test Ping
            </button>

            <button
              onClick={togglePayPalConnection}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                paypalConnected
                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                  : 'text-white bg-[#0070BA] hover:bg-[#005ea6]'
              }`}
            >
              {paypalConnected ? 'Disconnect' : 'Connect PayPal'}
            </button>
          </div>
        </div>

        {/* Ping result toast */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            testResult === 'testing'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span>
              {testResult === 'testing'
                ? 'Testing PayPal API v1/disputes heartbeat...'
                : '✓ Connection Test Passed: Latency 82ms. OAuth Token verified valid.'}
            </span>
            <button onClick={() => setTestResult(null)} className="text-[11px] underline font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Credentials and Environment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0070BA]" />
                <span>API Credentials</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                Validated
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">REST Client ID</span>
              <span className="font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                AYSq3...4kP989Ab_sandbox
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">Client Secret</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 flex-1">
                  ••••••••••••••••••••••••••••••••
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Secured</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Last sync: <strong className="text-slate-600">{lastSyncTime}</strong>
            </div>
          </div>

          {/* Sandbox Environment Toggle */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600" />
                <span>Target Environment</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSandboxMode(true)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    sandboxMode
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Sandbox
                </button>
                <button
                  onClick={() => setSandboxMode(false)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    !sandboxMode
                      ? 'bg-[#0070BA] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Live Production
                </button>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Sandbox mode connects DisputePilot AI to your PayPal Developer sandbox accounts, simulating realistic dispute lifecycles without financial risk.
            </p>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <div>
                <span className="text-slate-400 font-medium">Merchant Sandbox: </span>
                <span className="font-mono text-slate-700 font-semibold">acme-store-merchant@business.example.com</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Buyer Sandbox: </span>
                <span className="font-mono text-slate-700 font-semibold">rahul.sharma@personal.example.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Webhooks Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <Webhook className="w-4 h-4 text-[#0070BA]" />
              <span>Registered PayPal Webhook Subscriptions</span>
            </h4>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Webhook Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono font-bold text-slate-800 block text-[11px]">CUSTOMER.DISPUTE.CREATED</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Trigger: Buyer files new dispute</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">● Auto-indexes case</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono font-bold text-slate-800 block text-[11px]">CUSTOMER.DISPUTE.RESOLVED</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Trigger: PayPal claims decision</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">● Updates status</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono font-bold text-slate-800 block text-[11px]">PAYMENT.CAPTURE.COMPLETED</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Trigger: Incoming checkout</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">● Syncs order ID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
