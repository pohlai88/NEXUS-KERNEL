[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / WorkflowDefinitionSchema

# Variable: WorkflowDefinitionSchema

> `const` **WorkflowDefinitionSchema**: `ZodObject`\<\{ `initial`: `ZodString`; `requires_comment`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodBoolean`\>\>; `states`: `ZodString`; `transitions`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}, \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}\>

Defined in: [src/manifest.ts:162](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L162)

Workflow Definition - State machine for concept lifecycle

## Example

```typescript
const workflow: WorkflowDefinition = {
  states: "VALUESET_INVOICE_STATUS",
  initial: "RECEIVED",
  transitions: {
    RECEIVED: ["UNDER_REVIEW", "REJECTED"],
    UNDER_REVIEW: ["APPROVED_FOR_PAYMENT", "REJECTED"],
    APPROVED_FOR_PAYMENT: ["PAID"],
    REJECTED: [], // Terminal state
    PAID: [], // Terminal state
  },
  requires_comment: {
    REJECTED: true,
  },
};
```
