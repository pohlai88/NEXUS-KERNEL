[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / CrudPermissionSchema

# Variable: CrudPermissionSchema

> `const` **CrudPermissionSchema**: `ZodObject`\<\{ `create`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `delete`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `read`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `restore`: `ZodDefault`\<`ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>\>; `update`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `create`: `string`[]; `delete`: `string`[]; `read`: `string`[]; `restore`: `string`[]; `update`: `string`[]; \}, \{ `create?`: `string`[]; `delete?`: `string`[]; `read?`: `string`[]; `restore?`: `string`[]; `update?`: `string`[]; \}\>

Defined in: [src/manifest.ts:105](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/manifest.ts#L105)

CRUD-S Permission - Roles allowed for each operation

## Example

```typescript
const crud: CrudPermission = {
  create: ["admin", "manager"],
  read: ["*"], // Any role can read
  update: ["admin", "manager"],
  delete: ["admin"], // Soft-delete only
  restore: ["admin"],
};
```
