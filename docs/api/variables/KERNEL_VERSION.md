[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / KERNEL\_VERSION

# Variable: KERNEL\_VERSION

> `const` **KERNEL\_VERSION**: `"1.1.0"`

Defined in: [src/version.ts:22](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/version.ts#L22)

KERNEL_VERSION - Semantic Version

Must match:
- package.json version
- kernel_metadata.kernel_version in DB
- registry.snapshot.json snapshotVersion

Semver Policy:
- PATCH = doc-only / tooling-only (no registry shape change)
- MINOR = new concept/value set/value (backwards compatible additive)
- MAJOR = rename/remove/change meaning (breaking change)
