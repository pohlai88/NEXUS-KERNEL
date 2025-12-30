# Supplier Portal: Cryptographic Audit Trail Architecture

**Date:** 2025-01-28  
**Status:** 🏗️ Architecture Design  
**Authority:** Kernel Doctrine Aligned

---

## Executive Summary

A comprehensive supplier portal with **cryptographic audit trail** ensuring every action is:
- **Immutable** - Cannot be altered after creation
- **Verifiable** - Cryptographic proof of authenticity
- **Timestamped** - Proof of when action occurred
- **Traceable** - Complete chain of custody
- **Audit-Ready** - Regulatory compliance built-in

**Core Principle:** "I know you submitted, I know he edited, I know pending approval, I know everything in the audit trail, or process flow, what's next... no confusion"

---

## 🎯 System Requirements

### 1. Cryptographic Audit Trail
- Every action creates an immutable audit record
- Cryptographic signature (hash) of the action
- Proof timestamp (blockchain-like, but using PostgreSQL)
- Chain of custody tracking
- Cannot be altered or deleted (append-only)

### 2. Document Signing
- Documents signed using cryptographic signatures
- Proof timestamp for signing
- Signer identity verification
- Document integrity verification (hash)

### 3. Case Management
- Dispute resolution workflow
- Multi-team collaboration (Procurement, AP, Warehouse)
- Inline comments and actions
- Audit trail of all case activities
- Status tracking (Open, In Progress, Resolved, Closed)

### 4. Process Flows
- Supplier Onboarding
- Evaluation & KPI Tracking
- Quotation Management
- PO-GRN-Invoice 3-Way Matching
- SOA Auto-Matching
- Payment Preview
- Dispute Resolution

---

## 🗄️ Database Architecture

### Core Tables

#### 1. `audit_trail` (Immutable Append-Only)
```sql
CREATE TABLE audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action Context
  entity_type text NOT NULL,        -- 'vendor', 'document', 'case', 'invoice', etc.
  entity_id uuid NOT NULL,           -- ID of the entity being audited
  action text NOT NULL,               -- 'create', 'update', 'delete', 'approve', 'reject', 'sign', etc.
  action_by uuid NOT NULL,           -- User who performed the action
  action_at timestamptz NOT NULL DEFAULT now(),
  
  -- Change Tracking
  old_state jsonb,                    -- Previous state (for updates)
  new_state jsonb,                    -- New state (for creates/updates)
  changes jsonb,                      -- Diff of changes (for updates)
  
  -- Cryptographic Proof
  content_hash text NOT NULL,         -- SHA-256 hash of (entity_type + entity_id + action + old_state + new_state + action_by + action_at)
  previous_hash text,                 -- Hash of previous audit record (chain)
  proof_timestamp timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  ip_address inet,
  user_agent text,
  request_id uuid,                    -- Request correlation ID
  tenant_id uuid NOT NULL,
  
  -- Process Flow
  workflow_stage text,                -- 'submitted', 'pending_approval', 'approved', 'rejected', etc.
  workflow_state jsonb,               -- Current workflow state
  
  -- Immutability Enforcement
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 2. `document_signatures` (Cryptographic Signatures)
```sql
CREATE TABLE document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  document_version_id uuid,           -- Links to document_versions
  
  -- Signer
  signer_id uuid NOT NULL,
  signer_role text NOT NULL,          -- 'supplier', 'procurement', 'ap', 'warehouse', 'approver'
  signer_name text NOT NULL,
  
  -- Signature
  signature_hash text NOT NULL,       -- SHA-256 hash of (document_id + document_version_id + signer_id + signed_at + document_content_hash)
  document_content_hash text NOT NULL, -- Hash of document content at time of signing
  signed_at timestamptz NOT NULL DEFAULT now(),
  
  -- Proof Timestamp
  proof_timestamp timestamptz NOT NULL DEFAULT now(),
  proof_hash text NOT NULL,           -- Hash linking to audit_trail
  
  -- Metadata
  signing_method text NOT NULL,       -- 'digital_signature', 'crypto_wallet', 'biometric', etc.
  signing_device text,                -- Device identifier
  ip_address inet,
  tenant_id uuid NOT NULL,
  
  -- Audit Link
  audit_trail_id uuid NOT NULL REFERENCES audit_trail(id),
  
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 3. Enhanced `vmp_cases` (Dispute Management)
- Already exists with fields: `case_type`, `status`, `assigned_to_user_id`, `owner_team`
- **Enhancement:** Link to `audit_trail` for all case activities
- **Enhancement:** Multi-team collaboration via `vmp_messages` (already exists)

