-- =====================================================
-- NEXUS CANON V5: L0 KERNEL FOUNDATION
-- =====================================================
-- Phase 1: Kernel Instantiation (L0 Foundation)
-- Authority: NEXUS_CANON_V5_KERNEL_DOCTRINE.md
-- Date: 2025-12-30
-- Status: FOUNDATIONAL (ABSOLUTE AUTHORITY)
-- =====================================================

-- =====================================================
-- 1. CONCEPT REGISTRY SCHEMA
-- =====================================================
-- Purpose: Define all canonical concepts in the system
-- Layer: L0 (Absolute Authority)
-- Axiom: "If it's not in L0, it doesn't exist"
-- =====================================================

CREATE TABLE IF NOT EXISTS kernel_concept_registry (
  -- Immutable Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id TEXT NOT NULL UNIQUE, -- Canonical ID (e.g., "CONCEPT_BANK", "CONCEPT_CURRENCY")

  -- Definition
  concept_name TEXT NOT NULL, -- Human-readable name (e.g., "Bank", "Currency")
  concept_category TEXT NOT NULL CHECK (concept_category IN (
    'ENTITY',           -- Business entities (Bank, Vendor, Customer)
    'ATTRIBUTE',        -- Properties (Color, Status, Type)
    'RELATIONSHIP',     -- Connections (Ownership, Hierarchy)
    'OPERATION',        -- Actions (Payment, Transfer, Approval)
    'CONSTRAINT',       -- Rules (Limit, Threshold, Policy)
    'METADATA'          -- Descriptive (Tag, Label, Category)
  )),
  concept_description TEXT NOT NULL, -- Business meaning

  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0.0', -- Semantic versioning
  schema_version INTEGER NOT NULL DEFAULT 1, -- Schema evolution tracking

  -- Governance
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_jurisdiction BOOLEAN NOT NULL DEFAULT false, -- Does this concept vary by jurisdiction?
  is_extensible BOOLEAN NOT NULL DEFAULT false, -- Can downstream layers extend this?

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deprecated_at TIMESTAMPTZ,
  deprecated_reason TEXT,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Constraints
  CONSTRAINT concept_id_format CHECK (concept_id ~ '^CONCEPT_[A-Z0-9_]+$'),
  CONSTRAINT version_format CHECK (version ~ '^\d+\.\d+\.\d+$')
);

-- Index for fast concept lookup
CREATE INDEX idx_kernel_concept_active ON kernel_concept_registry(concept_id) WHERE is_active = true;
CREATE INDEX idx_kernel_concept_category ON kernel_concept_registry(concept_category);

-- Audit trigger
CREATE TRIGGER kernel_concept_update_timestamp
  BEFORE UPDATE ON kernel_concept_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy: Only admins can modify L0
ALTER TABLE kernel_concept_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "L0 concepts are readable by all authenticated users"
  ON kernel_concept_registry
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "L0 concepts can only be modified by kernel admins"
  ON kernel_concept_registry
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'kernel_admin'
    )
  );

COMMENT ON TABLE kernel_concept_registry IS 'L0 Kernel: Canonical concept definitions. Authority: ABSOLUTE. No downstream layer may create concepts not registered here.';

-- =====================================================
-- 2. JURISDICTIONAL VALUE SETS
-- =====================================================
-- Purpose: Define valid values per jurisdiction
-- Layer: L0 (Absolute Authority)
-- Axiom: "Local truth is real — but it is registered, not invented"
-- =====================================================

CREATE TABLE IF NOT EXISTS kernel_value_set_registry (
  -- Immutable Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_set_id TEXT NOT NULL UNIQUE, -- Canonical ID (e.g., "VALUESET_MALAYSIA_BANKS")

  -- Definition
  concept_id TEXT NOT NULL REFERENCES kernel_concept_registry(concept_id),
  jurisdiction_code TEXT NOT NULL, -- ISO country code or "GLOBAL"
  value_set_name TEXT NOT NULL, -- Human-readable (e.g., "Malaysian Banks")
  value_set_description TEXT,

  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0.0',
  schema_version INTEGER NOT NULL DEFAULT 1,

  -- Governance
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_canonical BOOLEAN NOT NULL DEFAULT true, -- Is this the official source?
  sync_source TEXT, -- External authority (e.g., "BANK_NEGARA_MALAYSIA", "ISO_4217")
  sync_frequency TEXT, -- How often to sync (e.g., "MONTHLY", "REALTIME")

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Constraints
  CONSTRAINT value_set_id_format CHECK (value_set_id ~ '^VALUESET_[A-Z0-9_]+$'),
  CONSTRAINT version_format CHECK (version ~ '^\d+\.\d+\.\d+$'),
  CONSTRAINT jurisdiction_format CHECK (jurisdiction_code ~ '^[A-Z]{2}$' OR jurisdiction_code = 'GLOBAL')
);

