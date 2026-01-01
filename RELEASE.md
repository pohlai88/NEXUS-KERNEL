# Kernel Release Process

## Freeze Line: Kernel v1.0.0 SSOT

The kernel is frozen as **v1.0.0 SSOT** with the following locked components:

### Frozen Components (v1.0.0)

- **Generator output format** - Exports, naming, IDs are immutable
- **Invariants A-F** - Quality gates cannot be loosened (only new invariants may be added)
- **Pack shape schema** - `priority`, `authoritative_for` structure is frozen
- **14 production packs** - Core, Finance, Inventory, Sales, Purchase, Manufacturing, HR, Project, Asset, Tax, Payments, Warehouse, Admin, Compliance

### Release Rules

After freeze, changes require:
- **Version bump** (semver)
- **Changelog entry** (auto-generated)
- **Deterministic regen + tests** (via `pnpm release:kernel`)

---

## Optional Packs v1.x (Fast Evolution)

New packs go here and can evolve quickly:

- **Reporting pack** - Dimensions, segments, fiscal calendars
- **Industry vertical packs** - Farm, franchise, retail, etc.
- **Country/local compliance packs** - MY SST/GST specifics, SG GST
- **Integration packs** - Autocount migration maps, etc.

---

## Release Commands

### One-Command Release Gate

```bash
pnpm release:kernel
```

Runs:
1. Generate kernel code
2. Validate invariants (A-F)
3. Typecheck
4. Run tests
5. Verify output files

### Generate Changelog

```bash
pnpm changelog:generate
```

Auto-generates changelog entry from current packs.

---

## Invariants

### Invariant A: Sort Order Continuity
`sort_order` must be continuous per value set (1..n)

### Invariant B: Minimum Values
Every value set must have at least 2 values

### Invariant C: Export Collision-Free
Concept and value set exports must not collide

### Invariant D: Line Concept Required
Order/Invoice/Entry entities must have corresponding `*_LINE` concepts

### Invariant E: Cross-Pack Duplicate Policy
Duplicates allowed only if:
- Winner pack has higher priority AND
- Winner pack lists code in `authoritative_for`

### Invariant F: Naming Semantics
- `*_STATUS` value sets must have ≥3 values and include terminal states
- `*_LINE` concepts must have matching parent concept
- `metadata.prefix` must be 3 letters, uppercase, unique globally

---

## Version Strategy

- **Kernel v1.0.0** - Frozen SSOT (current state)
- **Kernel v1.x.x** - Optional packs added
- **Kernel v2.0.0** - Breaking changes to generator/contract
- **Kernel v3.0.0** - Major contract changes

---

## Golden Rule

**Never manually edit generated files.**
Only edit **packs + generator + contract**. Everything else is disposable output.

