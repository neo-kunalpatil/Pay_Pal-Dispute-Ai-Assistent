import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PaymentLineChart } from '../components/common/SimpleCharts';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Wallet, 
  DollarSign, 
  ShoppingCart, 
  ShieldAlert, 
  Send, 
  Download, 
  CreditCard, 
  Settings, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    disputes, 
    setActiveTab, 
    setSelectedDisputeId,
    paypalConnected 
  } = useApp();

  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const pendingDisputes = (disputes || []).filter(d => d.status === 'Needs Response' || d.status === 'Under Review');
  const urgentDispute = (disputes || []).find(d => d.id === 'PP-D-12345') || disputes[0];

  return (
    <div className="space-y-6">
      {/* Welcome Greeting matching image_6d1c2c37.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            Welcome back, Kunal!
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Here's what's happening with your PayPal account today.
          </p>
        </div>

        {/* Quick PayPal Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>PayPal Sandbox Connected</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value="1,248"
          change="12%"
          isPositive={true}
          icon={<Wallet className="w-6 h-6" />}
          iconBgColor="bg-[#EAF4FC]"
          iconColor="text-[#0070BA]"
          onClick={() => { setActiveTab('transactions'); navigate('/transactions'); }}
        />

        <StatCard
          title="Total Payments"
          value="$24,780.50"
          change="18%"
          isPositive={true}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => { setActiveTab('transactions'); navigate('/transactions'); }}
        />

        <StatCard
          title="Pending Orders"
          value="42"
          change="5%"
          isPositive={true}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => { setActiveTab('transactions'); navigate('/transactions'); }}
        />

        <StatCard
          title="Open Disputes"
          value={pendingDisputes.length.toString()}
          change="50%"
          isPositive={false}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => { setActiveTab('disputes'); navigate('/disputes'); }}
          badgeLabel="Requires Action"
        />
      </div>

      {/* Middle Grid: Payment Overview Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payment Overview Chart matching screenshot */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0070BA]" />
              <h3 className="text-base font-bold text-[#172B4D]">Payment Overview</h3>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0070BA]"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Quarter</option>
            </select>
          </div>

          <PaymentLineChart timeRange={timeRange} />
        </div>

        {/* Right 1 Col: Quick Actions & AI Assistant matching screenshot */}
        <div className="space-y-6">
          {/* Quick Actions Grid matching screenshot */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center gap-2">
              <span className="text-[#0070BA]">⚡</span>
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('transactions')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-blue-50/40 text-center transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0070BA] flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 block">Send Money</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-blue-50/40 text-center transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 block">Request Payment</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-blue-50/40 text-center transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 block">View Transactions</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-blue-50/40 text-center transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 block">Manage Settings</span>
              </button>
            </div>
          </div>

          {/* AI Dispute Assistant Card matching merchant dashboard in image_25d7d2e4.png */}
          <div className="bg-gradient-to-br from-[#0070BA] to-[#003087] rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-sky-300" />
              <h4 className="text-sm font-bold">AI Dispute Assistant</h4>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Let AI help you retrieve invoices, verify delivery scans, detect timeline contradictions and draft PayPal rebuttals.
            </p>
            <button
              onClick={() => {
                setSelectedDisputeId('PP-D-12345');
                setActiveTab('ai-investigation');
                navigate('/ai-investigation');
              }}
              className="px-4 py-2 bg-white text-[#0070BA] hover:bg-blue-50 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Investigate PP-D-12345</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table matching image_6d1c2c37.png */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0070BA]" />
              <h3 className="text-base font-bold text-[#172B4D]">Recent Transactions</h3>
            </div>
            <button
              onClick={() => { setActiveTab('transactions'); navigate('/transactions'); }}
              className="text-xs font-bold text-[#0070BA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-1">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Dispute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-1 font-medium text-slate-600">{txn.date}</td>
                    <td className="py-3 font-semibold text-slate-800">{txn.type}</td>
                    <td className="py-3 font-medium text-slate-700">{txn.customerName}</td>
                    <td className={`py-3 text-right font-bold ${
                      txn.type === 'Payment Received' ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {txn.type === 'Payment Received' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3 text-right">
                      {txn.disputeId ? (
                        <button
                          onClick={() => {
                            setSelectedDisputeId(txn.disputeId!);
                            setActiveTab('dispute-details');
                          }}
                          className="text-[11px] font-bold text-[#0070BA] hover:underline"
                        >
                          {txn.disputeId}
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Dispute Deadlines Alert Card */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Upcoming Deadlines</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Urgent
            </span>
          </div>

          <div className="space-y-3">
            {disputes.slice(0, 3).map((disp) => (
              <div
                key={disp.id}
                onClick={() => {
                  setSelectedDisputeId(disp.id);
                  setActiveTab('dispute-details');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0070BA]">{disp.id}</span>
                  <span className="text-[11px] font-bold text-rose-600">
                    {disp.daysRemaining} days left
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {disp.customerName} • ${disp.amount.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {disp.reason}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('disputes')}
            className="w-full py-2.5 text-xs font-bold text-[#0070BA] bg-[#EAF4FC] hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <span>View All Dispute Deadlines</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
