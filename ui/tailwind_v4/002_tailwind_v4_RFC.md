### The Verdict: Is storing the RFC text in JSON correct?

**NO.**

Storing the text of an RFC (like the one above) inside a JSON file is an **Anti-Pattern** and is **NOT Industry Best Practice**.

**Why?**

1. **Readability:** JSON does not support native line breaks or rich formatting (tables, bolding, headers). The text becomes a long, unreadable string with `\n` characters.
2. **Diffing:** If you change one word in a paragraph inside a JSON string, Git treats the whole line as changed. This destroys version control history clarity.
3. **IDE Support:** IDEs (VS Code, IntelliJ) are built to render **Markdown (`.md`)** beautifully with previews and navigation. They are not built to read documentation inside JSON strings.

### The Correct Practice: "Configuration as Code"

The "Machine File Format" of an RFC is not the text itself, but the **Configuration Rules** derived from it. You translate the *Strategy* (RFC) into *Enforcement* (JSON).

To facilitate IDE preferences for **Tailwind v4 (RFC 003)**, you must use the `.vscode` folder configuration. This forces the IDE to understand the new v4 syntax (like `@theme`) and enforces the sorting rules.

---

### The Machine Implementation of RFC 003

Here are the specific JSON files you must commit to your repository to enforce the strategy.

#### 1. `.vscode/settings.json` (The Enforcer)

This file solves the specific Tailwind v4 problem: The new `@theme` and `@utility` directives will look like "errors" to the standard CSS linter. This JSON fixes that and enforces the "Class Sorter".

```json
{
  // 1. TAILWIND v4 COMPATIBILITY
  // The new Oxide engine uses CSS-native syntax (@theme).
  // We must tell the IDE not to scream "Unknown Rule" at these new directives.
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
  "less.lint.unknownAtRules": "ignore",

  // 2. ENFORCED FORMATTING (RFC 003 Section 4.1)
  // Forces the "Prettier Class Sorter" to run every time you save.
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  // 3. INTELISENSE REINFORCEMENT
  // Ensures Tailwind suggestions appear even in unknown contexts
  "tailwindCSS.includeLanguages": {
    "plaintext": "html",
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  
  // 4. VALIDATION
  // Disable built-in validation that conflicts with modern CSS features used in v4
  "css.validate": false
}

```

#### 2. `.vscode/extensions.json` (The Toolchain)

This mandates that any developer opening the project must install the specific tools required for Tailwind v4.

```json
{
  "recommendations": [
    // MANDATORY: The official engine integration
    "bradlc.vscode-tailwindcss",
    
    // MANDATORY: The class sorter engine
    "esbenp.prettier-vscode",
    
    // OPTIONAL: For visualizing the colors defined in @theme
    "usernamehw.errorlens" 
  ]
}

```

#### 3. `.vscode/tailwind-v4.code-snippets` (The Architecture)

Since we are banning the use of `tailwind.config.js`, we can provide a snippet to generate the correct CSS structure instantly.

```json
{
  "Tailwind v4 Setup": {
    "prefix": "tw4-setup",
    "body": [
      "@import \"tailwindcss\";",
      "",
      "@theme {",
      "  /* RFC 003: Define tokens here, not in JS */",
      "  --color-primary: oklch(55% 0.2 240);",
      "  --font-display: \"Satoshi\", \"sans-serif\";",
      "}",
      "",
      "/* Utilities Layer */",
      "@utility container-fluid {",
      "  margin-inline: auto;",
      "  padding-inline: 2rem;",
      "}"
    ],
    "description": "Scaffolds the RFC 003 compliant CSS entry point"
  }
}

```

### Summary of Next Steps

1. **Do not** create an `RFC.json`. Create `docs/RFC-003.md` for the human reading experience.
2. **Do** create the `.vscode/settings.json` (provided above) to stop the IDE from flagging valid Tailwind v4 syntax as errors.
3. **Do** create the `.vscode/extensions.json` to force the team to use the same tooling.
