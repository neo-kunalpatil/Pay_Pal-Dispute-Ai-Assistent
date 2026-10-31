import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ResponseSubmitModal } from '../components/response/ResponseSubmitModal';
import { 
  Send, 
  Check, 
  Save, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Paperclip, 
  CheckCircle2, 
  RotateCcw,
  Clock,
  Layers
} from 'lucide-react';

export const ResponseCenter: React.FC = () => {
  const navigate = useNavigate();
  const { 
    disputes = [], 
    selectedDisputeId, 
    setSelectedDisputeId, 
    documents = [], 
    updateDisputeDraft, 
    approveDisputeResponse, 
    submitDisputeEvidence,
    setActiveTab
  } = useApp();

  const dispute = disputes.find(d => d.id === selectedDisputeId) || disputes[0];

  const [draftText, setDraftText] = useState(dispute?.responseDraft || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (!dispute) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <Send className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-800">No Disputes Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no active dispute responses to prepare.
          </p>
        </div>
        <button
          onClick={() => { setActiveTab('disputes'); navigate('/disputes'); }}
          className="px-4 py-2 bg-[#0070BA] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
        >
          View Disputes
        </button>
      </div>
    );
  }

  const attachedDocs = (documents || []).filter(doc => doc.linkedDisputeId === dispute.id);

  const handleSaveDraft = () => {
    updateDisputeDraft(dispute.id, draftText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleApprove = () => {
    updateDisputeDraft(dispute.id, draftText);
    approveDisputeResponse(dispute.id);
  };

  const handleConfirmSubmit = async () => {
    await submitDisputeEvidence(dispute.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Response Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review AI-synthesized rebuttal drafts, attach merchant evidence, and submit approved rebuttals to PayPal.
          </p>
        </div>

        {/* Target Dispute Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Dispute:
          </label>
          <select
            value={selectedDisputeId}
            onChange={(e) => {
              setSelectedDisputeId(e.target.value);
              const target = disputes.find(d => d.id === e.target.value);
              if (target) setDraftText(target.responseDraft || '');
            }}
            className="text-xs font-bold text-slate-800 bg-white border border-[#0070BA] rounded-xl px-3 py-2 focus:outline-none shadow-2xs"
          >
            {disputes.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} ({d.customerName || 'Customer'} &bull; ${Number(d.amount || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Split: Draft Editor (Left 7 Cols) + Evidence & Validation Checklist (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Structured Rebuttal Letter Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0070BA]" />
                <h3 className="text-sm font-bold text-[#172B4D]">
                  AI-Synthesized Rebuttal Letter
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>

            {/* Notification / State banner */}
            {dispute.isResponseApproved ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Response approved and locked by Merchant Operations. Ready for submission.</span>
              </div>
            ) : (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-[#0070BA]">
                <Clock className="w-4 h-4 text-[#0070BA] shrink-0" />
                <span>Draft Status: Pending Merchant Review & Approval before PayPal Submission.</span>
              </div>
            )}

            {/* Textarea for rebuttal draft */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Rebuttal Statement Body (Formatted for PayPal Dispute Resolution Specialist)
              </label>
              <textarea
                rows={15}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="AI is generating draft response..."
                className="w-full text-xs font-mono text-slate-800 bg-[#FBFDFF] border border-slate-300 rounded-xl p-4 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] leading-relaxed resize-y"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Character count: {draftText.length} &bull; Markdown and structured sections enabled
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!dispute.isResponseApproved ? (
                  <button
                    onClick={handleApprove}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Draft</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0070BA]/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit to PayPal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Attached Evidence Package, Verification Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submission Readiness Checklist */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PayPal Submission Readiness</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Buyer statement reviewed and categorized</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>FedEx tracking and dispatch logs attached</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Store return policy cited in paragraph 4</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-800 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Signature verification pending for claims over $750</span>
              </div>
            </div>
          </div>

          {/* Attached Evidence Documents */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#0070BA]" />
                <span>Attached Evidence Package ({attachedDocs.length})</span>
              </h3>
              <button
                onClick={() => { setActiveTab('evidence'); navigate('/evidence'); }}
                className="text-xs font-bold text-[#0070BA] hover:underline cursor-pointer"
              >
                Manage Files
              </button>
            </div>

            <div className="space-y-2">
              {attachedDocs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No documents attached to this evidence package.
                </p>
              ) : (
                attachedDocs.map(doc => (
                  <div key={doc.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#0070BA] shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.category} &bull; {doc.size}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <ResponseSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        dispute={dispute}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};
