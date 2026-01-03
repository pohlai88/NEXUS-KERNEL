# Configuration Reference

Complete reference for all configuration files in the kernel project.

## Overview

This document explains all configuration files and their purposes.

## TypeScript Configuration

### `tsconfig.json`

Main TypeScript configuration for development and type checking.

**Key Settings:**
- `strict: true` - Enables all strict type checking
- `target: "ES2022"` - Compilation target
- `module: "ESNext"` - ES modules
- `moduleResolution: "bundler"` - Module resolution

**Location:** Root directory

### `tsconfig.build.json`

TypeScript configuration for production builds.

**Extends:** `tsconfig.json`  
**Differences:**
- Excludes test files
- Optimized for production

**Location:** Root directory

## Documentation Configuration

### `typedoc.json`

TypeDoc configuration for API documentation generation.

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true
}
```

**Key Settings:**
- `entryPoints` - Source files to document
- `out` - Output directory
- `plugin` - Markdown plugin for output
- `excludePrivate` - Exclude private members
- `excludeProtected` - Exclude protected members
- `excludeInternal` - Exclude internal members

**Usage:**
```bash
pnpm docs:generate
```

**Location:** Root directory

### `.releaserc.json`

Semantic Release configuration for automated releases.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ],
  "git": {
    "assets": ["CHANGELOG.md", "package.json"],
    "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
  }
}
```

**Key Settings:**
- `plugins` - Release plugins
- `git.assets` - Files to commit on release
- `git.message` - Commit message template

**Usage:**
```bash
pnpm release
```

**Location:** Root directory

### `docs/.vitepress/config.ts`

VitePress configuration for documentation site.

**Key Settings:**
- `title` - Site title
- `description` - Site description
- `base` - Base URL
- `themeConfig.nav` - Navigation items
- `themeConfig.sidebar` - Sidebar structure

**Usage:**
```bash
pnpm docs:dev    # Development server
pnpm docs:build  # Build site
```

**Location:** `docs/.vitepress/config.ts`

## Package Configuration

### `package.json`

Package configuration with dependencies and scripts.

**Key Sections:**
- `name` - Package name (`@aibos/kernel`)
- `version` - Package version
- `exports` - Package exports
- `scripts` - NPM scripts
- `dependencies` - Runtime dependencies
- `devDependencies` - Development dependencies

**Location:** Root directory

## Related Documentation

- **[Automation](../governance/automation.md)** - Automation setup
- **[Development Guide](../guides/development.md)** - Development workflow
- **[Scripts Guide](../guides/scripts.md)** - Script documentation

---

**Last Updated:** 2026-01-01  
**Source:** Configuration files in project root

