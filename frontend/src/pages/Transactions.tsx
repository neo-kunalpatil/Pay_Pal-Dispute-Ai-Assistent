import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { 
  CreditCard, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { transactions, setActiveTab, setSelectedDisputeId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const totalPaymentsAmount = transactions.reduce((sum, t) => sum + (t.type === 'Payment Received' ? t.amount : 0), 0);
  const successfulCount = transactions.filter(t => t.status === 'Completed').length;
  const refundedAmount = transactions.filter(t => t.status === 'Refunded').reduce((sum, t) => sum + t.amount, 0);
  const disputedCount = transactions.filter(t => t.status === 'Disputed').length;

  const filteredTxns = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Transactions</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Monitor incoming PayPal orders, customer settlements, refunds, and disputed payments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Payments"
          value={`$${totalPaymentsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<CreditCard className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Successful Orders"
          value={successfulCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Refunded Volume"
          value={`$${refundedAmount.toFixed(2)}`}
          icon={<RotateCcw className="w-6 h-6" />}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-600"
        />
        <StatCard
          title="Disputed Payments"
          value={disputedCount}
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          badgeLabel="Active Claims"
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, Order, Customer..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-[#F0F4F8] hover:bg-[#E8EFF6] focus:bg-white border border-transparent focus:border-[#0070BA] rounded-lg focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-[#0070BA] focus:outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Disputed">Disputed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-3">Order ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3 text-right">Amount</th>
                <th className="py-3.5 px-3 text-center">Payment Status</th>
                <th className="py-3.5 px-3">Dispute Case</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-[#F6F9FD] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0070BA] group-hover:underline">
                      {txn.id}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {txn.orderId}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{txn.customerName}</div>
                      <div className="text-[11px] text-slate-400">{txn.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {txn.date}
                    </td>
                    <td className={`py-3.5 px-3 text-right font-bold ${
                      txn.type === 'Payment Received' ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {txn.type === 'Payment Received' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3.5 px-3">
                      {txn.disputeId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDisputeId(txn.disputeId!);
                            setActiveTab('dispute-details');
                          }}
                          className="font-bold text-[#0070BA] hover:underline bg-[#EAF4FC] px-2 py-0.5 rounded text-[11px] border border-[#BDE0FE]"
                        >
                          {txn.disputeId}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#0070BA] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction ${selectedTxn.id}`}
          subtitle={`Order #${selectedTxn.orderId} • ${selectedTxn.date}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] uppercase font-bold block">Gross Amount</span>
                <span className="text-xl font-bold text-slate-900">${selectedTxn.amount.toFixed(2)} USD</span>
              </div>
              <StatusBadge status={selectedTxn.status} />
            </div>

            {/* Customer Details */}
            <div className="space-y-1.5 bg-white border border-slate-200 rounded-xl p-3.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">Payer Credentials</span>
              <p className="font-semibold text-slate-800">{selectedTxn.customerName}</p>
              <p className="text-slate-500">{selectedTxn.customerEmail}</p>
              <p className="text-slate-500">Method: {selectedTxn.paymentMethod}</p>
            </div>

            {/* Shipping Address */}
            {selectedTxn.shippingAddress && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0070BA]" />
                  <span>Confirmed Delivery Address</span>
                </span>
                <p className="text-slate-700 font-medium">{selectedTxn.shippingAddress}</p>
              </div>
            )}

            {/* Items */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">Order Items</span>
              {selectedTxn.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800">{item.name} × {item.qty}</span>
                  <span className="font-bold text-slate-900">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Linked Dispute Banner */}
            {selectedTxn.disputeId && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-rose-800 font-bold block">Under Active Dispute</span>
                  <span className="text-rose-600 text-[11px] font-mono">{selectedTxn.disputeId}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDisputeId(selectedTxn.disputeId!);
                    setSelectedTxn(null);
                    setActiveTab('dispute-details');
                  }}
                  className="px-3 py-1.5 bg-[#0070BA] text-white font-bold rounded-lg hover:bg-[#005ea6] transition-colors"
                >
                  Investigate Dispute
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
