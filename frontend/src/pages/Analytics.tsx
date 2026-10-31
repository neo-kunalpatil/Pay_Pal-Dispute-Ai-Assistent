import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { DisputeReasonsDonutChart, DisputeTrendsBarChart } from '../components/common/SimpleCharts';
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  PieChart, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { disputes, transactions } = useApp();
  const [timeRange, setTimeRange] = useState('Last 90 Days');

  const totalDisputes = disputes.length;
  const resolvedDisputes = disputes.filter(d => d.status === 'Resolved' || d.status === 'Submitted').length;
  const pendingDisputes = disputes.filter(d => d.status === 'Needs Response' || d.status === 'Under Review').length;
  const avgInvestigationHours = '1.4 hrs';
  const evidenceCompletionRate = '88%';

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Dispute ID,Customer,Amount,Reason,Status,Deadline\n" +
      disputes.map(d => `${d.id},"${d.customerName}",${d.amount},"${d.reason}","${d.status}","${d.deadline}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `disputepilot_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Analyze dispute frequency, claim reason breakdown, and evidence completion telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-[#0070BA] focus:outline-none"
          >
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inquiries"
          value={totalDisputes}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Resolved Cases"
          value={resolvedDisputes}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Active In Review"
          value={pendingDisputes}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Evidence Completeness"
          value={evidenceCompletionRate}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          badgeLabel="High RAG Coverage"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispute Trends by Day */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0070BA]" />
              <span>Weekly Dispute Volume (Pending vs Resolved)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Past 7 days</span>
          </div>

          <DisputeTrendsBarChart />
        </div>

        {/* Dispute Reasons Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0070BA]" />
              <span>Disputes by Category Reason</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">All-time</span>
          </div>

          <DisputeReasonsDonutChart />
        </div>
      </div>

      {/* Investigation Metrics Summary */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#172B4D]">Investigation Operational Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Average AI Analysis Turnaround</span>
            <span className="text-lg font-bold text-slate-900">{avgInvestigationHours}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated OCR and document matching</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Carrier Telemetry Verification Rate</span>
            <span className="text-lg font-bold text-slate-900">94.2%</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Matched tracking numbers with carrier manifests</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Median Response Time to PayPal</span>
            <span className="text-lg font-bold text-slate-900">1.8 Days</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Well within the 10-day PayPal deadline window</p>
          </div>
        </div>
      </div>
    </div>
  );
};
