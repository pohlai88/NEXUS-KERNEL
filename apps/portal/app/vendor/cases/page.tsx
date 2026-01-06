/**
 * Vendor Case Management Page
 * 
 * PRD S-02: No Manual Communication Dependency
 * - View all cases (Open, In Progress, Resolved)
 * - Create new case (Dispute, Question, Request)
 * - Case detail page with messages
 * - Upload evidence/documents
 * - Case status tracking
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { CaseRepository } from '@/src/repositories/case-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import Link from 'next/link';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorGroupId: 'default', // TODO: Get from vendor_user_access
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface VendorCasesPageProps {
  searchParams: {
    status?: string;
    case_type?: string;
    search?: string;
  };
}

export default async function VendorCasesPage({ searchParams }: VendorCasesPageProps) {
  const ctx = getRequestContext();
  const supabase = createClient();
  const caseRepo = new CaseRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get vendor IDs from accessible subsidiaries
  // In production, this would query vendor_user_access -> vendor_group -> vmp_vendors
  const { data: vendorAccess } = await supabase
    .from('vendor_user_access')
    .select('vendor_group_id')
    .eq('user_id', ctx.actor.userId)
    .limit(1)
    .single();

  const vendorGroupId = vendorAccess?.vendor_group_id;

  // Build case query
  let query = supabase
    .from('vmp_cases')
    .select('id, case_type, status, subject, owner_team, sla_due_at, escalation_level, created_at, updated_at, vmp_companies!inner(name), vmp_vendors!inner(name)')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  if (vendorGroupId) {
    // Filter by vendor group (in production, would use vendor_id from vendor_user_access)
    // For now, we'll show all cases for accessible tenants
  }

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.case_type) {
    query = query.eq('case_type', searchParams.case_type);
  }

  if (searchParams.search) {
    query = query.ilike('subject', `%${searchParams.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data: cases, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching cases:', error);
  }

  const caseList = cases || [];

  // Get status counts
  const { data: statusCounts } = await supabase
    .from('vmp_cases')
    .select('status')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  const statusCountMap = (statusCounts || []).reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">My Cases</h1>
        <Link href="/vendor/cases/new" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
          ➕ Create Case
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Filters</h2>
        <form method="get" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="caption mb-2 block">Status</label>
              <select
                name="status"
                defaultValue={searchParams.status || ''}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="waiting_supplier">Waiting for Supplier</option>
                <option value="waiting_internal">Waiting for Internal Team</option>
                <option value="resolved">Resolved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Case Type Filter */}
            <div>
              <label className="caption mb-2 block">Case Type</label>
              <select
                name="case_type"
                defaultValue={searchParams.case_type || ''}
                className="input w-full"
              >
                <option value="">All Types</option>
                <option value="invoice">Invoice</option>
                <option value="payment">Payment</option>
                <option value="soa">SOA</option>
                <option value="onboarding">Onboarding</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="caption mb-2 block">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search by subject..."
                defaultValue={searchParams.search || ''}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
              Apply Filters
            </button>
            <Link href="/vendor/cases" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
              Clear
            </Link>
          </div>
        </form>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href="/vendor/cases"
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm ${!searchParams.status ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            All ({caseList.length})
          </Link>
          {Object.entries(statusCountMap).map(([status, count]) => (
            <Link
              key={status}
              href={`/vendor/cases?status=${status}`}
              className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm ${searchParams.status === status ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
            >
              {status.replace('_', ' ')} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Case List */}
      <div className="card p-6">
        <h2 className="section mb-4">Cases ({caseList.length})</h2>
        {caseList.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No cases found.</p>
            <Link href="/vendor/cases/new" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
              Create Your First Case
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {caseList.map((caseItem: unknown) => {
              const c = caseItem as {
                id: string;
                case_type: string;
                status: string;
                subject: string;
                owner_team: string;
                sla_due_at: string | null;
                escalation_level: number;
                created_at: string;
                updated_at: string;
                vmp_companies: { name: string };
                vmp_vendors: { name: string };
              };
              return (
                <Link
                  key={c.id}
                  href={`/vendor/cases/${c.id}`}
                  className="card p-4 block hover:bg-nx-surface-well transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-nx-text-main">{c.subject}</h3>
                        <span
                          className={`badge badge-${
                            c.status === 'resolved'
                              ? 'badge-success'
                              : c.status === 'blocked'
                                ? 'bad'
                                : c.status === 'waiting_supplier'
                                  ? 'badge-warning'
                                  : 'pending'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                        <span className="caption text-xs">{c.case_type}</span>
                      </div>
                      <div className="caption text-sm mb-2">
                        Assigned to: {c.owner_team} team
                        {c.vmp_companies?.name && ` • ${c.vmp_companies.name}`}
                      </div>
                      <div className="caption text-xs">
                        Created: {new Date(c.created_at).toLocaleDateString()}
                        {c.sla_due_at && (
                          <span className="ml-4">
                            SLA Due: {new Date(c.sla_due_at).toLocaleDateString()}
                          </span>
                        )}
                        {c.escalation_level > 0 && (
                          <span className="ml-4 text-nx-warning">
                            Escalated (Level {c.escalation_level})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm">View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

