import React from 'react';
import { EvidenceDocument } from '../../types';
import { Modal } from '../common/Modal';
import { FileText, Download, Trash2, CheckCircle2, Clock, Sparkles, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DocumentPreviewModalProps {
  document: EvidenceDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document: doc, onClose }) => {
  const { deleteDocument, disputes, linkDocumentToDispute } = useApp();

  if (!doc) return null;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
      deleteDocument(doc.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={!!doc}
      onClose={onClose}
      title={doc.name}
      subtitle={`Category: ${doc.category} • Size: ${doc.size} • Uploaded ${doc.uploadDate}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Processing Lifecycle Pipeline matching prompt: Uploaded -> Text Extracted -> Indexed -> Available for AI Search */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            RAG Processing Pipeline
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] mb-1">✓</span>
              <span className="font-semibold text-slate-700">Uploaded</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] mb-1">✓</span>
              <span className="font-semibold text-slate-700">OCR Extracted</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] mb-1">✓</span>
              <span className="font-semibold text-slate-700">Vector Indexed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                <Sparkles className="w-3 h-3" />
              </span>
              <span className="font-semibold text-[#0070BA]">AI Search Ready</span>
            </div>
          </div>
        </div>

        {/* Linked Dispute Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EAF4FC] border border-[#BDE0FE] rounded-xl p-3">
          <div>
            <span className="text-xs font-bold text-[#0070BA] block">Linked Dispute</span>
            <span className="text-xs text-slate-600">
              {doc.linkedDisputeId ? `Associated with ${doc.linkedDisputeId}` : 'Not linked to any specific dispute'}
            </span>
          </div>

          <select
            value={doc.linkedDisputeId || ''}
            onChange={(e) => linkDocumentToDispute(doc.id, e.target.value)}
            className="text-xs font-semibold bg-white border border-[#0070BA]/40 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="">Unlink from dispute</option>
            {disputes.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} ({d.customerName})
              </option>
            ))}
          </select>
        </div>

        {/* Document Summary */}
        {doc.summary && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">AI Semantic Summary</h4>
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
              {doc.summary}
            </p>
          </div>
        )}

        {/* Extracted Text Content preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0070BA]" />
              <span>Extracted Text Content (OCR)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Normalized utf-8</span>
          </div>
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
            {doc.extractedText || `FILE CONTENT: ${doc.name}\n[Automated parsing complete: verified header, items, timestamps and address coordinates.]`}
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Document</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Downloaded ${doc.name} to local environment.`);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] rounded-lg shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
