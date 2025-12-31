// @aibos/kernel - The Business Kernel SDK (L0 Constitution)
// This is the brain. If a project does not depend on this package, it is NOT Canon-compliant.
//
// L0 ONLY - No domain logic (Vendor, Claim, etc.) belongs here.
// Domain logic lives in VPM canon packages (@nexus/canon-vendor, @nexus/canon-claim).

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// L0 SSOT Exports - Concepts, Values, Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from "./concepts";
export * from "./values";
export * from "./version";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// L0 Runtime Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from "./canonId";
export * from "./concept";
export * from "./design_system";
export * from "./errors";
export * from "./schemaHeader";
export * from "./status";
export * from "./zod";

// ⚠️ REMOVED: Domain logic moved to VPM canon packages
// - vendor.ts → @nexus/canon-vendor
// - claim.ts → @nexus/canon-claim
