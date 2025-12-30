# Documentation Registry

**Version:** 1.1.0  
**Last Updated:** 2025-12-30  
**Status:** Active

---

## Purpose

This registry tracks all documentation in the repository, ensuring:
- No duplicates
- Proper categorization
- Version control
- Easy discovery

---

## Documentation Structure

```
docs/
├── ssot/              # Single Source of Truth documents
│   └── db/           # Database SSOT documents
├── development/      # Development guides and protocols
├── architecture/     # Architecture decisions and assessments
├── integrations/     # Integration guides (AIBOS, NextUI, Supabase)
├── reports/          # Audit and optimization reports
│   └── archive/      # Historical/duplicate reports
└── DOCUMENTATION_REGISTRY.md (this file)
```

---

## SSOT Documents (Single Source of Truth)

**Location:** `docs/ssot/`

**Note:** Some SSOT documents are referenced in `.cursorrules` and may not yet be present in repository.  
**Location:** `docs/ssot/db/`

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `db/NEXUS_CANON_V5_KERNEL_DOCTRINE.md` | 5.1.0 | ✅ Active | Absolute authority for Kernel Doctrine (Gold Master / SSOT) |
| `db/DB_GUARDRAIL_MATRIX.md` | 1.1.0 | ✅ Active | Database guardrails and constraints (SSOT operational matrix) |
| `db/JSONB_CONTRACT_REGISTRY.md` | 1.0.0 | ✅ Active | Detailed JSONB contract definitions with Zod schemas (Annex to DB_GUARDRAIL_MATRIX.md) |
| `PRD_KERNEL_NEXUS_CANON.md` | 1.0 | ⚠️ Referenced | Product requirements for Kernel Canon (referenced in .cursorrules) |

---

## Development Documentation

**Location:** `docs/development/`

**Note:** Development guides referenced in registry but not yet present in repository.  
**Expected Location:** `docs/development/` when created.

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `VMP_TO_NA_MIGRATION_GUIDE.md` | 1.0 | ⚠️ Referenced | Migration guide from vmp- to na- classes |
| `TODO_MCP_BEST_PRACTICES.md` | 1.0 | ⚠️ Referenced | MCP best practices and guidelines |
| `SHIP1.0.md` | 1.0 | ⚠️ Referenced | Shipping standards and requirements |

---

## Architecture Documentation

**Location:** `docs/architecture/`

**Note:** Architecture documents referenced in registry but not yet present in repository.  
**Expected Location:** `docs/architecture/` when created.

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `AIBOS_DESIGN_SYSTEM_EVALUATION.md` | 1.0 | ⚠️ Referenced | AIBOS design system evaluation |
| `AIBOS_DESIGN_SYSTEM_FINAL_DECISION.md` | 1.0 | ⚠️ Referenced | Final decision on AIBOS adoption |
| `AIBOS_DESIGN_SYSTEM_WORKFLOW.md` | 1.0 | ⚠️ Referenced | AIBOS design system workflow |
| `AIBOS_FINAL_DECISION_SUMMARY.md` | 1.0 | ⚠️ Referenced | Summary of AIBOS decision |
| `GODVIEW_IMPLEMENTATION_COMPLETE.md` | 1.0 | ⚠️ Referenced | GODVIEW implementation status |

---

## Integration Guides

**Location:** `docs/integrations/`

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `aibos/AIBOS_HEADLESS_APPLICATION.md` | 1.0 | ✅ Active | AIBOS headless application guide |
| `aibos/AIBOS_NEXTUI_INTEGRATION_GUIDE.md` | 1.0 | ✅ Active | AIBOS + NextUI integration guide |
| `aibos/AIBOS_IMPLEMENTATION_REPORT.md` | 1.0 | ✅ Active | AIBOS implementation report |
| `figma/FIGMA_AIBOS_HEADLESS_INTEGRATION.md` | 1.0 | ✅ Active | Figma AIBOS headless integration guide |
| `nextui/NEXTUI_STATUS_INDICATOR_REQUIREMENTS.md` | 1.0 | ✅ Active | NextUI status indicator requirements |
| `nextjs/NEXTJS_DESIGN_SYSTEM_IMPROVEMENTS.md` | 1.0 | ✅ Active | Next.js design system improvements |
| `nextjs/NEXTJS_MCP_AUDIT_REPORT_2025-12-30.md` | 1.0 | ✅ Active | Next.js MCP comprehensive audit report |
| `nextjs/UI_UX_IMPROVEMENTS.md` | 1.0 | ✅ Active | UI/UX improvements guide |
| `nextjs/PERFORMANCE_MONITORING_SETUP.md` | 1.0 | ✅ Active | Performance monitoring setup guide |
| `nextjs/MCP_EFFICIENCY_TRACKER.md` | 1.0 | ✅ Active | MCP efficiency tracking document |
| `supabase/SUPABASE_MCP_OPTIMIZATION_REPORT.md` | 1.0 | ✅ Active | Supabase optimization report |
| `STRATEGIC_ADJUSTMENTS.md` | 1.0 | ✅ Active | Strategic adjustments documentation |
| `VENDOR_PORTAL_IMPLEMENTATION_COMPLETE.md` | 1.0 | ✅ Active | Vendor portal implementation complete report |

