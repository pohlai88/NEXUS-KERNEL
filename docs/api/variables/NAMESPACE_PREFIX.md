[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / NAMESPACE\_PREFIX

# Variable: NAMESPACE\_PREFIX

> `const` **NAMESPACE\_PREFIX**: `object`

Defined in: [src/namespace-prefixes.ts:56](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L56)

NAMESPACE_PREFIX - Approved Prefixes

Every value in the registry must use an approved prefix.
Unregistered prefixes are violations.

## Type Declaration

### APP

> `readonly` **APP**: `"PREFIX_APP"` = `"PREFIX_APP"`

### AUD

> `readonly` **AUD**: `"PREFIX_AUD"` = `"PREFIX_AUD"`

### CONCEPT

> `readonly` **CONCEPT**: `"PREFIX_CONCEPT"` = `"PREFIX_CONCEPT"`

### COUNTRY

> `readonly` **COUNTRY**: `"PREFIX_COUNTRY"` = `"PREFIX_COUNTRY"`

### CURRENCY

> `readonly` **CURRENCY**: `"PREFIX_CURRENCY"` = `"PREFIX_CURRENCY"`

### DOC

> `readonly` **DOC**: `"PREFIX_DOC"` = `"PREFIX_DOC"`

### DOCTYPE

> `readonly` **DOCTYPE**: `"PREFIX_DOCTYPE"` = `"PREFIX_DOCTYPE"`

### EVENT

> `readonly` **EVENT**: `"PREFIX_EVENT"` = `"PREFIX_EVENT"`

### ID

> `readonly` **ID**: `"PREFIX_ID"` = `"PREFIX_ID"`

### OVERRIDE

> `readonly` **OVERRIDE**: `"PREFIX_OVERRIDE"` = `"PREFIX_OVERRIDE"`

### PARTY

> `readonly` **PARTY**: `"PREFIX_PARTY"` = `"PREFIX_PARTY"`

### POLICY

> `readonly` **POLICY**: `"PREFIX_POLICY"` = `"PREFIX_POLICY"`

### PRI

> `readonly` **PRI**: `"PREFIX_PRI"` = `"PREFIX_PRI"`

### REL

> `readonly` **REL**: `"PREFIX_REL"` = `"PREFIX_REL"`

### RELATION

> `readonly` **RELATION**: `"PREFIX_RELATION"` = `"PREFIX_RELATION"`

### RISK

> `readonly` **RISK**: `"PREFIX_RISK"` = `"PREFIX_RISK"`

### ROLE

> `readonly` **ROLE**: `"PREFIX_ROLE"` = `"PREFIX_ROLE"`

### ROOT

> `readonly` **ROOT**: `"PREFIX_ROOT"` = `"PREFIX_ROOT"`

### STATUS

> `readonly` **STATUS**: `"PREFIX_STATUS"` = `"PREFIX_STATUS"`

### VALUESET

> `readonly` **VALUESET**: `"PREFIX_VALUESET"` = `"PREFIX_VALUESET"`

### WF

> `readonly` **WF**: `"PREFIX_WF"` = `"PREFIX_WF"`

## Example

```typescript
import { NAMESPACE_PREFIX } from "@aibos/kernel";

const prefix = NAMESPACE_PREFIX.CONCEPT; // ✅ "PREFIX_CONCEPT"
```