CREATE INDEX idx_kernel_valueset_concept ON kernel_value_set_registry(concept_id);
CREATE INDEX idx_kernel_valueset_jurisdiction ON kernel_value_set_registry(jurisdiction_code);
CREATE INDEX idx_kernel_valueset_active ON kernel_value_set_registry(value_set_id) WHERE is_active = true;

-- Audit trigger
CREATE TRIGGER kernel_valueset_update_timestamp
  BEFORE UPDATE ON kernel_value_set_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE kernel_value_set_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "L0 value sets are readable by all authenticated users"
  ON kernel_value_set_registry
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "L0 value sets can only be modified by kernel admins"
  ON kernel_value_set_registry
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'kernel_admin'
    )
  );

COMMENT ON TABLE kernel_value_set_registry IS 'L0 Kernel: Jurisdictional value set definitions. Resolves the "Oxford vs Kamus Dewan" problem by registering local truth without global fragmentation.';

-- =====================================================
-- 3. VALUE SET VALUES (ACTUAL VALUES)
-- =====================================================
-- Purpose: Store actual values within each value set
-- Layer: L0 (Governed Data)
-- Note: Changes often, but must align with registry
-- =====================================================

CREATE TABLE IF NOT EXISTS kernel_value_set_values (
  -- Immutable Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_id TEXT NOT NULL, -- Canonical value ID (e.g., "BANK_MALAYSIA_MAYBANK")

  -- Relationship
  value_set_id TEXT NOT NULL REFERENCES kernel_value_set_registry(value_set_id),

  -- Value Data
  value_code TEXT NOT NULL, -- Machine code (e.g., "MAYBANK", "USD")
  value_label TEXT NOT NULL, -- Human-readable label
  value_description TEXT,

  -- Official Aliases (Regulatory/Standard Codes)
  official_aliases JSONB NOT NULL DEFAULT '[]', -- Array of {type, code} objects
  -- Example: [{"type": "SWIFT", "code": "MBBEMYKL"}, {"type": "BIC", "code": "MAYBANK"}]

  -- Ordering
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Governance
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false, -- System-reserved, cannot be deleted

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deprecated_at TIMESTAMPTZ,
  deprecated_reason TEXT,

  -- Metadata (Extensible attributes)
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Constraints
  UNIQUE (value_set_id, value_code),
  UNIQUE (value_set_id, value_id),
  CONSTRAINT value_id_format CHECK (value_id ~ '^[A-Z0-9_]+$')
);

CREATE INDEX idx_kernel_values_valueset ON kernel_value_set_values(value_set_id);
CREATE INDEX idx_kernel_values_code ON kernel_value_set_values(value_code);
CREATE INDEX idx_kernel_values_active ON kernel_value_set_values(value_set_id, value_code) WHERE is_active = true;

-- GIN index for searching official aliases
CREATE INDEX idx_kernel_values_aliases ON kernel_value_set_values USING GIN (official_aliases);

-- Audit trigger
CREATE TRIGGER kernel_values_update_timestamp
  BEFORE UPDATE ON kernel_value_set_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE kernel_value_set_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "L0 values are readable by all authenticated users"
  ON kernel_value_set_values
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "L0 values can only be modified by kernel admins or data stewards"
  ON kernel_value_set_values
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (
        u.raw_user_meta_data->>'role' = 'kernel_admin'
        OR u.raw_user_meta_data->>'role' = 'data_steward'
      )
    )
  );

COMMENT ON TABLE kernel_value_set_values IS 'L0 Kernel: Actual values within jurisdictional value sets. Adding a new bank is data governance, not a migration.';

