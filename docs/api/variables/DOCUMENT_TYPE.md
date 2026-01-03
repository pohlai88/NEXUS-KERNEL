[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / DOCUMENT\_TYPE

# Variable: DOCUMENT\_TYPE

> `const` **DOCUMENT\_TYPE**: `object`

Defined in: [src/document-types.ts:50](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L50)

DOCUMENT_TYPE - Document Classifications

These define the governance document hierarchy.
LAW → PRD → SRS → ADR → TSD → SOP

## Type Declaration

### ADR

> `readonly` **ADR**: `"DOCTYPE_ADR"` = `"DOCTYPE_ADR"`

### LAW

> `readonly` **LAW**: `"DOCTYPE_LAW"` = `"DOCTYPE_LAW"`

### LAW\_REG

> `readonly` **LAW\_REG**: `"DOCTYPE_LAW_REG"` = `"DOCTYPE_LAW_REG"`

### PRD

> `readonly` **PRD**: `"DOCTYPE_PRD"` = `"DOCTYPE_PRD"`

### SOP

> `readonly` **SOP**: `"DOCTYPE_SOP"` = `"DOCTYPE_SOP"`

### SRS

> `readonly` **SRS**: `"DOCTYPE_SRS"` = `"DOCTYPE_SRS"`

### TSD

> `readonly` **TSD**: `"DOCTYPE_TSD"` = `"DOCTYPE_TSD"`

## Example

```typescript
import { DOCUMENT_TYPE } from "@aibos/kernel";

const type = DOCUMENT_TYPE.LAW; // ✅ "DOCTYPE_LAW"
```
