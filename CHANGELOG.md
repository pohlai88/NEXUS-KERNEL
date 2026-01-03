# Changelog

All notable changes to `@aibos/kernel` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-01-03

### Added

- **Next.js Integration** (`@aibos/kernel/nextjs`) - Complete Next.js App Router integration
  - Middleware utilities for kernel validation (`withKernelValidation`, `kernelValidationMiddleware`)
  - Server Components with automatic caching (`getCachedConcepts`, `getCachedValueSets`, `getCachedValues`)
  - Route handlers for API endpoints (`handleGetConcepts`, `handleGetValueSets`, `handleGetValues`, etc.)
  - Custom cache strategy utilities (`createKernelCache`, `revalidateKernelTag`, `revalidateAllKernelCaches`)
  - 100% test coverage for Next.js modules (30+ tests)

- **Supabase Database Integration** - Production-grade database features
  - `kernel_metadata` table for storing kernel concepts, valuesets, and values
  - Row Level Security (RLS) policies for multi-tenant security
  - TypeScript integration (`syncKernelToDatabase`, `syncConceptsToDatabase`, etc.)
  - Security fixes for all RPC functions (fixed `search_path` vulnerability, input validation)
  - Cache performance optimizations (covering indexes, unused index removal)
  - 3 database migrations created and tested

- **Schema Versioning & Migration System** (`@aibos/kernel/migration`) - Version management
  - Version compatibility matrix for semantic versioning
  - Migration engine with rollback support (`executeMigration`, `rollbackMigration`)
  - Breaking change detection (`detectBreakingChanges`, `validateMigration`)
  - Deprecation warnings and migration guidance
  - 86.76% test coverage (21 tests)

- **Supabase Edge Functions** - Serverless kernel operations
  - `validate-kernel` function for kernel integrity validation
  - `sync-kernel` function for database synchronization

- **Comprehensive Testing** - Production-grade test coverage
  - 58+ new tests across all new modules
  - Next.js integration tests (100% coverage)
  - Migration system tests (86.76% coverage)
  - Kernel metadata tests (16 tests)

- **Enhanced Documentation** - Complete integration guides
  - Next.js integration guide with 4 patterns and examples
  - Migration guide with CLI and programmatic APIs
  - Full-stack examples and best practices
  - Performance comparison tables

### Changed

- **Security** - Fixed all Supabase security vulnerabilities
  - All RPC functions now have fixed `search_path` and input validation
  - SQL injection protection via parameterized queries
  - Function-level security policies

- **Performance** - Optimized database queries
  - Removed unused indexes
  - Created covering indexes for common query patterns
  - Optimized cache cleanup operations

- **Type Safety** - Enhanced Supabase client types
  - Extended `SupabaseClient` interface to support all required methods
  - Proper query builder types for update/upsert operations

### Infrastructure

- **Kernel v1.1.0** - Complete ERP kernel with 182 concepts, 72 value sets, 624 values

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
