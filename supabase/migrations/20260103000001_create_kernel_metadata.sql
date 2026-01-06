-- Create kernel_metadata Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Create kernel_metadata table for storing kernel concepts, valuesets, and values
-- Priority: P0 - CRITICAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Create kernel_metadata table
CREATE TABLE IF NOT EXISTS kernel_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kernel_version TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('concept', 'valueset', 'value')),
  entity_id TEXT NOT NULL,
  entity_data JSONB NOT NULL,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kernel_version, snapshot_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE kernel_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Read: All authenticated users can read kernel metadata
CREATE POLICY "kernel_metadata_read_all" ON kernel_metadata
  FOR SELECT USING (true);

-- Write: Only service_role can write kernel metadata
CREATE POLICY "kernel_metadata_write_admin" ON kernel_metadata
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kernel_metadata_version 
  ON kernel_metadata(kernel_version, snapshot_id);

CREATE INDEX IF NOT EXISTS idx_kernel_metadata_entity 
  ON kernel_metadata(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_kernel_metadata_current 
  ON kernel_metadata(is_current) 
  WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_kernel_metadata_entity_data 
  ON kernel_metadata USING GIN (entity_data);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kernel_metadata_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_kernel_metadata_updated_at ON kernel_metadata;
CREATE TRIGGER update_kernel_metadata_updated_at
  BEFORE UPDATE ON kernel_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_kernel_metadata_updated_at();

-- Add comments for documentation
COMMENT ON TABLE kernel_metadata IS 'Stores kernel concepts, valuesets, and values as JSONB for database-level synchronization';
COMMENT ON COLUMN kernel_metadata.kernel_version IS 'Kernel semantic version (e.g., 1.1.0)';
COMMENT ON COLUMN kernel_metadata.snapshot_id IS 'Content hash snapshot ID for drift detection';
COMMENT ON COLUMN kernel_metadata.entity_type IS 'Type of entity: concept, valueset, or value';
COMMENT ON COLUMN kernel_metadata.entity_id IS 'Unique identifier for the entity (concept code, valueset code, or value code)';
COMMENT ON COLUMN kernel_metadata.entity_data IS 'Full entity data as JSONB (ConceptShape, ValueSetShape, or ValueShape)';
COMMENT ON COLUMN kernel_metadata.is_current IS 'Whether this is the current version of the entity';

