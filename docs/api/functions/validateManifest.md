[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / validateManifest

# Function: validateManifest()

> **validateManifest**(`input`): `object`

Defined in: [src/manifest.ts:383](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L383)

Validate a full manifest record

## Parameters

### input

`unknown`

## Returns

### created\_at?

> `optional` **created\_at**: `string`

Audit: when created

### created\_by?

> `optional` **created\_by**: `string` \| `null`

Audit: who created

### definition

> **definition**: `object` = `ManifestDefinitionSchema`

Manifest definition (the actual rules)

#### definition.allowlist

> **allowlist**: [`ConceptId`](../type-aliases/ConceptId.md)[]

Concept allowlist - only these concepts can be used in this scope

#### definition.description?

> `optional` **description**: `string`

Description

#### definition.metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Metadata for extensibility

#### definition.name

> **name**: `string`

Human-readable name

#### definition.policies?

> `optional` **policies**: `Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}\>\>

Per-concept policies

### deleted\_at?

> `optional` **deleted\_at**: `string` \| `null`

Soft-delete timestamp

### deleted\_by?

> `optional` **deleted\_by**: `string` \| `null`

Who soft-deleted this manifest

### id

> **id**: `string`

UUID primary key

### is\_active

> **is\_active**: `boolean`

Is this manifest active?

### is\_current

> **is\_current**: `boolean`

Is this the current version?

### kernel\_snapshot\_id

> **kernel\_snapshot\_id**: `string`

Kernel snapshot ID for version compliance

### layer

> **layer**: `"L1"` \| `"L2"` \| `"L3"` = `ManifestLayerSchema`

Manifest layer (L1/L2/L3)

### parent\_manifest\_id?

> `optional` **parent\_manifest\_id**: `string` \| `null`

Parent manifest ID (for inheritance)

### replaced\_by\_id?

> `optional` **replaced\_by\_id**: `string` \| `null`

Replacement manifest ID

### target\_id

> **target\_id**: `string`

Target identifier (domain ID, cluster ID, or tenant ID)

### target\_type

> **target\_type**: `"domain"` \| `"cluster"` \| `"tenant"` = `TargetTypeSchema`

Target type

### updated\_at?

> `optional` **updated\_at**: `string`

Audit: when last updated

### updated\_by?

> `optional` **updated\_by**: `string` \| `null`

Audit: who last updated

### version

> **version**: `string` = `SemverSchema`

Manifest semantic version

## Throws

CanonError on validation failure
