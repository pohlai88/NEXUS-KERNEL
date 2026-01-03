[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / transitionRequiresComment

# Function: transitionRequiresComment()

> **transitionRequiresComment**(`workflow`, `toState`): `boolean`

Defined in: [src/manifest.ts:476](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L476)

Check if a state transition requires a comment

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

### toState

`string`

## Returns

`boolean`
