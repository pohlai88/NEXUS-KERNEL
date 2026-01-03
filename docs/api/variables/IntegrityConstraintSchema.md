[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / IntegrityConstraintSchema

# Variable: IntegrityConstraintSchema

> `const` **IntegrityConstraintSchema**: `ZodObject`\<\{ `immutable_fields`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `required_relations`: `ZodDefault`\<`ZodArray`\<`ZodEnum`\<\[[`ConceptId`](../type-aliases/ConceptId.md), `...ConceptId[]`\]\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}, \{ `immutable_fields?`: `string`[]; `required_relations?`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}\>

Defined in: [src/manifest.ts:129](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L129)

Integrity Constraints - Field immutability and required relations

## Example

```typescript
const integrity: IntegrityConstraint = {
  immutable_fields: ["id", "created_at", "vendor_id"],
  required_relations: ["CONCEPT_VENDOR", "CONCEPT_COMPANY"],
};
```
