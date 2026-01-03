[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / isConceptAllowed

# Function: isConceptAllowed()

> **isConceptAllowed**(`manifest`, `conceptId`): `boolean`

Defined in: [src/manifest.ts:416](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L416)

Check if a concept is in the manifest allowlist

## Parameters

### manifest

\{ `allowlist`: [`ConceptId`](../type-aliases/ConceptId.md)[]; `description?`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `name`: `string`; `policies?`: `Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}\>\>; \}

#### allowlist

[`ConceptId`](../type-aliases/ConceptId.md)[] = `...`

Concept allowlist - only these concepts can be used in this scope

#### description?

`string` = `...`

Description

#### metadata?

`Record`\<`string`, `unknown`\> = `...`

Metadata for extensibility

#### name

`string` = `...`

Human-readable name

#### policies?

`Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<`string`, `boolean`\>; `states`: `string`; `transitions`: `Record`\<`string`, `string`[]\>; \}; \}\>\> = `...`

Per-concept policies

|

\{ `created_at?`: `string`; `created_by?`: `string` \| `null`; `definition`: \{ `allowlist`: [`ConceptId`](../type-aliases/ConceptId.md)[]; `description?`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `name`: `string`; `policies?`: `Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<..., ...\>; `states`: `string`; `transitions`: `Record`\<`string`, ...[]\>; \}; \}\>\>; \}; `deleted_at?`: `string` \| `null`; `deleted_by?`: `string` \| `null`; `id`: `string`; `is_active`: `boolean`; `is_current`: `boolean`; `kernel_snapshot_id`: `string`; `layer`: `"L1"` \| `"L2"` \| `"L3"`; `parent_manifest_id?`: `string` \| `null`; `replaced_by_id?`: `string` \| `null`; `target_id`: `string`; `target_type`: `"domain"` \| `"cluster"` \| `"tenant"`; `updated_at?`: `string`; `updated_by?`: `string` \| `null`; `version`: `string`; \}

#### created_at?

`string` = `...`

Audit: when created

#### created_by?

`string` \| `null` = `...`

Audit: who created

#### definition

\{ `allowlist`: [`ConceptId`](../type-aliases/ConceptId.md)[]; `description?`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `name`: `string`; `policies?`: `Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<..., ...\>; `states`: `string`; `transitions`: `Record`\<`string`, ...[]\>; \}; \}\>\>; \} = `ManifestDefinitionSchema`

Manifest definition (the actual rules)

#### definition.allowlist

[`ConceptId`](../type-aliases/ConceptId.md)[] = `...`

Concept allowlist - only these concepts can be used in this scope

#### definition.description?

`string` = `...`

Description

#### definition.metadata?

`Record`\<`string`, `unknown`\> = `...`

Metadata for extensibility

#### definition.name

`string` = `...`

Human-readable name

#### definition.policies?

`Partial`\<`Record`\<[`ConceptId`](../type-aliases/ConceptId.md), \{ `business_reference?`: \{ `notes?`: `string`; `reference`: `string`; `standard`: `"INTERNAL"` \| `"IFRS"` \| `"MFRS"` \| `"LOCAL"`; \}; `crud`: \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}; `integrity?`: \{ `immutable_fields`: `string`[]; `required_relations`: [`ConceptId`](../type-aliases/ConceptId.md)[]; \}; `workflow?`: \{ `initial`: `string`; `requires_comment?`: `Record`\<..., ...\>; `states`: `string`; `transitions`: `Record`\<`string`, ...[]\>; \}; \}\>\> = `...`

Per-concept policies

#### deleted_at?

`string` \| `null` = `...`

Soft-delete timestamp

#### deleted_by?

`string` \| `null` = `...`

Who soft-deleted this manifest

#### id

`string` = `...`

UUID primary key

#### is_active

`boolean` = `...`

Is this manifest active?

#### is_current

`boolean` = `...`

Is this the current version?

#### kernel_snapshot_id

`string` = `...`

Kernel snapshot ID for version compliance

#### layer

`"L1"` \| `"L2"` \| `"L3"` = `ManifestLayerSchema`

Manifest layer (L1/L2/L3)

#### parent_manifest_id?

`string` \| `null` = `...`

Parent manifest ID (for inheritance)

#### replaced_by_id?

`string` \| `null` = `...`

Replacement manifest ID

#### target_id

`string` = `...`

Target identifier (domain ID, cluster ID, or tenant ID)

#### target_type

`"domain"` \| `"cluster"` \| `"tenant"` = `TargetTypeSchema`

Target type

#### updated_at?

`string` = `...`

Audit: when last updated

#### updated_by?

`string` \| `null` = `...`

Audit: who last updated

#### version

`string` = `SemverSchema`

Manifest semantic version

### conceptId

[`ConceptId`](../type-aliases/ConceptId.md)

## Returns

`boolean`
