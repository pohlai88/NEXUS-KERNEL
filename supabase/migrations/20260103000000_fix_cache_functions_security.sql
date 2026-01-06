-- Fix Supabase Cache Functions Security Issues
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Fix search_path vulnerability and add input validation
-- Priority: P0 - CRITICAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Drop existing functions to allow recreation with new signatures
DROP FUNCTION IF EXISTS get_cache_entry(TEXT, TEXT);
DROP FUNCTION IF EXISTS upsert_cache_entry(TEXT, TEXT, JSONB, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_cache_stats();
DROP FUNCTION IF EXISTS cleanup_expired_cache();

-- Fix get_cache_entry function
-- Security: Fixed search_path, added input validation, SQL injection protection
CREATE OR REPLACE FUNCTION get_cache_entry(
  p_cache_key TEXT,
  p_cache_type TEXT
)
RETURNS TABLE (
  cache_value JSONB,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Input validation (prevent SQL injection)
  IF p_cache_key IS NULL OR p_cache_type IS NULL THEN
    RAISE EXCEPTION 'Invalid input parameters: cache_key and cache_type are required';
  END IF;
  
  -- Validate cache_type enum
  IF p_cache_type NOT IN ('concept', 'valueset', 'value') THEN
    RAISE EXCEPTION 'Invalid cache_type: must be one of (concept, valueset, value)';
  END IF;
  
  -- Sanitize cache_key (prevent injection via length check)
  IF length(p_cache_key) > 500 THEN
    RAISE EXCEPTION 'Invalid cache_key: length exceeds maximum (500 characters)';
  END IF;
  
  -- Return query with parameterized values (safe from SQL injection)
  RETURN QUERY
  SELECT 
    c.cache_value,
    c.expires_at
  FROM kernel_validation_cache c
  WHERE c.cache_key = p_cache_key
    AND c.cache_type = p_cache_type
    AND c.expires_at > NOW();
END;
$$;

-- Fix upsert_cache_entry function
-- Security: Fixed search_path, added input validation
CREATE OR REPLACE FUNCTION upsert_cache_entry(
  p_cache_key TEXT,
  p_cache_type TEXT,
  p_cache_value JSONB,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Input validation
  IF p_cache_key IS NULL OR p_cache_type IS NULL OR p_cache_value IS NULL OR p_expires_at IS NULL THEN
    RAISE EXCEPTION 'Invalid input parameters: all parameters are required';
  END IF;
  
  -- Validate cache_type enum
  IF p_cache_type NOT IN ('concept', 'valueset', 'value') THEN
    RAISE EXCEPTION 'Invalid cache_type: must be one of (concept, valueset, value)';
  END IF;
  
  -- Sanitize cache_key
  IF length(p_cache_key) > 500 THEN
    RAISE EXCEPTION 'Invalid cache_key: length exceeds maximum (500 characters)';
  END IF;
  
  -- Validate expires_at is in the future
  IF p_expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invalid expires_at: must be in the future';
  END IF;
  
  -- Upsert with parameterized values
  INSERT INTO kernel_validation_cache (
    cache_key,
    cache_type,
    cache_value,
    expires_at,
    updated_at
  )
  VALUES (
    p_cache_key,
    p_cache_type,
    p_cache_value,
    p_expires_at,
    NOW()
  )
  ON CONFLICT (cache_key, cache_type)
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
END;
$$;

-- Fix get_cache_stats function
-- Security: Fixed search_path
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE (
  cache_type TEXT,
  total_count BIGINT,
  active_count BIGINT,
  expired_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cache_type,
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE c.expires_at > NOW())::BIGINT as active_count,
    COUNT(*) FILTER (WHERE c.expires_at <= NOW())::BIGINT as expired_count
  FROM kernel_validation_cache c
  GROUP BY c.cache_type;
END;
$$;

-- Fix cleanup_expired_cache function
-- Security: Fixed search_path
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  DELETE FROM kernel_validation_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_cache_entry IS 'Get cache entry with security fixes: fixed search_path, input validation, SQL injection protection';
COMMENT ON FUNCTION upsert_cache_entry IS 'Upsert cache entry with security fixes: fixed search_path, input validation';
COMMENT ON FUNCTION get_cache_stats IS 'Get cache statistics with security fixes: fixed search_path';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Cleanup expired cache entries with security fixes: fixed search_path';

