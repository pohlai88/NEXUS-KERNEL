/**
 * Shared Service Center (SSC) Work Queue Page
 * 
 * "God Mode": Unified work queue across all subsidiaries.
 * AP Clerk sees all pending invoices from all companies in one view.
 */

import { Suspense } from 'react';
import { SSCWorkQueueRepository } from '@/src/repositories/ssc-work-queue-repository';
import { ContextSwitcher } from '@/components/tenant/ContextSwitcher';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: null, // null = all companies
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface SSCWorkQueuePageProps {
  searchParams: {
    tenant_id?: string;
    document_type?: 'invoice' | 'po' | 'case' | 'payment';
    status?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

export default async function SSCWorkQueuePage({ searchParams }: SSCWorkQueuePageProps) {
  const ctx = getRequestContext();
  const sscRepo = new SSCWorkQueueRepository();

  // Get unified work queue
  const workItems = await sscRepo.getWorkQueue(ctx.actor.userId, {
    document_type: searchParams.document_type,
    status: searchParams.status,
    priority: searchParams.priority,
    tenant_id: searchParams.tenant_id,
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
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">SSC Work Queue</h1>
        <p className="caption">
          Unified work queue across all subsidiaries
        </p>
      </div>

      <Suspense fallback={<div className="card p-6">Loading context...</div>}>
        <ContextSwitcher
          currentTenantId={searchParams.tenant_id || null}
          onTenantChange={(tenantId) => {
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (tenantId) {
              params.set('tenant_id', tenantId);
            } else {
              params.delete('tenant_id');
            }
            window.location.href = `/ssc/work-queue?${params.toString()}`;
          }}
          userId={ctx.actor.userId}
        />
      </Suspense>

      {/* Summary Cards */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="caption">Total Items</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{workItems.length}</div>
          </div>
          <div>
            <div className="caption">Subsidiaries</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{Object.keys(tenantSummary).length}</div>
          </div>
          <div>
            <div className="caption">Urgent</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {workItems.filter((item) => item.priority === 'urgent').length}
            </div>
          </div>
          <div>
            <div className="caption">Total Amount</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              ${workItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Work Queue Table */}
      {workItems.length === 0 ? (
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold text-nx-text-main">No Work Items</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">All caught up! No pending items.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-professional w-full w-full">
            <thead>
              <tr className="table-row">
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workItems.map((item) => (
                <tr key={item.id} className="table-row hover:bg-nx-surface-well">
                  <td className="table-data-cell">{item.tenant_name}</td>
                  <td className="table-data-cell text-sm">{item.document_type}</td>
                  <td className="table-data-cell">
                    {item.amount ? `$${item.amount.toLocaleString()} ${item.currency_code || ''}` : '—'}
                  </td>
                  <td className="table-data-cell text-sm">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="table-data-cell">
                    <span className={`badge badge-${item.priority === 'urgent' ? 'bad' : item.priority === 'high' ? 'badge-warning' : 'badge-success'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="table-data-cell text-sm">{item.status}</td>
                  <td className="table-data-cell">
                    <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Actions */}
      {workItems.length > 0 && (
        <div className="card p-4 mt-6">
          <h3 className="text-base font-semibold text-nx-text-main mb-4">Bulk Actions</h3>
          <div className="flex gap-4">
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
              Approve Selected (5)
            </button>
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
              Reject Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

