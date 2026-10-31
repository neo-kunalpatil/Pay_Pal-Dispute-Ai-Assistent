import { Dispute, EvidenceDocument, Transaction, BuyerOrder } from '../types';

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'PP-D-12345',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-9001',
    orderId: 'ORD-1001',
    productName: 'Pro UltraBook Laptop 15"',
    amount: 800.00,
    currency: 'USD',
    reason: 'Product Not Received',
    status: 'Needs Response',
    aiStatus: 'Needs Attention',
    createdDate: 'Oct 28, 2026',
    deadline: 'Nov 03, 2026',
    daysRemaining: 3,
    complaintDescription: 'Buyer claims package never arrived despite tracking status showing in transit / delivered to porch.',
    customerStatement: 'I ordered the laptop on Oct 20. The carrier marked it as delivered on Oct 22, but I checked my security cameras and no courier stopped by. Please refund my $800 immediately.',
    requestedEvidence: [
      'Proof of shipment with carrier tracking number',
      'Proof of delivery to buyer full street address (POD)',
      'Signed invoice matching buyer PayPal billing address',
      'Terms of service / Store return policy'
    ],
    responseDraft: `Dear PayPal Dispute Resolution Specialist,

We are submitting formal merchant rebuttal evidence for dispute PP-D-12345 regarding Order ORD-1001 ($800.00 USD).

1. Order & Fulfillment Verification:
The buyer Rahul Sharma placed Order ORD-1001 on October 20, 2026. Payment was authorized via verified PayPal account rahul.sharma@example.com.

2. Shipment & Tracking:
The item (Pro UltraBook Laptop 15") was packed and dispatched via FedEx Ground under tracking number 794829103942. The shipping label explicitly matches the verified PayPal delivery address on file (452 Maple Ave, Suite 3B, Austin, TX 78701).

3. Delivery Confirmation & Signature:
FedEx delivery scan records indicate package handover at front door with GPS coordinates matching the recipient destination.

We have attached the official commercial invoice, carrier dispatch receipt, GPS-verified delivery proof, and store return terms. We respectfully request this dispute be resolved in the merchant's favor in accordance with PayPal Seller Protection guidelines.

Sincerely,
Acme Store Merchant Operations`,
    merchantResponseNotes: 'Checked FedEx GPS coordinates; confirmed delivery at front desk.',
    isResponseApproved: false,
    timeline: [
      {
        id: 'tl-1',
        title: 'Payment Dispute Received',
        description: 'Buyer Rahul Sharma filed "Product Not Received" via PayPal Resolution Center.',
        timestamp: 'Oct 28, 2026 10:14 AM',
        actor: 'PayPal System',
        type: 'dispute_created'
      },
      {
        id: 'tl-2',
        title: 'Evidence Documents Retrieved',
        description: 'Retrieved invoice_1001.pdf and shipping_receipt.pdf from Merchant Document Vault.',
        timestamp: 'Oct 28, 2026 10:45 AM',
        actor: 'DisputePilot AI Agent',
        type: 'evidence_uploaded'
      },
      {
        id: 'tl-3',
        title: 'AI Investigation Completed',
        description: 'Multi-agent analysis verified 3 of 4 requested documents. Detected 1 timestamp inconsistency in shipping dispatch logs.',
        timestamp: 'Oct 28, 2026 11:02 AM',
        actor: 'DisputePilot AI Agent',
        type: 'investigation_completed'
      },
      {
        id: 'tl-4',
        title: 'Rebuttal Response Drafted',
        description: 'Generated structured response citing FedEx tracking #794829103942 and PayPal Seller Protection eligibility.',
        timestamp: 'Oct 29, 2026 09:15 AM',
        actor: 'DisputePilot AI Agent',
        type: 'response_drafted'
      }
    ],
    investigationReport: {
      summary: 'Buyer filed "Merchandise Not Received" for an $800 Pro UltraBook. Merchant has verified invoice and shipping dispatch records. However, a carrier timestamp anomaly was identified between dispatch and delivery scan that requires merchant verification.',
      evidenceMatchScore: 78,
      supportingEvidence: [
        {
          documentName: 'invoice_1001.pdf',
          relevance: 'Verifies verified billing address matches PayPal account and line item specifications.',
          pageRef: 'Page 1, Item #ORD-1001'
        },
        {
          documentName: 'shipping_receipt.pdf',
          relevance: 'Confirms FedEx Ground dispatch with tracking #794829103942.',
          pageRef: 'Carrier Dispatch Log #4'
        },
        {
          documentName: 'refund_policy.pdf',
          relevance: 'Merchant terms section 4.2 states lost-in-transit claims require carrier tracer ticket within 14 days.',
          pageRef: 'Section 4.2 (Lost Shipments)'
        },
        {
          documentName: 'customer_email.pdf',
          relevance: 'Customer confirmed order placement and requested shipping tracking updates on Oct 21.',
          pageRef: 'Email thread #EM-882'
        }
      ],
      missingEvidence: [
        {
          item: 'Direct Signature Confirmation (POD)',
          importance: 'Mandatory',
          reason: 'PayPal Seller Protection requires physical or electronic signature proof for transactions exceeding $750.00 USD.'
        },
        {
          item: 'Carrier GPS Handover Log',
          importance: 'Recommended',
          reason: 'Confirms courier physical coordinates within 15 meters of destination building.'
        }
      ],
      contradictions: [
        {
          id: 'cd-1',
          severity: 'high',
          title: 'Dispatch Date & Delivery Date Chronology Conflict',
          description: 'Document "shipping_receipt.pdf" notes carrier pickup on Oct 25, 2026, while customer claim cites delivery scan on Oct 22, 2026. Carrier pre-scan may have been generated prior to physical dock transfer.',
          sourceDocA: 'shipping_receipt.pdf (Pickup: Oct 25)',
          sourceDocB: 'Customer Complaint (Scan: Oct 22)',
          recommendation: 'Verify the amended FedEx master tracking scan to confirm actual handover date of Oct 21.'
        }
      ],
      policyClauses: [
        {
          clause: 'High-Value Item Signature Requirement',
          source: 'PayPal Seller Protection Rules §3.1',
          applicability: 'Requires signature delivery confirmation for transactions at or above $750 USD.'
        },
        {
          clause: 'Proof of Shipment Delivery to Confirmed Address',
          source: 'PayPal Merchant Terms §6.4',
          applicability: 'Recipient address on shipping label must match the Transaction Details page.'
        }
      ],
      recommendedAction: 'Obtain and attach FedEx signature delivery receipt (POD) before final submission to satisfy the $750+ Seller Protection threshold.',
      lastRunTimestamp: 'Oct 29, 2026, 09:15 AM'
    }
  },
  {
    id: 'PP-D-12346',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@techcorp.io',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-9045',
    orderId: 'ORD-1044',
    productName: 'Mechanical Ergonomic Keyboard',
    amount: 199.00,
    currency: 'USD',
    reason: 'Product Not as Described',
    status: 'Ready for Review',
    aiStatus: 'Completed',
    createdDate: 'Oct 29, 2026',
    deadline: 'Nov 05, 2026',
    daysRemaining: 5,
    complaintDescription: 'Customer claims keyboard switches are tactile rather than clicky as selected on product configuration.',
    customerStatement: 'I ordered Blue Clicky switches, but the keyboard received feels soft and linear with no audible tactile click. I want a replacement or full refund.',
    requestedEvidence: [
      'Original product listing snapshot & SKU specs',
      'Warehouse pick-and-pack fulfillment scan',
      'Manufacturer serial number verification'
    ],
    responseDraft: `Dear PayPal Claims Team,

Regarding dispute PP-D-12346 for Order ORD-1044 ($199.00 USD):
Our warehouse inventory scan verifies that item SKU MECH-BLUE-01 was picked and packaged. The enclosed invoice and serialized packaging sheet confirm Blue Clicky switches were manufactured and packed.

We have offered the customer a prepaid replacement return label under RMA #9045, which remains open and active. We attach the SKU specification sheet and RMA prepaid label.`,
    isResponseApproved: false,
    timeline: [
      {
        id: 'tl-marcus-1',
        title: 'Dispute Received',
        description: 'Dispute raised: Product Not as Described',
        timestamp: 'Oct 29, 2026 02:20 PM',
        actor: 'PayPal System',
        type: 'dispute_created'
      },
      {
        id: 'tl-marcus-2',
        title: 'AI Verification Completed',
        description: 'Matched SKU packing slip with product catalog. Response drafted.',
        timestamp: 'Oct 29, 2026 03:00 PM',
        actor: 'DisputePilot AI Agent',
        type: 'investigation_completed'
      }
    ],
    investigationReport: {
      summary: 'Buyer received keyboard and claims switch type mismatch. Merchant documentation confirms correct SKU shipment and active return RMA label offered.',
      evidenceMatchScore: 92,
      supportingEvidence: [
        { documentName: 'invoice_1044.pdf', relevance: 'Proves SKU MECH-BLUE-01 matching customer purchase.' },
        { documentName: 'rma_label_9045.pdf', relevance: 'Active prepaid return label provided to buyer.' }
      ],
      missingEvidence: [],
      contradictions: [],
      policyClauses: [
        { clause: 'Return Remedy Clause', source: 'Store Policy §2', applicability: 'Merchants offering free return replacement fulfill good-faith resolution.' }
      ],
      recommendedAction: 'Approve response draft and attach RMA shipping label.',
      lastRunTimestamp: 'Oct 29, 2026 03:00 PM'
    }
  },
  {
    id: 'PP-D-12347',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@designlab.co',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-8812',
    orderId: 'ORD-0982',
    productName: 'Design Studio 4K Monitor Stand',
    amount: 149.50,
    currency: 'USD',
    reason: 'Unauthorised Transaction',
    status: 'Under Review',
    aiStatus: 'Completed',
    createdDate: 'Oct 26, 2026',
    deadline: 'Nov 02, 2026',
    daysRemaining: 2,
    complaintDescription: 'Account holder claims their PayPal account was used without authorization.',
    customerStatement: 'I see a charge of $149.50 for a monitor stand that I never bought. My account might have been hacked.',
    requestedEvidence: [
      'Proof of 2FA authentication at checkout',
      'IP address and device fingerprint logs',
      'Delivery confirmation to verified account address'
    ],
    responseDraft: `Dear PayPal Risk Department,

Rebuttal for Unauthorized Claim PP-D-12347:
The order was placed from IP address 174.92.12.8 matching the customer's prior 6 successful transactions. Courier confirmation shows delivery to the primary account address on file since 2024. All 3D Secure / PayPal risk checks were passed at checkout.`,
    isResponseApproved: true,
    submissionDate: 'Oct 27, 2026',
    submissionReference: 'PP-EVD-9812401',
    timeline: [
      {
        id: 'tl-e-1',
        title: 'Dispute Received',
        description: 'Unauthorized transaction claim filed by account holder.',
        timestamp: 'Oct 26, 2026 08:30 AM',
        actor: 'PayPal System',
        type: 'dispute_created'
      },
      {
        id: 'tl-e-2',
        title: 'Evidence Submitted to PayPal',
        description: 'Merchant approved response with device fingerprint & shipping proof.',
        timestamp: 'Oct 27, 2026 11:20 AM',
        actor: 'Merchant',
        type: 'evidence_submitted'
      }
    ]
  },
  {
    id: 'PP-D-12348',
    customerName: 'David Chen',
    customerEmail: 'd.chen@apex.org',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-9110',
    orderId: 'ORD-1090',
    productName: 'Studio Headphones Noise-Cancelling',
    amount: 320.00,
    currency: 'USD',
    reason: 'Duplicate Charge',
    status: 'Resolved',
    aiStatus: 'Completed',
    createdDate: 'Oct 22, 2026',
    deadline: 'Oct 29, 2026',
    daysRemaining: 0,
    complaintDescription: 'Customer was billed twice for a single headphone order due to cart session refresh.',
    customerStatement: 'I pressed the checkout button once, but got two charges of $320 on PayPal.',
    requestedEvidence: ['Merchant refund ledger confirmation'],
    isResponseApproved: true,
    submissionDate: 'Oct 23, 2026',
    timeline: [
      {
        id: 'tl-d-1',
        title: 'Dispute Created',
        description: 'Duplicate charge inquiry.',
        timestamp: 'Oct 22, 2026 04:12 PM',
        actor: 'Buyer',
        type: 'dispute_created'
      },
      {
        id: 'tl-d-2',
        title: 'Duplicate Refund Issued & Dispute Resolved',
        description: 'Auto-refunded duplicate TXN-9111. Dispute closed in good standing.',
        timestamp: 'Oct 23, 2026 09:00 AM',
        actor: 'Merchant',
        type: 'resolved'
      }
    ]
  },
  {
    id: 'PP-D-12349',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@outlook.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-9180',
    orderId: 'ORD-1115',
    productName: 'Smart Fitness Tracker v3',
    amount: 129.99,
    currency: 'USD',
    reason: 'Refund Not Received',
    status: 'Evidence Pending',
    aiStatus: 'Processing',
    createdDate: 'Oct 30, 2026',
    deadline: 'Nov 06, 2026',
    daysRemaining: 6,
    complaintDescription: 'Buyer returned item on Oct 18 but claims merchant never credited back PayPal account.',
    customerStatement: 'I sent the fitness band back 12 days ago. Tracking said it arrived at your warehouse on Oct 22, but still no refund.',
    requestedEvidence: ['Warehouse receiving dock log', 'Condition inspection report'],
    timeline: [
      {
        id: 'tl-s-1',
        title: 'Dispute Received',
        description: 'Refund Not Received claim logged.',
        timestamp: 'Oct 30, 2026 11:00 AM',
        actor: 'PayPal System',
        type: 'dispute_created'
      }
    ]
  },
  {
    id: 'PP-D-12350',
    customerName: 'Carlos Santana',
    customerEmail: 'carlos.s@santanadesign.com',
    customerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
    transactionId: 'TXN-9205',
    orderId: 'ORD-1132',
    productName: 'Leather Executive Desk Pad',
    amount: 75.00,
    currency: 'USD',
    reason: 'Product Not as Described',
    status: 'Submitted',
    aiStatus: 'Completed',
    createdDate: 'Oct 24, 2026',
    deadline: 'Oct 31, 2026',
    daysRemaining: 0,
    complaintDescription: 'Customer claimed color was Tan instead of Chestnut Brown.',
    customerStatement: 'The leather shade differs significantly from web photos.',
    requestedEvidence: ['Color swatch comparison', 'Store return disclaimer'],
    isResponseApproved: true,
    submissionDate: 'Oct 26, 2026',
    timeline: [
      {
        id: 'tl-c-1',
        title: 'Dispute Received',
        description: 'Color mismatch complaint.',
        timestamp: 'Oct 24, 2026',
        actor: 'Buyer',
        type: 'dispute_created'
      },
      {
        id: 'tl-c-2',
        title: 'Evidence Submitted',
        description: 'Uploaded studio lighting comparison and product warranty disclaimer.',
        timestamp: 'Oct 26, 2026',
        actor: 'Merchant',
        type: 'evidence_submitted'
      }
    ]
  }
];

