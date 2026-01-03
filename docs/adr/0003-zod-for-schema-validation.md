# Use Zod for Schema Validation

* **Status:** Accepted
* **Date:** 2026-01-01
* **Deciders:** Architecture Team, Core Maintainers
* **Consulted:** Development Team

## Context and Problem Statement

The Kernel requires runtime validation of pack definitions and kernel registry structures. We need a schema validation library that provides compile-time type inference, runtime validation, and TypeScript integration. The library must support the frozen contract structure defined in `kernel.contract.ts`.

## Decision Drivers

* Need for compile-time type inference from schemas
* Runtime validation required for pack loading
* TypeScript-first approach (no code generation)
* Ecosystem compatibility
* Performance for validation operations
* Developer experience

## Considered Options

* **Option 1:** Zod (TypeScript-first schema validation)
* **Option 2:** Yup (JavaScript-first, TypeScript support)
* **Option 3:** Joi (Runtime validation, no TypeScript inference)
* **Option 4:** io-ts (Functional approach, complex API)
* **Option 5:** JSON Schema with code generation

## Decision Outcome

Chosen option: **Option 1 (Zod)**, because:
- Provides excellent TypeScript type inference
- Zero runtime dependencies (small bundle size)
- Intuitive API that matches our contract structure
- Strong ecosystem support and active maintenance
- Perfect for frozen contract validation
- Supports complex validation rules (regex, custom validators)

### Positive Consequences

* Type-safe schemas with automatic TypeScript types
* Runtime validation matches compile-time types
* No code generation step required
* Excellent developer experience
* Small bundle size (important for NPM package)
* Active community and maintenance

### Negative Consequences

* Learning curve for developers unfamiliar with Zod
* Some advanced validation patterns may require custom validators

## Links

* [Zod Documentation](https://zod.dev/)
* [Zod GitHub Repository](https://github.com/colinhacks/zod)
* See: [`src/kernel.contract.ts`](../../src/kernel.contract.ts)

