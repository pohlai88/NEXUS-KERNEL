# Kernel Industrialization Guide

**Status:** ✅ ACTIVE — Production Strategy  
**Version:** 1.0.0  
**Approach:** Table-Driven Code Generation

---

## TL;DR

> **Do NOT hand-craft concepts one by one.  
> Do NOT "think" per module.  
> You must industrialize the kernel.**

**Source of Truth = Data Tables → Generated Code**

---

## 1. The Strategy (Why This Works)

### ❌ Slow Path (What Kills Speed)
- Writing TypeScript by hand
- Thinking about each concept individually
- Manual test writing
- Copy-paste patterns

### ✅ Fast Path (Industrialized)
- **Source of truth = structured tables** (CSV/JSON)
- **Code generation** from data
- **Pack-based architecture** (parallelization)
- **Invariant testing** (not examples)
- **AI for expansion** (not structure)

**Result: 5-10× speed increase**

---

## 2. The Contract (Frozen First)

Before speed, you need **zero ambiguity**.

### Files Created:
- ✅ `src/kernel.contract.ts` — Frozen schema definitions
- ✅ `src/kernel.validation.ts` — Zod validation
- ✅ `docs/kernel.naming.rules.md` — Naming laws

### What's Frozen:
- `ConceptShape` (id, code, domain, description, tags)
- `ValueSetShape`
- `ValueShape`
- Naming law (`CONCEPT_*`, `VALUESET_*`)
- Export pattern (`as const`, no strings)

✅ **If these are frozen, everything else can be generated.**

---

## 3. Pack-Based Architecture

### Structure
```
packs/
  finance.pack.json
  inventory.pack.json
  sales.pack.json
  hr.pack.json
```

### Pack Format
```json
{
  "id": "finance",
  "name": "Finance & Accounting",
  "version": "1.0.0",
  "domain": "FINANCE",
  "description": "...",
  "concepts": [...],
  "value_sets": [...],
  "values": [...]
}
```

### Why Packs?
- ✅ **Parallelization** — Work per pack
- ✅ **Delegation** — Assign packs to team members
- ✅ **Auditability** — Each pack is self-contained
- ✅ **Replaceability** — Swap packs without breaking
- ✅ **CI Validation** — Validate pack integrity

---

## 4. Code Generation Workflow

### Step 1: Create Pack JSON
```bash
# Create packs/finance.pack.json
# Define concepts, value sets, values
```

### Step 2: Generate Code
```bash
pnpm generate
```

### Step 3: Generated Files
- `src/concepts.ts` — Auto-generated
- `src/values.ts` — Auto-generated

### Step 4: Never Edit Generated Code
⚠️ **Always edit source data, never generated code**

---

## 5. Using AI for Expansion

### ✅ Perfect AI Tasks
- Expand ISO countries (195+)
- Expand currencies (170+)
- Expand status enums
- Generate descriptions
- Generate tests

### ❌ Bad AI Tasks
- Core concept definition (use domain experts)
- Naming laws (frozen contract)
- Kernel boundaries (architectural)

### AI Prompt Pattern
```
Given this Concept schema,
expand VALUESET_DOCUMENT_STATUS
into a complete enterprise-grade set,
NO duplicates, uppercase, snake_case.
```

Result → paste into pack JSON → regenerate code.

---

## 6. Testing Strategy (Invariant, Not Examples)

### ❌ Slow Testing
```typescript
test("ACCOUNT should exist", () => {
  expect(CONCEPT.ACCOUNT).toBe("CONCEPT_ACCOUNT");
});
```

### ✅ Fast Testing (Invariants)
```typescript
test("all concept codes are unique", () => {
  const codes = Object.values(CONCEPT);
  expect(new Set(codes).size).toBe(codes.length);
});

test("all values reference valid value set", () => {
  // Structural validation
});
```

**One invariant test validates everything.**

---

## 7. Execution Checklist

### Day 1: Contract Freeze
- [x] Create `kernel.contract.ts`
- [x] Create `kernel.validation.ts`
- [x] Create `kernel.naming.rules.md`
- [ ] Review and approve contract (stakeholder sign-off)

