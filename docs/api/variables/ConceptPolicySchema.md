[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / ConceptPolicySchema

# Variable: ConceptPolicySchema

> `const` **ConceptPolicySchema**: `ZodObject`\<\{ `business_reference`: `ZodOptional`\<`ZodObject`\<\{ `notes`: `ZodOptional`\<`ZodString`\>; `reference`: `ZodString`; `standard`: `ZodEnum`\<\[`"IFRS"`, `"MFRS"`, `"LOCAL"`, `"INTERNAL"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}, \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}\>\>; `crud`: `ZodObject`\<\{ `create`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `delete`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `read`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `restore`: `ZodDefault`\<`ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>\>; `update`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}, \{ `create?`: `string`[]; `delete?`: `string`[]; `read?`: `string`[]; `restore?`: `string`[]; `update?`: `string`[]; \}\>; `integrity`: `ZodOptional`\<`ZodObject`\<\{ `immutable_fields`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `required_relations`: `ZodDefault`\<`ZodArray`\<`ZodEnum`\<\[[`ConceptId`](../type-aliases/ConceptId.md), `...ConceptId[]`\]\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}, \{ `immutable_fields?`: `string`[]; `required_relations?`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}\>\>; `workflow`: `ZodOptional`\<`ZodObject`\<\{ `initial`: `ZodString`; `requires_comment`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodBoolean`\>\>; `states`: `ZodString`; `transitions`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}, \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}, \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create?`: `string`[]; `delete?`: `string`[]; `read?`: `string`[]; `restore?`: `string`[]; `update?`: `string`[]; \}; `integrity?`: \{ `immutable_fields?`: `string`[]; `required_relations?`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}\>

Defined in: [src/manifest.ts:230](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L230)

Concept Policy - Full governance rules for a single concept

## Example

```typescript
const invoicePolicy: ConceptPolicy = {
  crud: {
    create: ["vendor", "admin"],
    read: ["*"],
    update: ["admin", "manager"],
    delete: ["admin"],
    restore: ["admin"],
  },
  integrity: {
    immutable_fields: ["id", "invoice_number", "vendor_id"],
    required_relations: ["CONCEPT_VENDOR"],
  },
  workflow: {
    states: "VALUESET_INVOICE_STATUS",
    initial: "RECEIVED",
    transitions: { ... },
  },
  business_reference: {
    standard: "IFRS",
    reference: "IFRS 15 - Revenue Recognition",
  },
};
```
