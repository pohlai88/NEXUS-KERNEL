## Description

<!-- Describe what this PR does -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to break)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration/tooling change
- [ ] 🛡️ Kernel registry change (L0 modification)

## Kernel Doctrine Checklist

> **Phase 1 L2 Enforced** - All PRs must pass these checks.

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm audit:no-drift` passes (no orphan CONCEPT*\*/VALUESET*\* tokens)
- [ ] Portal tests pass (`cd apps/portal && pnpm test`)

### If modifying L0 Kernel (concepts/value sets):

- [ ] Migration added to `apps/portal/supabase/migrations/`
- [ ] Registry snapshot regenerated: `pnpm kernel:export-snapshot`
- [ ] Documentation updated in `docs/development/KERNEL_PHASE_1_SUMMARY.md`
- [ ] Team review completed (L0 changes require explicit approval)

## Testing

<!-- Describe the tests you ran -->

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->
