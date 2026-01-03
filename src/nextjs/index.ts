// @aibos/kernel - Next.js Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Complete Next.js integration for @aibos/kernel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Middleware
export {
  withKernelValidation,
  kernelValidationMiddleware,
} from "./middleware.js";

// Server Components
export {
  getCachedConcepts,
  getCachedValueSets,
  getCachedValues,
  getKernelVersion,
  revalidateKernelCache,
} from "./server-components.js";

// Route Handlers
export {
  handleGetConcepts,
  handleGetValueSets,
  handleGetValues,
  handleGetVersion,
  handleValidateKernel,
  handleGetConcept,
} from "./route-handlers.js";

// Cache Strategy
export {
  createKernelCache,
  revalidateKernelTag,
  revalidateAllKernelCaches,
  type CacheConfig,
} from "./cache-strategy.js";

