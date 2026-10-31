import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AgentWorkflow } from '../components/investigation/AgentWorkflow';
import { DocumentPreviewModal } from '../components/evidence/DocumentPreviewModal';
import { EvidenceDocument } from '../types';
import { 
  Sparkles, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Send, 
  ShieldCheck, 
  Info, 
  FileSearch, 
  BookOpen, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const AIInvestigation: React.FC = () => {
  const navigate = useNavigate();
  const { 
    disputes = [], 
    selectedDisputeId, 
    setSelectedDisputeId, 
    documents = [], 
    runAIInvestigation, 
    setActiveTab 
  } = useApp();

  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const dispute = disputes.find(d => d.id === selectedDisputeId) || disputes[0];

  if (!dispute) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-800">No Disputes to Investigate</h2>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no disputes in your account.
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

  const report = dispute.investigationReport;
  const supportingEvidence = report?.supportingEvidence || [];
  const missingEvidence = report?.missingEvidence || [];
  const policyClauses = report?.policyClauses || [];
  const contradictions = report?.contradictions || [];

  const handleReRun = async () => {
    setIsProcessing(true);
    await runAIInvestigation(dispute.id);
    setIsProcessing(false);
  };

  const handleViewSource = (docName: string) => {
    const found = documents.find(d => d.name === docName);
    if (found) {
      setPreviewDoc(found);
    } else {
      alert(`Source file: ${docName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Dispute Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0070BA]" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">
              AI Multi-Agent Dispute Investigation
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Autonomous verification of customer complaints, carrier telemetry, and store policies.
          </p>
        </div>

        {/* Dispute Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
            Target Dispute:
          </label>
          <select
            value={selectedDisputeId}
            onChange={(e) => setSelectedDisputeId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-white border border-[#0070BA] rounded-xl px-3 py-2 focus:outline-none shadow-2xs"
          >
            {disputes.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} &bull; {d.customerName || 'Customer'} (${Number(d.amount || 0).toFixed(2)})
              </option>
            ))}
          </select>

          <button
            onClick={handleReRun}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Investigating...' : 'Re-run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Legal Disclaimer Banner */}
      <div className="bg-[#EAF4FC] border border-[#BDE0FE] rounded-xl p-3.5 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0070BA] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-[#0070BA]">AI Advisory Notice:</span> The following findings are AI-generated suggestions derived from merchant document OCR and carrier tracking scans. Merchant verification is required before submitting rebuttal evidence to PayPal.
        </div>
      </div>

      {/* 5-Stage Agent Workflow Visualization */}
      <AgentWorkflow dispute={dispute} isProcessing={isProcessing} />

      {/* Contradiction Detection Alert Banner */}
      {contradictions.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Chronological Contradiction Detected by Evidence Verification Agent</span>
          </div>

          {contradictions.map((contra) => (
            <div key={contra.id} className="bg-white/80 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-900">{contra.title}</h4>
              <p className="text-slate-700 leading-relaxed">{contra.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Record A:</span>
                  <span className="font-mono text-slate-800 font-semibold">{contra.sourceDocA}</span>
                </div>
                <div className="bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Record B:</span>
                  <span className="font-mono text-slate-800 font-semibold">{contra.sourceDocB}</span>
                </div>
              </div>

              {contra.recommendation && (
                <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-100/70 p-2.5 rounded-lg flex items-center gap-2">
                  <span>Action Required:</span>
                  <span>{contra.recommendation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Analysis Findings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting Evidence Card */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Supporting Evidence ({supportingEvidence.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified in Repository
            </span>
          </div>

          <div className="space-y-2.5">
            {supportingEvidence.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No supporting evidence identified yet. Click "Re-run Analysis" to scan documents.
              </p>
            ) : (
              supportingEvidence.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewSource(item.documentName)}
                      className="font-bold text-[#0070BA] hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{item.documentName}</span>
                    </button>
                    {item.pageRef && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {item.pageRef}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.relevance}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Evidence & Action Recommendations */}
        <div className="space-y-6">
          {/* Missing Evidence Card */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Identified Missing Evidence ({missingEvidence.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Action Required
              </span>
            </div>

            {missingEvidence.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center text-xs text-emerald-700 font-semibold">
                ✓ All required evidence criteria satisfied! Ready for rebuttal submission.
              </div>
            ) : (
              <div className="space-y-2.5">
                {missingEvidence.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900">{item.item}</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy Clauses Card */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0070BA]" />
              <span>Governing Policy Clauses</span>
            </h3>

            <div className="space-y-2">
              {policyClauses.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Policy analysis will populate upon running investigation.
                </p>
              ) : (
                policyClauses.map((clause, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{clause.clause}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{clause.source}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{clause.applicability}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Next Step: Prepare Rebuttal Letter
          </span>
          <span className="text-xs text-slate-500">
            Export the synthesized findings and attach verified evidence directly into the PayPal Response Center.
          </span>
        </div>

        <button
          onClick={() => {
            setSelectedDisputeId(dispute.id);
            setActiveTab('response-center');
            navigate('/response-center');
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Open Response Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
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