## Standards & Meta Documentation

**Location:** `docs/`

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `DOCUMENTATION_STANDARDS.md` | 1.0.0 | ✅ Active | Rules and guidelines for documentation |
| `DOCUMENTATION_REGISTRY.md` | 1.0.0 | ✅ Active | Master registry of all documentation |
| `COMPLIANCE_REPORT.md` | 1.0.0 | ✅ Active | Documentation standards compliance report |

---

## Reports

**Location:** `docs/reports/`

### Active Reports

| Document | Version | Status | Description |
|----------|---------|--------|-------------|
| `PRD_KERNEL_NEXUS_CANON_COMPLIANCE_REPORT.md` | 1.0 | ⚠️ Referenced | PRD compliance report (referenced in registry) |
| `NEXTJS_MCP_OPTIMIZATION_REPORT.md` | 1.0 | ⚠️ Referenced | Next.js optimization report (referenced in registry) |

### Archived Reports

**Location:** `docs/reports/archive/`

**Historical Cleanup Files:**
| Document | Version | Status | Reason |
|----------|---------|--------|--------|
| `ACTUAL_FILE_INVENTORY.md` | 1.0 | 📦 Archived | Historical cleanup inventory (2025-12-30) |
| `CLEANUP_COMPLETE.md` | 1.0 | 📦 Archived | Historical cleanup completion report (2025-12-30) |
| `CLEANUP_SUMMARY.md` | 1.0 | 📦 Archived | Historical cleanup summary (2025-12-30) |
| `FINAL_CLEANUP_STATUS.md` | 1.0 | 📦 Archived | Historical cleanup status (2025-12-30) |
| `REPOSITORY_CLEANUP_REPORT.md` | 1.0 | 📦 Archived | Historical cleanup report (2025-12-30) |

**Next.js Audit Iteration Files:**
| Document | Version | Status | Reason |
|----------|---------|--------|--------|
| `AUDIT_QUALITY_FAILURE_LETTER.md` | 1.0 | 📦 Archived | Critique letter - corrections applied to main report (2025-12-30) |
| `AUDIT_REPORT_CORRECTIONS_DIFF.md` | 1.0 | 📦 Archived | Corrections diff - incorporated into main report (2025-12-30) |
| `AUDIT_REPORT_CRITIQUE_AND_EVIDENCE.md` | 1.0 | 📦 Archived | Critique with evidence - corrections applied (2025-12-30) |
| `AUDIT_REPORT_CRITIQUE_RESPONSE.md` | 1.0 | 📦 Archived | Response to critique - corrections applied (2025-12-30) |
| `AUDIT_REPORT_OPTIMIZATION_SUMMARY.md` | 1.0 | 📦 Archived | Optimization summary - incorporated into main report (2025-12-30) |
| `NEXTJS_MCP_AUDIT_REQUEST.md` | 1.0 | 📦 Archived | Audit request - audit completed (2025-12-30) |

**MCP Setup Files:**
| Document | Version | Status | Reason |
|----------|---------|--------|--------|
| `MCP_INTEGRATION_SUMMARY.md` | 1.0 | 📦 Archived | Setup summary - historical, setup complete (2025-12-30) |
| `MCP_TOOL_USAGE_CORRECTION.md` | 1.0 | 📦 Archived | Tool usage correction - corrections applied (2025-12-30) |

