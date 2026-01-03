[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / SEMANTIC\_ROOT

# Variable: SEMANTIC\_ROOT

> `const` **SEMANTIC\_ROOT**: `object`

Defined in: [src/semantic-roots.ts:77](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L77)

SEMANTIC_ROOT - Approved Meaning Cores

Every CONCEPT_* must derive from exactly one root.
No root = no concept.

## Type Declaration

### APPROVAL

> `readonly` **APPROVAL**: `"ROOT_APPROVAL"` = `"ROOT_APPROVAL"`

### APPROVAL\_LEVEL

> `readonly` **APPROVAL\_LEVEL**: `"ROOT_APPROVAL_LEVEL"` = `"ROOT_APPROVAL_LEVEL"`

### AUDIT

> `readonly` **AUDIT**: `"ROOT_AUDIT"` = `"ROOT_AUDIT"`

### BANK

> `readonly` **BANK**: `"ROOT_BANK"` = `"ROOT_BANK"`

### BIOLOGICAL\_ASSET

> `readonly` **BIOLOGICAL\_ASSET**: `"ROOT_BIOLOGICAL_ASSET"` = `"ROOT_BIOLOGICAL_ASSET"`

### CASE

> `readonly` **CASE**: `"ROOT_CASE"` = `"ROOT_CASE"`

### CLAIM

> `readonly` **CLAIM**: `"ROOT_CLAIM"` = `"ROOT_CLAIM"`

### COMPANY

> `readonly` **COMPANY**: `"ROOT_COMPANY"` = `"ROOT_COMPANY"`

### COUNTRY

> `readonly` **COUNTRY**: `"ROOT_COUNTRY"` = `"ROOT_COUNTRY"`

### CURRENCY

> `readonly` **CURRENCY**: `"ROOT_CURRENCY"` = `"ROOT_CURRENCY"`

### DOCUMENT

> `readonly` **DOCUMENT**: `"ROOT_DOCUMENT"` = `"ROOT_DOCUMENT"`

### DOCUMENT\_REQUEST

> `readonly` **DOCUMENT\_REQUEST**: `"ROOT_DOCUMENT_REQUEST"` = `"ROOT_DOCUMENT_REQUEST"`

### ESCALATION

> `readonly` **ESCALATION**: `"ROOT_ESCALATION"` = `"ROOT_ESCALATION"`

### EXCEPTION

> `readonly` **EXCEPTION**: `"ROOT_EXCEPTION"` = `"ROOT_EXCEPTION"`

### GROUP\_MEMBERSHIP

> `readonly` **GROUP\_MEMBERSHIP**: `"ROOT_GROUP_MEMBERSHIP"` = `"ROOT_GROUP_MEMBERSHIP"`

### IDENTITY

> `readonly` **IDENTITY**: `"ROOT_IDENTITY"` = `"ROOT_IDENTITY"`

### INVOICE

> `readonly` **INVOICE**: `"ROOT_INVOICE"` = `"ROOT_INVOICE"`

### INVOICE\_VENDOR\_LINK

> `readonly` **INVOICE\_VENDOR\_LINK**: `"ROOT_INVOICE_VENDOR_LINK"` = `"ROOT_INVOICE_VENDOR_LINK"`

### MANUFACTURING\_FACILITY

> `readonly` **MANUFACTURING\_FACILITY**: `"ROOT_MANUFACTURING_FACILITY"` = `"ROOT_MANUFACTURING_FACILITY"`

### ONBOARDING

> `readonly` **ONBOARDING**: `"ROOT_ONBOARDING"` = `"ROOT_ONBOARDING"`

### PARTY

> `readonly` **PARTY**: `"ROOT_PARTY"` = `"ROOT_PARTY"`

### PAYMENT

> `readonly` **PAYMENT**: `"ROOT_PAYMENT"` = `"ROOT_PAYMENT"`

### PAYMENT\_METHOD

> `readonly` **PAYMENT\_METHOD**: `"ROOT_PAYMENT_METHOD"` = `"ROOT_PAYMENT_METHOD"`

### PRIORITY

> `readonly` **PRIORITY**: `"ROOT_PRIORITY"` = `"ROOT_PRIORITY"`

### RATING

> `readonly` **RATING**: `"ROOT_RATING"` = `"ROOT_RATING"`

### REJECTION

> `readonly` **REJECTION**: `"ROOT_REJECTION"` = `"ROOT_REJECTION"`

### RELATIONSHIP

> `readonly` **RELATIONSHIP**: `"ROOT_RELATIONSHIP"` = `"ROOT_RELATIONSHIP"`

### RISK

> `readonly` **RISK**: `"ROOT_RISK"` = `"ROOT_RISK"`

### STATUS

> `readonly` **STATUS**: `"ROOT_STATUS"` = `"ROOT_STATUS"`

### TENANT

> `readonly` **TENANT**: `"ROOT_TENANT"` = `"ROOT_TENANT"`

### VENDOR

> `readonly` **VENDOR**: `"ROOT_VENDOR"` = `"ROOT_VENDOR"`

### VENDOR\_COMPANY\_LINK

> `readonly` **VENDOR\_COMPANY\_LINK**: `"ROOT_VENDOR_COMPANY_LINK"` = `"ROOT_VENDOR_COMPANY_LINK"`

### WORKFLOW

> `readonly` **WORKFLOW**: `"ROOT_WORKFLOW"` = `"ROOT_WORKFLOW"`

## Example

```typescript
import { SEMANTIC_ROOT } from "@aibos/kernel";

const root = SEMANTIC_ROOT.BIOLOGICAL_ASSET; // ✅ "ROOT_BIOLOGICAL_ASSET"
```
