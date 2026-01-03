# CI/CD Documentation

## Overview

The `@aibos/kernel` project uses GitHub Actions for continuous integration and deployment. All workflows are configured to ensure code quality, security, and reliability.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **TypeScript Type Check** - Validates type safety
2. **Lint Check** - Code style validation (if configured)
3. **Unit Tests** - Runs test suite with coverage across Node.js 18, 20, and 22
4. **Build Verification** - Ensures package builds successfully
5. **Kernel Integrity Check** - Validates kernel registry integrity

**Coverage Gates:**
- Minimum coverage threshold: **95%** (statements, functions, branches, lines)
- Coverage is enforced by `vitest.config.ts`
- Tests will fail if coverage drops below threshold

### Security Workflow (`.github/workflows/security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Mondays at midnight UTC)

**Jobs:**
1. **Dependency Vulnerability Scan** - `pnpm audit` for known vulnerabilities
2. **Snyk Security Scan** - Advanced security analysis (requires `SNYK_TOKEN`)
3. **Secret Scanning** - TruffleHog for exposed secrets
4. **CodeQL Analysis** - Static security analysis
5. **License Compliance** - Verifies LICENSE file exists

**Security Gates:**
- High or critical vulnerabilities will fail the workflow
- Moderate vulnerabilities are reported but don't block

### Performance Workflow (`.github/workflows/performance.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Daily schedule (2 AM UTC)

**Jobs:**
1. **Performance Benchmarks** - Runs performance test suite
2. **Bundle Size Check** - Verifies bundle size < 500KB
3. **Memory Usage Tracking** - Monitors memory consumption

**Performance Gates:**
- Performance tests must pass (<10ms p95 latency target)
- Bundle size must be < 500KB
- Performance regressions will fail the workflow

### Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push to `main` branch (after CI passes)
- Skips if commit message contains `[skip ci]`

**Jobs:**
1. **Semantic Release** - Automated versioning and publishing
2. **NPM Publishing** - Publishes to npm registry
3. **Release Notes** - Generates changelog and release notes
4. **Version Tagging** - Creates git tags for releases

**Requirements:**
- `GITHUB_TOKEN` - For creating releases and tags
- `NPM_TOKEN` - For publishing to npm (stored in secrets)

### Quality Workflow (`.github/workflows/quality.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Type Coverage Analysis** - Ensures type safety
2. **Documentation Check** - Verifies README.md exists
3. **Bundle Analysis** - Reports bundle size metrics
4. **Code Quality Report** - Generates quality metrics summary

## Required Status Checks

The following checks must pass before merging:

- ✅ TypeScript Type Check
- ✅ Unit Tests (all Node.js versions)
- ✅ Build Verification
- ✅ Kernel Integrity Check
- ✅ Security Scan (no high/critical vulnerabilities)
- ✅ Performance Benchmarks (if applicable)

## Branch Protection

The `main` branch is protected with the following rules:

- Require status checks to pass before merging
- Require branches to be up to date
- Require pull request reviews (if configured)

## Coverage Reporting

Coverage reports are generated using Vitest with v8 provider:

- **Text Report** - Console output
- **HTML Report** - `coverage/index.html`
- **JSON Report** - `coverage/coverage-final.json`
- **LCOV Report** - `coverage/lcov.info` (for Codecov)

Coverage thresholds (enforced in `vitest.config.ts`):
- Lines: 95%
- Functions: 95%
- Branches: 95%
- Statements: 95%

## Secrets

The following secrets are required for full CI/CD functionality:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `NPM_TOKEN` - NPM authentication token (for publishing)
- `SNYK_TOKEN` - Snyk API token (optional, for advanced security scanning)
- `CODECOV_TOKEN` - Codecov token (optional, for coverage reporting)

## Local Testing

To test workflows locally before pushing:

```bash
# Run all CI checks locally
pnpm typecheck
pnpm test:ci
pnpm build
pnpm validate:kernel

# Check coverage
pnpm test:coverage

# Security audit
pnpm audit --audit-level=high
```

## Troubleshooting

### Coverage Below Threshold

If coverage drops below 95%, the CI will fail. To fix:

1. Run `pnpm test:coverage` locally
2. Review the coverage report
3. Add tests for uncovered code
4. Re-run tests to verify coverage improvement

### Security Vulnerabilities

If security scan finds vulnerabilities:

1. Review the vulnerability report
2. Update dependencies: `pnpm update`
3. Check for security patches: `pnpm audit fix`
4. If no fix available, document the risk and mitigation

### Performance Regression

If performance tests fail:

1. Review performance test output
2. Identify the slow operation
3. Optimize the code
4. Re-run performance tests

### Build Failures

If build fails:

1. Check TypeScript errors: `pnpm typecheck`
2. Verify all dependencies installed: `pnpm install`
3. Check for missing files or incorrect paths
4. Review build logs for specific errors

## Best Practices

1. **Always run tests locally** before pushing
2. **Check coverage** before submitting PRs
3. **Review security reports** regularly
4. **Monitor performance** benchmarks for regressions
5. **Keep dependencies updated** to avoid vulnerabilities
6. **Follow semantic versioning** for releases
7. **Update CHANGELOG.md** for user-facing changes

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)