**Vendor Portal Duplicate Files:**
| Document | Version | Status | Reason |
|----------|---------|--------|--------|
| `VENDOR_PORTAL_FINAL_REPORT.md` | 1.0 | 📦 Archived | Duplicate - consolidated into VENDOR_PORTAL_IMPLEMENTATION_COMPLETE.md (2025-12-30) |
| `VENDOR_PORTAL_IMPLEMENTATION_SUMMARY.md` | 1.0 | 📦 Archived | Duplicate - consolidated into VENDOR_PORTAL_IMPLEMENTATION_COMPLETE.md (2025-12-30) |
| `VENDOR_PORTAL_IMPLEMENTATION_COMPLIANCE.md` | 1.0 | 📦 Archived | Duplicate - consolidated into VENDOR_PORTAL_IMPLEMENTATION_COMPLETE.md (2025-12-30) |
| `VENDOR_PORTAL_MCP_AUDIT.md` | 1.0 | 📦 Archived | Historical MCP audit - superseded (2025-12-30) |
| `VENDOR_PORTAL_MCP_DIFFS.md` | 1.0 | 📦 Archived | Historical MCP diffs - superseded (2025-12-30) |

**Legacy Reports (Referenced but not yet archived):**
| Document | Version | Status | Reason |
|----------|---------|--------|--------|
| `MCP_AUDIT_REPORT.md` | 1.0 | 📦 Archived | Duplicate - consolidated into NEXTJS_MCP_AUDIT_REPORT.md |
| `WORKSPACE_AUDIT_REPORT.md` | 1.0 | 📦 Archived | Duplicate - consolidated into NEXTJS_MCP_AUDIT_REPORT.md |
| `NEXTJS_MCP_AUDIT_REPORT.md` | 1.0 | 📦 Archived | Superseded by NEXTJS_MCP_OPTIMIZATION_REPORT.md |
| `NEXTJS_MCP_COMPLIANCE_DIFF.md` | 1.0 | 📦 Archived | Superseded by PRD_KERNEL_NEXUS_CANON_COMPLIANCE_REPORT.md |

---

## Root Directory Files

**Allowed in Root:**
- `README.md` - Project README (ONLY markdown file allowed in root)
- Configuration files (package.json, tsconfig.json, etc.)

**Forbidden in Root:**
- ❌ Any other `.md` files (must be in `docs/`)
- ❌ Duplicate documentation
- ❌ Unversioned documentation

---

## Version Control

**Version Format:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes or major rewrites
- **MINOR:** New sections or significant additions
- **PATCH:** Corrections, clarifications, minor updates

**Version History:**
- Track in document header
- Update registry when version changes
- Archive old versions if major rewrite

---

## Maintenance Rules

1. **No Duplicates:** If content overlaps, consolidate or archive
2. **Single Source:** Each topic has ONE authoritative document
3. **Proper Location:** Files must be in correct `docs/` subdirectory
4. **Version Tracking:** All documents must have version in header
5. **Registry Updates:** Update this registry when adding/moving files

---

## File Naming Convention

**Format:** `UPPERCASE_WITH_UNDERSCORES.md`

**Examples:**
- ✅ `NEXUS_CANON_V5_KERNEL_DOCTRINE.md`
- ✅ `AIBOS_DESIGN_SYSTEM_EVALUATION.md`
- ❌ `aibos-design-system.md` (wrong case)
- ❌ `AIBOS Design System.md` (spaces)

---

## Discovery Guide

**Looking for:**
- **Kernel Doctrine?** → `docs/ssot/db/NEXUS_CANON_V5_KERNEL_DOCTRINE.md`
- **Database Rules?** → `docs/ssot/db/DB_GUARDRAIL_MATRIX.md`
- **JSONB Contracts?** → `docs/ssot/db/JSONB_CONTRACT_REGISTRY.md`
- **PRD Requirements?** → `docs/ssot/PRD_KERNEL_NEXUS_CANON.md`
- **AIBOS Integration?** → `docs/integrations/aibos/`
- **Next.js Guides?** → `docs/integrations/nextjs/`
- **Audit Reports?** → `docs/reports/`

---

**Registry Maintained By:** Repository Maintainers  
**Last Audit:** 2025-12-30  
**Next Review:** After major documentation changes

---

## Recent Cleanup (2025-12-30)

**Action:** Archived 19 legacy, duplicate, and deprecated files to `docs/reports/archive/`

**Files Archived:**
- 5 historical cleanup files (CLEANUP_*, FINAL_*, REPOSITORY_*, ACTUAL_*)
- 6 Next.js audit iteration files (AUDIT_* critique/correction files)
- 2 MCP setup files (MCP_INTEGRATION_SUMMARY, MCP_TOOL_USAGE_CORRECTION)
- 5 Vendor Portal duplicate files (consolidated into VENDOR_PORTAL_IMPLEMENTATION_COMPLETE.md)
- 1 Next.js audit request (audit completed)

**Result:** Clean documentation structure with only active, current files in main directories.

