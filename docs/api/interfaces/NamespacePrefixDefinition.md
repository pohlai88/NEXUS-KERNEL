[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / NamespacePrefixDefinition

# Interface: NamespacePrefixDefinition

Defined in: [src/namespace-prefixes.ts:22](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L22)

Namespace Prefix Definition

## Properties

### changeAuthority

> `readonly` **changeAuthority**: `"LAW_AMENDMENT"` \| `"PRD_APPROVAL"` \| `"RUNTIME"`

Defined in: [src/namespace-prefixes.ts:38](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L38)

Change authority - what is required to modify

***

### code

> `readonly` **code**: [`NamespacePrefixId`](../type-aliases/NamespacePrefixId.md)

Defined in: [src/namespace-prefixes.ts:24](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L24)

Unique prefix identifier (e.g., "PREFIX_CONCEPT")

***

### description

> `readonly` **description**: `string`

Defined in: [src/namespace-prefixes.ts:28](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L28)

Human-readable description

***

### domain

> `readonly` **domain**: [`DomainCode`](../type-aliases/DomainCode.md)

Defined in: [src/namespace-prefixes.ts:34](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L34)

Domain this prefix belongs to

***

### namespaceType

> `readonly` **namespaceType**: [`NamespaceType`](../type-aliases/NamespaceType.md)

Defined in: [src/namespace-prefixes.ts:30](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L30)

Namespace type determining governance

***

### ownerRole

> `readonly` **ownerRole**: [`OwnerRole`](../type-aliases/OwnerRole.md)

Defined in: [src/namespace-prefixes.ts:32](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L32)

Role that owns this prefix

***

### pattern

> `readonly` **pattern**: `string`

Defined in: [src/namespace-prefixes.ts:36](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L36)

Regex pattern for values using this prefix

***

### prefix

> `readonly` **prefix**: `string`

Defined in: [src/namespace-prefixes.ts:26](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L26)

The actual prefix string (e.g., "CONCEPT_")

***

### version

> `readonly` **version**: `string`

Defined in: [src/namespace-prefixes.ts:40](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/namespace-prefixes.ts#L40)

Version
