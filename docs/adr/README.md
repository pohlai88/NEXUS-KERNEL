# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for `@aibos/kernel`.

## What are ADRs?

ADRs are immutable records of architectural decisions made on this project. They document:
- **Context** - Why the decision was needed
- **Decision** - What was chosen
- **Consequences** - Positive and negative outcomes

## Format

All ADRs follow the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-record-architecture.md) | Record Architecture Decisions | Accepted | 2026-01-01 |
| [0002](0002-use-strict-mode.md) | Use TypeScript Strict Mode | Accepted | 2026-01-01 |
| [0003](0003-zod-for-schema-validation.md) | Use Zod for Schema Validation | Accepted | 2026-01-01 |

## Status Values

- **Proposed** - Decision is under consideration
- **Accepted** - Decision has been made and implemented
- **Deprecated** - Decision is no longer in effect
- **Superseded** - Decision has been replaced by another ADR

## Creating a New ADR

1. Create a new file: `docs/adr/XXXX-title-of-decision.md`
2. Use the template from [ADR 0001](0001-record-architecture.md)
3. Update this README with the new ADR entry
4. Submit as part of your PR

## Tools

- [adr-tools](https://github.com/npryce/adr-tools) - CLI for managing ADRs
- [log4brains](https://github.com/thomvaill/log4brains) - ADR management and publication

## Related Documentation

- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Design Principles](../architecture/design-principles.md)** - Core principles
- **[Contributing Guidelines](../governance/contributing.md)** - How to contribute

