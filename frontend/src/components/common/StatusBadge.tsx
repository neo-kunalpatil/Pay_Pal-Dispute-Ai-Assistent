import React from 'react';
import { DisputeStatus, AIInvestigationStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, Sparkles, Send } from 'lucide-react';

export const StatusBadge: React.FC<{ status: DisputeStatus | string }> = ({ status }) => {
  switch (status) {
    case 'Needs Response':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Needs Response
        </span>
      );
    case 'Under Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Under Review
        </span>
      );
    case 'Evidence Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          Evidence Pending
        </span>
      );
    case 'Ready for Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Ready for Review
        </span>
      );
    case 'Submitted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          Submitted
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          Resolved
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Completed
        </span>
      );
    case 'Refunded':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Refunded
        </span>
      );
    case 'Disputed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
          Disputed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
};

export const AIStatusBadge: React.FC<{ status: AIInvestigationStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Verified
        </span>
      );
    case 'Processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Analyzing
        </span>
      );
    case 'Needs Attention':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Needs Attention
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Not Started
        </span>
      );
  }
};
