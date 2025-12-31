# @aibos/canon-claim

**VPM Canon: Employee Claim Domain (L1)**

This package contains employee claim-specific schemas, statuses, and policies for the AI-BOS platform.

## Layer Hierarchy

- **L0 (Kernel):** `@aibos/kernel` - Constitutional concepts, IDs, primitives
- **L1 (Domain):** `@aibos/canon-claim` - Claim schemas, statuses, policies ← YOU ARE HERE
- **L2 (Cluster):** Workflows, approvals
- **L3 (Cell):** UI, API, runtime execution

## Shadow Vendor Pattern

Employee claims follow the "Shadow Vendor" pattern:

- **Employee = Vendor (L0)** - Staff are treated as vendors in the system
- **Claims as Invoices** - Same database table, same process

## Contract Rule

This package **derives from** Kernel. It may:

- ✅ Define schemas that reference Kernel concepts
- ✅ Define allowed value subsets
- ✅ Define domain-specific policies (e.g., claim limits)

It may **NOT**:

- ❌ Invent new Kernel concepts
- ❌ Redefine Kernel semantics

## Usage

```typescript
import {
  EmployeeClaimSchema,
  ClaimCategory,
  ClaimStatus,
  CLAIM_POLICY_LIMITS,
} from "@aibos/canon-claim";

// Validate claim data
const result = EmployeeClaimSchema.safeParse(data);

// Check policy limits
const limit = CLAIM_POLICY_LIMITS.MEDICAL.max_per_claim; // 500
```

## Exports

- `ClaimCategory` - Claim categories (MEDICAL, TRAVEL, ENTERTAINMENT, etc.)
- `ClaimStatus` - Claim lifecycle states (DRAFT, SUBMITTED, APPROVED, etc.)
- `EmployeeClaimSchema` - Zod schema for claim payload
- `EmployeeClaimPayload` - TypeScript type
- `CLAIM_POLICY_LIMITS` - Policy configuration for claim limits
