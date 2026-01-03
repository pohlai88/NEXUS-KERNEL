[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / validateDerivationChain

# Function: validateDerivationChain()

> **validateDerivationChain**(`documentType`, `derivesFrom`): `object`

Defined in: [src/document-types.ts:226](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/document-types.ts#L226)

Validate derivation chain - ensures no cycles and correct authority direction

## Parameters

### documentType

[`DocumentTypeId`](../type-aliases/DocumentTypeId.md)

### derivesFrom

readonly `string`[]

## Returns

`object`

### errors

> **errors**: `string`[]

### valid

> **valid**: `boolean`
