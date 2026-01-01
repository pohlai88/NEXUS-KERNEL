# Changelog

All notable changes to `@aibos/kernel` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-01

### Added

- **TENANT Concept** - Added `CONCEPT_TENANT` to ENTITY category
  - Governance boundary entity — NOT automatically included in business cell allowlists
  - Total concepts increased from 30 to 31

### Changed

- Updated `CONCEPT_COUNT` from 30 to 31
- Updated `registry.snapshot.json` to reflect 31 concepts
- Updated `SNAPSHOT_ID` to reflect new registry state

## [1.0.0] - 2025-12-31

### Added

- **CONCEPT** - 30 canonical concept identifiers

  - 12 ENTITY: BANK, CASE, CLAIM, COMPANY, COUNTRY, CURRENCY, DOCUMENT, EXCEPTION, INVOICE, PARTY, RATING, VENDOR
  - 6 ATTRIBUTE: APPROVAL_LEVEL, IDENTITY, PAYMENT_METHOD, PRIORITY, RISK, STATUS
  - 8 OPERATION: APPROVAL, AUDIT, DOCUMENT_REQUEST, ESCALATION, ONBOARDING, PAYMENT, REJECTION, WORKFLOW
  - 4 RELATIONSHIP: GROUP_MEMBERSHIP, INVOICE_VENDOR_LINK, RELATIONSHIP, VENDOR_COMPANY_LINK

- **VALUESET** - 12 canonical value set identifiers

  - APPROVAL_ACTION, AUDIT_EVENT_TYPE, COUNTRIES, CURRENCIES, DOCUMENT_TYPE
  - IDENTITY_TYPE, PARTY_TYPE, PRIORITY_LEVEL, RELATIONSHIP_TYPE, RISK_FLAG
  - STATUS_GENERAL, WORKFLOW_STATE

- **VALUE** - 62 canonical values organized by value set

  - Type-safe nested structure: `VALUE.CURRENCIES.MYR`

- **Version Law** exports

  - `KERNEL_VERSION` - "1.0.0"
  - `SNAPSHOT_ID` - Content hash for CI validation
  - `validateKernelIntegrity()` - Runtime drift detection

- **registry.snapshot.json** - Embedded SSOT artifact for DB validation

### Architecture

- L0 Constitutional layer (SDK-only, no CLI)
- One-way truth flow: Kernel → Snapshot → DB validation
- Domain logic moved to VPM packages (`@nexus/canon-vendor`, `@nexus/canon-claim`)
