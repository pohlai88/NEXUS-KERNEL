# Design Principles

Core architectural principles that guide all design decisions in `@aibos/kernel`.

## 1. Single Source of Truth (SSOT)

**Principle:** The Kernel is the **only** source of truth for platform metadata.

**Implications:**
- If it's not in `@aibos/kernel`, it doesn't exist
- All downstream systems must reference kernel exports
- No raw strings for concepts/values
- Database validates against kernel snapshot

**Enforcement:**
- TypeScript compile-time checks
- Runtime validation via `validateKernelIntegrity()`
- CI/CD drift detection

## 2. Immutability by Default

**Principle:** Kernel definitions are immutable. Changes require version bumps.

**Implications:**
- Concepts, values, and contracts are frozen
- Breaking changes = major version bump
- Additive changes = minor version bump
- Documentation/tooling = patch version bump

**Enforcement:**
- Frozen contract in `kernel.contract.ts`
- Semantic versioning
- Changelog tracking

## 3. Type Safety First

**Principle:** Zero raw strings. Everything is type-safe.

**Implications:**
- All concepts/values are TypeScript constants
- Compile-time validation prevents errors
- IDE autocomplete and refactoring support
- No `any` types in kernel code

**Enforcement:**
- TypeScript strict mode
- Zod schema validation
- Linter rules (no raw strings)

## 4. One-Way Truth Flow

**Principle:** Truth flows L0 → L1 → L2 → L3. Never reversed.

**Implications:**
- Downstream may restrict or execute
- Downstream may NOT redefine or rename
- Kernel defines existence, downstream uses it

**Enforcement:**
- Architecture documentation
- Code review process
- Layer validation

## 5. Pack-Based Architecture

**Principle:** Kernel is organized into domain packs.

**Implications:**
- Modular, parallelizable development
- Clear domain boundaries
- Pack priority for conflict resolution
- Authoritative pack declarations

**Enforcement:**
- Pack shape schema validation
- Generator script enforces structure
- Priority-based resolution

## 6. Industrialization

**Principle:** Code is generated from data tables, not hand-written.

**Implications:**
- Source of truth = structured data (JSON)
- Generator creates TypeScript code
- No manual concept/value definitions
- Deterministic output

**Enforcement:**
- Generator script (`scripts/generate-kernel.ts`)
- Pack JSON files as source
- Automated code generation

## 7. Validation at Every Layer

**Principle:** Validate early, validate often.

**Implications:**
- Compile-time type checking
- Runtime schema validation
- CI/CD integrity checks
- Database snapshot validation

**Enforcement:**
- TypeScript compiler
- Zod validators
- `validateKernelIntegrity()` function
- CI drift detection

## 8. Zero Domain Logic in Kernel

**Principle:** Kernel defines existence only. Domain logic lives in L1.

**Implications:**
- No business rules in kernel
- No workflow logic in kernel
- No tenant-specific logic in kernel
- Pure metadata and types

**Enforcement:**
- Code review
- Architecture documentation
- Clear separation of concerns

## 9. Documentation as Code

**Principle:** Documentation is version-controlled and automated.

**Implications:**
- Markdown files in repository
- Auto-generated API docs (TypeDoc)
- Auto-generated changelog (Semantic Release)
- Diagrams as code (Mermaid)

**Enforcement:**
- Documentation in `docs/` directory
- CI/CD documentation generation
- Link checking

## 10. Backward Compatibility

**Principle:** Maintain backward compatibility within major versions.

**Implications:**
- Additive changes only (minor versions)
- Breaking changes require major version
- Deprecation warnings before removal
- Migration guides for major versions

**Enforcement:**
- Semantic versioning
- Changelog documentation
- Migration guides

## Related Documentation

- **[System Architecture Overview](./overview.md)** - System design
- **[Layer Model](./layer-model.md)** - L0/L1/L2/L3 details
- **[Architecture Decision Records](../adr/README.md)** - Design decisions
- **[Contributing Guidelines](../governance/contributing.md)** - How to contribute
- **[Code Standards](../governance/code-standards.md)** - Coding conventions

