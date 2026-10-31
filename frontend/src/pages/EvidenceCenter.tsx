import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentCategory, EvidenceDocument } from '../types';
import { StatCard } from '../components/common/StatCard';
import { FileUploader } from '../components/evidence/FileUploader';
import { DocumentPreviewModal } from '../components/evidence/DocumentPreviewModal';
import { 
  FolderLock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  Filter,
  Link
} from 'lucide-react';

export const EvidenceCenter: React.FC = () => {
  const { documents, deleteDocument, disputes, linkDocumentToDispute } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);
  const [showUploader, setShowUploader] = useState(true);

  const totalCount = documents.length;
  const indexedCount = documents.filter(d => d.status === 'Indexed').length;
  const processingCount = documents.filter(d => d.status === 'Processing').length;
  const failedCount = documents.filter(d => d.status === 'Failed').length;

  const categories = [
    'ALL',
    'Invoices',
    'Shipping Documents',
    'Delivery Proof',
    'Refund Policies',
    'Customer Emails',
    'Product Evidence',
    'Other'
  ];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.linkedDisputeId && d.linkedDisputeId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Evidence Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Organise invoices, shipping receipts, carrier PODs and buyer communications for AI indexing.
          </p>
        </div>

        <button
          onClick={() => setShowUploader(!showUploader)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005ea6] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showUploader ? 'Hide Upload Zone' : 'Upload New Documents'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={totalCount}
          icon={<FolderLock className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-[#0070BA]"
        />
        <StatCard
          title="Indexed in RAG"
          value={indexedCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Processing OCR"
          value={processingCount}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Failed Uploads"
          value={failedCount}
          icon={<AlertCircle className="w-6 h-6" />}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-600"
        />
      </div>

      {/* Upload Zone (collapsible) */}
      {showUploader && (
        <FileUploader onUploadComplete={() => {}} />
      )}

      {/* Category Pills & Search */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document name, dispute ID..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-[#F0F4F8] hover:bg-[#E8EFF6] focus:bg-white border border-transparent focus:border-[#0070BA] rounded-lg focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing {filteredDocs.length} of {documents.length} files
          </div>
        </div>

        {/* Categories scrollable bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0070BA] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Document Name</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Format</th>
                <th className="py-3.5 px-3">Size</th>
                <th className="py-3.5 px-3">Uploaded</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3">Linked Dispute</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No documents found matching the search or category filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-[#F6F9FD] transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0070BA] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-[#0070BA] transition-colors">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {doc.category}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {doc.size}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {doc.uploadDate}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Indexed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                      }`}>
                        {doc.status === 'Indexed' ? '✓ Indexed' : 'Processing'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {doc.linkedDisputeId ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#0070BA] bg-[#EAF4FC] px-2 py-0.5 rounded text-[11px] border border-[#BDE0FE]">
                          <Link className="w-3 h-3" />
                          <span>{doc.linkedDisputeId}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview Extracted Content"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#0070BA] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert(`Downloaded ${doc.name}`)}
                          title="Download"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${doc.name}?`)) deleteDocument(doc.id);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
