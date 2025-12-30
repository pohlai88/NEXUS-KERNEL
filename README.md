# AIBOS Nexus Kernel

**Business Operating System - Kernel Canon Implementation**

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build
pnpm build
```

---

## Documentation

**📚 All documentation is organized in the [`docs/`](docs/) directory.**

### Key Documents

- **Documentation Standards:** [`docs/DOCUMENTATION_STANDARDS.md`](docs/DOCUMENTATION_STANDARDS.md) - Rules and guidelines
- **Documentation Registry:** [`docs/DOCUMENTATION_REGISTRY.md`](docs/DOCUMENTATION_REGISTRY.md) - Complete file inventory
- **Kernel Doctrine:** [`docs/ssot/db/NEXUS_CANON_V5_KERNEL_DOCTRINE.md`](docs/ssot/db/NEXUS_CANON_V5_KERNEL_DOCTRINE.md) - Absolute authority (referenced)
- **Database Guardrails:** [`docs/ssot/db/DB_GUARDRAIL_MATRIX.md`](docs/ssot/db/DB_GUARDRAIL_MATRIX.md) (referenced)
- **PRD:** [`docs/ssot/PRD_KERNEL_NEXUS_CANON.md`](docs/ssot/PRD_KERNEL_NEXUS_CANON.md) (referenced)

### Documentation Structure

```
docs/
├── DOCUMENTATION_STANDARDS.md  # Documentation rules and guidelines
├── DOCUMENTATION_REGISTRY.md   # Master registry
├── ssot/                       # Single Source of Truth documents
├── development/                # Development guides
├── architecture/               # Architecture decisions
├── integrations/               # Integration guides
└── reports/                    # Audit and optimization reports
    └── archive/                # Historical reports
```

**See [`docs/DOCUMENTATION_REGISTRY.md`](docs/DOCUMENTATION_REGISTRY.md) for complete file inventory.**

---

## Packages

- `@nexus/kernel` - Kernel SDK (types, builders, validators)
- `@nexus/cruds` - CRUD-S operations factory
- `@nexus/ui-actions` - UI action registry and helpers
- `@nexus/eslint-plugin-canon` - ESLint rules for Canon compliance

---

## Status

✅ **GODVIEW Implementation:** Complete (Phase 1-4)  
✅ **Design System:** AIBOS + NextUI integrated  
✅ **Documentation:** Organized and registered

---

**Last Updated:** 2025-01-22

