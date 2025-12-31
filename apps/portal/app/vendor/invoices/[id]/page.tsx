/**
 * Vendor Invoice Detail Page
 *
 * PRD V-01: Payment Status Transparency
 * - Status timeline (RECEIVED → UNDER_REVIEW → APPROVED → PAID)
 * - Rejection reasons (if rejected)
 * - Matching status (3-way matching)
 * - Payment schedule
 * - Documents (invoice PDF, PO, GRN)
 * - Audit trail
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createClient } from "@/lib/supabase-client";
import { InvoiceRepository } from "@/src/repositories/invoice-repository";
import Link from "next/link";
import { notFound } from "next/navigation";

interface InvoiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VendorInvoiceDetailPage({
  params: paramsPromise,
}: InvoiceDetailPageProps) {
  const ctx = getRequestContext();
  const params = await paramsPromise;
  const invoiceRepo = new InvoiceRepository();

  // Get invoice
  const invoice = await invoiceRepo.getById(params.id);

  if (!invoice) {
    notFound();
  }

  // Get status timeline from audit trail
  const supabase = createClient();
  const { data: auditTrail } = await supabase
    .from("audit_events")
    .select("*")
    .eq("entity_type", "invoice")
    .eq("entity_id", params.id)
    .order("created_at", { ascending: true });

  // Get linked documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("linked_entity_type", "invoice")
    .eq("linked_entity_id", params.id)
    .order("created_at", { ascending: false });

  // Get 3-way matching status
  const { data: matching } = await supabase
    .from("three_way_matches")
    .select("*")
    .eq("invoice_id", params.id)
    .single();

  // Calculate expected payment date (invoice_date + payment_terms)
  const expectedPaymentDate = invoice.due_date
    ? new Date(invoice.due_date)
    : invoice.invoice_date
    ? new Date(
        new Date(invoice.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000
      ) // Default 30 days
    : null;

  // Determine current status display (PRD V-01: Canonical statuses)
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "ok" | "bad" | "warn" | "pending" }
    > = {
      received: { label: "RECEIVED", variant: "pending" },
      pending: { label: "UNDER_REVIEW", variant: "pending" },
      under_review: { label: "UNDER_REVIEW", variant: "pending" },
      matched: { label: "UNDER_REVIEW", variant: "pending" },
      approved: { label: "APPROVED_FOR_PAYMENT", variant: "ok" },
      rejected: { label: "REJECTED", variant: "bad" },
      paid: { label: "PAID", variant: "ok" },
      disputed: { label: "DISPUTED", variant: "warn" },
      cancelled: { label: "CANCELLED", variant: "bad" },
    };

    return (
      statusMap[status.toLowerCase()] || {
        label: status.toUpperCase(),
        variant: "pending",
      }
    );
  };

  const statusDisplay = getStatusDisplay(invoice.status);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <div>
          <h1 className="na-h1">Invoice {invoice.invoice_num}</h1>
          <p className="na-metadata na-mt-2">
            Created: {new Date(invoice.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/vendor/invoices" className="na-btn na-btn-ghost">
          ← Back to Invoices
        </Link>
      </div>

      {/* Status Card (PRD V-01: Payment Status Transparency) */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Current Status</h2>
        <div className="na-flex na-items-center na-gap-4 na-mb-4">
          <span
            className={`na-status na-status-${statusDisplay.variant} na-text-lg`}
          >
            {statusDisplay.label}
          </span>
          <div className="na-metadata na-text-sm">
            Last updated: {new Date(invoice.updated_at).toLocaleString()}
          </div>
        </div>

        {/* Expected Next Step (PRD V-01) */}
        <div className="na-card na-p-4 na-bg-paper-2 na-mt-4">
          <div className="na-metadata na-mb-2">Expected Next Step</div>
          <div className="na-body">
            {invoice.status === "approved"
              ? `Payment scheduled for ${
                  expectedPaymentDate?.toLocaleDateString() || "TBD"
                }`
              : invoice.status === "pending" ||
                invoice.status === "under_review"
              ? "Invoice is under review. You will be notified when status changes."
              : invoice.status === "rejected"
              ? "Invoice was rejected. Please review rejection reason below."
              : invoice.status === "paid"
              ? "Invoice has been paid."
              : "Status update pending."}
          </div>
        </div>

        {/* Expected Payment Date (PRD V-01) */}
        {expectedPaymentDate && (
          <div className="na-card na-p-4 na-bg-paper-2 na-mt-4">
            <div className="na-metadata na-mb-2">Expected Payment Date</div>
            <div className="na-data-large">
              {expectedPaymentDate.toLocaleDateString()}
            </div>
            <div className="na-metadata na-text-sm na-mt-2">
              Based on invoice date and payment terms
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Invoice Details</h2>
        <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
          <div>
            <label className="na-metadata na-mb-2 na-block">
              Invoice Number
            </label>
            <div className="na-data">{invoice.invoice_num}</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Invoice Date</label>
            <div className="na-data">
              {invoice.invoice_date
                ? new Date(invoice.invoice_date).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Amount</label>
            <div className="na-data-large">
              $
              {(invoice.amount ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              {invoice.currency_code || "USD"}
            </div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Due Date</label>
            <div className="na-data">
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline (PRD V-01) */}
      {auditTrail && auditTrail.length > 0 && (
        <div className="na-card na-p-6 na-mb-6">
          <h2 className="na-h3 na-mb-4">Status Timeline</h2>
          <div className="na-space-y-4">
            {auditTrail.map((event, index) => (
              <div key={event.id} className="na-flex na-gap-4">
                <div className="na-flex-shrink-0">
                  <div className="na-w-2 na-h-2 na-rounded-full na-bg-primary na-mt-2"></div>
                  {index < auditTrail.length - 1 && (
                    <div className="na-w-0.5 na-h-8 na-bg-paper-3 na-ml-1"></div>
                  )}
                </div>
                <div className="na-flex-1">
                  <div className="na-metadata na-text-sm">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                  <div className="na-body na-mt-1">{event.action}</div>
                  {event.workflow_state && (
                    <div className="na-metadata na-text-sm na-mt-1">
                      {JSON.stringify(event.workflow_state)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Way Matching Status */}
      {matching && (
        <div className="na-card na-p-6 na-mb-6">
          <h2 className="na-h3 na-mb-4">3-Way Matching Status</h2>
          <div className="na-grid na-grid-cols-3 na-gap-4">
            <div>
              <label className="na-metadata na-mb-2 na-block">PO Match</label>
              <span
                className={`na-status na-status-${
                  matching.po_match ? "ok" : "bad"
                }`}
              >
                {matching.po_match ? "Matched" : "Not Matched"}
              </span>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">GRN Match</label>
              <span
                className={`na-status na-status-${
                  matching.grn_match ? "ok" : "bad"
                }`}
              >
                {matching.grn_match ? "Matched" : "Not Matched"}
              </span>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">
                Overall Match
              </label>
              <span
                className={`na-status na-status-${
                  matching.match_score >= 0.8 ? "ok" : "warn"
                }`}
              >
                {matching.match_score >= 0.8 ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {documents && documents.length > 0 && (
        <div className="na-card na-p-6 na-mb-6">
          <h2 className="na-h3 na-mb-4">Documents</h2>
          <div className="na-space-y-2">
            {documents.map((doc: unknown) => {
              const d = doc as { id: string; name: string; file_url: string };
              return (
                <div
                  key={d.id}
                  className="na-card na-p-4 na-flex na-items-center na-justify-between"
                >
                  <div>
                    <div className="na-body">{d.name}</div>
                    <div className="na-metadata na-text-sm">Document</div>
                  </div>
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="na-btn na-btn-ghost na-btn-sm"
                  >
                    View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection Reason (if rejected) */}
      {invoice.status === "rejected" && (
        <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger">
          <h2 className="na-h4 na-mb-2">Rejection Reason</h2>
          <p className="na-body">
            {(invoice as unknown as { rejection_reason?: string })
              .rejection_reason || "No rejection reason provided."}
          </p>
        </div>
      )}
    </div>
  );
}
