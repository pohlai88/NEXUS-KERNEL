# @aibos/canon-vendor

**VPM Canon: Vendor Domain (L1/L3)**

This package contains vendor-specific schemas, statuses, and policies for the AI-BOS platform.

## Layer Hierarchy

- **L0 (Kernel):** `@aibos/kernel` - Constitutional concepts, IDs, primitives
- **L1 (Domain):** `@aibos/canon-vendor` - Vendor schemas, statuses, policies ← YOU ARE HERE
- **L2 (Cluster):** Workflows, approvals
- **L3 (Cell):** UI, API, runtime execution

## Contract Rule

This package **derives from** Kernel. It may:

- ✅ Define schemas that reference Kernel concepts
- ✅ Define allowed value subsets
- ✅ Define domain-specific policies

It may **NOT**:

- ❌ Invent new Kernel concepts
- ❌ Redefine Kernel semantics

## Usage

```typescript
import {
  VendorPayloadSchema,
  VendorStatus,
  validateVendorPayload,
} from "@aibos/canon-vendor";

// Validate vendor data
const vendor = validateVendorPayload(data);

// Check status
if (VendorStatus.is(vendor.status, "APPROVED")) {
  // ...
}
```

## Exports

- `VendorStatus` - Status set (PENDING, SUBMITTED, APPROVED, REJECTED, SUSPENDED)
- `VendorPayloadSchema` - Zod schema for vendor payload
- `VendorPayload` - TypeScript type
- `validateVendorPayload` - Validation helper
- `VendorType` - Vendor type classification (SUPPLIER_EXTERNAL, SUPPLIER_INTERNAL, EMPLOYEE_CLAIMANT)
