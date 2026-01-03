# Documentation Index

Welcome to the `@aibos/kernel` documentation. This directory contains comprehensive documentation following industrial best practices.

## Quick Navigation

### 🚀 Getting Started
- **[Getting Started Guide](./guides/getting-started.md)** - "Hello World" tutorial
- **[Usage Guide](./guides/usage.md)** - Practical examples and patterns
- **[Glossary](./guides/glossary.md)** - Ubiquitous Language (with code links)

### 🏗️ Architecture
- **[System Architecture](./architecture/overview.md)** - C4 Model diagrams and system design
- **[Layer Model](./architecture/layer-model.md)** - L0/L1/L2/L3 explanation
- **[Design Principles](./architecture/design-principles.md)** - Core architectural principles

### 📋 Architecture Decisions
- **[ADR Index](./adr/README.md)** - Architecture Decision Records
- **[ADR 0001](./adr/0001-record-architecture.md)** - Record Architecture Decisions
- **[ADR 0002](./adr/0002-use-strict-mode.md)** - Use TypeScript Strict Mode
- **[ADR 0003](./adr/0003-zod-for-schema-validation.md)** - Use Zod for Schema Validation

### 📚 Guides
- **[Getting Started](./guides/getting-started.md)** - Quick start
- **[Usage Guide](./guides/usage.md)** - Usage patterns
- **[Packs Guide](./guides/packs.md)** - Pack system
- **[Scripts Guide](./guides/scripts.md)** - Script documentation
- **[Development Guide](./guides/development.md)** - Development workflow
- **[Migration Guide](./guides/migration.md)** - Version migration
- **[Troubleshooting](./guides/troubleshooting.md)** - Common issues
- **[Glossary](./guides/glossary.md)** - Ubiquitous Language
- **[Advanced Guides](./guides/advanced/)** - Advanced modules

### ⚖️ Governance
- **[Contributing](./governance/contributing.md)** - Contribution guidelines
- **[Release Process](./governance/release-process.md)** - Versioning and releases
- **[Security Policy](./governance/security.md)** - Security guidelines
- **[Code Standards](./governance/code-standards.md)** - Coding conventions
- **[Automation](./governance/automation.md)** - Documentation automation setup

### 📖 Reference
- **[Schema Reference](./reference/schemas.md)** - Zod schema reference
- **[Configuration Reference](./reference/configuration.md)** - Configuration files
- **Original PRDs** - Product Requirements Documents
  - **[PRD: NPM Package](./PRD-KERNEL_NPM.md)** - Original PRD for NPM package
  - **[PRD: ERP Production Ready](./PRD-KERNEL_ERP_PRODUCTION_READY.md)** - Original PRD for ERP expansion
- **[Kernel Doctrine](./NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core doctrine and architectural principles

### 📊 Project Status
- **[Current Status](./status/current-status.md)** - Latest project status analysis
- **[Metrics Dashboard](./status/metrics-dashboard.md)** - Key performance indicators

## Documentation Structure

```
docs/
├── adr/              # Architecture Decision Records (immutable)
├── architecture/     # System architecture (C4 Model)
├── guides/           # Developer guides
├── governance/      # Policies and standards
├── reference/       # Reference documentation
├── status/          # Project status reports
├── PRD-KERNEL_NPM.md                    # Original PRD: NPM Package
├── PRD-KERNEL_ERP_PRODUCTION_READY.md   # Original PRD: ERP Production Ready
└── NEXUS_CANON_V5_KERNEL_DOCTRINE.md    # Core doctrine
```

## Documentation Standards

- **Format:** Markdown with Mermaid diagrams
- **ADR Format:** Michael Nygard template
- **Architecture:** C4 Model with Mermaid
- **Glossary:** Bi-directional code links
- **Auto-Generated:** API docs (TypeDoc), Changelog (Semantic Release)

## Related Links

- [Main README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [CHANGELOG](../CHANGELOG.md)

