-- Optimize Cache Performance
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Optimize cache indexes for better query performance
-- Priority: P1 - HIGH
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Analyze current index usage
-- Note: Index usage stats may be low if cache is not heavily used yet
-- This optimization is based on query patterns, not current usage

-- Remove redundant index (idx_cache_key_type duplicates primary key)
-- The primary key on (cache_key, cache_type) already covers this lookup pattern
DROP INDEX IF EXISTS idx_cache_key_type;

-- Create optimized covering index for common lookup pattern
-- Query pattern: WHERE cache_type = ? AND cache_key = ? AND expires_at > NOW()
-- This index covers the entire query, avoiding table lookups
-- Note: Cannot use NOW() in partial index predicate (not immutable)
-- Instead, create regular covering index - PostgreSQL will use it efficiently
CREATE INDEX IF NOT EXISTS idx_cache_lookup_covering
  ON kernel_validation_cache(cache_type, cache_key, expires_at);

-- Optimize expires_at index for cleanup operations
-- Query pattern: WHERE expires_at < NOW() (cleanup_expired_cache function)
-- Note: Cannot use NOW() in partial index predicate, so use regular index
-- PostgreSQL will efficiently use this for range queries
DROP INDEX IF EXISTS idx_cache_expires_at;
CREATE INDEX IF NOT EXISTS idx_cache_expires_at
  ON kernel_validation_cache(expires_at);

-- Keep idx_cache_type for stats queries (GROUP BY cache_type)
-- This index is useful for get_cache_stats() function
-- No changes needed - already optimal

-- Add comment for documentation
COMMENT ON INDEX idx_cache_lookup_covering IS 'Covering index for cache lookups: optimizes queries filtering by cache_type, cache_key, and active expiration';
COMMENT ON INDEX idx_cache_expired IS 'Partial index for expired entries: optimizes cleanup operations by only indexing expired entries';
COMMENT ON INDEX idx_cache_type IS 'Index for cache statistics: optimizes GROUP BY cache_type queries';

