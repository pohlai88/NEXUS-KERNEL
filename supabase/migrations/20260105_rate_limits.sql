-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- NEXUS-KERNEL RATE LIMITING TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Description: Store rate limit counters in PostgreSQL/Supabase
-- OWASP A09:2021: Security Logging and Monitoring Failures
-- 
-- Features:
-- - Sliding window rate limiting
-- - Distributed across serverless instances
-- - Automatic cleanup of expired records
-- - Brute force attack logging
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  -- Composite key: identifier (IP + User-Agent hash) + limiter name
  identifier TEXT NOT NULL,
  limiter_name TEXT NOT NULL,
  
  -- Counter and expiration
  count INTEGER DEFAULT 1,
  expires_at BIGINT NOT NULL, -- Unix timestamp (ms)
  
  -- Metadata for logging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Primary key
  PRIMARY KEY (identifier, limiter_name)
);

-- Index for cleanup query (delete expired records)
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at 
  ON rate_limits (expires_at);

-- Index for lookup by identifier
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier 
  ON rate_limits (identifier);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUTOMATIC CLEANUP FUNCTION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to delete expired rate limit records
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE expires_at < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RATE LIMIT VIOLATION LOGGING TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Store rate limit violations for security monitoring
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request details
  identifier TEXT NOT NULL,
  limiter_name TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  path TEXT,
  
  -- Violation details
  limit_amount INTEGER NOT NULL,
  current_count INTEGER NOT NULL,
  window_ms INTEGER NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for security analysis
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created_at 
  ON rate_limit_violations (created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_identifier 
  ON rate_limit_violations (identifier);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_limiter 
  ON rate_limit_violations (limiter_name);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW-LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS on tables
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to read/write rate_limits
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow service role to read/write violations
CREATE POLICY "Service role can manage violations"
  ON rate_limit_violations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SCHEDULED CLEANUP (Optional - requires pg_cron extension)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Uncomment to enable automatic cleanup every hour
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *', -- Every hour at minute 0
--   $$ SELECT cleanup_expired_rate_limits(); $$
-- );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- USAGE EXAMPLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insert or update rate limit counter
-- INSERT INTO rate_limits (identifier, limiter_name, count, expires_at)
-- VALUES ('ip_192.168.1.1', 'auth', 1, EXTRACT(EPOCH FROM NOW() + INTERVAL '15 minutes') * 1000)
-- ON CONFLICT (identifier, limiter_name)
-- DO UPDATE SET
--   count = rate_limits.count + 1,
--   updated_at = NOW();

-- Check rate limit
-- SELECT count, expires_at
-- FROM rate_limits
-- WHERE identifier = 'ip_192.168.1.1'
--   AND limiter_name = 'auth'
--   AND expires_at > EXTRACT(EPOCH FROM NOW()) * 1000;

-- Log violation
-- INSERT INTO rate_limit_violations (
--   identifier, limiter_name, ip_address, user_agent, path,
--   limit_amount, current_count, window_ms
-- ) VALUES (
--   'ip_192.168.1.1', 'auth', '192.168.1.1', 'Mozilla/5.0...', '/api/auth/login',
--   5, 6, 900000
-- );
