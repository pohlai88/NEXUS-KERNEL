[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / isValidTransition

# Function: isValidTransition()

> **isValidTransition**(`workflow`, `fromState`, `toState`): `boolean`

Defined in: [src/manifest.ts:461](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L461)

Validate a workflow state transition

## Parameters

### workflow

#### initial

`string` = `ValueIdSchema`

Initial state for new entities

#### requires_comment?

`Record`\<`string`, `boolean`\> = `...`

States that require a comment when entering

#### states

`string` = `ValueSetIdSchema`

Value set containing valid states

#### transitions

`Record`\<`string`, `string`[]\> = `...`

Allowed state transitions (from -> [to])

### fromState

`string`

### toState

`string`

## Returns

`boolean`
