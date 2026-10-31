import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DisputeStatus, DisputeReason } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, AIStatusBadge } from '../components/common/StatusBadge';
import { 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Disputes: React.FC = () => {
  const navigate = useNavigate();
  const { disputes = [], setActiveTab, setSelectedDisputeId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount'>('deadline');

  const totalCount = disputes.length;
  const needsResponseCount = disputes.filter(d => d.status === 'Needs Response').length;
  const underInvestigationCount = disputes.filter(d => d.status === 'Under Review' || d.status === 'Evidence Pending').length;
  const resolvedCount = disputes.filter(d => d.status === 'Resolved' || d.status === 'Submitted').length;

  const filteredDisputes = disputes.filter(d => {
    const q = searchQuery.toLowerCase();
    const safeCustomer = (d.customerName || (d as any).customer_name || '').toString().toLowerCase();
    const safeOrder = (d.orderId || (d as any).order_id || '').toString().toLowerCase();
    const safeTxn = (d.transactionId || (d as any).transaction_id || '').toString().toLowerCase();
    const safeId = (d.id || '').toString().toLowerCase();

    const matchesSearch = 
      safeId.includes(q) ||
      safeCustomer.includes(q) ||
      safeOrder.includes(q) ||
      safeTxn.includes(q);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesReason = reasonFilter === 'ALL' || d.reason === reasonFilter;

    return matchesSearch && matchesStatus && matchesReason;
  }).sort((a, b) => {
    if (sortBy === 'deadline') return (a.daysRemaining ?? 3) - (b.daysRemaining ?? 3);
    if (sortBy === 'amount') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    return 0;
  });

  const handleRowClick = (id: string) => {
    setSelectedDisputeId(id);
    setActiveTab('dispute-details');
    navigate(`/disputes/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Dispute Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Review and manage payment disputes received through your PayPal Business account.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="All Disputes"
          value={totalCount}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Needs Response"
          value={needsResponseCount}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          badgeLabel="Urgent"
        />
        <StatCard
          title="Under Investigation"
          value={underInvestigationCount}
          icon={<Sparkles className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Dispute ID, Customer, Order..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-[#F0F4F8] hover:bg-[#E8EFF6] focus:bg-white border border-transparent focus:border-[#0070BA] rounded-lg focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-[#0070BA] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Needs Response">Needs Response</option>
              <option value="Under Review">Under Review</option>
              <option value="Evidence Pending">Evidence Pending</option>
              <option value="Ready for Review">Ready for Review</option>
              <option value="Submitted">Submitted</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Reason Filter */}
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-[#0070BA] focus:outline-none"
            >
              <option value="ALL">All Reasons</option>
              <option value="Product Not Received">Product Not Received</option>
              <option value="Product Not as Described">Product Not as Described</option>
              <option value="Unauthorised Transaction">Unauthorised Transaction</option>
              <option value="Duplicate Charge">Duplicate Charge</option>
              <option value="Refund Not Received">Refund Not Received</option>
            </select>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dispute ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Order / TXN</th>
                <th className="py-3.5 px-3">Reason</th>
                <th className="py-3.5 px-3 text-right">Amount</th>
                <th className="py-3.5 px-3">Deadline</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">AI Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No payment disputes matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((dispute) => (
                  <tr
                    key={dispute.id}
                    onClick={() => handleRowClick(dispute.id)}
                    className="hover:bg-[#F6F9FD] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0070BA] group-hover:underline">
                      {dispute.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{dispute.customerName}</div>
                      <div className="text-[11px] text-slate-400">{dispute.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      <div>{dispute.orderId}</div>
                      <div className="text-slate-400">{dispute.transactionId}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium max-w-xs truncate">
                      {dispute.reason}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      ${dispute.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-700">{dispute.deadline}</div>
                      <div className={`text-[11px] font-bold ${
                        dispute.daysRemaining <= 3 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {dispute.daysRemaining} days left
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={dispute.status} />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <AIStatusBadge status={dispute.aiStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(dispute.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF4FC] hover:bg-[#0070BA] text-[#0070BA] hover:text-white font-bold text-xs transition-colors"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDisputes.length} of {disputes.length} disputes</span>
          <span className="text-[11px] text-slate-400">Click any row to open dispute investigation workspace</span>
        </div>
      </div>
    </div>
  );
};
