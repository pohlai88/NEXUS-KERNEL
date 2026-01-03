[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / DocumentTypeDefinition

# Interface: DocumentTypeDefinition

Defined in: [src/document-types.ts:16](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L16)

Document Type Definition

Document types form a strict authority hierarchy.
Lower-level documents may reference higher-level, never the reverse.

## Properties

### approvalRole

> `readonly` **approvalRole**: [`OwnerRole`](../type-aliases/OwnerRole.md)

Defined in: [src/document-types.ts:32](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L32)

Role required for approval

***

### authorityLevel

> `readonly` **authorityLevel**: `1` \| `2` \| `3` \| `4` \| `5` \| `6`

Defined in: [src/document-types.ts:26](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L26)

Authority level (1 = highest, 6 = lowest)

***

### code

> `readonly` **code**: [`DocumentTypeId`](../type-aliases/DocumentTypeId.md)

Defined in: [src/document-types.ts:18](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L18)

Unique document type identifier (e.g., "DOCTYPE_LAW")

***

### immutableOnApproval

> `readonly` **immutableOnApproval**: `boolean`

Defined in: [src/document-types.ts:30](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L30)

Whether document is immutable after approval

***

### name

> `readonly` **name**: `string`

Defined in: [src/document-types.ts:22](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L22)

Human-readable name

***

### parentType

> `readonly` **parentType**: [`DocumentTypeId`](../type-aliases/DocumentTypeId.md) \| `null`

Defined in: [src/document-types.ts:28](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L28)

Parent document type (null for LAW)

***

### pattern

> `readonly` **pattern**: `string`

Defined in: [src/document-types.ts:20](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L20)

The document code pattern (e.g., "LAW-XXX")

***

### purpose

> `readonly` **purpose**: `string`

Defined in: [src/document-types.ts:24](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L24)

Purpose of this document type

***

### version

> `readonly` **version**: `string`

Defined in: [src/document-types.ts:34](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L34)

Version
