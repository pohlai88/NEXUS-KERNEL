# Vendor Portal Gap Analysis

**Date:** 2025-01-28  
**Status:** 🔍 Gap Analysis Complete  
**Focus:** What vendors need vs. what exists

---

## Executive Summary

**Current State:** We have Iron Dome features (Magic Link, Status Bot, Mobile Upload) and Vendor Omni-Dashboard, but vendors need a **complete self-service portal** to reduce AP/Procurement workload.

**Gap:** Missing vendor-facing pages for profile management, invoice tracking, payment visibility, and document management.

---

## ✅ What EXISTS (Vendor-Facing)

### 1. ✅ Vendor Omni-Dashboard
- **File:** `apps/portal/app/vendor-omni-dashboard/page.tsx`
- **Features:**
  - View invoices, POs, cases across all subsidiaries
  - Context switcher (switch between subsidiaries)
  - Unified work queue
- **Status:** ✅ Complete

### 2. ✅ Invoice Upload
- **File:** `apps/portal/components/invoices/InvoiceUploadForm.tsx`
- **Features:**
  - Upload invoice with auto-linking
  - Duplicate detection
  - Mobile snap & submit
- **Status:** ✅ Complete

### 3. ✅ Status Bot (24/7 Inquiry)
- **File:** `apps/portal/app/api/status-bot/route.ts`
- **Features:**
  - WhatsApp/Portal/API inquiry
  - "Status Inv #101" → Payment date
- **Status:** ✅ Complete

### 4. ✅ Magic Link Notifications
- **File:** `apps/portal/src/repositories/notification-repository.ts`
- **Features:**
  - WhatsApp push with secure link
  - Auto-login to fix screen
- **Status:** ✅ Complete

### 5. ✅ Vendor Onboarding
- **File:** `apps/portal/components/vendors/VendorOnboardingForm.tsx`
- **Features:**
  - Instant-check onboarding
  - Real-time validation
- **Status:** ✅ Complete

---

## ❌ What's MISSING (Critical Gaps)

### 1. ❌ Vendor Dashboard/Home Page
**Problem:** Vendor logs in → sees what? No landing page with summary.

**Needed:**
- **Vendor Home Page** (`/vendor/dashboard`)
  - Summary cards: Pending Invoices, Approved Invoices, Total Outstanding, Next Payment Date
  - Recent activity feed
  - Quick actions: Upload Invoice, View POs, Create Case
  - Payment schedule (upcoming payments)

**Priority:** P0 (Critical - First thing vendor sees)

---

### 2. ❌ Vendor Profile Management
**Problem:** Vendor can't update their own profile (bank details, contact info, tax ID).

**Needed:**
- **Vendor Profile Page** (`/vendor/profile`)
  - View/Edit: Legal Name, Display Name, Tax ID, Country
  - View/Edit: Bank Account Details (for payment)
  - View/Edit: Contact Info (Email, Phone, Address)
  - View/Edit: Official Aliases
  - Compliance Documents Upload
  - Change Password (if vendor has auth account)

**Priority:** P0 (Critical - Vendors need to maintain their own data)

---

### 3. ❌ Invoice Status Tracking (Detailed View)
**Problem:** Status Bot gives basic info, but vendor needs detailed invoice status page.

**Needed:**
- **Invoice Detail Page** (`/vendor/invoices/[id]`)
  - Full invoice details
  - Status timeline (RECEIVED → UNDER_REVIEW → APPROVED → PAID)
  - Rejection reasons (if rejected)
  - Matching status (3-way matching)
  - Payment schedule
  - Documents (invoice PDF, PO, GRN)
  - Audit trail (who did what, when)

**Priority:** P0 (Critical - PRD V-01: Payment Status Transparency)

---

### 4. ❌ Invoice List/History
**Problem:** Vendor can see invoices in Omni-Dashboard, but no dedicated invoice list with filters.

**Needed:**
- **Invoice List Page** (`/vendor/invoices`)
  - Filter by: Status, Date Range, Amount, Subsidiary
  - Sort by: Date, Amount, Status
  - Search by: Invoice Number, PO Number
  - Export to Excel/PDF
  - Bulk actions (if needed)

**Priority:** P1 (High - Vendors need to track all invoices)

---

### 5. ❌ Payment Tracking & History
**Problem:** Vendor doesn't know when they'll be paid. No payment schedule visibility.

**Needed:**
- **Payment Schedule Page** (`/vendor/payments`)
  - Upcoming Payments (next 30 days)
  - Payment History (past payments)
  - Payment Details: Amount, Date, Reference, Bank Account
  - Outstanding Amount (total unpaid invoices)
  - Payment Calendar View

**Priority:** P0 (Critical - PRD V-01: Payment Status Transparency)

---

### 6. ❌ PO Acknowledgment
**Problem:** Vendor receives PO but can't acknowledge it in the portal.

**Needed:**
- **PO Detail Page** (`/vendor/purchase-orders/[id]`)
  - View PO details
  - Acknowledge PO (Accept/Reject)
  - Add comments/notes
  - Upload acknowledgment document
  - View PO status (Pending → Acknowledged → In Progress → Completed)

**Priority:** P1 (High - Important for procurement workflow)

---

### 7. ❌ GRN Submission
**Problem:** Vendor can't submit GRN (Goods Receipt Note) in the portal.

**Needed:**
- **GRN Submission Page** (`/vendor/grns/submit`)
  - Link to PO
  - Upload GRN document
  - Enter GRN details (date, quantity, condition)
  - Submit for approval

**Priority:** P1 (High - Required for 3-way matching)

---

### 8. ❌ Document Library
**Problem:** Vendor can't see/upload compliance documents, certificates, etc.

