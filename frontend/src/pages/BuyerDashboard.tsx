import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { RaiseDisputeModal } from '../components/buyer/RaiseDisputeModal';
import { BuyerOrder } from '../types';
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  ShieldAlert, 
  Truck, 
  Clock, 
  Package,
  HelpCircle
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { buyerOrders = [], disputes = [], setActiveTab, setSelectedDisputeId } = useApp();
  const [selectedOrderForDispute, setSelectedOrderForDispute] = useState<BuyerOrder | null>(null);

  const safeCustomerName = (d: any) => (d?.customerName || d?.customer_name || '').toString().toLowerCase();
  const activeDispute = (disputes && disputes.length > 0)
    ? (disputes.find(d => safeCustomerName(d).includes('rahul')) || disputes[0])
    : null;

  const orders = buyerOrders && buyerOrders.length > 0 ? buyerOrders : [];

  return (
    <div className="space-y-6">
      {/* Greeting matching PayPal buyer dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            Hello, Rahul!
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Here's your account overview and active order dispute tracking.
          </p>
        </div>

        <button
          onClick={() => setSelectedOrderForDispute(orders[0] || null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Raise a Dispute</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={<ShoppingBag className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Completed"
          value={orders.filter(o => o.status === 'Delivered').length}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Active Disputes"
          value={activeDispute ? "1" : "0"}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Refunds"
          value="$249.00"
          icon={<RotateCcw className="w-6 h-6" />}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172B4D]">Recent Orders</h3>
            <span className="text-xs font-bold text-[#0070BA] cursor-pointer hover:underline">
              View All &rarr;
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={order.image}
                    alt={order.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      {order.productName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      #{order.orderNumber} &bull; ${order.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.status}
                  </span>

                  {order.hasDispute ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      Dispute Open
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedOrderForDispute(order)}
                      className="text-xs font-semibold text-[#0070BA] hover:underline"
                    >
                      Report Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Need Help Card & Track Your Dispute */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#EAF4FC] to-blue-50 border border-[#BDE0FE] rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <h4 className="text-sm font-bold text-[#0070BA] mb-1">Need Help?</h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Raise a Dispute for your order if merchandise was not delivered, arrived damaged, or was not as described.
            </p>
            <button
              onClick={() => setSelectedOrderForDispute(orders[0] || null)}
              className="px-4 py-2 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Raise Dispute</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172B4D]">Track Your Dispute</h3>
              <span className="text-xs font-bold text-[#0070BA] font-mono">
                {activeDispute?.id || 'PP-D-12345'}
              </span>
            </div>

            <div className="py-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>
                <div className="absolute top-3 left-4 w-1/3 h-0.5 bg-[#0070BA] -z-0"></div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-[#0070BA] text-white flex items-center justify-center text-[10px] font-bold">
                    &#10003;
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Submitted</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-[#0070BA] text-white flex items-center justify-center text-[10px] font-bold">
                    &#10003;
                  </div>
                  <span className="text-[10px] font-bold text-[#0070BA] mt-1">Under Review</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                    3
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1">Pending</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                    4
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1">Resolved</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              The merchant is reviewing your claim and preparing evidence for the PayPal Resolution Specialist.
            </p>
          </div>
        </div>
      </div>

      {/* Raise Dispute Modal */}
      {selectedOrderForDispute && (
        <RaiseDisputeModal
          order={selectedOrderForDispute}
          onClose={() => setSelectedOrderForDispute(null)}
        />
      )}
    </div>
  );
};
