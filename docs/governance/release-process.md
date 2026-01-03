# Release Process

This document describes the versioning strategy and release workflow for `@aibos/kernel`.

## Versioning Strategy

The kernel follows [Semantic Versioning](https://semver.org/) (SemVer 2.0.0):

- **MAJOR** (x.0.0) - Breaking changes
  - Removed concepts/values
  - Renamed concepts/values
  - Changed contract structure
  - Changed API signatures

- **MINOR** (x.y.0) - Additive changes (backwards compatible)
  - New concepts
  - New value sets
  - New values
  - New utility functions

- **PATCH** (x.y.z) - Documentation/tooling only
  - Documentation updates
  - Bug fixes in tooling
  - Performance improvements
  - No registry changes

## Release Workflow

### Automated Release (Recommended)

The project uses **Semantic Release** for automated releases:

```bash
# Semantic Release automatically:
# 1. Analyzes commits (Conventional Commits)
# 2. Determines version bump
# 3. Generates CHANGELOG.md
# 4. Creates git tag
# 5. Publishes to NPM
```

### Manual Release

If manual release is needed:

```bash
# 1. Update version in package.json
npm version [major|minor|patch]

# 2. Generate changelog
pnpm changelog:generate

# 3. Build and validate
pnpm build
pnpm validate:kernel

# 4. Run tests
pnpm test

# 5. Publish to NPM
npm publish
```

## Pre-Release Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Kernel validation passes (`pnpm validate:kernel`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version updated in `package.json` and `src/version.ts`
- [ ] Snapshot ID matches expected
- [ ] No breaking changes (or clearly documented)

## Release Steps

### 1. Prepare Release

```bash
# Ensure clean working directory
git status

# Pull latest changes
git pull origin main

# Run validation
pnpm validate:kernel
```

### 2. Version Bump

```bash
# For patch release
npm version patch

# For minor release
npm version minor

# For major release
npm version major
```

### 3. Generate Changelog

```bash
pnpm changelog:generate
```

### 4. Build and Test

```bash
pnpm build
pnpm test
pnpm validate:kernel
```

### 5. Commit and Tag

```bash
git add .
git commit -m "chore: release v1.2.0"
git tag v1.2.0
git push origin main --tags
```

### 6. Publish

```bash
npm publish
```

## Post-Release

### Update Documentation

- Update README.md if needed
- Update migration guide if breaking changes
- Update architecture docs if structure changed

### Announce Release

- Create GitHub Release
- Update release notes
- Notify stakeholders if major version

## Conventional Commits

The project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning:

```
feat(scope): add new concept
fix(scope): fix validation bug
docs(scope): update documentation
chore(scope): update dependencies
```

**Types:**
- `feat` - New feature (minor version)
- `fix` - Bug fix (patch version)
- `docs` - Documentation (patch version)
- `chore` - Maintenance (patch version)
- `BREAKING CHANGE` - Breaking change (major version)

## Version Compatibility

### Backward Compatibility

- **Minor versions** are always backward compatible
- **Patch versions** are always backward compatible
- **Major versions** may break compatibility

### Migration Support

- Migration guides provided for major versions
- Deprecation warnings before removal
- At least one minor version warning period

## Related Documentation

- **[Contributing Guidelines](./contributing.md)** - Contribution process
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history
- **[Migration Guide](../guides/migration.md)** - Version migration
- **[Code Standards](./code-standards.md)** - Coding conventions
- **[Architecture Overview](../architecture/overview.md)** - System design

