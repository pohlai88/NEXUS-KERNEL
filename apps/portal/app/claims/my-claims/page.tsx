/**
 * My Claims Page (Mobile PWA)
 *
 * Simplified view for employees to submit claims.
 * Snap & Submit: Take photo, upload, done.
 */

import { MobileUpload } from "@/components/documents/MobileUpload";
import { getRequestContext } from "@/lib/dev-auth-context";
import { EmployeeClaimRepository } from "@/src/repositories/employee-claim-repository";
import { ClaimCategory } from "@nexus/kernel";

export default async function MyClaimsPage() {
  const ctx = getRequestContext();
  const claimRepo = new EmployeeClaimRepository();

  // Get employee's claims
  const claims = await claimRepo.getByEmployee(
    ctx.actor.userId,
    ctx.actor.tenantId
  );

  return (
    <div className="na-container na-mx-auto na-p-6">
      <h1 className="na-h1 na-mb-6">My Claims</h1>

      {/* Quick Submit Card */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Submit New Claim</h2>
        <form action="/claims/actions" method="post" className="na-space-y-4">
          <input type="hidden" name="employee_id" value={ctx.actor.userId} />
          <input
            type="hidden"
            name="tenant_id"
            value={ctx.actor.tenantId || "default"}
          />

          <div>
            <label className="na-metadata na-mb-2 na-block">Category *</label>
            <select name="category" className="na-input na-w-full" required>
              <option value="">Select Category</option>
              {ClaimCategory.values.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="na-metadata na-mb-2 na-block">
              Merchant Name *
            </label>
            <input
              type="text"
              name="merchant_name"
              className="na-input na-w-full"
              placeholder="Where did you spend?"
              required
            />
          </div>

          <div>
            <label className="na-metadata na-mb-2 na-block">Amount *</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              className="na-input na-w-full"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="na-metadata na-mb-2 na-block">Date *</label>
            <input
              type="date"
              name="claim_date"
              className="na-input na-w-full"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Snap & Submit Upload */}
          <div>
            <label className="na-metadata na-mb-2 na-block">
              Receipt * (No Receipt, No Coin)
            </label>
            <MobileUpload documentType="receipt" />
            <input type="hidden" name="receipt_url" id="receipt_url" />
          </div>

          <button type="submit" className="na-btn na-btn-primary na-w-full">
            Submit Claim
          </button>
        </form>
      </div>

      {/* Claims List */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">My Claims History</h2>
        {claims.length === 0 ? (
          <div className="na-text-center na-p-6">
            <p className="na-body">No claims submitted yet.</p>
          </div>
        ) : (
          <div className="na-space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="na-card na-p-4 na-border">
                <div className="na-flex na-justify-between na-items-start na-mb-2">
                  <div>
                    <h3 className="na-h5">{claim.merchant_name}</h3>
                    <p className="na-metadata na-text-sm">{claim.category}</p>
                  </div>
                  <div className="na-text-right">
                    <div className="na-data-large">
                      ${claim.amount.toFixed(2)}
                    </div>
                    <span
                      className={`na-status na-status-${
                        claim.status === "APPROVED"
                          ? "ok"
                          : claim.status === "REJECTED"
                          ? "bad"
                          : "pending"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>
                <div className="na-metadata na-text-sm na-mt-2">
                  {new Date(claim.claim_date).toLocaleDateString()}
                </div>
                {claim.policy_validation_errors.length > 0 && (
                  <div className="na-card na-p-2 na-bg-danger-subtle na-text-danger na-mt-2">
                    <p className="na-metadata na-text-sm">
                      {claim.policy_validation_errors.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
