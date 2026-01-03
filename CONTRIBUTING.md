# Contributing to @aibos/kernel

Thank you for your interest in contributing! This is the "door" to the project.

## Quick Start

1. **Set up your environment** - See [Development Setup](#development-setup)
2. **Pick an issue** - Check [GitHub Issues](https://github.com/pohlai88/NEXUS-KERNEL/issues)
3. **Make your changes** - Follow [Key Principles](#key-principles)
4. **Submit a PR** - See [Pull Request Checklist](#pull-request-checklist)

## Development Setup

```bash
# Clone repository
git clone https://github.com/pohlai88/NEXUS-KERNEL.git
cd NEXUS-KERNEL

# Install dependencies
pnpm install

# Build project
pnpm build

# Run tests
pnpm test

# Validate kernel
pnpm validate:kernel
```

## Key Principles

- **Type Safety First** - No raw strings, strict TypeScript
- **SSOT Compliance** - Kernel defines existence, downstream uses it
- **Code Generation** - Edit pack JSON, not generated files
- **Automated Validation** - All checks must pass

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(concepts): add new INVOICE concept
fix(validation): correct snapshot ID calculation
docs(guides): update usage examples
```

## Pull Request Checklist

- [ ] Code follows [Key Principles](#key-principles)
- [ ] Tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Kernel validation passes (`pnpm validate:kernel`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)

## Getting Help

- **Documentation** - Check [README.md](./README.md) and [docs/](./docs/) directory
- **Issues** - [GitHub Issues](https://github.com/pohlai88/NEXUS-KERNEL/issues)
- **Discussions** - [GitHub Discussions](https://github.com/pohlai88/NEXUS-KERNEL/discussions)

## Related Documentation

- **[README.md](./README.md)** - Main project documentation with Next.js integration guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[PRD: NPM Package](./docs/PRD-KERNEL_NPM.md)** - Product requirements
- **[PRD: ERP Production Ready](./docs/PRD-KERNEL_ERP_PRODUCTION_READY.md)** - Production requirements
- **[Kernel Doctrine](./docs/NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core principles

---

**Remember:** The Kernel is the L0 SSOT. Changes here affect the entire platform. Please review the [Kernel Doctrine](./docs/NEXUS_CANON_V5_KERNEL_DOCTRINE.md) before making significant changes.