-- =====================================================
-- 4. CANONICAL IDENTITY MAPPING
-- =====================================================
-- Purpose: Map external IDs to canonical L0 IDs
-- Layer: L0 (Absolute Authority)
-- Axiom: Immutable IDs, official aliases only
-- =====================================================

CREATE TABLE IF NOT EXISTS kernel_identity_mapping (
  -- Immutable Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_id UUID NOT NULL, -- The L0 canonical ID (immutable)

  -- Entity Reference
  entity_type TEXT NOT NULL, -- What kind of entity (e.g., "BANK", "CURRENCY", "VENDOR")
  concept_id TEXT NOT NULL REFERENCES kernel_concept_registry(concept_id),

  -- External Identity
  external_system TEXT NOT NULL, -- Source system (e.g., "SAP", "SWIFT", "ISO", "LOCAL_ERP")
  external_id TEXT NOT NULL, -- ID in that system
  external_id_type TEXT NOT NULL, -- Type of ID (e.g., "SWIFT_CODE", "ISO_4217", "SAP_VENDOR_CODE")

  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  verification_source TEXT, -- Authority that verified this (e.g., "SWIFT_REGISTRY", "MANUAL")

  -- Governance
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false, -- Is this the primary external reference?

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deprecated_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Constraints
  UNIQUE (external_system, external_id, external_id_type)
);

CREATE INDEX idx_kernel_identity_canonical ON kernel_identity_mapping(canonical_id);
CREATE INDEX idx_kernel_identity_external ON kernel_identity_mapping(external_system, external_id);
CREATE INDEX idx_kernel_identity_type ON kernel_identity_mapping(entity_type);
CREATE INDEX idx_kernel_identity_concept ON kernel_identity_mapping(concept_id);

-- Audit trigger
CREATE TRIGGER kernel_identity_update_timestamp
  BEFORE UPDATE ON kernel_identity_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE kernel_identity_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "L0 identity mappings are readable by all authenticated users"
  ON kernel_identity_mapping
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "L0 identity mappings can only be modified by kernel admins"
  ON kernel_identity_mapping
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'kernel_admin'
    )
  );

COMMENT ON TABLE kernel_identity_mapping IS 'L0 Kernel: Canonical identity mapping. Maps external system IDs to immutable L0 canonical IDs. Official aliases only (regulatory codes, SWIFT, ISO).';

-- =====================================================
-- 5. CONCEPT VERSION HISTORY
-- =====================================================
-- Purpose: Track changes to L0 concepts over time
-- Layer: L0 (Audit)
-- Axiom: All L0 changes are immutable audit events
-- =====================================================

CREATE TABLE IF NOT EXISTS kernel_concept_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  concept_id TEXT NOT NULL REFERENCES kernel_concept_registry(concept_id),

  -- Version Info
  version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,

  -- Snapshot of concept state
  concept_snapshot JSONB NOT NULL, -- Full concept data at this version

  -- Change Tracking
  change_type TEXT NOT NULL CHECK (change_type IN ('CREATED', 'UPDATED', 'DEPRECATED', 'ACTIVATED')),
  change_description TEXT NOT NULL,
  breaking_change BOOLEAN NOT NULL DEFAULT false, -- Does this break downstream compatibility?

  -- Audit
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_kernel_version_concept ON kernel_concept_version_history(concept_id);
CREATE INDEX idx_kernel_version_timestamp ON kernel_concept_version_history(changed_at DESC);

-- RLS Policy
ALTER TABLE kernel_concept_version_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "L0 version history is readable by all authenticated users"
  ON kernel_concept_version_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Only insert allowed, no updates/deletes (immutable audit)
CREATE POLICY "L0 version history can only be inserted by kernel admins"
  ON kernel_concept_version_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'kernel_admin'
    )
  );

COMMENT ON TABLE kernel_concept_version_history IS 'L0 Kernel: Immutable version history for concept changes. All L0 changes are audited.';

-- =====================================================
-- 6. HELPER FUNCTION: update_updated_at_column()
-- =====================================================
-- Purpose: Automatically update updated_at timestamp
-- Note: This function should exist, but creating it here if missing
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to automatically update updated_at timestamp on row updates.';

