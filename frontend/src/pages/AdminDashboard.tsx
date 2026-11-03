import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { DisputeTrendsBarChart } from '../components/common/SimpleCharts';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Users, 
  Activity, 
  Store, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Server,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { setActiveTab } = useApp();
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDashboard();
      setAdminData(data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const topMerchants = adminData?.topMerchants || [
    { rank: 1, name: 'Acme Store Merchant Operations', volume: '$949.99', disputes: '1', rate: '50.0%' },
  ];

  const recentActivities = adminData?.recentActivities || [
    { id: 'act-1', text: 'Dispute filed by buyer #PP-D-12345 (Rahul Sharma)', time: 'Oct 28', type: 'dispute' },
    { id: 'act-2', text: 'AI Investigation completed for dispute #PP-D-12345', time: 'Oct 28', type: 'investigation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header matching image_25d7d2e4.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            Platform Overview
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monitor disputes, merchants, and overall DisputePilot AI platform health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational</span>
          </span>
        </div>
      </div>

      {/* 4 Stats Cards matching admin dashboard in image_25d7d2e4.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Disputes"
          value={loading ? '...' : (adminData?.totalDisputes ?? 1).toString()}
          change="Real-time"
          isPositive={true}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Resolved"
          value={loading ? '...' : (adminData?.resolvedDisputes ?? 0).toString()}
          change="Real-time"
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Pending"
          value={loading ? '...' : (adminData?.activeDisputes ?? 1).toString()}
          change="Active"
          isPositive={false}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Users"
          value={loading ? '...' : (adminData?.totalUsers ?? 4).toString()}
          change="Neon DB"
          isPositive={true}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Middle 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dispute Trends + Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Trends Bar Chart matching screenshot */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172B4D]">Dispute Trends</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                This Week
              </span>
            </div>

            <DisputeTrendsBarChart />
          </div>

          {/* Recent Activities feed matching screenshot */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172B4D]">Recent Activities</h3>
              <span className="text-xs font-bold text-[#0070BA] cursor-pointer hover:underline">
                View All →
              </span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#0070BA] shrink-0"></span>
                    <span className="font-medium text-slate-700 truncate">{act.text}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Merchants & System Health */}
        <div className="space-y-6">
          {/* Top Merchants Leaderboard matching screenshot */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172B4D]">Top Merchants</h3>
              <span className="text-xs font-bold text-[#0070BA] cursor-pointer hover:underline">
                View All →
              </span>
            </div>

            <div className="space-y-2.5">
              {topMerchants.map((m: any) => (
                <div
                  key={m.rank}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                      {m.rank}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block">{m.name}</span>
                      <span className="text-[10px] text-slate-400">{m.volume} processed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-700">{m.disputes} disputes</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">{m.rate} rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Card matching screenshot */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-6 shadow-xs text-center space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D]">System Health</h3>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">All Systems Operational</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                PayPal API Gateway, OCR Ingestion & Multi-Agent Cluster are operating at normal capacity.
              </p>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Server className="w-3.5 h-3.5" />
              <span>Latency: 42ms • Uptime: 99.98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
