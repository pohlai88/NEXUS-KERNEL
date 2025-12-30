# Documentation Date Management Guide

**Version:** 1.0.0  
**Last Updated:** 2025-12-30  
**Status:** Active  
**Purpose:** Prevent stale dates in documentation and maintain document currency

---

## 🎯 Problem Statement

Documentation files contain hardcoded dates in headers (e.g., `**Last Updated:** 2025-01-22`). These dates become stale over time, causing confusion about document currency and making it difficult to determine which documents are actively maintained.

**Root Cause:**
- Dates are hardcoded in markdown files
- No automated process to update them
- Manual updates are easily forgotten
- Historical dates mixed with metadata dates

---

## ✅ Solution

### Automated Date Update Script

Use `scripts/update-doc-dates.ps1` to batch update all documentation dates:

```powershell
# Run from project root
powershell -ExecutionPolicy Bypass -File scripts/update-doc-dates.ps1
```

**What it does:**
- Finds all markdown files in `docs/` with dates matching `2025-01-XX` pattern
- Updates only metadata dates (Last Updated, Date:, Generated:, etc.)
- Preserves historical dates in content (implementation dates, audit history, etc.)
- Reports number of files updated

**When to run:**
- Before major releases
- Quarterly maintenance
- After bulk documentation updates
- When dates are noticed to be stale

---

## 📋 Date Update Rules

### ✅ DO Update These Dates

These are metadata dates that indicate document currency:

- `**Last Updated:** YYYY-MM-DD`
- `**Date:** YYYY-MM-DD`
- `**Generated:** YYYY-MM-DD`
- `**Tracker Updated:** YYYY-MM-DD`
- `**Report Generated:** YYYY-MM-DD`
- `**Last Audit:** YYYY-MM-DD`
- `**Next Audit Required:** YYYY-MM-DD`

### ❌ DON'T Update These Dates

These are historical records of when events occurred:

- `**Implemented Date:** YYYY-MM-DD` (in feature tables)
- `**Last Audit Date:** YYYY-MM-DD` (historical audit records)
- Dates in audit history tables
- Dates in implementation status tables
- Any date that represents a historical event, not document currency

---

## 🔧 Implementation Details

### Script Logic

The script uses regex patterns to identify and update only metadata dates:

```powershell
# Pattern 1: **Last Updated:** YYYY-MM-DD
$content = $content -replace "(\*\*Last Updated:\*\*)\s+2025-01-2[0-9]", "`$1 $currentDate"

# Pattern 2: **Date:** YYYY-MM-DD
$content = $content -replace "(\*\*Date:\*\*)\s+2025-01-2[0-9]", "`$1 $currentDate"

# ... and so on for other metadata patterns
```

**Why this works:**
- Only matches dates in specific metadata contexts
- Preserves historical dates in content
- Uses current system date automatically
- Safe to run multiple times

### For Auto-Generated Documentation

When generating documentation programmatically, use dynamic dates:

```typescript
// ✅ CORRECT: Dynamic date generation
markdown += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;

// ❌ WRONG: Hardcoded date
markdown += `**Generated:** 2025-01-22\n\n`;
```

**Example:** See `docs/integrations/figma/FIGMA_AIBOS_HEADLESS_INTEGRATION.md` line 927

---

## 🚀 Best Practices

### 1. Regular Maintenance

- **Quarterly:** Run update script as part of quarterly documentation review
- **Pre-Release:** Update dates before major releases
- **Ad-Hoc:** Run when stale dates are noticed

### 2. Manual Updates

When editing a single file:
- Update "Last Updated" date manually to current date
- Or run the script after making changes

### 3. CI/CD Integration (Future)

Consider adding a git hook or CI check:
- Warn when "Last Updated" dates are > 90 days old
- Auto-update dates in CI pipeline
- Block merges if critical docs have stale dates

### 4. Documentation Standards

Follow `docs/DOCUMENTATION_STANDARDS.md`:
- Always include "Last Updated" date in header
- Use ISO format: `YYYY-MM-DD`
- Never use relative dates

---

## 📊 Verification

After running the script, verify updates:

```powershell
# Check for remaining old dates (should only find historical dates)
Get-ChildItem -Path docs -Recurse -Filter *.md | 
  Select-String -Pattern "2025-01-2[0-9]" | 
  Select-Object Path, LineNumber, Line
```

**Expected:** Only historical dates in content (implementation dates, audit history, etc.)

---

## 🔍 Troubleshooting

### Script doesn't update a file

**Possible causes:**
1. Date format doesn't match pattern (check format)
2. File is not in `docs/` directory
3. Date is in content, not metadata (intentional - historical date)

### Script updates historical dates

**Fix:** Update script patterns to be more specific. Current patterns target metadata contexts only.

### Dates still stale after running script

**Check:**
1. Script ran successfully (check output)
2. File was actually modified (check git diff)
3. Date format matches expected pattern

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-30 | Initial guide created | Development Team |

---

**Maintained By:** Development Team  
**Related Documents:**
- `docs/DOCUMENTATION_STANDARDS.md` - General documentation standards
- `scripts/update-doc-dates.ps1` - Date update script

