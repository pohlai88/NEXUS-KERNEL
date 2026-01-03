[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / SemanticRootDefinition

# Interface: SemanticRootDefinition

Defined in: [src/semantic-roots.ts:20](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L20)

Semantic Root Definition

A semantic root is the approved meaning core from which concepts derive.
Roots prevent synonyms, abbreviation drift, and duplicate meanings.

## Example

```typescript
// ROOT_BIOLOGICAL_ASSET is the root
// CONCEPT_BIOLOGICAL_ASSET derives from it
```

## Properties

### canonicalDefinition

> `readonly` **canonicalDefinition**: `string`

Defined in: [src/semantic-roots.ts:24](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L24)

Canonical definition — immutable meaning

***

### code

> `readonly` **code**: [`SemanticRootId`](../type-aliases/SemanticRootId.md)

Defined in: [src/semantic-roots.ts:22](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L22)

Unique root identifier (e.g., "ROOT_BIOLOGICAL_ASSET")

***

### domain

> `readonly` **domain**: [`DomainCode`](../type-aliases/DomainCode.md)

Defined in: [src/semantic-roots.ts:34](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L34)

Domain this root belongs to

***

### lifecycleStage

> `readonly` **lifecycleStage**: `"ACTIVE"` \| `"DEPRECATED"`

Defined in: [src/semantic-roots.ts:30](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L30)

Lifecycle stage

***

### ownerRole

> `readonly` **ownerRole**: [`OwnerRole`](../type-aliases/OwnerRole.md)

Defined in: [src/semantic-roots.ts:28](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L28)

Role that owns this root

***

### standardRef

> `readonly` **standardRef**: `string`

Defined in: [src/semantic-roots.ts:26](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L26)

External standard reference (e.g., "IFRS:IAS41")

***

### version

> `readonly` **version**: `string`

Defined in: [src/semantic-roots.ts:32](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/semantic-roots.ts#L32)

Version (semantic versioning)