-- =====================================================
-- 7. SEED DATA: INITIAL CONCEPTS
-- =====================================================
-- Purpose: Bootstrap the L0 Kernel with foundational concepts
-- Status: MINIMAL SEED (expand based on business requirements)
-- =====================================================

-- Core Entity Concepts
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description, requires_jurisdiction, is_extensible, version)
VALUES
  ('CONCEPT_BANK', 'Bank', 'ENTITY', 'Financial institution that provides banking services', true, false, '1.0.0'),
  ('CONCEPT_CURRENCY', 'Currency', 'ENTITY', 'Medium of exchange (ISO 4217)', true, false, '1.0.0'),
  ('CONCEPT_VENDOR', 'Vendor', 'ENTITY', 'External business entity providing goods/services', false, true, '1.0.0'),
  ('CONCEPT_TENANT', 'Tenant', 'ENTITY', 'Top-level organizational isolation unit in multi-tenant SaaS', false, false, '1.0.0'),
  ('CONCEPT_COMPANY', 'Company', 'ENTITY', 'Legal entity within a tenant', false, true, '1.0.0'),
  ('CONCEPT_COUNTRY', 'Country', 'ENTITY', 'Sovereign nation (ISO 3166-1)', false, false, '1.0.0')
ON CONFLICT (concept_id) DO NOTHING;

-- Core Attribute Concepts
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description, requires_jurisdiction, is_extensible, version)
VALUES
  ('CONCEPT_STATUS', 'Status', 'ATTRIBUTE', 'Lifecycle state of an entity', false, true, '1.0.0'),
  ('CONCEPT_COLOR_TOKEN', 'Color Token', 'ATTRIBUTE', 'Design system color token', false, true, '1.0.0'),
  ('CONCEPT_PAYMENT_TERM', 'Payment Term', 'ATTRIBUTE', 'Payment schedule and conditions', true, true, '1.0.0'),
  ('CONCEPT_APPROVAL_LEVEL', 'Approval Level', 'ATTRIBUTE', 'Hierarchical approval authority level', false, true, '1.0.0')
ON CONFLICT (concept_id) DO NOTHING;

-- Core Relationship Concepts
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description, requires_jurisdiction, is_extensible, version)
VALUES
  ('CONCEPT_VENDOR_COMPANY_LINK', 'Vendor-Company Link', 'RELATIONSHIP', 'Relationship between vendor and company', false, false, '1.0.0'),
  ('CONCEPT_USER_TENANT_ACCESS', 'User-Tenant Access', 'RELATIONSHIP', 'User access rights to tenant', false, false, '1.0.0'),
  ('CONCEPT_GROUP_MEMBERSHIP', 'Group Membership', 'RELATIONSHIP', 'Membership in organizational group', false, false, '1.0.0')
ON CONFLICT (concept_id) DO NOTHING;

-- Core Operation Concepts
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description, requires_jurisdiction, is_extensible, version)
VALUES
  ('CONCEPT_PAYMENT', 'Payment', 'OPERATION', 'Transfer of monetary value', false, true, '1.0.0'),
  ('CONCEPT_INVOICE', 'Invoice', 'OPERATION', 'Request for payment for goods/services rendered', false, true, '1.0.0'),
  ('CONCEPT_APPROVAL', 'Approval', 'OPERATION', 'Authorization action', false, true, '1.0.0'),
  ('CONCEPT_ONBOARDING', 'Onboarding', 'OPERATION', 'Process of adding new entity to system', false, true, '1.0.0')
ON CONFLICT (concept_id) DO NOTHING;

-- =====================================================
-- 8. SEED DATA: GLOBAL VALUE SETS
-- =====================================================

-- Global Currencies (ISO 4217)
INSERT INTO kernel_value_set_registry (value_set_id, concept_id, jurisdiction_code, value_set_name, value_set_description, sync_source, sync_frequency, version)
VALUES
  ('VALUESET_GLOBAL_CURRENCIES', 'CONCEPT_CURRENCY', 'GLOBAL', 'Global Currencies', 'ISO 4217 Currency Codes', 'ISO_4217', 'QUARTERLY', '1.0.0')
ON CONFLICT (value_set_id) DO NOTHING;

