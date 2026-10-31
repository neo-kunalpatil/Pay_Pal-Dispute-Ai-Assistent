import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentCategory } from '../../types';
import { UploadCloud, File, CheckCircle2, AlertCircle, Link } from 'lucide-react';

interface FileUploaderProps {
  defaultDisputeId?: string;
  onUploadComplete?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ defaultDisputeId, onUploadComplete }) => {
  const { uploadDocument, disputes } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('Invoices');
  const [linkedDispute, setLinkedDispute] = useState<string>(defaultDisputeId || 'PP-D-12345');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories: DocumentCategory[] = [
    'Invoices',
    'Shipping Documents',
    'Delivery Proof',
    'Refund Policies',
    'Customer Emails',
    'Product Evidence',
    'Other'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      const validExtensions = ['pdf', 'docx', 'xlsx', 'csv', 'jpg', 'png'];
      const fileType = (validExtensions.includes(extension) ? extension : 'pdf') as any;

      await uploadDocument({
        name: selectedFile.name,
        category,
        fileType,
        size: `${(selectedFile.size / 1024).toFixed(0)} KB`,
        linkedDisputeId: linkedDispute || undefined
      });

      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadComplete) {
        setTimeout(onUploadComplete, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5EAF0] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-[#172B4D]">Upload Business Evidence</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize invoices, shipping receipts, carrier PODs and buyer communications for AI indexing.
          </p>
        </div>

        {uploadSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Document uploaded & queued for RAG indexing!
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#0070BA] bg-[#EAF4FC]'
            : 'border-slate-300 hover:border-[#0070BA] bg-slate-50/60 hover:bg-[#F6F9FD]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        <div className="w-12 h-12 mx-auto rounded-full bg-[#EAF4FC] text-[#0070BA] flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-[#172B4D]">
          {selectedFile ? selectedFile.name : 'Drag and drop your documents here or browse files'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, DOCX, XLSX, CSV, JPG, PNG up to 25 MB
        </p>

        {selectedFile && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-slate-200 text-xs font-medium text-slate-700">
            <File className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>

      {/* Metadata Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Document Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#0070BA] focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Link to PayPal Dispute (Optional)
          </label>
          <select
            value={linkedDispute}
            onChange={(e) => setLinkedDispute(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#0070BA] focus:outline-none"
          >
            <option value="">None (General Store Document)</option>
            {disputes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} – {d.customerName} (${d.amount.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {selectedFile && (
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Clear Selection
          </button>
        )}

        <button
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            !selectedFile || isUploading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-xs cursor-pointer'
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              <span>Uploading & Processing OCR...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Confirm & Upload Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
