[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / BusinessReferenceSchema

# Variable: BusinessReferenceSchema

> `const` **BusinessReferenceSchema**: `ZodObject`\<\{ `notes`: `ZodOptional`\<`ZodString`\>; `reference`: `ZodString`; `standard`: `ZodEnum`\<\[`"IFRS"`, `"MFRS"`, `"LOCAL"`, `"INTERNAL"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}, \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}\>

Defined in: [src/manifest.ts:190](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L190)

Business Reference - Regulatory/standard alignment

## Example

```typescript
const ref: BusinessReference = {
  standard: "IFRS",
  reference: "IAS 41 - Agriculture",
  notes: "Biological assets valuation",
};
```
