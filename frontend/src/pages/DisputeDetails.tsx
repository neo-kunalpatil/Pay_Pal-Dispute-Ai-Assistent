import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge, AIStatusBadge } from '../components/common/StatusBadge';
import { DocumentPreviewModal } from '../components/evidence/DocumentPreviewModal';
import { EvidenceDocument } from '../types';
import {
  ArrowLeft,
  Sparkles,
  UploadCloud,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ExternalLink,
  Check,
  AlertCircle,
  FileCheck,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const DisputeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedDisputeId,
    setSelectedDisputeId,
    disputes = [],
    documents = [],
    setActiveTab,
    runAIInvestigation
  } = useApp();

  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);
  const [isRunningAI, setIsRunningAI] = useState(false);

  const targetId = id || selectedDisputeId;
  const dispute = disputes.find(d => d.id === targetId) || disputes.find(d => d.id === selectedDisputeId) || disputes[0];

  if (!dispute) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-800">Dispute Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested dispute #{targetId} could not be loaded.
          </p>
        </div>
        <button
          onClick={() => { setActiveTab('disputes'); navigate('/disputes'); }}
          className="px-4 py-2 bg-[#0070BA] text-white text-xs font-bold rounded-xl shadow-xs"
        >
          Back to Disputes List
        </button>
      </div>
    );
  }

  const timeline = dispute.timeline || [];
  const requestedEvidence = dispute.requestedEvidence || [];
  const linkedDocs = (documents || []).filter(doc => doc.linkedDisputeId === dispute.id);
  const formattedAmount = typeof dispute.amount === 'number' ? dispute.amount.toFixed(2) : Number(dispute.amount || 0).toFixed(2);

  const handleStartAI = async () => {
    setIsRunningAI(true);
    await runAIInvestigation(dispute.id);
    setIsRunningAI(false);
  };

  const goTo = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo('disputes', '/disputes')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Back to Disputes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
                {dispute.id}
              </h1>
              <StatusBadge status={dispute.status} />
              <AIStatusBadge status={dispute.aiStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order #{dispute.orderId || 'N/A'} &bull; Customer: {dispute.customerName || 'Customer'} ({dispute.customerEmail || 'No email'})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleStartAI}
            disabled={isRunningAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EAF4FC] hover:bg-blue-100 text-[#0070BA] transition-colors cursor-pointer border border-[#BDE0FE]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRunningAI ? 'animate-spin' : ''}`} />
            <span>{isRunningAI ? 'Analyzing...' : 'Run AI Investigation'}</span>
          </button>

          <button
            onClick={() => goTo('evidence', '/evidence')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Evidence</span>
          </button>

          <button
            onClick={() => {
              setSelectedDisputeId(dispute.id);
              goTo('response-center', '/response-center');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Prepare Rebuttal Response</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Dispute Summary, Customer Complaint, Transaction Info, Activity Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispute Overview Card */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0070BA]" />
                <span>Dispute Summary</span>
              </h3>
              <div className="text-right">
                <span className="text-xs text-slate-400">Response Deadline:</span>
                <span className="text-xs font-bold text-rose-600 ml-1.5">
                  {dispute.deadline || 'Nov 03, 2026'} ({dispute.daysRemaining ?? 3} days left)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Claim Reason</span>
                <span className="font-bold text-slate-800">{dispute.reason}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Disputed Amount</span>
                <span className="font-bold text-slate-900 text-sm">${formattedAmount} USD</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">PayPal Case Status</span>
                <span className="font-semibold text-slate-800">{dispute.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Transaction ID</span>
                <span className="font-mono text-slate-700">{dispute.transactionId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Order ID</span>
                <span className="font-mono text-slate-700">{dispute.orderId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Target Product</span>
                <span className="font-semibold text-slate-800 truncate block">{dispute.productName || 'Merchandise'}</span>
              </div>
            </div>
          </div>

          {/* Customer Complaint Card */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Customer Complaint Statement</span>
            </h3>

            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs text-slate-700 leading-relaxed italic">
              "{dispute.customerStatement || dispute.complaintDescription || 'Customer submitted claim via PayPal Resolution Center.'}"
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>Reported to PayPal Resolution Center on {dispute.createdDate || 'Oct 28, 2026'}</span>
              <span className="font-medium text-slate-600">Buyer Account Verified</span>
            </div>
          </div>

          {/* Transaction & Order Details */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070BA]" />
              <span>Original Transaction Record</span>
            </h3>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Authorization Reference:</span>
                <span className="font-mono font-bold text-slate-800">{dispute.transactionId || 'PP-ORD-8829103'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Payment Date:</span>
                <span className="font-medium text-slate-800">{dispute.createdDate || 'Oct 28, 2026'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Processed Amount:</span>
                <span className="font-bold text-slate-800">${formattedAmount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seller Protection Status:</span>
                <span className="font-bold text-emerald-600">Eligible (Subject to Signature POD)</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0070BA]" />
                <span>Dispute Activity Timeline</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">{timeline.length} Events</span>
            </div>

            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No timeline events recorded yet.</p>
            ) : (
              <div className="space-y-4 pl-2">
                {timeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative flex items-start gap-3 text-xs">
                    {idx !== timeline.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-200 -z-0"></div>
                    )}

                    <div className="w-5 h-5 rounded-full bg-[#EAF4FC] text-[#0070BA] flex items-center justify-center font-bold text-[10px] shrink-0 z-10 border-2 border-white shadow-2xs">
                      &#8226;
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        By {item.actor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Checklist, AI Investigation Summary & Documents (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Investigation Summary Box */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0070BA]" />
                <h3 className="text-sm font-bold text-[#172B4D]">AI Investigation Summary</h3>
              </div>
              {dispute.investigationReport && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {dispute.investigationReport.evidenceMatchScore}% Evidence Match
                </span>
              )}
            </div>

            {/* AI Warning / Contradiction banner if any */}
            {dispute.investigationReport?.contradictions && dispute.investigationReport.contradictions.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Contradiction Detected</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {dispute.investigationReport.contradictions[0].description}
                </p>
                {dispute.investigationReport.contradictions[0].recommendation && (
                  <div className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 p-2 rounded-lg mt-1">
                    Recommendation: {dispute.investigationReport.contradictions[0].recommendation}
                  </div>
                )}
              </div>
            )}

            {/* Summary Text */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {dispute.investigationReport?.summary || 'AI multi-agent pipeline is analyzing case documents and telemetry. Click "Run AI Investigation" above to trigger.'}
            </p>

            {/* Recommended Next Action */}
            {dispute.investigationReport?.recommendedAction && (
              <div className="p-3 bg-[#EAF4FC] rounded-xl border border-[#BDE0FE] text-xs">
                <span className="font-bold text-[#0070BA] block mb-0.5">Recommended Next Action:</span>
                <p className="text-slate-700">{dispute.investigationReport.recommendedAction}</p>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedDisputeId(dispute.id);
                goTo('ai-investigation', '/ai-investigation');
              }}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#0070BA] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Open Detailed AI Investigation Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Requested Evidence Checklist */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0070BA]" />
              <span>PayPal Requested Evidence</span>
            </h3>

            <div className="space-y-2">
              {requestedEvidence.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  Standard evidence package required: Shipping proof, commercial invoice, and store policies.
                </div>
              ) : (
                requestedEvidence.map((req, i) => {
                  const isAvailable = i < 3;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${isAvailable
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-rose-50/50 border-rose-200 text-slate-800'
                        }`}
                    >
                      <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                        {isAvailable ? '✓' : '!'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium block leading-tight">{req}</span>
                        <span className={`text-[10px] font-bold ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isAvailable ? 'Document Available & Indexed' : 'Evidence Missing — Upload Required'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Associated Documents Vault */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0070BA]" />
                <span>Linked Documents ({linkedDocs.length})</span>
              </h3>
              <button
                onClick={() => goTo('evidence', '/evidence')}
                className="text-xs font-bold text-[#0070BA] hover:underline cursor-pointer"
              >
                + Add File
              </button>
            </div>

            <div className="space-y-2">
              {linkedDocs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No documents linked to this dispute yet.
                </p>
              ) : (
                linkedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-[#0070BA] hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-blue-50 text-[#0070BA] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block group-hover:text-[#0070BA]">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {doc.category} &bull; {doc.size}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#0070BA] group-hover:underline flex items-center gap-1">
                      <span>Preview</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Drawer / Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
