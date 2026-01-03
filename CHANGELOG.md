# Changelog

All notable changes to `@aibos/kernel` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-01-01

### Added

- **Kernel v1.0.0** - Complete ERP kernel with 181 concepts, 68 value sets, 307 values

#### Packs (14 total)

**ADMIN** (1 pack):
  - `admin` v1.0.0: 20 concepts, 6 value sets, 22 values

**ASSET** (1 pack):
  - `asset` v1.0.0: 11 concepts, 5 value sets, 21 values

**COMPLIANCE** (1 pack):
  - `compliance` v1.0.0: 12 concepts, 4 value sets, 14 values

**CORE** (1 pack):
  - `core` v1.0.0: 13 concepts, 7 value sets, 33 values

**FINANCE** (1 pack):
  - `finance` v1.0.1: 13 concepts, 3 value sets, 18 values

**HR** (1 pack):
  - `hr` v1.0.0: 18 concepts, 6 value sets, 25 values

**INVENTORY** (1 pack):
  - `inventory` v1.0.0: 6 concepts, 3 value sets, 15 values

**MANUFACTURING** (1 pack):
  - `manufacturing` v1.0.0: 11 concepts, 4 value sets, 17 values

**PAYMENTS** (1 pack):
  - `payments` v1.0.0: 12 concepts, 6 value sets, 29 values

**PROJECT** (1 pack):
  - `project` v1.0.0: 12 concepts, 5 value sets, 23 values

**PURCHASE** (1 pack):
  - `purchase` v1.0.0: 14 concepts, 5 value sets, 25 values

**SALES** (1 pack):
  - `sales` v1.0.0: 16 concepts, 6 value sets, 28 values

**TAX** (1 pack):
  - `tax` v1.0.0: 9 concepts, 4 value sets, 17 values

**WAREHOUSE** (1 pack):
  - `warehouse` v1.0.0: 15 concepts, 4 value sets, 20 values

### Infrastructure

- **Pack-based generation** - Industrialized kernel generation from JSON packs
- **Invariants A-F** - Automated quality gates (uniqueness, continuity, semantics, line concepts, overwrite policy, naming)
- **Priority & authoritative_for** - Cross-pack conflict resolution
- **14 production packs** - Core, Finance, Inventory, Sales, Purchase, Manufacturing, HR, Project, Asset, Tax, Payments, Warehouse, Admin, Compliance


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
