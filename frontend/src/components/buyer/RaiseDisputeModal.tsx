import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BuyerOrder, DisputeReason } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RaiseDisputeModalProps {
  order: BuyerOrder | null;
  onClose: () => void;
}

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({ order, onClose }) => {
  const { raiseBuyerDispute, setActiveTab } = useApp();

  const [reason, setReason] = useState<DisputeReason>('Product Not Received');
  const [statement, setStatement] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    raiseBuyerDispute(
      order.orderNumber,
      reason,
      statement,
      order.price,
      order.productName
    );

    setIsSubmitted(true);
  };

  const handleFinish = () => {
    setIsSubmitted(false);
    setStatement('');
    onClose();
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={handleFinish}
      title="Open a Payment Dispute"
      subtitle={`Order #${order.orderNumber} • ${order.productName} • $${order.price.toFixed(2)}`}
      maxWidth="max-w-lg"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172B4D]">
              Dispute Filed with PayPal Resolution Center
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your claim has been forwarded to the merchant for rebuttal evidence. Track status in your Buyer dashboard.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="px-5 py-2 bg-[#0070BA] text-white text-xs font-bold rounded-xl"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Before raising a dispute, PayPal recommends contacting the merchant. If you could not resolve the issue, please describe your problem below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dispute Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#0070BA] focus:outline-none"
            >
              <option value="Product Not Received">Product Not Received (Merchandise never arrived)</option>
              <option value="Product Not as Described">Product Not as Described (Damaged, defective or wrong model)</option>
              <option value="Unauthorised Transaction">Unauthorised Transaction (Account security concern)</option>
              <option value="Duplicate Charge">Duplicate Charge (Billed multiple times)</option>
              <option value="Refund Not Received">Refund Not Received (Returned but no credit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Statement / Explanation
            </label>
            <textarea
              required
              rows={4}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Explain what happened, courier status, or condition of item..."
              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-3 focus:border-[#0070BA] focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!statement.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Submit Dispute Claim</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
