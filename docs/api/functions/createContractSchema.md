[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / createContractSchema

# Function: createContractSchema()

> **createContractSchema**\<`T`\>(`schemaId`, `schemaVersion`, `fields`): `ZodObject`\<`object` & `T`\>

Defined in: [src/zod.ts:23](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/zod.ts#L23)

Creates a contract schema by extending SchemaHeader with additional fields.

## Type Parameters

### T

`T` *extends* `ZodRawShape`

## Parameters

### schemaId

`string`

### schemaVersion

`string`

### fields

`T`

## Returns

`ZodObject`\<`object` & `T`\>
