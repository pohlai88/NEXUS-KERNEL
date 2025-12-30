# Vendor Portal & AP Portal: PRD Acceptance Criteria Mapping

**Date:** 2025-01-28  
**Status:** 🧭 PRD Analysis & Architecture Mapping  
**Authority:** Best Practice PRD (Non-Negotiable Acceptance Criteria)

---

## Executive Summary

This document maps the **PRD-level acceptance criteria** to our current architecture and identifies implementation gaps. The PRD defines **what must exist**, **what must never exist**, and **what is considered failure** - ensuring the system survives time, people changes, and scale.

**Core Principle:** "The system must remove uncertainty, not create convenience."

---

## 📋 PRD Requirements Overview

### Vendor Portal Requirements
- **V-01:** Payment Status Transparency (MUST)
- **V-02:** Zero Re-Typing Principle (MUST)
- **V-03:** Predictive Warning System (SHOULD)

### AP/Procurement Portal Requirements
- **A-01:** Exception-First Workload (MUST)
- **A-02:** Audit-Proof Single Source of Truth (MUST)
- **A-03:** System-Enforced Rejection (MUST)

### Shared Rules
- **S-01:** One Status, Two Perspectives
- **S-02:** No Manual Communication Dependency
- **S-03:** Silence Is a Bug

---

## 🗺️ Architecture Mapping

### Current Implementation Status

#### ✅ Phase 1-3 Foundation (Complete)
- ✅ Cryptographic audit trail system
- ✅ Case management with multi-team collaboration
- ✅ 3-way matching (PO-GRN-Invoice)
- ✅ SOA auto-matching
- ✅ Document signatures
- ✅ Supplier onboarding workflow
- ✅ Evaluation/KPI tracking
- ✅ Quotation management

#### ⚠️ PRD Gap Analysis

---

## V-01: Payment Status Transparency (MUST)

### PRD Requirements

**What must exist:**
- Single canonical status per invoice:
  - `RECEIVED`
  - `UNDER_REVIEW`
  - `REJECTED`
  - `APPROVED_FOR_PAYMENT`
  - `PAID`
- Each non-final status **must include a reason code**
- Each invoice **must show**:
  - Current status
  - Last updated time
  - Expected next step
  - Expected payment date (or reason why not available)

**What must never exist:**
- Statuses without explanations
- "Pending" without context
- Free-text rejection reasons

**Failure if:**
- A vendor needs to email/call AP to ask "What is happening with my invoice?"

### Current Implementation

**Status:** ⚠️ **PARTIAL**

**Existing:**
- `vmp_invoices` table has `status` field (pending, matched, paid, disputed, cancelled)
- Audit trail system tracks status changes
- Case management links invoices to cases

**Gaps:**
- ❌ Status values don't match PRD canonical statuses
- ❌ No reason code system for status changes
- ❌ No "expected next step" tracking
- ❌ No "expected payment date" calculation
- ❌ No standardized rejection reason codes

**Required Implementation:**
1. **Database Migration:** Update `vmp_invoices.status` enum to match PRD canonical statuses
2. **New Table:** `invoice_status_reasons` - Standardized reason codes
3. **New Table:** `invoice_status_timeline` - Status history with reasons
4. **Repository:** `InvoiceStatusRepository` - Status management with reason codes
5. **Server Action:** `updateInvoiceStatusAction()` - Enforced reason code requirement
6. **UI Component:** Invoice status display with reason, next step, expected payment date

---

## V-02: Zero Re-Typing Principle (MUST)

### PRD Requirements

**What must exist:**
- Vendor uploads invoice **once**
- System auto-links:
  - Vendor master
  - Bank details
  - Tax ID
  - Contract / PO (if exists)
- If something is missing, system **asks specifically**:
  - "GRN missing — upload here"
  - "PO not found — select or request"

**What must never exist:**
- Vendor re-entering data already on file
- "Upload invoice again" flows
- Email-based corrections

**Failure if:**
- Vendor performs the same action twice for the same invoice

### Current Implementation

**Status:** ⚠️ **PARTIAL**

**Existing:**
- Document upload system exists
- Vendor master data in `vmp_vendors`
- 3-way matching system links PO-GRN-Invoice
- Case management for missing documents

**Gaps:**
- ❌ No automatic vendor master linking on invoice upload
- ❌ No automatic bank details linking
- ❌ No automatic tax ID linking
- ❌ No automatic contract/PO detection
- ❌ No specific "missing document" prompts with upload actions
- ❌ No prevention of duplicate uploads

**Required Implementation:**
1. **Repository Enhancement:** `DocumentRepository` - Auto-link vendor data on upload
2. **Service:** `InvoiceAutoLinkService` - Automatic linking logic
3. **Server Action:** `uploadInvoiceAction()` - Auto-link + missing document detection
4. **UI Component:** Missing document prompts with direct upload actions
5. **Database:** Duplicate detection index on invoice number + vendor_id

---

## V-03: Predictive Warning System (SHOULD)

