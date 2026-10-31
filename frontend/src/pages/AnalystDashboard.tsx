import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  Sparkles,
  FileQuestion,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const AnalystDashboard: React.FC = () => {
  const { setActiveTab, setSelectedDisputeId } = useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [analystData, setAnalystData] = useState<any>(null);

  const fetchAnalystData = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalystDashboard();
      setAnalystData(data);
    } catch (err) {
      console.error('Failed to load analyst dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalystData();
  }, []);

  const assignedDisputes = analystData?.assignedDisputes || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
              Dispute Analyst Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mt-1">
            Claims Investigation Queue
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review assigned claims, analyze pgvector evidence retrievals, and verify response drafts.
          </p>
        </div>

        <button
          onClick={fetchAnalystData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 4 Analyst Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Disputes"
          value={loading ? '...' : (assignedDisputes.length || 0).toString()}
          change="Real-time"
          isPositive={true}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Urgent Deadlines"
          value={loading ? '...' : (analystData?.urgentDeadlinesCount || 0).toString()}
          change="< 3 days"
          isPositive={false}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Missing Evidence"
          value={loading ? '...' : (analystData?.missingEvidenceCount || 0).toString()}
          change="Items flagged"
          isPositive={false}
          icon={<FileQuestion className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Contradictions Detected"
          value={loading ? '...' : (analystData?.contradictionsCount || 0).toString()}
          change="AI Audit"
          isPositive={false}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Investigation Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172B4D]">Active Assigned Claims</h2>
            <p className="text-xs text-slate-500 mt-0.5">Disputes requiring evidence synthesis and rebuttal draft review</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#0070BA]">
            {assignedDisputes.length} active
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0070BA]" />
            <p className="text-xs font-medium">Loading claims queue from Neon PostgreSQL...</p>
          </div>
        ) : assignedDisputes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">No pending disputes in queue</p>
            <p className="text-xs text-slate-500 mt-1">All assigned merchant claims have been addressed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Dispute ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Claim Reason</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Audit</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {assignedDisputes.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0070BA]">{d.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{d.customerName}</div>
                      <div className="text-[11px] text-slate-400">{d.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{d.reason}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${d.amount?.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        d.aiStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        d.aiStatus === 'Needs Attention' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {d.aiStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">{d.deadline}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDisputeId(d.id);
                          setActiveTab('ai-investigation');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

