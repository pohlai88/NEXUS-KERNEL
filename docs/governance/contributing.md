# Contributing Guidelines

Thank you for contributing to `@aibos/kernel`! This document outlines the contribution process and standards.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Maintenance & Support](#maintenance--support)
- [Deprecation Policy](#deprecation-policy)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Follow the project's coding standards
- Respect the SSOT principle (no downstream redefinition)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (preferred) or npm
- TypeScript 5.7+
- Git

### Setup

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

## Development Process

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Follow [Code Standards](#code-standards)
   - Write tests for new features
   - Update documentation

3. **Validate Changes**
   ```bash
   pnpm validate:kernel
   pnpm test
   pnpm typecheck
   ```

4. **Commit Changes**
   - Use [Conventional Commits](https://www.conventionalcommits.org/)
   - Format: `type(scope): description`
   - Examples:
     - `feat(concepts): add new INVOICE concept`
     - `fix(validation): correct snapshot ID calculation`
     - `docs(guides): update usage examples`

5. **Push and Create PR**
   - Push to your fork
   - Create pull request to `main`
   - Reference related issues

## Code Standards

### TypeScript

- **Strict Mode Required** - All strict flags enabled
- **No `any` Types** - Use proper types or `unknown`
- **No Raw Strings** - Always use kernel exports
- **Type Safety First** - Compile-time validation

### Naming Conventions

- **Concepts:** `UPPERCASE_SNAKE_CASE` (e.g., `INVOICE`)
- **Value Sets:** `UPPERCASE_SNAKE_CASE` (e.g., `ACCOUNT_TYPE`)
- **Values:** `UPPERCASE_SNAKE_CASE` (e.g., `ASSET`)
- **Functions:** `camelCase` (e.g., `validateKernelIntegrity`)
- **Types:** `PascalCase` (e.g., `ConceptCategory`)

### File Structure

```
src/
├── concepts.ts          # Concept definitions
├── values.ts            # Value set and value definitions
├── kernel.contract.ts   # Frozen contract schemas
├── kernel.validation.ts # Validation functions
└── [module].ts          # Module-specific code
```

### Code Generation

- **Never edit generated files manually**
- Edit source data (pack JSON files) instead
- Run `pnpm generate` to regenerate code
- Commit both source and generated files

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use Vitest for testing
- Test both positive and negative cases

## Pull Request Process

### PR Requirements

- [ ] Code follows style guidelines
- [ ] Tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Kernel validation passes (`pnpm validate:kernel`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
- [ ] No breaking changes (or clearly documented)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. Address review comments
4. Maintainer approval before merge

## Maintenance & Support

### Support Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and discussions
- **Documentation** - Check guides first

### Maintenance Windows

- Regular maintenance: Monthly
- Security updates: As needed
- Major releases: Quarterly (planned)

### Support Policy

- **Current Version:** Full support
- **Previous Major Version:** Security fixes only
- **Older Versions:** No support

## Deprecation Policy

### Deprecation Process

1. **Announcement** - Deprecation notice in CHANGELOG
2. **Warning Period** - At least one minor version
3. **Removal** - Next major version

### Example

```typescript
// v1.1.0 - Deprecated
/**
 * @deprecated Use CONCEPT.NEW_NAME instead
 * Will be removed in v2.0.0
 */
export const OLD_CONCEPT = "CONCEPT_OLD";

// v2.0.0 - Removed
// OLD_CONCEPT no longer exists
```

## Related Documentation

- **[Code Standards](./code-standards.md)** - Coding conventions
- **[Release Process](./release-process.md)** - Versioning and releases
- **[Security Policy](./security.md)** - Security guidelines
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Getting Started Guide](../guides/getting-started.md)** - Quick start
- **[Architecture Decision Records](../adr/README.md)** - Design decisions

