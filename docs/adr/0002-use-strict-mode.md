# Use TypeScript Strict Mode

* **Status:** Accepted
* **Date:** 2026-01-01
* **Deciders:** Architecture Team, Core Maintainers
* **Consulted:** Development Team

## Context and Problem Statement

The Kernel is the L0 SSOT (Single Source of Truth) for all platform metadata. Type safety is critical to prevent semantic drift and ensure compile-time validation. We need to choose a TypeScript configuration that maximizes type safety while maintaining developer productivity.

## Decision Drivers

* Type safety is paramount for SSOT integrity
* Need to catch errors at compile-time, not runtime
* Zero tolerance for `any` types in kernel code
* Developer experience should not be compromised
* Compliance with industrial best practices

## Considered Options

* **Option 1:** TypeScript with default settings
* **Option 2:** TypeScript with `strict: true` (all strict flags enabled)
* **Option 3:** TypeScript with selective strict flags
* **Option 4:** Use additional type checking tools (e.g., ESLint rules)

## Decision Outcome

Chosen option: **Option 2**, because:
- Enables all strict type checking flags (`strictNullChecks`, `strictFunctionTypes`, `noImplicitAny`, etc.)
- Catches type errors at compile-time, preventing runtime failures
- Ensures zero `any` types in kernel code
- Provides maximum type safety for SSOT layer
- Industry standard for mission-critical TypeScript projects

### Positive Consequences

* Compile-time detection of type errors
* Prevents null/undefined bugs
* Forces explicit type annotations
* Better IDE autocomplete and refactoring
* Zero runtime type errors from kernel code

### Negative Consequences

* Slightly more verbose code (explicit types required)
* Initial migration effort for existing code
* Some developers may need to learn strict TypeScript patterns

## Links

* [TypeScript Strict Mode Documentation](https://www.typescriptlang.org/tsconfig#strict)
* [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