-- Global Countries (ISO 3166-1)
INSERT INTO kernel_value_set_registry (value_set_id, concept_id, jurisdiction_code, value_set_name, value_set_description, sync_source, sync_frequency, version)
VALUES
  ('VALUESET_GLOBAL_COUNTRIES', 'CONCEPT_COUNTRY', 'GLOBAL', 'Global Countries', 'ISO 3166-1 Country Codes', 'ISO_3166_1', 'QUARTERLY', '1.0.0')
ON CONFLICT (value_set_id) DO NOTHING;

-- Common Currency Values
INSERT INTO kernel_value_set_values (value_id, value_set_id, value_code, value_label, value_description, official_aliases, sort_order, is_active, is_default)
VALUES
  ('CURRENCY_USD', 'VALUESET_GLOBAL_CURRENCIES', 'USD', 'US Dollar', 'United States Dollar', '[{"type": "ISO_4217", "code": "USD"}, {"type": "NUMERIC_CODE", "code": "840"}]', 1, true, true),
  ('CURRENCY_EUR', 'VALUESET_GLOBAL_CURRENCIES', 'EUR', 'Euro', 'European Euro', '[{"type": "ISO_4217", "code": "EUR"}, {"type": "NUMERIC_CODE", "code": "978"}]', 2, true, false),
  ('CURRENCY_MYR', 'VALUESET_GLOBAL_CURRENCIES', 'MYR', 'Malaysian Ringgit', 'Malaysia Ringgit', '[{"type": "ISO_4217", "code": "MYR"}, {"type": "NUMERIC_CODE", "code": "458"}]', 3, true, false),
  ('CURRENCY_SGD', 'VALUESET_GLOBAL_CURRENCIES', 'SGD', 'Singapore Dollar', 'Singapore Dollar', '[{"type": "ISO_4217", "code": "SGD"}, {"type": "NUMERIC_CODE", "code": "702"}]', 4, true, false),
  ('CURRENCY_GBP', 'VALUESET_GLOBAL_CURRENCIES', 'GBP', 'British Pound', 'British Pound Sterling', '[{"type": "ISO_4217", "code": "GBP"}, {"type": "NUMERIC_CODE", "code": "826"}]', 5, true, false)
ON CONFLICT (value_set_id, value_code) DO NOTHING;

-- Common Country Values
INSERT INTO kernel_value_set_values (value_id, value_set_id, value_code, value_label, value_description, official_aliases, sort_order, is_active)
VALUES
  ('COUNTRY_MY', 'VALUESET_GLOBAL_COUNTRIES', 'MY', 'Malaysia', 'Malaysia', '[{"type": "ISO_3166_1_ALPHA_2", "code": "MY"}, {"type": "ISO_3166_1_ALPHA_3", "code": "MYS"}, {"type": "ISO_3166_1_NUMERIC", "code": "458"}]', 1, true),
  ('COUNTRY_SG', 'VALUESET_GLOBAL_COUNTRIES', 'SG', 'Singapore', 'Singapore', '[{"type": "ISO_3166_1_ALPHA_2", "code": "SG"}, {"type": "ISO_3166_1_ALPHA_3", "code": "SGP"}, {"type": "ISO_3166_1_NUMERIC", "code": "702"}]', 2, true),
  ('COUNTRY_US', 'VALUESET_GLOBAL_COUNTRIES', 'US', 'United States', 'United States of America', '[{"type": "ISO_3166_1_ALPHA_2", "code": "US"}, {"type": "ISO_3166_1_ALPHA_3", "code": "USA"}, {"type": "ISO_3166_1_NUMERIC", "code": "840"}]', 3, true),
  ('COUNTRY_GB', 'VALUESET_GLOBAL_COUNTRIES', 'GB', 'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', '[{"type": "ISO_3166_1_ALPHA_2", "code": "GB"}, {"type": "ISO_3166_1_ALPHA_3", "code": "GBR"}, {"type": "ISO_3166_1_NUMERIC", "code": "826"}]', 4, true)
ON CONFLICT (value_set_id, value_code) DO NOTHING;

-- =====================================================
-- END OF L0 KERNEL FOUNDATION MIGRATION
-- =====================================================

COMMENT ON SCHEMA public IS 'L0 Kernel Foundation instantiated. Nexus Canon v5 operational. No downstream layer may create concepts not registered in kernel_concept_registry.';
