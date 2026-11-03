import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Dispute, EvidenceDocument } from '../../types';
import { ShieldCheck, Check, AlertTriangle, FileText, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResponseSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: Dispute;
  attachedDocs?: EvidenceDocument[];
  onConfirm?: () => Promise<void>;
  onConfirmSubmit?: () => Promise<void>;
}

export const ResponseSubmitModal: React.FC<ResponseSubmitModalProps> = ({
  isOpen,
  onClose,
  dispute,
  attachedDocs = [],
  onConfirm,
  onConfirmSubmit
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!confirmed) return;
    setIsSubmitting(true);

    try {
      const fn = onConfirmSubmit || onConfirm;
      if (fn) await fn();
      
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }

      setSuccessResult(`PP-EVD-${Math.floor(1000000 + Math.random() * 9000000)}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setSuccessResult(null);
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleFinish}
      title="Submit Rebuttal Evidence to PayPal"
      subtitle={`Dispute Ref: ${dispute.id} • Customer: ${dispute.customerName} • Disputed Amount: $${dispute.amount.toFixed(2)}`}
      maxWidth="max-w-xl"
    >
      {successResult ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#172B4D]">
              Evidence Submitted to PayPal Sandbox!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your merchant rebuttal package and supporting documents were packaged and transmitted to the PayPal Dispute API.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Submission Reference:</span>
              <span className="font-mono font-bold text-slate-800">{successResult}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Dispute:</span>
              <span className="font-semibold text-slate-800">{dispute.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Documents Attached:</span>
              <span className="font-semibold text-slate-800">{attachedDocs.length} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Environment:</span>
              <span className="font-bold text-amber-600">PayPal Sandbox (Demo)</span>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Back to Dispute Workspace
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Environment notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0070BA] shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Merchant Approval Step:</span> In accordance with DisputePilot AI governance, PayPal evidence submissions require explicit merchant authorization.
            </div>
          </div>

          {/* Attached documents list */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attached Evidence Package ({attachedDocs.length} files)
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {attachedDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <FileText className="w-3.5 h-3.5 text-[#0070BA] shrink-0" />
                  <span className="truncate font-medium text-slate-700">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response summary preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rebuttal Statement Preview
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {dispute.responseDraft || 'Rebuttal draft ready for transmission.'}
            </div>
          </div>

          {/* Explicit Merchant Confirmation Checkbox */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0070BA] focus:ring-[#0070BA]"
              />
              <span className="text-xs font-medium text-slate-700 leading-relaxed">
                I confirm that I have reviewed the customer complaint, verified that the attached documentation is genuine, and authorize transmission of this evidence rebuttal to PayPal.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!confirmed || isSubmitting}
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !confirmed || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-xs cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Transmitting to PayPal API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Authorize & Submit Evidence</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
