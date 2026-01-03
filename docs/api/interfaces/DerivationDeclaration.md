[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / DerivationDeclaration

# Interface: DerivationDeclaration

Defined in: [src/document-types.ts:189](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L189)

Derivation Declaration - LAW-REG-001 §18

Every controlled document must declare its lineage.

## Properties

### derivesFrom

> `readonly` **derivesFrom**: readonly `string`[]

Defined in: [src/document-types.ts:191](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L191)

Document IDs this document derives from (LAW parents, PRD parents, etc.)

***

### governs

> `readonly` **governs**: readonly `string`[]

Defined in: [src/document-types.ts:193](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L193)

Registry IDs this document governs