export const INITIAL_DOCUMENTS: EvidenceDocument[] = [
  {
    id: 'doc-1',
    name: 'invoice_1001.pdf',
    category: 'Invoices',
    fileType: 'pdf',
    size: '248 KB',
    uploadDate: 'Oct 28, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12345',
    summary: 'Commercial tax invoice for Order ORD-1001. Bill to: Rahul Sharma, 452 Maple Ave, Suite 3B, Austin, TX 78701. Item: Pro UltraBook Laptop 15", Total: $800.00 USD.',
    extractedText: `ACME ELECTRONICS STORE INC.
INVOICE #: INV-2026-1001
Date: October 20, 2026
Payment Method: PayPal (Transaction ID: TXN-9001)

SOLD TO:
Rahul Sharma
rahul.sharma@example.com
452 Maple Ave, Suite 3B
Austin, TX 78701

ITEMS:
1x Pro UltraBook Laptop 15" (16GB RAM / 512GB SSD) - $800.00 USD
Tax: $0.00 | Shipping: $0.00
TOTAL PAID: $800.00 USD
Status: Paid in Full via PayPal Express Checkout`
  },
  {
    id: 'doc-2',
    name: 'shipping_receipt.pdf',
    category: 'Shipping Documents',
    fileType: 'pdf',
    size: '412 KB',
    uploadDate: 'Oct 28, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12345',
    summary: 'FedEx Ground dispatch manifest. Tracking #794829103942. Pickup scan: Oct 25, 2026. Destination: Austin, TX.',
    extractedText: `FEDEX GROUND SHIPPING MANIFEST
Waybill: 794829103942
Service: Ground Commercial
Pickup Date: Oct 25, 2026 14:30 CST
Weight: 4.8 lbs
Dimensions: 16x12x3 in
Origin: Acme Fulfillment Hub, Dallas TX
Destination: Rahul Sharma, 452 Maple Ave Suite 3B, Austin TX 78701
Declared Value: $800.00 USD`
  },
  {
    id: 'doc-3',
    name: 'delivery_confirmation.pdf',
    category: 'Delivery Proof',
    fileType: 'pdf',
    size: '185 KB',
    uploadDate: 'Oct 29, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12345',
    summary: 'Carrier delivery confirmation scan. Status: Delivered at Front Door. Oct 22, 2026 16:15 CST.',
    extractedText: `CARRIER DELIVERY RECORD
Tracking Number: 794829103942
Delivered: Oct 22, 2026 16:15 CST
Disposition: Left at front porch / lobby door
Carrier notes: Recipient not available for signature at first attempt. Package left in secure vestibule area.`
  },
  {
    id: 'doc-4',
    name: 'refund_policy.pdf',
    category: 'Refund Policies',
    fileType: 'pdf',
    size: '115 KB',
    uploadDate: 'Oct 20, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12345',
    summary: 'Acme Store official dispute & return terms. Section 4.2 outlines missing package protocol and carrier tracer requirements.',
    extractedText: `ACME STORE GENERAL TERMS & CONDITIONS (V4.2)
Section 4: Lost, Stolen or Damaged Shipments
4.1 The merchant fulfills delivery obligations upon carrier recorded delivery scan to the address confirmed at checkout.
4.2 For orders exceeding $750, signature confirmation is requested by default. If delivery is disputed by buyer, buyer agrees to file carrier tracer within 14 calendar days.
4.3 PayPal Buyer & Seller Protection guidelines govern eligible claims.`
  },
  {
    id: 'doc-5',
    name: 'customer_email.pdf',
    category: 'Customer Emails',
    fileType: 'pdf',
    size: '95 KB',
    uploadDate: 'Oct 28, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12345',
    summary: 'Customer support communication thread with Rahul Sharma regarding tracking updates and delivery query.',
    extractedText: `SUPPORT THREAD #EM-882
From: Rahul Sharma <rahul.sharma@example.com>
To: support@acmestore.com
Date: Oct 21, 2026 11:04 AM
Subject: When will my laptop arrive?

Hi support, I placed order ORD-1001 yesterday. Just checking when the courier will pick it up?
Reply: Sent tracking number FedEx 794829103942 with estimated arrival Oct 23.`
  },
  {
    id: 'doc-6',
    name: 'invoice_1044.pdf',
    category: 'Invoices',
    fileType: 'pdf',
    size: '220 KB',
    uploadDate: 'Oct 29, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12346',
    summary: 'Invoice for Marcus Vance - Mechanical Ergonomic Keyboard with SKU MECH-BLUE-01.'
  },
  {
    id: 'doc-7',
    name: 'warehouse_quality_check.png',
    category: 'Product Evidence',
    fileType: 'png',
    size: '1.2 MB',
    uploadDate: 'Oct 29, 2026',
    status: 'Indexed',
    linkedDisputeId: 'PP-D-12346',
    summary: 'Pre-shipment photo verifying serial number and switch type for keyboard order ORD-1044.'
  },
  {
    id: 'doc-8',
    name: 'fedex_carrier_agreement.pdf',
    category: 'Shipping Documents',
    fileType: 'pdf',
    size: '890 KB',
    uploadDate: 'Oct 15, 2026',
    status: 'Indexed',
    summary: 'Master commercial carrier service level agreement with FedEx Ground logistics.'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9001',
    orderId: 'ORD-1001',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    amount: 800.00,
    currency: 'USD',
    date: 'Oct 20, 2026 11:45 AM',
    type: 'Payment Received',
    status: 'Disputed',
    disputeId: 'PP-D-12345',
    paymentMethod: 'PayPal Balance',
    shippingAddress: '452 Maple Ave, Suite 3B, Austin, TX 78701',
    items: [
      { name: 'Pro UltraBook Laptop 15"', qty: 1, price: 800.00 }
    ]
  },
  {
    id: 'TXN-9002',
    orderId: 'ORD-1002',
    customerName: 'Amazon Web Services',
    customerEmail: 'billing@amazon.com',
    amount: 1299.00,
    currency: 'USD',
    date: 'Oct 31, 2026 10:20 AM',
    type: 'Payment Sent',
    status: 'Completed',
    paymentMethod: 'Visa •••• 4242',
    items: [
      { name: 'Monthly Cloud Infrastructure & Hosting', qty: 1, price: 1299.00 }
    ]
  },
  {
    id: 'TXN-9003',
    orderId: 'ORD-1003',
    customerName: 'Customer #1024',
    customerEmail: 'customer1024@gmail.com',
    amount: 249.00,
    currency: 'USD',
    date: 'Oct 30, 2026 09:15 PM',
    type: 'Refund Issued',
    status: 'Refunded',
    paymentMethod: 'PayPal Balance',
    items: [
      { name: 'Smart Video Doorbell (Returned)', qty: 1, price: 249.00 }
    ]
  },
  {
    id: 'TXN-9004',
    orderId: 'ORD-1004',
    customerName: 'Sophia Miller',
    customerEmail: 'sophia.m@creative.net',
    amount: 499.00,
    currency: 'USD',
    date: 'Oct 31, 2026 11:45 AM',
    type: 'Payment Received',
    status: 'Completed',
    paymentMethod: 'Mastercard •••• 8821',
    shippingAddress: '782 Pine Crest Rd, Seattle, WA 98101',
    items: [
      { name: 'Mirrorless Camera Kit Lens Bundle', qty: 1, price: 499.00 }
    ]
  },
  {
    id: 'TXN-9005',
    orderId: 'ORD-1044',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@techcorp.io',
    amount: 199.00,
    currency: 'USD',
    date: 'Oct 25, 2026 02:18 PM',
    type: 'Payment Received',
    status: 'Disputed',
    disputeId: 'PP-D-12346',
    paymentMethod: 'PayPal Balance',
    shippingAddress: '100 Silicon Way, San Jose, CA 95112',
    items: [
      { name: 'Mechanical Ergonomic Keyboard', qty: 1, price: 199.00 }
    ]
  },
  {
    id: 'TXN-9006',
    orderId: 'ORD-1045',
    customerName: 'Oliver Twist',
    customerEmail: 'oliver.t@books.uk',
    amount: 1250.00,
    currency: 'USD',
    date: 'Oct 29, 2026 04:30 PM',
    type: 'Payment Received',
    status: 'Completed',
    paymentMethod: 'PayPal Balance',
    shippingAddress: '14 Oxford St, Cambridge, MA 02138',
    items: [
      { name: 'Custom High-End Audio Interface', qty: 1, price: 1250.00 }
    ]
  },
  {
    id: 'TXN-9007',
    orderId: 'ORD-0982',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@designlab.co',
    amount: 149.50,
    currency: 'USD',
    date: 'Oct 21, 2026 09:12 AM',
    type: 'Payment Received',
    status: 'Disputed',
    disputeId: 'PP-D-12347',
    paymentMethod: 'Visa •••• 4242',
    shippingAddress: '88 Wall Street, New York, NY 10005',
    items: [
      { name: 'Design Studio 4K Monitor Stand', qty: 1, price: 149.50 }
    ]
  }
];

export const BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'bo-1',
    productName: 'Pro UltraBook Laptop 15"',
    orderNumber: 'ORD-1001',
    price: 800.00,
    date: 'Oct 20, 2026',
    status: 'In Transit',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop',
    hasDispute: true,
    disputeId: 'PP-D-12345',
    trackingNumber: 'FEDEX-794829103942'
  },
  {
    id: 'bo-2',
    productName: 'Wireless Earbuds Active ANC',
    orderNumber: 'PP123466',
    price: 89.00,
    date: 'Oct 28, 2026',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop',
    trackingNumber: 'UPS-994829102'
  },
  {
    id: 'bo-3',
    productName: 'Smart Watch Series 7',
    orderNumber: 'PP123455',
    price: 249.00,
    date: 'Oct 25, 2026',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    trackingNumber: 'USPS-94001000293'
  },
  {
    id: 'bo-4',
    productName: 'Waterproof Laptop Bag Pro',
    orderNumber: 'PP123454',
    price: 65.00,
    date: 'Oct 20, 2026',
    status: 'In Transit',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
    trackingNumber: 'FEDEX-8839102948'
  }
];
