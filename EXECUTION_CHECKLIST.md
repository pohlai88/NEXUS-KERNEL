# Day-1 Execution Checklist

**Goal:** Industrialize kernel generation in <2 days  
**Strategy:** Contract → Generator → Packs → Code

---

## ✅ Phase 1: Contract Freeze (COMPLETE)

- [x] Create `src/kernel.contract.ts` — Frozen schema
- [x] Create `src/kernel.validation.ts` — Zod validation
- [x] Create `docs/kernel.naming.rules.md` — Naming laws
- [x] Create `scripts/generate-kernel.ts` — Code generator
- [x] Create `packs/` directory structure
- [x] Create example pack (`example-finance.pack.json`)
- [x] Add generator script to `package.json`

**Status:** ✅ **COMPLETE** — Contract is frozen

---

## ⏳ Phase 2: Generator Testing (NEXT)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Test Generator
```bash
# Test with example pack
pnpm generate
```

**Expected Output:**
- ✅ Generated `src/concepts.ts`
- ✅ Generated `src/values.ts`
- ✅ No errors

### Step 3: Validate Generated Code
```bash
pnpm typecheck
pnpm test
```

**Success Criteria:**
- ✅ TypeScript compiles
- ✅ Tests pass
- ✅ Generated code matches contract

---

## ⏳ Phase 3: First Real Pack (TODAY)

### Option A: Finance Pack (Recommended)
**Why:** Core ERP foundation, well-defined domain

**Concepts to Add:**
- ACCOUNT (Chart of Accounts)
- JOURNAL_ENTRY
- JOURNAL_TYPE
- FISCAL_YEAR
- FISCAL_PERIOD
- COST_CENTER
- PROFIT_CENTER
- BUDGET
- RECONCILIATION
- PAYMENT_TERM

**Value Sets to Add:**
- ACCOUNT_TYPE (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE)
- JOURNAL_TYPE (SALES, PURCHASE, PAYMENT, RECEIPT, GENERAL)
- FISCAL_PERIOD (MONTH, QUARTER, YEAR)
- RECONCILIATION_STATUS (PENDING, MATCHED, UNMATCHED)

**Time Estimate:** 2-3 hours

### Option B: Inventory Pack
**Why:** Critical ERP module, clear boundaries

**Concepts to Add:**
- ITEM
- ITEM_TYPE
- ITEM_GROUP
- WAREHOUSE
- STOCK_LOCATION
- STOCK_ENTRY
- STOCK_ENTRY_TYPE
- UOM
- SERIAL_NUMBER
- BATCH

**Value Sets to Add:**
- ITEM_TYPE (STOCK, SERVICE, BUNDLE, ASSEMBLY)
- STOCK_ENTRY_TYPE (RECEIPT, ISSUE, TRANSFER, ADJUSTMENT)
- STOCK_VALUATION (FIFO, LIFO, AVERAGE, STANDARD)
- UOM_CATEGORY (WEIGHT, VOLUME, LENGTH, COUNT)

**Time Estimate:** 2-3 hours

---

## ⏳ Phase 4: Scale Up (THIS WEEK)

### Day 1-2: Foundation Packs
- [ ] Finance pack (50+ concepts)
- [ ] Inventory pack (30+ concepts)
- [ ] Generate and test

### Day 3-4: Sales & Purchase
- [ ] Sales pack (40+ concepts)
- [ ] Purchase pack (30+ concepts)
- [ ] Generate and test

### Day 5: Integration
- [ ] Merge all packs
- [ ] Validate integrity
- [ ] Run full test suite
- [ ] Generate documentation

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Test Generator
```bash
pnpm generate
```

### 3. Create Your First Pack
```bash
# Copy example
cp packs/example-finance.pack.json packs/finance.pack.json

# Edit finance.pack.json
# Add your concepts, value sets, values
```

### 4. Generate Code
```bash
pnpm generate
```

### 5. Validate
```bash
pnpm typecheck
pnpm test
```

---

## 📋 Pack Creation Template

```json
{
  "id": "your-domain",
  "name": "Your Domain Name",
  "version": "1.0.0",
  "domain": "FINANCE",
  "description": "Brief description",
  "concepts": [
    {
      "code": "CONCEPT_CODE",
      "category": "ENTITY",
      "domain": "FINANCE",
      "description": "Human-readable description",
      "tags": ["tag1", "tag2"]
    }
  ],
  "value_sets": [
    {
      "code": "VALUESET_CODE",
      "domain": "FINANCE",
      "description": "Value set description",
      "jurisdiction": "GLOBAL",
      "tags": ["tag1"]
    }
  ],
  "values": [
    {
      "code": "VALUE_CODE",
      "value_set_code": "VALUESET_CODE",
      "label": "Human Label",
      "description": "Optional description",
      "sort_order": 1
    }
  ]
}
```

---

## 🎯 Success Criteria

### Generator Works
- ✅ `pnpm generate` runs without errors
- ✅ Generated files are valid TypeScript
- ✅ TypeScript compiles
- ✅ Tests pass

### Pack System Works
- ✅ Multiple packs merge correctly
- ✅ No duplicate concepts
- ✅ All value references valid
- ✅ Generated code matches contract

### Ready for Scale
- ✅ Can create packs in parallel
- ✅ Can delegate pack creation
- ✅ CI can validate packs
- ✅ Generation is fast (<5 seconds)

---

## 🔥 Next Actions (Priority Order)

1. **Test generator** (5 min)
   ```bash
   pnpm install
   pnpm generate
   ```

2. **Create first real pack** (2-3 hours)
   - Finance or Inventory
   - 30-50 concepts
   - Test generation

3. **Scale up** (This week)
   - Create 3-5 packs
   - Generate and validate
   - Run full test suite

4. **Automate** (Next week)
   - Add to CI
   - Add invariant tests
   - Performance benchmarks

---

**Remember:** Source of truth = Pack JSON files. Never edit generated code.

