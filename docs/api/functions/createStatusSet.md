[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / createStatusSet

# Function: createStatusSet()

> **createStatusSet**\<`T`\>(`values`): `object`

Defined in: [src/status.ts:7](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/status.ts#L7)

Creates a status set with readable enum values.
Internally maps to stable tokens if needed, but never exposes them to developers.

## Type Parameters

### T

`T` *extends* readonly `string`[]

## Parameters

### values

`T`

## Returns

`object`

### is()

> **is**: (`value`) => `value is T[number]`

#### Parameters

##### value

`string`

#### Returns

`value is T[number]`

### parse()

> **parse**: (`input`) => `string`

#### Parameters

##### input

`unknown`

#### Returns

`string`

### safeParse()

> **safeParse**: (`input`) => `SafeParseReturnType`\<`string`, `string`\>

#### Parameters

##### input

`unknown`

#### Returns

`SafeParseReturnType`\<`string`, `string`\>

### schema

> **schema**: `ZodEnum`\<\[`string`, `...string[]`\]\> = `statusSet`

### values

> **values**: readonly `string`[]
