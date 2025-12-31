/**
 * Shared Service Center (SSC) Work Queue Page
 *
 * "God Mode": Unified work queue across all subsidiaries.
 * AP Clerk sees all pending invoices from all companies in one view.
 */

import { ContextSwitcher } from "@/components/tenant/ContextSwitcher";
import { getRequestContext } from "@/lib/dev-auth-context";
import { SSCWorkQueueRepository } from "@/src/repositories/ssc-work-queue-repository";
import { Suspense } from "react";

interface SSCWorkQueuePageProps {
  searchParams: Promise<{
    tenant_id?: string;
    document_type?: "invoice" | "po" | "case" | "payment";
    status?: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }>;
}

export default async function SSCWorkQueuePage({
  searchParams,
}: SSCWorkQueuePageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const sscRepo = new SSCWorkQueueRepository();

  // Get unified work queue
  const workItems = await sscRepo.getWorkQueue(ctx.actor.userId, {
    document_type: params.document_type,
    status: params.status,
    priority: params.priority,
    tenant_id: params.tenant_id,
  });

  // Group by tenant for summary
  const tenantSummary = workItems.reduce((acc, item) => {
    if (!acc[item.tenant_id]) {
      acc[item.tenant_id] = {
        tenant_name: item.tenant_name,
        count: 0,
        total_amount: 0,
      };
    }
    acc[item.tenant_id].count += 1;
    if (item.amount) {
      acc[item.tenant_id].total_amount += item.amount;
    }
    return acc;
  }, {} as Record<string, { tenant_name: string; count: number; total_amount: number }>);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">SSC Work Queue</h1>
        <p className="na-metadata">
          Unified work queue across all subsidiaries
        </p>
      </div>

      <Suspense
        fallback={<div className="na-card na-p-6">Loading context...</div>}
      >
        <ContextSwitcher
          currentTenantId={params.tenant_id || null}
          userId={ctx.actor.userId}
        />
      </Suspense>

      {/* Summary Cards */}
      <div className="na-card na-p-4 na-mb-6">
        <div className="na-grid na-grid-cols-4 na-gap-4">
          <div>
            <div className="na-metadata">Total Items</div>
            <div className="na-data-large">{workItems.length}</div>
          </div>
          <div>
            <div className="na-metadata">Subsidiaries</div>
            <div className="na-data-large">
              {Object.keys(tenantSummary).length}
            </div>
          </div>
          <div>
            <div className="na-metadata">Urgent</div>
            <div className="na-data-large">
              {workItems.filter((item) => item.priority === "urgent").length}
            </div>
          </div>
          <div>
            <div className="na-metadata">Total Amount</div>
            <div className="na-data-large">
              $
              {workItems
                .reduce((sum, item) => sum + (item.amount || 0), 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Work Queue Table */}
      {workItems.length === 0 ? (
        <div className="na-card na-p-6 na-text-center">
          <h2 className="na-h4">No Work Items</h2>
          <p className="na-body na-mt-2">All caught up! No pending items.</p>
        </div>
      ) : (
        <div className="na-card na-overflow-x-auto">
          <table className="na-table-frozen na-w-full">
            <thead>
              <tr className="na-tr">
                <th className="na-th">Company</th>
                <th className="na-th">Type</th>
                <th className="na-th">Amount</th>
                <th className="na-th">Due Date</th>
                <th className="na-th">Priority</th>
                <th className="na-th">Status</th>
                <th className="na-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workItems.map((item) => (
                <tr key={item.id} className="na-tr na-hover-bg-paper-2">
                  <td className="na-td">{item.tenant_name}</td>
                  <td className="na-td na-text-sm">{item.document_type}</td>
                  <td className="na-td">
                    {item.amount
                      ? `$${item.amount.toLocaleString()} ${
                          item.currency_code || ""
                        }`
                      : "—"}
                  </td>
                  <td className="na-td na-text-sm">
                    {item.due_date
                      ? new Date(item.due_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="na-td">
                    <span
                      className={`na-status na-status-${
                        item.priority === "urgent"
                          ? "bad"
                          : item.priority === "high"
                          ? "warn"
                          : "ok"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="na-td na-text-sm">{item.status}</td>
                  <td className="na-td">
                    <button className="na-btn na-btn-ghost na-btn-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Actions */}
      {workItems.length > 0 && (
        <div className="na-card na-p-4 na-mt-6">
          <h3 className="na-h4 na-mb-4">Bulk Actions</h3>
          <div className="na-flex na-gap-4">
            <button className="na-btn na-btn-primary">
              Approve Selected (5)
            </button>
            <button className="na-btn na-btn-secondary">Reject Selected</button>
          </div>
        </div>
      )}
    </div>
  );
}
