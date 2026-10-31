import time
import logging
from datetime import datetime, timezone, timedelta
from app.database.session import engine, Base, SessionLocal
from app.models import (
    Merchant, User, Transaction, Dispute, DisputeTimeline,
    Document, DisputeDocument, Investigation, InvestigationSource,
    Response, Notification, PayPalConnection
)
from app.core.security import get_password_hash

logger = logging.getLogger("disputepilot.init_db")

def init_db(max_retries: int = 5, retry_delay: float = 3.0):
    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"Failed to connect to database after {max_retries} attempts: {e}")
                raise
            logger.warning(f"Database connection attempt {attempt} failed ({e}). Retrying in {retry_delay}s...")
            time.sleep(retry_delay)

    db = SessionLocal()

    try:
        # 1. Ensure Default Merchant
        merchant = db.query(Merchant).filter(Merchant.id == "mch-001").first()
        if not merchant:
            print("Seeding initial merchant...")
            merchant = Merchant(
                id="mch-001",
                business_name="Acme Store Merchant Operations",
                email="acme-store-merchant@business.example.com",
                country="US",
                currency="USD",
                business_type="Ecommerce"
            )
            db.add(merchant)
            db.commit()
            db.refresh(merchant)

        # 2. Ensure Demo Users
        users_to_check = [
            ("usr-001", "merchant@disputepilot.demo", "Acme Merchant Owner", "Merchant@12345", "merchant"),
            ("usr-002", "admin@disputepilot.demo", "Platform Admin", "Admin@12345", "admin"),
            ("usr-003", "analyst@disputepilot.demo", "Dispute Analyst", "Analyst@12345", "analyst"),
            ("usr-004", "rahul.sharma@example.com", "Rahul Sharma", "password123", "buyer"),
            ("usr-005", "kunalpatil3435@gmail.com", "Kunal Patil", "Merchant@12345", "merchant"),
        ]
        for uid, email, name, pwd, role in users_to_check:
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                u = User(
                    id=uid,
                    merchant_id=merchant.id,
                    full_name=name,
                    email=email,
                    password_hash=get_password_hash(pwd),
                    role=role,
                    is_active=True
                )
                db.add(u)
        db.commit()

        # 3. Ensure PayPal Connection
        conn = db.query(PayPalConnection).filter(PayPalConnection.merchant_id == merchant.id).first()
        if not conn:
            pp_conn = PayPalConnection(
                merchant_id=merchant.id,
                environment="sandbox",
                paypal_merchant_id="SANDBOX_MERCHANT_01",
                connection_status="Connected",
                last_sync_time="Today at 11:45 AM"
            )
            db.add(pp_conn)
            db.commit()

        # 4. Ensure Transactions and Dispute
        existing_disp = db.query(Dispute).filter(Dispute.id == "PP-D-12345").first()
        if not existing_disp:
            print("Seeding initial transactions, documents, and dispute PP-D-12345...")
            txn1 = db.query(Transaction).filter(Transaction.id == "TXN-9001").first()
            if not txn1:
                txn1 = Transaction(
                    id="TXN-9001",
                    merchant_id=merchant.id,
                    order_id="ORD-1001",
                    paypal_order_id="PP-ORD-8829103",
                    paypal_capture_id="CAP-9921029",
                    customer_name="Rahul Sharma",
                    customer_email="rahul.sharma@example.com",
                    amount=800.00,
                    currency="USD",
                    payment_status="Disputed",
                    payment_method="Visa •••• 4242",
                    payment_type="Payment Received",
                    items=[{"name": 'Pro UltraBook Laptop 15"', "qty": 1, "price": 800.00}],
                    shipping_address="452 Maple Ave, Suite 3B, Austin, TX 78701"
                )
                db.add(txn1)

            txn2 = db.query(Transaction).filter(Transaction.id == "TXN-9002").first()
            if not txn2:
                txn2 = Transaction(
                    id="TXN-9002",
                    merchant_id=merchant.id,
                    order_id="ORD-1002",
                    paypal_order_id="PP-ORD-8829104",
                    customer_name="Priya Patel",
                    customer_email="priya.p@example.com",
                    amount=149.99,
                    currency="USD",
                    payment_status="Completed",
                    payment_method="PayPal Balance",
                    payment_type="Payment Received",
                    items=[{"name": "Mechanical Keyboard RGB", "qty": 1, "price": 149.99}],
                    shipping_address="100 Innovation Way, San Jose, CA 95110"
                )
                db.add(txn2)
            db.commit()

            # Documents
            doc1 = db.query(Document).filter(Document.id == "doc-101").first()
            if not doc1:
                doc1 = Document(
                    id="doc-101",
                    merchant_id=merchant.id,
                    filename="invoice_1001.pdf",
                    original_filename="invoice_1001.pdf",
                    file_type="pdf",
                    file_size="245 KB",
                    file_size_bytes=250880,
                    document_category="Invoices",
                    storage_path="storage/uploads/invoice_1001.pdf",
                    processing_status="Indexed",
                    extracted_text="COMMERCIAL INVOICE #ORD-1001\nBilled To: Rahul Sharma\nAddress: 452 Maple Ave, Suite 3B, Austin, TX 78701\nItem: Pro UltraBook Laptop 15\"\nTotal: $800.00 USD",
                    summary="Commercial Invoice for Order ORD-1001. Confirms buyer address matches PayPal profile.",
                    extracted_metadata={"trackingNumber": "794829103942", "amount": "$800.00"}
                )
                db.add(doc1)

            doc2 = db.query(Document).filter(Document.id == "doc-102").first()
            if not doc2:
                doc2 = Document(
                    id="doc-102",
                    merchant_id=merchant.id,
                    filename="shipping_receipt.pdf",
                    original_filename="shipping_receipt.pdf",
                    file_type="pdf",
                    file_size="1.1 MB",
                    file_size_bytes=1153433,
                    document_category="Shipping Documents",
                    storage_path="storage/uploads/shipping_receipt.pdf",
                    processing_status="Indexed",
                    extracted_text="FEDEX GROUND DISPATCH RECEIPT\nTracking: 794829103942\nShip Date: Oct 25, 2026\nOrigin: Acme Warehouse Dallas, TX\nDestination: 452 Maple Ave, Suite 3B, Austin, TX 78701\nStatus: Handed over to courier.",
                    summary="FedEx Ground Dispatch receipt with tracking number 794829103942.",
                    extracted_metadata={"trackingNumber": "794829103942"}
                )
                db.add(doc2)

            doc3 = db.query(Document).filter(Document.id == "doc-103").first()
            if not doc3:
                doc3 = Document(
                    id="doc-103",
                    merchant_id=merchant.id,
                    filename="refund_policy.pdf",
                    original_filename="refund_policy.pdf",
                    file_type="pdf",
                    file_size="180 KB",
                    file_size_bytes=184320,
                    document_category="Refund Policies",
                    storage_path="storage/uploads/refund_policy.pdf",
                    processing_status="Indexed",
                    extracted_text="STORE TERMS & REFUND POLICY V4.2\nSection 4.1: Delivery fulfilled upon valid carrier scan.\nSection 4.2: Lost-in-transit claims require carrier tracer ticket within 14 calendar days.",
                    summary="Merchant store policy covering shipping fulfillment and tracer filing requirements."
                )
                db.add(doc3)
            db.commit()

            # Create Primary Dispute PP-D-12345
            disp = Dispute(
                id="PP-D-12345",
                merchant_id=merchant.id,
                transaction_id="TXN-9001",
                paypal_dispute_id="PP-D-12345",
                order_id="ORD-1001",
                product_name='Pro UltraBook Laptop 15"',
                customer_name="Rahul Sharma",
                customer_email="rahul.sharma@example.com",
                customer_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
                amount=800.00,
                currency="USD",
                reason="Product Not Received",
                status="Needs Response",
                lifecycle_stage="INQUIRY",
                priority="HIGH",
                ai_status="Needs Attention",
                complaint_description="Buyer claims package never arrived despite tracking status showing in transit / delivered to porch.",
                customer_statement="I ordered the laptop on Oct 20. The carrier marked it as delivered on Oct 22, but I checked my security cameras and no courier stopped by. Please refund my $800 immediately.",
                requested_evidence=[
                    "Proof of shipment with carrier tracking number",
                    "Proof of delivery to buyer full street address (POD)",
                    "Signed invoice matching buyer PayPal billing address",
                    "Terms of service / Store return policy"
                ],
                response_draft="""Dear PayPal Dispute Resolution Specialist,

We are submitting formal merchant rebuttal evidence for dispute PP-D-12345 regarding Order ORD-1001 ($800.00 USD).

1. Order & Fulfillment Verification:
The buyer Rahul Sharma placed Order ORD-1001 on October 20, 2026. Payment was authorized via verified PayPal account rahul.sharma@example.com.

2. Shipment & Tracking:
The item (Pro UltraBook Laptop 15") was packed and dispatched via FedEx Ground under tracking number 794829103942. The shipping label explicitly matches the verified PayPal delivery address on file (452 Maple Ave, Suite 3B, Austin, TX 78701).

3. Delivery Confirmation & Signature:
FedEx delivery scan records indicate package handover with GPS coordinates matching recipient destination.

We have attached the official commercial invoice, carrier dispatch receipt, and store return terms. We respectfully request this dispute be resolved in the merchant's favor in accordance with PayPal Seller Protection guidelines.

Sincerely,
Acme Store Merchant Operations""",
                merchant_response_notes="Checked FedEx GPS coordinates; confirmed delivery at front desk.",
                is_response_approved=False,
                dispute_date=datetime.now(timezone.utc) - timedelta(days=3),
                response_deadline=datetime.now(timezone.utc) + timedelta(days=3)
            )
            db.add(disp)
            db.commit()

            # Link documents to dispute
            db.add(DisputeDocument(dispute_id=disp.id, document_id="doc-101"))
            db.add(DisputeDocument(dispute_id=disp.id, document_id="doc-102"))
            db.add(DisputeDocument(dispute_id=disp.id, document_id="doc-103"))
            db.commit()

            # Seed document chunks for pgvector semantic search
            from app.rag.embeddings import embedding_service
            from app.rag.pgvector_client import pgvector_client
            
            pgvector_client.ensure_extension(db)

            chunks_to_seed = [
                {
                    "merchant_id": merchant.id,
                    "document_id": "doc-101",
                    "dispute_id": disp.id,
                    "chunk_index": 1,
                    "content": "COMMERCIAL INVOICE #ORD-1001\nBilled To: Rahul Sharma\nAddress: 452 Maple Ave, Suite 3B, Austin, TX 78701\nItem: Pro UltraBook Laptop 15\"\nTotal: $800.00 USD",
                    "embedding": embedding_service.generate_embedding("COMMERCIAL INVOICE #ORD-1001\nBilled To: Rahul Sharma\nAddress: 452 Maple Ave, Suite 3B, Austin, TX 78701\nItem: Pro UltraBook Laptop 15\"\nTotal: $800.00 USD"),
                    "page_number": 1,
                    "document_category": "Invoices",
                    "filename": "invoice_1001.pdf"
                },
                {
                    "merchant_id": merchant.id,
                    "document_id": "doc-102",
                    "dispute_id": disp.id,
                    "chunk_index": 1,
                    "content": "FEDEX GROUND DISPATCH RECEIPT\nTracking: 794829103942\nShip Date: Oct 25, 2026\nOrigin: Acme Warehouse Dallas, TX\nDestination: 452 Maple Ave, Suite 3B, Austin, TX 78701\nStatus: Handed over to courier.",
                    "embedding": embedding_service.generate_embedding("FEDEX GROUND DISPATCH RECEIPT\nTracking: 794829103942\nShip Date: Oct 25, 2026\nOrigin: Acme Warehouse Dallas, TX\nDestination: 452 Maple Ave, Suite 3B, Austin, TX 78701\nStatus: Handed over to courier."),
                    "page_number": 1,
                    "document_category": "Shipping Documents",
                    "filename": "shipping_receipt.pdf"
                },
                {
                    "merchant_id": merchant.id,
                    "document_id": "doc-103",
                    "dispute_id": disp.id,
                    "chunk_index": 1,
                    "content": "STORE TERMS & REFUND POLICY V4.2\nSection 4.1: Delivery fulfilled upon valid carrier scan.\nSection 4.2: Lost-in-transit claims require carrier tracer ticket within 14 calendar days.",
                    "embedding": embedding_service.generate_embedding("STORE TERMS & REFUND POLICY V4.2\nSection 4.1: Delivery fulfilled upon valid carrier scan.\nSection 4.2: Lost-in-transit claims require carrier tracer ticket within 14 calendar days."),
                    "page_number": 1,
                    "document_category": "Refund Policies",
                    "filename": "refund_policy.pdf"
                }
            ]
            pgvector_client.store_chunks(db, chunks_to_seed)

            # Dispute timeline
            db.add_all([
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Payment Dispute Received",
                    description='Buyer Rahul Sharma filed "Product Not Received" via PayPal Resolution Center.',
                    timestamp="Oct 28, 2026 10:14 AM",
                    actor="PayPal System",
                    event_type="dispute_created"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Evidence Documents Retrieved",
                    description="Retrieved invoice_1001.pdf and shipping_receipt.pdf from Merchant Document Vault.",
                    timestamp="Oct 28, 2026 10:45 AM",
                    actor="DisputePilot AI Agent",
                    event_type="evidence_uploaded"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="AI Investigation Completed",
                    description="Multi-agent analysis verified 3 of 4 requested documents. Detected 1 timestamp anomaly in dispatch logs.",
                    timestamp="Oct 28, 2026 11:02 AM",
                    actor="DisputePilot AI Agent",
                    event_type="investigation_completed"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Rebuttal Response Drafted",
                    description="Generated structured response citing FedEx tracking #794829103942 and PayPal Seller Protection eligibility.",
                    timestamp="Oct 29, 2026 09:15 AM",
                    actor="DisputePilot AI Agent",
                    event_type="response_drafted"
                )
            ])
            db.commit()

            # Initial Investigation for PP-D-12345
            inv = Investigation(
                merchant_id=merchant.id,
                dispute_id=disp.id,
                status="COMPLETED",
                ai_summary='Buyer filed "Merchandise Not Received" for an $800 Pro UltraBook. Merchant has verified invoice and shipping dispatch records. However, a carrier timestamp anomaly was identified between dispatch and delivery scan that requires merchant verification.',
                evidence_match_score=78.0,
                confidence=0.91,
                supporting_evidence=[
                    {
                        "documentName": "invoice_1001.pdf",
                        "relevance": "Verifies verified billing address matches PayPal account and line item specifications.",
                        "pageRef": "Page 1, Item #ORD-1001"
                    },
                    {
                        "documentName": "shipping_receipt.pdf",
                        "relevance": "Confirms FedEx Ground dispatch with tracking #794829103942.",
                        "pageRef": "Carrier Dispatch Log #4"
                    },
                    {
                        "documentName": "refund_policy.pdf",
                        "relevance": "Merchant terms section 4.2 states lost-in-transit claims require carrier tracer ticket within 14 days.",
                        "pageRef": "Section 4.2 (Lost Shipments)"
                    }
                ],
                missing_evidence=[
                    {
                        "item": "Direct Signature Confirmation (POD)",
                        "importance": "Mandatory",
                        "reason": "PayPal Seller Protection requires physical or electronic signature proof for transactions exceeding $750.00 USD."
                    },
                    {
                        "item": "Carrier GPS Handover Log",
                        "importance": "Recommended",
                        "reason": "Confirms courier physical coordinates within 15 meters of destination building."
                    }
                ],
                contradictions=[
                    {
                        "id": "cd-1",
                        "severity": "high",
                        "title": "Dispatch Timestamp Anomaly Detected",
                        "description": "Customer statement asserts delivery occurred on Oct 22, yet carrier dispatch records indicate shipment handover on Oct 25.",
                        "sourceDocA": "Customer Dispute Statement (Claims delivery Oct 22)",
                        "sourceDocB": "Carrier Dispatch Log (Shows package dispatched Oct 25)",
                        "recommendation": "Request carrier tracking history trace log from freight vendor before submitting formal rebuttal to PayPal."
                    }
                ],
                policy_clauses=[
                    {
                        "clause": "Delivery fulfilled upon carrier scan",
                        "source": "Store Terms §4.1",
                        "applicability": "Applies directly to merchandise transit stage."
                    },
                    {
                        "clause": "Signature Mandate for $750+ Transactions",
                        "source": "PayPal Seller Protection §3.1",
                        "applicability": "Directly impacts claim protection threshold for $800 transaction."
                    }
                ],
                recommendations="Review the synthesized rebuttal text. Verify tracking GPS coordinates and confirm whether recipient signature is available."
            )
            db.add(inv)

            # Notifications
            db.add_all([
                Notification(
                    merchant_id=merchant.id,
                    title="Action Required: PP-D-12345 deadline in 3 days",
                    time="10m ago",
                    read=False
                ),
                Notification(
                    merchant_id=merchant.id,
                    title="AI Analysis complete for dispute #PP-D-12345",
                    time="1h ago",
                    read=False
                ),
                Notification(
                    merchant_id=merchant.id,
                    title="PayPal Sandbox Webhook: Payment TXN-9002 settled",
                    time="2h ago",
                    read=True
                )
            ])
            db.commit()
            print("DisputePilot AI database seeded successfully with dispute and vector chunks!")

            # Dispute timeline
            db.add_all([
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Payment Dispute Received",
                    description='Buyer Rahul Sharma filed "Product Not Received" via PayPal Resolution Center.',
                    timestamp="Oct 28, 2026 10:14 AM",
                    actor="PayPal System",
                    event_type="dispute_created"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Evidence Documents Retrieved",
                    description="Retrieved invoice_1001.pdf and shipping_receipt.pdf from Merchant Document Vault.",
                    timestamp="Oct 28, 2026 10:45 AM",
                    actor="DisputePilot AI Agent",
                    event_type="evidence_uploaded"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="AI Investigation Completed",
                    description="Multi-agent analysis verified 3 of 4 requested documents. Detected 1 timestamp anomaly in dispatch logs.",
                    timestamp="Oct 28, 2026 11:02 AM",
                    actor="DisputePilot AI Agent",
                    event_type="investigation_completed"
                ),
                DisputeTimeline(
                    dispute_id=disp.id,
                    title="Rebuttal Response Drafted",
                    description="Generated structured response citing FedEx tracking #794829103942 and PayPal Seller Protection eligibility.",
                    timestamp="Oct 29, 2026 09:15 AM",
                    actor="DisputePilot AI Agent",
                    event_type="response_drafted"
                )
            ])

            # Initial Investigation for PP-D-12345
            inv = Investigation(
                merchant_id=merchant.id,
                dispute_id=disp.id,
                status="COMPLETED",
                ai_summary='Buyer filed "Merchandise Not Received" for an $800 Pro UltraBook. Merchant has verified invoice and shipping dispatch records. However, a carrier timestamp anomaly was identified between dispatch and delivery scan that requires merchant verification.',
                evidence_match_score=78.0,
                confidence=0.91,
                supporting_evidence=[
                    {
                        "documentName": "invoice_1001.pdf",
                        "relevance": "Verifies verified billing address matches PayPal account and line item specifications.",
                        "pageRef": "Page 1, Item #ORD-1001"
                    },
                    {
                        "documentName": "shipping_receipt.pdf",
                        "relevance": "Confirms FedEx Ground dispatch with tracking #794829103942.",
                        "pageRef": "Carrier Dispatch Log #4"
                    },
                    {
                        "documentName": "refund_policy.pdf",
                        "relevance": "Merchant terms section 4.2 states lost-in-transit claims require carrier tracer ticket within 14 days.",
                        "pageRef": "Section 4.2 (Lost Shipments)"
                    }
                ],
                missing_evidence=[
                    {
                        "item": "Direct Signature Confirmation (POD)",
                        "importance": "Mandatory",
                        "reason": "PayPal Seller Protection requires physical or electronic signature proof for transactions exceeding $750.00 USD."
                    },
                    {
                        "item": "Carrier GPS Handover Log",
                        "importance": "Recommended",
                        "reason": "Confirms courier physical coordinates within 15 meters of destination building."
                    }
                ],
                contradictions=[
                    {
                        "id": "cd-1",
                        "severity": "high",
                        "title": "Dispatch Timestamp Anomaly Detected",
                        "description": "Customer statement asserts delivery occurred on Oct 22, yet carrier dispatch records indicate shipment handover on Oct 25.",
                        "sourceDocA": "Customer Dispute Statement (Claims delivery Oct 22)",
                        "sourceDocB": "Carrier Dispatch Log (Shows package dispatched Oct 25)",
                        "recommendation": "Request carrier tracking history trace log from freight vendor before submitting formal rebuttal to PayPal."
                    }
                ],
                policy_clauses=[
                    {
                        "clause": "Delivery fulfilled upon carrier scan",
                        "source": "Store Terms §4.1",
                        "applicability": "Applies directly to merchandise transit stage."
                    },
                    {
                        "clause": "Signature Mandate for $750+ Transactions",
                        "source": "PayPal Seller Protection §3.1",
                        "applicability": "Directly impacts claim protection threshold for $800 transaction."
                    }
                ],
                recommendations="Review the synthesized rebuttal text. Verify tracking GPS coordinates and confirm whether recipient signature is available."
            )
            db.add(inv)

            # Notifications
            db.add_all([
                Notification(
                    merchant_id=merchant.id,
                    title="Action Required: PP-D-12345 deadline in 3 days",
                    time="10m ago",
                    read=False
                ),
                Notification(
                    merchant_id=merchant.id,
                    title="AI Analysis complete for dispute #PP-D-12345",
                    time="1h ago",
                    read=False
                ),
                Notification(
                    merchant_id=merchant.id,
                    title="PayPal Sandbox Webhook: Payment TXN-9002 settled",
                    time="2h ago",
                    read=True
                )
            ])

            db.commit()
            print("DisputePilot AI database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