**Needed:**
- **Document Library Page** (`/vendor/documents`)
  - View all documents (Compliance, Certificates, Contracts)
  - Upload new documents
  - Document categories
  - Version history
  - Expiry tracking (for certificates)

**Priority:** P1 (High - Compliance requirement)

---

### 9. ❌ Case Management (Vendor Side)
**Problem:** Vendor can see cases in Omni-Dashboard, but can't create cases or view case details.

**Needed:**
- **Case List Page** (`/vendor/cases`)
  - View all cases (Open, In Progress, Resolved)
  - Create new case (Dispute, Question, Request)
  - Case detail page with messages
  - Upload evidence/documents
  - Case status tracking

**Priority:** P1 (High - "Don't call me, create a CASE")

---

### 10. ❌ Quotation Submission
**Problem:** Vendor can't submit quotations through the portal.

**Needed:**
- **Quotation Submission Page** (`/vendor/quotations/submit`)
  - Link to RFQ (Request for Quotation)
  - Upload quotation document
  - Enter quotation details (items, prices, terms)
  - Submit for evaluation

**Priority:** P2 (Medium - Nice to have)

---

### 11. ❌ Vendor Rating/Feedback
**Problem:** Two-way rating system exists, but vendor can't see their ratings or submit feedback.

**Needed:**
- **Rating Dashboard** (`/vendor/ratings`)
  - View company/staff ratings of vendor
  - Submit feedback/rating for company/staff
  - Rating history
  - Rating transparency (blackbox/whitebox)

**Priority:** P2 (Medium - Nice to have)

---

### 12. ❌ Vendor Settings
**Problem:** Vendor can't manage notification preferences, password, etc.

**Needed:**
- **Settings Page** (`/vendor/settings`)
  - Notification Preferences (Email, WhatsApp, Portal)
  - Password Change
  - Two-Factor Authentication
  - Language/Timezone
  - API Keys (if vendor has API access)

**Priority:** P2 (Medium - Nice to have)

---

## 📊 Priority Matrix

### P0 (Critical - Must Have)
1. ✅ Vendor Dashboard/Home Page
2. ✅ Vendor Profile Management
3. ✅ Invoice Status Tracking (Detailed View)
4. ✅ Payment Tracking & History

### P1 (High - Should Have)
5. ✅ Invoice List/History
6. ✅ PO Acknowledgment
7. ✅ GRN Submission
8. ✅ Document Library
9. ✅ Case Management (Vendor Side)

### P2 (Medium - Nice to Have)
10. ✅ Quotation Submission
11. ✅ Vendor Rating/Feedback
12. ✅ Vendor Settings

---

## 🎯 Implementation Roadmap

### Phase 1: Core Self-Service (P0)
**Goal:** Vendors can manage their profile and track invoices/payments.

**Pages:**
1. `/vendor/dashboard` - Home page with summary
2. `/vendor/profile` - Profile management
3. `/vendor/invoices/[id]` - Invoice detail with status timeline
4. `/vendor/payments` - Payment schedule & history

**Estimated:** 4 pages, ~800 lines

---

### Phase 2: Workflow Integration (P1)
**Goal:** Vendors can participate in procurement workflow.

**Pages:**
1. `/vendor/invoices` - Invoice list with filters
2. `/vendor/purchase-orders/[id]` - PO acknowledgment
3. `/vendor/grns/submit` - GRN submission
4. `/vendor/documents` - Document library
5. `/vendor/cases` - Case management

**Estimated:** 5 pages, ~1,000 lines

---

### Phase 3: Enhanced Features (P2)
**Goal:** Complete vendor self-service portal.

**Pages:**
1. `/vendor/quotations/submit` - Quotation submission
2. `/vendor/ratings` - Rating dashboard
3. `/vendor/settings` - Settings & preferences

**Estimated:** 3 pages, ~600 lines

---

## 📈 Impact Assessment

### Current State
- **Vendor Self-Service:** 30% (Basic upload, status bot)
- **AP/Procurement Workload:** High (vendors call/email for status)
- **Vendor Satisfaction:** Low (no visibility, no control)

### After Phase 1 (P0)
- **Vendor Self-Service:** 70% (Profile + Invoice/Payment tracking)
- **AP/Procurement Workload:** Medium (fewer status inquiries)
- **Vendor Satisfaction:** Medium (visibility, but limited control)

### After Phase 2 (P1)
- **Vendor Self-Service:** 90% (Full workflow participation)
- **AP/Procurement Workload:** Low (vendors handle their own workflow)
- **Vendor Satisfaction:** High (full control, full visibility)

### After Phase 3 (P2)
- **Vendor Self-Service:** 100% (Complete portal)
- **AP/Procurement Workload:** Minimal (vendors self-serve everything)
- **Vendor Satisfaction:** Very High (enterprise-grade portal)

---

## 🚀 Next Steps

### Immediate (This Week)
1. **Create Vendor Dashboard** (`/vendor/dashboard`)
   - Summary cards
   - Recent activity
   - Quick actions

2. **Create Vendor Profile Page** (`/vendor/profile`)
   - View/Edit profile
   - Bank account management
   - Compliance documents

3. **Create Invoice Detail Page** (`/vendor/invoices/[id]`)
   - Status timeline
   - Payment schedule
   - Documents

4. **Create Payment Schedule Page** (`/vendor/payments`)
   - Upcoming payments
   - Payment history
   - Outstanding amount

---

**Status:** 🔍 Gap Analysis Complete  
**Recommendation:** Start with Phase 1 (P0) - Core Self-Service  
**Impact:** High - Reduces AP/Procurement workload by 50%+