### Day 2: Generator Setup
- [x] Create `scripts/generate-kernel.ts`
- [x] Create `packs/` directory
- [x] Create example pack
- [ ] Test generator with example pack
- [ ] Add to CI pipeline

### Week 1: Foundation Packs
- [ ] Create `finance.pack.json` (50+ concepts)
- [ ] Create `inventory.pack.json` (30+ concepts)
- [ ] Generate and test
- [ ] Validate integrity

### Week 2: Expansion Packs
- [ ] Create `sales.pack.json`
- [ ] Create `purchase.pack.json`
- [ ] Create `hr.pack.json`
- [ ] Generate and test

### Week 3: Advanced Packs
- [ ] Create `manufacturing.pack.json`
- [ ] Create `project.pack.json`
- [ ] Create `asset.pack.json`
- [ ] Generate and test

### Week 4: Hardening
- [ ] Invariant tests
- [ ] Performance tests
- [ ] Documentation
- [ ] Release alpha

---

## 8. Commands Reference

### Generate Code
```bash
# Generate from packs
pnpm generate

# Watch mode (regenerate on pack changes)
pnpm generate:watch
```

### Validate Packs
```bash
# Validation happens automatically during generation
# Or use TypeScript to validate:
pnpm typecheck
```

### Test Generated Code
```bash
# Run invariant tests
pnpm test

# Watch mode
pnpm test:watch
```

---

## 9. Pack Creation Workflow

### Step 1: Create Pack File
```bash
touch packs/finance.pack.json
```

### Step 2: Define Structure
```json
{
  "id": "finance",
  "name": "Finance & Accounting",
  "version": "1.0.0",
  "domain": "FINANCE",
  "description": "Core financial concepts",
  "concepts": [
    {
      "code": "ACCOUNT",
      "category": "ENTITY",
      "domain": "FINANCE",
      "description": "Chart of Accounts entry",
      "tags": ["accounting"]
    }
  ],
  "value_sets": [...],
  "values": [...]
}
```

### Step 3: Validate
```bash
pnpm generate
# Generator validates automatically
```

### Step 4: Review Generated Code
```bash
# Check src/concepts.ts
# Check src/values.ts
```

### Step 5: Test
```bash
pnpm test
```

---

## 10. Best Practices

### ✅ Do
- Edit pack JSON files (source of truth)
- Use AI for value expansion
- Test invariants, not examples
- Regenerate after every pack change
- Commit pack files to git
- Use descriptive pack names

### ❌ Don't
- Edit generated `concepts.ts` or `values.ts`
- Hand-write concept definitions
- Skip validation
- Mix manual and generated code
- Create duplicate concepts across packs

---

## 11. Troubleshooting

### Error: "Duplicate concept code"
**Solution:** Check all packs for duplicate codes. Each concept code must be unique across all packs.

### Error: "Invalid value set reference"
**Solution:** Ensure value's `value_set_code` matches a value set in the same pack.

### Error: "Naming law violation"
**Solution:** Check code follows `UPPERCASE_SNAKE_CASE` pattern.

### Generated code looks wrong
**Solution:** Check pack JSON structure matches contract schema.

---

## 12. Next Steps

1. **Review contract** — Ensure it's frozen and correct
2. **Test generator** — Run with example pack
3. **Create first real pack** — Finance or Inventory
4. **Generate and validate** — Ensure workflow works
5. **Scale up** — Create remaining packs in parallel

---

## 13. Success Metrics

### Speed Metrics
- **Pack creation:** <30 min per pack
- **Code generation:** <5 seconds
- **Validation:** <10 seconds
- **Total time to 180 concepts:** <2 weeks (not months)

### Quality Metrics
- **Zero manual code edits** in generated files
- **100% pack validation** before generation
- **Zero duplicate concepts** across packs
- **All invariants pass** automatically

---

**Remember:** The kernel is **data wearing TypeScript clothes**. Industrialize, don't hand-craft.