### PRD Requirements

**What must exist:**
- Early warnings such as:
  - "Likely delay due to missing GRN"
  - "Approval cutoff missed — next cycle"
- Visibility of:
  - Cut-off rules
  - Payment cycles
  - Public holidays impact

**What must never exist:**
- Surprise rejections
- Silent delays

**Failure if:**
- Vendor learns about a delay **after** expected payment date

### Current Implementation

**Status:** ❌ **NOT IMPLEMENTED**

**Gaps:**
- ❌ No warning system
- ❌ No cut-off rules configuration
- ❌ No payment cycle tracking
- ❌ No public holidays integration
- ❌ No predictive delay calculation

**Required Implementation:**
1. **New Table:** `payment_cutoff_rules` - Cut-off rules configuration
2. **New Table:** `payment_cycles` - Payment cycle definitions
3. **New Table:** `public_holidays` - Holiday calendar
4. **Service:** `PaymentWarningService` - Predictive warning calculation
5. **Repository:** `PaymentWarningRepository` - Warning management
6. **UI Component:** Warning display with actionable information

---

## A-01: Exception-First Workload (MUST)

### PRD Requirements

**What must exist:**
- Default view shows **only problems**, not volume:
  - Missing documents
  - Variance breaches
  - Aging thresholds exceeded
- Severity tagging:
  - 🔴 Blocking
  - 🟠 Needs action
  - 🟢 Safe

**What must never exist:**
- Flat lists of all invoices by default
- Manual filtering required to find problems

**Failure if:**
- AP staff discovers issues only after vendor escalation

### Current Implementation

**Status:** ❌ **NOT IMPLEMENTED**

**Gaps:**
- ❌ No exception-first dashboard
- ❌ No severity tagging system
- ❌ No automatic problem detection
- ❌ No aging threshold tracking

**Required Implementation:**
1. **New Table:** `invoice_exceptions` - Exception tracking
2. **Service:** `ExceptionDetectionService` - Automatic exception detection
3. **Repository:** `ExceptionRepository` - Exception management
4. **UI Component:** Exception-first dashboard with severity tags
5. **Server Action:** `getExceptionsAction()` - Exception list with severity

---

## A-02: Audit-Proof Single Source of Truth (MUST)

### PRD Requirements

**What must exist:**
- Every invoice linked to:
  - PO (if applicable)
  - GRN
  - Contract
  - Approval chain
- Immutable activity log:
  - Who
  - When
  - What
  - Why

**What must never exist:**
- Editable approval history
- Multiple "truths" across screens

**Failure if:**
- AP cannot defend a decision to auditor or CFO **using the system alone**

### Current Implementation

**Status:** ✅ **MOSTLY COMPLETE**

**Existing:**
- ✅ Audit trail system with cryptographic proof
- ✅ 3-way matching links PO-GRN-Invoice
- ✅ Case management links invoices
- ✅ Immutable audit records

**Gaps:**
- ⚠️ Contract linking not explicitly tracked
- ⚠️ Approval chain not explicitly structured
- ⚠️ "Why" (reason) not always captured in audit trail

**Required Implementation:**
1. **Database Enhancement:** Add `contract_id` to `vmp_invoices`
2. **Repository Enhancement:** Ensure all status changes include reason
3. **UI Component:** Approval chain visualization
4. **Service:** `AuditTrailQueryService` - Complete audit trail queries

---

## A-03: System-Enforced Rejection (MUST)

### PRD Requirements

**What must exist:**
- Standardized rejection reasons (select, not type)
- System rules enforce:
  - Cut-off dates
  - Approval limits
  - Required documents
- Vendor sees **exactly the same reason** AP sees

**What must never exist:**
- Personal explanations typed by staff
- "Soft rejections" without system record

**Failure if:**
- Rejection becomes a personal conflict instead of a policy outcome

### Current Implementation

**Status:** ⚠️ **PARTIAL**

**Existing:**
- ✅ Case management has rejection workflow
- ✅ Audit trail tracks rejections

**Gaps:**
- ❌ No standardized rejection reason codes
- ❌ No system-enforced rules
- ❌ No cut-off date enforcement
- ❌ No approval limit enforcement
- ❌ Free-text rejection reasons possible

**Required Implementation:**
1. **New Table:** `rejection_reason_codes` - Standardized rejection reasons
2. **New Table:** `approval_rules` - System-enforced rules
3. **Service:** `RejectionEnforcementService` - Rule enforcement
4. **Repository:** `RejectionRepository` - Rejection management with codes
5. **Server Action:** `rejectInvoiceAction()` - Enforced reason code selection
6. **UI Component:** Rejection reason selector (no free text)

---

## S-01: One Status, Two Perspectives

### PRD Requirements

**What must exist:**
- Vendor view ≠ AP view, but status is identical
- Vendor sees *meaning*
- AP sees *risk*
- Status code is the same

**Failure if:**
- Same invoice shows different states to different users

