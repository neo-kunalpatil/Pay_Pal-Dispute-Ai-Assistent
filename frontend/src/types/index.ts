export type UserRole = 'merchant' | 'buyer' | 'admin' | 'analyst';

export type DisputeStatus = 
  | 'Needs Response'
  | 'Under Review'
  | 'Evidence Pending'
  | 'Ready for Review'
  | 'Submitted'
  | 'Resolved'
  | 'Closed';

export type AIInvestigationStatus = 
  | 'Not Started'
  | 'Processing'
  | 'Completed'
  | 'Needs Attention';

export type DisputeReason =
  | 'Product Not Received'
  | 'Product Not as Described'
  | 'Unauthorised Transaction'
  | 'Duplicate Charge'
  | 'Refund Not Received';

export type DocumentCategory =
  | 'Invoices'
  | 'Shipping Documents'
  | 'Delivery Proof'
  | 'Refund Policies'
  | 'Customer Emails'
  | 'Product Evidence'
  | 'Other';

export type DocumentProcessingStatus = 'Uploaded' | 'Processing' | 'Indexed' | 'Failed';

export interface EvidenceDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'jpg' | 'png';
  size: string;
  uploadDate: string;
  status: DocumentProcessingStatus;
  linkedDisputeId?: string;
  previewUrl?: string;
  extractedText?: string;
  summary?: string;
  extractedMetadata?: {
    date?: string;
    trackingNumber?: string;
    amount?: string;
    carrier?: string;
    parties?: string;
  };
}

export interface ActivityTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: 'PayPal System' | 'Buyer' | 'Merchant' | 'DisputePilot AI Agent';
  type: 'dispute_created' | 'evidence_uploaded' | 'investigation_started' | 'investigation_completed' | 'response_drafted' | 'merchant_approved' | 'evidence_submitted' | 'resolved';
}

export interface Contradiction {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  sourceDocA: string;
  sourceDocB: string;
  recommendation: string;
}

export interface AIInvestigationReport {
  summary: string;
  evidenceMatchScore: number; // percentage 0 - 100
  supportingEvidence: Array<{
    documentName: string;
    relevance: string;
    pageRef?: string;
  }>;
  missingEvidence: Array<{
    item: string;
    importance: 'Mandatory' | 'Recommended' | 'Optional';
    reason: string;
  }>;
  contradictions: Contradiction[];
  policyClauses: Array<{
    clause: string;
    source: string;
    applicability: string;
  }>;
  recommendedAction: string;
  lastRunTimestamp: string;
}

export interface Dispute {
  id: string; // e.g. PP-D-12345
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  transactionId: string; // e.g. TXN-9001
  orderId: string; // e.g. ORD-1001
  productName: string;
  amount: number;
  currency: string;
  reason: DisputeReason;
  status: DisputeStatus;
  aiStatus: AIInvestigationStatus;
  createdDate: string;
  deadline: string;
  daysRemaining: number;
  complaintDescription: string;
  customerStatement: string;
  requestedEvidence: string[];
  responseDraft?: string;
  merchantResponseNotes?: string;
  isResponseApproved?: boolean;
  submissionDate?: string;
  submissionReference?: string;
  timeline: ActivityTimelineItem[];
  investigationReport?: AIInvestigationReport;
}

export interface Transaction {
  id: string; // TXN-9001
  orderId: string; // ORD-1001
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  date: string;
  type: 'Payment Received' | 'Payment Sent' | 'Refund Issued';
  status: 'Completed' | 'Refunded' | 'Disputed' | 'Pending';
  disputeId?: string;
  paymentMethod: 'PayPal Balance' | 'Visa •••• 4242' | 'Mastercard •••• 8821';
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  shippingAddress?: string;
}

export interface BuyerOrder {
  id: string;
  productName: string;
  orderNumber: string;
  price: number;
  date: string;
  status: 'Delivered' | 'In Transit' | 'Processing';
  image: string;
  hasDispute?: boolean;
  disputeId?: string;
  trackingNumber?: string;
}
