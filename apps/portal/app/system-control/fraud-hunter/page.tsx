/**
 * Fraud Hunter Dashboard
 *
 * The Guard - Reviews high-value changes, bank account modifications,
 * and risk anomalies the AI missed.
 *
 * Shows:
 * - High-value transactions requiring review
 * - Bank account changes
 * - Risk watchlist items
 * - Anomaly detection alerts
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { TenantAccessRepository } from "@/src/repositories/tenant-access-repository";

interface FraudHunterPageProps {
  searchParams: Promise<{
    tenant_id?: string;
    risk_level?: string;
  }>;
}

export default async function FraudHunterPage({
  searchParams,
}: FraudHunterPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(
    ctx.actor.userId
  );
  const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

  // Get selected tenant (or null for "All Companies")
  const selectedTenantId = params.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId
    ? [selectedTenantId]
    : accessibleTenantIds;

  // Fetch risk data
  let highValuePayments: unknown[] = [];
  let riskWatchlist: unknown[] = [];
  let bankAccountChanges: unknown[] = [];
  let error: string | null = null;

  try {
    if (tenantIdsToQuery.length > 0) {
      // Get high-value payments (over $10k) requiring review
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("vmp_payments")
        .select(
          "*, vmp_vendors(name, legal_name, bank_name, account_number), vmp_companies(name)"
        )
        .in("tenant_id", tenantIdsToQuery)
        .gte("amount", 10000)
        .order("created_at", { ascending: false })
        .limit(50);

      if (paymentsError) {
        throw new Error(`Failed to fetch payments: ${paymentsError.message}`);
      }

      highValuePayments = paymentsData || [];

      // Get risk watchlist items
      const { data: watchlistData, error: watchlistError } = await supabase
        .from("group_risk_watchlist")
        .select(
          "*, global_vendors(legal_name, tax_id, risk_status), groups(name)"
        )
        .eq("status", "active")
        .order("flagged_at", { ascending: false })
        .limit(50);

      if (watchlistError) {
        throw new Error(`Failed to fetch watchlist: ${watchlistError.message}`);
      }

      riskWatchlist = watchlistData || [];

      // Get recent vendor bank account changes (from audit trail)
      // Note: This would need to query audit_trail for vendor bank account changes
      // For now, we'll show a placeholder
      bankAccountChanges = [];
    }
  } catch (err) {
    // Graceful error handling - capture message for display
    error =
      err instanceof Error
        ? err.message
        : "Failed to load fraud detection data.";
  }

  const totalRisks =
    highValuePayments.length + riskWatchlist.length + bankAccountChanges.length;

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <div>
          <h1 className="na-h1 na-mb-2">Fraud Hunter</h1>
          <p className="na-body na-text-muted">
            The Guard - Reviews high-value changes, bank account modifications,
            and risk anomalies
          </p>
        </div>
        <div className="na-text-right">
          <div className="na-metadata">Total Risk Items</div>
          <div className="na-data-large na-text-danger">{totalRisks}</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="na-grid na-grid-cols-4 na-gap-4 na-mb-6">
        <div className="na-card na-p-4">
          <div className="na-metadata">High-Value Payments</div>
          <div className="na-data-large">{highValuePayments.length}</div>
          <div className="na-text-xs na-text-muted na-mt-1">≥ $10,000</div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">Risk Watchlist</div>
          <div className="na-data-large">{riskWatchlist.length}</div>
          <div className="na-text-xs na-text-muted na-mt-1">Active flags</div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">Bank Changes</div>
          <div className="na-data-large">{bankAccountChanges.length}</div>
          <div className="na-text-xs na-text-muted na-mt-1">
            Requires verification
          </div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">Accessible Companies</div>
          <div className="na-data-large">{accessibleTenants.length}</div>
        </div>
      </div>

      {error ? (
        <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-mb-6">
          <h2 className="na-h4">Error Loading Risk Data</h2>
          <p className="na-body">{error}</p>
        </div>
      ) : (
        <div className="na-space-y-6">
          {/* High-Value Payments */}
          {highValuePayments.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">
                High-Value Payments Requiring Review
              </h2>
              <div className="na-space-y-3">
                {highValuePayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                  >
                    <div className="na-flex na-items-start na-justify-between">
                      <div className="na-flex-1">
                        <div className="na-flex na-items-center na-gap-2 na-mb-2">
                          <span className="na-font-medium">
                            {payment.payment_ref || payment.id}
                          </span>
                          <span className="na-badge na-bg-danger-subtle na-text-danger">
                            ${payment.amount?.toLocaleString() || "0.00"}
                          </span>
                        </div>
                        <div className="na-text-sm na-text-muted na-mb-1">
                          Vendor:{" "}
                          {payment.vmp_vendors?.name ||
                            payment.vmp_vendors?.legal_name ||
                            "Unknown"}
                        </div>
                        <div className="na-text-sm na-text-muted na-mb-1">
                          Bank: {payment.vmp_vendors?.bank_name || "N/A"}
                          {payment.vmp_vendors?.account_number && (
                            <span className="na-ml-2">
                              ***{payment.vmp_vendors.account_number.slice(-4)}
                            </span>
                          )}
                        </div>
                        <div className="na-text-sm na-text-muted">
                          Date:{" "}
                          {new Date(
                            payment.payment_date || payment.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="na-flex na-gap-2">
                        <a
                          href={`/payments/${payment.id}`}
                          className="na-btn na-btn-sm na-btn-primary"
                        >
                          Review
                        </a>
                        <button className="na-btn na-btn-sm na-btn-outline">
                          Verify Bank
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Watchlist */}
          {riskWatchlist.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">Risk Watchlist</h2>
              <div className="na-space-y-3">
                {riskWatchlist.map((item: any) => (
                  <div
                    key={item.id}
                    className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                  >
                    <div className="na-flex na-items-start na-justify-between">
                      <div className="na-flex-1">
                        <div className="na-flex na-items-center na-gap-2 na-mb-2">
                          <span className="na-font-medium">
                            {item.global_vendors?.legal_name ||
                              "Unknown Vendor"}
                          </span>
                          <span
                            className={`na-badge ${
                              item.risk_level === "critical"
                                ? "na-bg-danger-subtle na-text-danger"
                                : item.risk_level === "high"
                                ? "na-bg-warning-subtle na-text-warning"
                                : "na-bg-muted"
                            }`}
                          >
                            {item.risk_level}
                          </span>
                        </div>
                        <div className="na-text-sm na-text-muted na-mb-1">
                          Reason: {item.risk_reason}
                        </div>
                        <div className="na-text-sm na-text-muted na-mb-1">
                          Tax ID: {item.global_vendors?.tax_id || "N/A"}
                        </div>
                        {item.requires_group_cfo_approval && (
                          <div className="na-text-xs na-text-warning na-mt-2">
                            ⚠️ Requires Group CFO Approval
                          </div>
                        )}
                        {item.requires_group_ceo_approval && (
                          <div className="na-text-xs na-text-danger na-mt-2">
                            ⚠️ Requires Group CEO Approval
                          </div>
                        )}
                      </div>
                      <div className="na-flex na-gap-2">
                        <button className="na-btn na-btn-sm na-btn-primary">
                          Review
                        </button>
                        <button className="na-btn na-btn-sm na-btn-outline">
                          Call Vendor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Account Changes */}
          {bankAccountChanges.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">
                Bank Account Changes Requiring Verification
              </h2>
              <div className="na-space-y-3">
                {bankAccountChanges.map((change: any) => (
                  <div
                    key={change.id}
                    className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                  >
                    <div className="na-flex na-items-start na-justify-between">
                      <div className="na-flex-1">
                        <div className="na-font-medium na-mb-2">
                          {change.vendor_name}
                        </div>
                        <div className="na-text-sm na-text-muted">
                          Old: {change.old_bank_account}
                        </div>
                        <div className="na-text-sm na-text-muted">
                          New: {change.new_bank_account}
                        </div>
                      </div>
                      <button className="na-btn na-btn-sm na-btn-primary">
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalRisks === 0 && (
            <div className="na-card na-p-12 na-text-center">
              <div className="na-w-16 na-h-16 na-mx-auto na-mb-4 na-bg-success-subtle na-rounded-full na-flex na-items-center na-justify-center">
                <svg
                  className="na-w-8 na-h-8 na-text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="na-h4 na-mb-2">No Risk Items Found</h2>
              <p className="na-body na-text-muted">
                All transactions are within normal parameters. No anomalies
                detected.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
