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
// L0 Semantic Governance - LAW-REG-001 Compliance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from "./document-types";
export * from "./namespace-prefixes";
export * from "./semantic-roots";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// L0 Runtime Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from "./canonId";
export * from "./concept-registry";
export * from "./design_system";
export * from "./errors";
export * from "./schemaHeader";
export * from "./status";
export * from "./zod";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// L1-L3 Manifest Governance Layer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from "./manifest";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Performance Optimization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { validationCache, warmValidationCache, ValidationCache } from "./kernel.validation.cache";
export type { CacheStats, CacheWarmingOptions } from "./kernel.validation.cache";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Supabase Cache (Optional - for distributed systems using existing database)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { createSupabaseCache, SupabaseValidationCache } from "./kernel.validation.cache.supabase";
export type { SupabaseClient, SupabaseCacheConfig } from "./kernel.validation.cache.supabase";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Monitoring & Observability
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  enablePerformanceMonitoring,
  disablePerformanceMonitoring,
  measurePerformance,
  PerformanceCollector,
  globalPerformanceCollector,
} from "./monitoring/performance";
export type { PerformanceMetrics, PerformanceCallback } from "./monitoring/performance";

export {
  enableErrorTracking,
  disableErrorTracking,
  trackError,
  withErrorTracking,
  ErrorCollector,
  globalErrorCollector,
} from "./monitoring/errors";
export type { ErrorContext, ErrorCallback, ErrorStatistics } from "./monitoring/errors";

// ⚠️ REMOVED: Domain logic moved to VPM canon packages
// - vendor.ts → @nexus/canon-vendor
// - claim.ts → @nexus/canon-claim