#### 4. Enhanced `vmp_invoices`, `vmp_po_refs`, `vmp_grn_refs` (3-Way Matching)
- Already exist with matching fields
- **Enhancement:** Link to `audit_trail` for matching operations
- **Enhancement:** Matching status tracking in `audit_trail.workflow_stage`

#### 5. Enhanced `vmp_soa_items`, `vmp_soa_matches` (SOA Auto-Matching)
- Already exist with matching logic
- **Enhancement:** Link to `audit_trail` for auto-matching operations
- **Enhancement:** Matching confidence scores in `audit_trail.workflow_state`

---

## 🔐 Cryptographic Functions

### Hash Generation
```sql
CREATE OR REPLACE FUNCTION generate_audit_hash(
  entity_type text,
  entity_id uuid,
  action text,
  old_state jsonb,
  new_state jsonb,
  action_by uuid,
  action_at timestamptz,
  previous_hash text
) RETURNS text AS $$
BEGIN
  RETURN encode(
    digest(
      entity_type || 
      entity_id::text || 
      action || 
      COALESCE(old_state::text, '') || 
      COALESCE(new_state::text, '') || 
      action_by::text || 
      action_at::text || 
      COALESCE(previous_hash, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Audit Trail Insert (Immutable)
```sql
CREATE OR REPLACE FUNCTION insert_audit_trail(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_action_by uuid,
  p_old_state jsonb,
  p_new_state jsonb,
  p_changes jsonb,
  p_workflow_stage text,
  p_workflow_state jsonb,
  p_tenant_id uuid,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_previous_hash text;
  v_content_hash text;
  v_audit_id uuid;
BEGIN
  -- Get previous hash for this entity (chain)
  SELECT content_hash INTO v_previous_hash
  FROM audit_trail
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
  ORDER BY action_at DESC
  LIMIT 1;
  
  -- Generate content hash
  v_content_hash := generate_audit_hash(
    p_entity_type,
    p_entity_id,
    p_action,
    p_old_state,
    p_new_state,
    p_action_by,
    now(),
    v_previous_hash
  );
  
  -- Insert audit record
  INSERT INTO audit_trail (
    entity_type, entity_id, action, action_by, action_at,
    old_state, new_state, changes,
    content_hash, previous_hash, proof_timestamp,
    workflow_stage, workflow_state,
    tenant_id, ip_address, user_agent, request_id
  ) VALUES (
    p_entity_type, p_entity_id, p_action, p_action_by, now(),
    p_old_state, p_new_state, p_changes,
    v_content_hash, v_previous_hash, now(),
    p_workflow_stage, p_workflow_state,
    p_tenant_id, p_ip_address, p_user_agent, p_request_id
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Process Flows

### 1. Supplier Onboarding
```
1. Supplier submits application
   → audit_trail: action='submit', workflow_stage='submitted'
   
2. Procurement reviews
   → audit_trail: action='review', workflow_stage='pending_approval'
   
3. Approval/Rejection
   → audit_trail: action='approve'/'reject', workflow_stage='approved'/'rejected'
   
4. Document signing
   → document_signatures: cryptographic signature
   → audit_trail: action='sign', workflow_stage='signed'
```

### 2. Document Signing Workflow
```
1. Document uploaded
   → audit_trail: action='upload', entity_type='document'
   
2. Document signed
   → Generate document_content_hash
   → Generate signature_hash
   → Insert document_signatures record
   → audit_trail: action='sign', proof_hash=signature_hash
   
3. Verification
   → Verify signature_hash matches document content
   → Verify proof_timestamp in audit_trail
```

### 3. Case Management Workflow
```
1. Create Case
   → vmp_cases: status='open'
   → audit_trail: action='create', entity_type='case'
   
2. Assign to Team
   → vmp_cases: assigned_team='procurement', assigned_to_user_id=user_id
   → vmp_messages: activity_type='assignment'
   → audit_trail: action='assign'
   
3. Team Collaboration
   → vmp_messages: sender_type='internal', is_internal_note=true
   → audit_trail: action='comment'
   
4. Resolution
   → vmp_cases: status='resolved'
   → audit_trail: action='resolve'
```

### 4. 3-Way Matching Workflow
```
1. PO Created
   → vmp_po_refs: status='open'
   → audit_trail: action='create', entity_type='purchase_order'
   
2. GRN Created
   → vmp_grn_refs: status='pending'
   → audit_trail: action='create', entity_type='goods_receipt_note'
   
3. Invoice Received
   → vmp_invoices: status='pending'
   → audit_trail: action='create', entity_type='invoice'
   
4. Auto-Matching
   → Compare PO, GRN, Invoice
   → Calculate matching_score
   → audit_trail: action='match', workflow_stage='matched'/'mismatch', workflow_state={'matching_score': 95}
   
5. Approval
   → vmp_invoices: status='matched'
   → audit_trail: action='approve'
   
6. Payment Preview
   → Generate payment_preview
   → audit_trail: action='preview_payment'
```

### 5. SOA Auto-Matching Workflow
```
1. SOA Uploaded
   → vmp_soa_items: status='extracted'
   → audit_trail: action='upload', entity_type='soa'
   
2. Auto-Matching
   → vmp_soa_matches: match_type='deterministic'/'probabilistic'
   → Calculate match_confidence
   → audit_trail: action='match', workflow_stage='matched'/'partial'/'disputed', workflow_state={'match_confidence': 0.95}
   
3. Discrepancy Detection
   → vmp_soa_discrepancies: status='open'
   → audit_trail: action='discrepancy_detected'
   
4. Case Creation
   → vmp_cases: case_type='soa', status='open'
   → audit_trail: action='create', entity_type='case'
```

---

## 🛡️ Security & Compliance

### Immutability Enforcement
- **Row-Level Security (RLS):** Prevent UPDATE/DELETE on `audit_trail`
- **Triggers:** Prevent modification of audit records
- **Append-Only:** Only INSERT allowed

### Verification
- **Hash Verification:** Verify content_hash matches content
- **Chain Verification:** Verify previous_hash links to previous record
- **Timestamp Verification:** Verify proof_timestamp is sequential

### Compliance
- **GDPR:** Audit trail for data access/modification
- **SOX:** Financial transaction audit trail
- **ISO 27001:** Security event audit trail

---

## 📊 Query Examples

### Get Complete Audit Trail for Entity
```sql
SELECT 
  action,
  action_by,
  action_at,
  workflow_stage,
  content_hash,
  previous_hash
FROM audit_trail
WHERE entity_type = 'vendor'
  AND entity_id = '...'
ORDER BY action_at ASC;
```

### Verify Audit Trail Integrity
```sql
SELECT 
  id,
  content_hash,
  previous_hash,
  CASE 
    WHEN previous_hash = LAG(content_hash) OVER (ORDER BY action_at) 
    THEN 'valid' 
    ELSE 'invalid' 
  END AS chain_validity
FROM audit_trail
WHERE entity_type = 'vendor'
  AND entity_id = '...'
ORDER BY action_at;
```

### Get Document Signing History
```sql
SELECT 
  ds.signer_name,
  ds.signer_role,
  ds.signed_at,
  ds.signature_hash,
  ds.proof_hash,
  at.action_at AS proof_timestamp
FROM document_signatures ds
JOIN audit_trail at ON ds.audit_trail_id = at.id
WHERE ds.document_id = '...'
ORDER BY ds.signed_at;
```

### Get Case Activity Timeline
```sql
SELECT 
  at.action,
  at.action_by,
  at.action_at,
  at.workflow_stage,
  vm.body AS message_content,
  vm.sender_type
FROM audit_trail at
LEFT JOIN vmp_messages vm ON vm.case_id = at.entity_id::text
WHERE at.entity_type = 'case'
  AND at.entity_id = '...'
ORDER BY at.action_at;
```

---

## 🚀 Implementation Plan

### Phase 1: Core Audit Trail (P0)
1. ✅ Create `audit_trail` table with cryptographic functions
2. ✅ Create `document_signatures` table
3. ✅ Integrate with existing `@nexus/cruds` audit hooks
4. ✅ Create audit trail repository

### Phase 2: Document Signing (P0)
1. ✅ Implement document signing workflow
2. ✅ Generate cryptographic signatures
3. ✅ Link signatures to audit trail
4. ✅ Create signature verification API

### Phase 3: Case Management Integration (P0)
1. ✅ Link `vmp_cases` to `audit_trail`
2. ✅ Track case activities in audit trail
3. ✅ Multi-team collaboration audit
4. ✅ Case resolution tracking

### Phase 4: 3-Way Matching Integration (P1)
1. ✅ Link matching operations to audit trail
2. ✅ Track matching scores and status
3. ✅ Payment preview audit
4. ✅ Matching approval tracking

### Phase 5: SOA Auto-Matching Integration (P1)
1. ✅ Link SOA matching to audit trail
2. ✅ Track matching confidence scores
3. ✅ Discrepancy detection audit
4. ✅ Case creation from discrepancies

### Phase 6: UI Components (P1)
1. ✅ Audit trail viewer component
2. ✅ Document signature viewer
3. ✅ Case activity timeline
4. ✅ Process flow visualization

---

**Status:** 🏗️ Architecture Complete  
**Next:** Implementation Phase - Start with Phase 1 (Core Audit Trail)

