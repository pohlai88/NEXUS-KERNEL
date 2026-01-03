# Contributing to @aibos/kernel

Thank you for your interest in contributing! This is the "door" to the project.

## Quick Start

1. **Read the [Contributing Guidelines](docs/governance/contributing.md)** - Full details
2. **Set up your environment** - See [Development Setup](#development-setup)
3. **Pick an issue** - Check [GitHub Issues](https://github.com/pohlai88/NEXUS-KERNEL/issues)
4. **Make your changes** - Follow [Code Standards](docs/governance/code-standards.md)
5. **Submit a PR** - See [Pull Request Process](docs/governance/contributing.md#pull-request-process)

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

- [ ] Code follows [Code Standards](docs/governance/code-standards.md)
- [ ] Tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Kernel validation passes (`pnpm validate:kernel`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)

## Getting Help

- **Documentation** - Check [docs/](docs/) directory
- **Issues** - [GitHub Issues](https://github.com/pohlai88/NEXUS-KERNEL/issues)
- **Discussions** - [GitHub Discussions](https://github.com/pohlai88/NEXUS-KERNEL/discussions)

## Related Documentation

- **[Full Contributing Guidelines](docs/governance/contributing.md)** - Complete contribution process
- **[Code Standards](docs/governance/code-standards.md)** - Coding conventions
- **[Release Process](docs/governance/release-process.md)** - Versioning and releases
- **[Security Policy](docs/governance/security.md)** - Security guidelines
- **[Automation Setup](docs/governance/automation.md)** - Documentation automation (TypeDoc, Semantic Release, SSG)
- **[Getting Started Guide](docs/guides/getting-started.md)** - Quick start tutorial

---

**Remember:** The Kernel is the L0 SSOT. Changes here affect the entire platform. Please review the [Architecture Documentation](docs/architecture/overview.md) before making significant changes.