### Current Implementation

**Status:** ⚠️ **PARTIAL**

**Existing:**
- ✅ Single `status` field in `vmp_invoices`
- ✅ Audit trail tracks status changes

**Gaps:**
- ❌ No perspective-specific UI rendering
- ❌ No "meaning" vs "risk" differentiation
- ❌ No view layer separation

**Required Implementation:**
1. **Service:** `StatusPresentationService` - Perspective-specific status rendering
2. **UI Components:** 
   - `VendorInvoiceStatus` - Shows meaning
   - `APInvoiceStatus` - Shows risk
3. **Repository:** Ensure single source of truth for status

---

## S-02: No Manual Communication Dependency

### PRD Requirements

**What must exist:**
- All actions resolvable inside the portal

**What must never exist:**
- "Please email AP"
- "Call finance for clarification"

**Failure if:**
- Business process relies on WhatsApp / email / calls

### Current Implementation

**Status:** ✅ **MOSTLY COMPLETE**

**Existing:**
- ✅ Case management with messages
- ✅ Multi-team collaboration
- ✅ Document upload system
- ✅ Status tracking

**Gaps:**
- ⚠️ Some workflows may still require external communication
- ⚠️ No explicit "actionable" UI patterns

**Required Implementation:**
1. **UI Pattern:** All error states must include actionable next steps
2. **Service:** `ActionResolverService` - Ensure all issues have portal-based resolution
3. **Documentation:** PRD compliance checklist for all user-facing errors

---

## S-03: Silence Is a Bug

### PRD Requirements

**What must exist:**
- No change + no explanation = defect

**Failure if:**
- An invoice changes nothing for X days with no system message

### Current Implementation

**Status:** ❌ **NOT IMPLEMENTED**

**Gaps:**
- ❌ No staleness detection
- ❌ No automatic notifications for inactivity
- ❌ No "why no change" explanations

**Required Implementation:**
1. **Service:** `StalenessDetectionService` - Detect inactive invoices
2. **Repository:** `NotificationRepository` - Automatic notifications
3. **Background Job:** Staleness monitoring and notification
4. **UI Component:** Staleness indicators

---

## 🎯 Implementation Priority

### P0 (Critical - PRD MUST Requirements)
1. **V-01:** Payment Status Transparency
2. **V-02:** Zero Re-Typing Principle
3. **A-01:** Exception-First Workload
4. **A-02:** Audit-Proof Single Source of Truth (mostly done, needs enhancement)
5. **A-03:** System-Enforced Rejection
6. **S-01:** One Status, Two Perspectives
7. **S-02:** No Manual Communication Dependency (mostly done, needs verification)
8. **S-03:** Silence Is a Bug

### P1 (High - PRD SHOULD Requirements)
9. **V-03:** Predictive Warning System

---

## 📊 Gap Summary

### Database Tables Needed (7 new tables)
1. `invoice_status_reasons` - Standardized reason codes
2. `invoice_status_timeline` - Status history with reasons
3. `payment_cutoff_rules` - Cut-off rules configuration
4. `payment_cycles` - Payment cycle definitions
5. `public_holidays` - Holiday calendar
6. `invoice_exceptions` - Exception tracking
7. `rejection_reason_codes` - Standardized rejection reasons
8. `approval_rules` - System-enforced rules

### Repositories Needed (6 new repositories)
1. `InvoiceStatusRepository` - Status management with reason codes
2. `PaymentWarningRepository` - Warning management
3. `ExceptionRepository` - Exception management
4. `RejectionRepository` - Rejection management with codes
5. `StatusPresentationService` - Perspective-specific rendering
6. `StalenessDetectionService` - Staleness detection

### Services Needed (5 new services)
1. `InvoiceAutoLinkService` - Automatic linking logic
2. `PaymentWarningService` - Predictive warning calculation
3. `ExceptionDetectionService` - Automatic exception detection
4. `RejectionEnforcementService` - Rule enforcement
5. `ActionResolverService` - Ensure portal-based resolution

### UI Components Needed (8 new components)
1. Invoice status display with reason, next step, expected payment date
2. Missing document prompts with direct upload actions
3. Warning display with actionable information
4. Exception-first dashboard with severity tags
5. Approval chain visualization
6. Rejection reason selector (no free text)
7. `VendorInvoiceStatus` - Shows meaning
8. `APInvoiceStatus` - Shows risk

---

## ✅ Next Steps

**Recommended Order:**
1. ✅ **SSOT Enforcement Checks** (This document)
2. ⏭️ **Cell / MCP Mapping** (Hard architecture)
3. ⏭️ **UI Wireframe Rules** (Visual design constraints)

**Status:** ✅ Step 1 Complete - SSOT Enforcement Checks mapped to architecture

---

**Authority:** Best Practice PRD (Non-Negotiable Acceptance Criteria)  
**Compliance:** All implementations must meet these PRD requirements  
**Failure Definition:** Any deviation from PRD acceptance criteria is considered a system failure

