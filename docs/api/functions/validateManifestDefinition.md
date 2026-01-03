[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / validateManifestDefinition

# Function: validateManifestDefinition()

> **validateManifestDefinition**(`input`): `object`

Defined in: [src/manifest.ts:367](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L367)

Validate a manifest definition

## Parameters

### input

`unknown`

## Returns

### allowlist

> **allowlist**: [`ConceptId`](../type-aliases/ConceptId.md)[]

Concept allowlist - only these concepts can be used in this scope

### description?

> `optional` **description**: `string`

Description

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Metadata for extensibility

### name

> **name**: `string`

Human-readable name

### policies?

> `optional` **policies**: `Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}\>\>

Per-concept policies

## Throws

CanonError on validation failure
