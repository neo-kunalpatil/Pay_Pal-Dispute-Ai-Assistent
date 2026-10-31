import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Dispute } from '../../types';

interface AgentWorkflowProps {
  dispute: Dispute;
  isProcessing?: boolean;
}

export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ dispute, isProcessing = false }) => {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(3); // Default show Evidence Verification Agent

  const stages = [
    {
      id: 1,
      name: 'Dispute Understanding Agent',
      shortDesc: 'Deconstructs buyer claim & identifies PayPal compliance rules',
      icon: Bot,
      status: 'Completed',
      agentRole: 'LangGraph Reasoning Node #1',
      details: [
        `Claim classification: "${dispute.reason}"`,
        `Identified buyer argument: "${dispute.complaintDescription}"`,
        `Extracted target claim amount: $${dispute.amount.toFixed(2)} USD`,
        `Mapped PayPal required evidence: Proof of shipment, proof of delivery to confirmed street address.`
      ]
    },
    {
      id: 2,
      name: 'Evidence Retrieval Agent',
      shortDesc: 'Vector search & hybrid document retrieval across merchant repository',
      icon: Search,
      status: 'Completed',
      agentRole: 'Elastic + Semantic Embeddings',
      details: [
        'Queried document index for Order #ORD-1001 & Customer "Rahul Sharma"',
        'Retrieved: invoice_1001.pdf (Invoice, 100% confidence match)',
        'Retrieved: shipping_receipt.pdf (FedEx Ground dispatch, 98% match)',
        'Retrieved: refund_policy.pdf (Store Policy V4.2, 94% match)',
        'Retrieved: customer_email.pdf (Support Ticket #EM-882)'
      ]
    },
    {
      id: 3,
      name: 'Policy Analysis Agent',
      shortDesc: 'Retrieves relevant merchant refund and return policies',
      icon: BookOpen,
      status: 'Completed',
      agentRole: 'Policy Rule Engine',
      details: [
        'Evaluated Section 4.1: Delivery fulfilled upon carrier scan',
        'Evaluated Section 4.2: High-value $750+ orders require signature confirmation',
        'Evaluated PayPal Seller Protection Clause §3.1: Transactions >= $750 require proof of recipient signature.'
      ]
    },
    {
      id: 4,
      name: 'Evidence Verification Agent',
      shortDesc: 'Validates authenticity, detects chronological contradictions and missing proof',
      icon: CheckCircle2,
      status: dispute.investigationReport?.contradictions.length ? 'Attention Required' : 'Completed',
      agentRole: 'Cross-Document Chronology & Audit Checker',
      details: [
        'Checked billing address against PayPal transaction: Address Match Confirmed (Austin, TX)',
        'Checked carrier tracking number: FEDEX-794829103942 valid',
        'ALERT: Chronology discrepancy detected between dispatch date (Oct 25) and customer stated delivery date (Oct 22)',
        'Missing signature confirmation (POD) required for $750+ Seller Protection threshold.'
      ]
    },
    {
      id: 5,
      name: 'Response Generation Agent',
      shortDesc: 'Synthesizes structured rebuttal letter and evidence attachments',
      icon: Sparkles,
      status: isProcessing ? 'Generating...' : 'Completed',
      agentRole: 'Rebuttal Synthesis Model',
      details: [
        'Formulated 4-part legal rebuttal tailored to PayPal Dispute Resolution Specialist',
        'Cited FedEx tracking telemetry and matched address credentials',
        'Included store policy excerpts and buyer ticket communications',
        'Formatted merchant approval draft.'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0070BA]" />
            <span>AI Multi-Agent Autonomous Investigation Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5 specialized LangGraph-style agent nodes working in tandem to verify dispute evidence.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
          Pipeline Active • 5 Nodes
        </span>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isExpanded = expandedAgent === stage.id;
          const isWarning = stage.status === 'Attention Required';

          return (
            <div
              key={stage.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? isWarning
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-[#0070BA]/30 bg-[#F4F9FD]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => setExpandedAgent(isExpanded ? null : stage.id)}
                className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : isExpanded
                        ? 'bg-[#0070BA] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172B4D] truncate">
                        Stage {stage.id}: {stage.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        [{stage.agentRole}]
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {stage.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {stage.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Agent Telemetry & Log Findings */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Agent Execution Trace
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {stage.details.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-[#0070BA] font-bold mt-0.5">•</span>
                        <span className={item.startsWith('ALERT:') ? 'text-amber-800 font-semibold' : ''}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
