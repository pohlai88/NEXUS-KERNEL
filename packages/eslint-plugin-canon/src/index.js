/**
 * @nexus/eslint-plugin-canon
 *
 * ESLint plugin to enforce Nexus Canon compliance at coding time.
 *
 * Rules:
 * - forbid-free-string-status: Prevents using free strings for status values
 * - require-schema-header: Requires schema headers in contract definitions
 * - forbid-bypass-imports: Prevents bypassing @nexus/kernel imports
 *
 * @module @nexus/eslint-plugin-canon
 */

// Status patterns that should use createStatusSet()
const STATUS_PATTERNS = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "INACTIVE",
  "SUCCESS",
  "ERROR",
  "WARNING",
  "COMPLETE",
  "CANCELLED",
  "ARCHIVED",
  "ENABLED",
  "DISABLED",
  "OPEN",
  "CLOSED",
  "PROCESSING",
  "FAILED",
];

/**
 * Rule: forbid-free-string-status
 * Prevents using free string literals for status values.
 */
const forbidFreeStringStatus = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid free string literals for status values. Use createStatusSet() instead.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      freeStringStatus:
        'Status values must use createStatusSet() from @nexus/kernel, not free strings. Found: "{{ value }}"',
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string") {
          const value = node.value.toUpperCase();

          // Check if parent is a status assignment
          const parent = node.parent;
          if (
            parent &&
            ((parent.type === "Property" &&
              parent.key?.name?.toLowerCase().includes("status")) ||
              (parent.type === "AssignmentExpression" &&
                parent.left?.property?.name?.toLowerCase().includes("status")))
          ) {
            if (STATUS_PATTERNS.includes(value)) {
              context.report({
                node,
                messageId: "freeStringStatus",
                data: { value: node.value },
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: require-schema-header
 * Requires schema headers in contract definitions.
 */
const requireSchemaHeader = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require schema headers (_schema_id, _schema_version) in contract definitions.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      missingSchemaHeader:
        "Contract definitions must include _schema_id and _schema_version. Use createContractSchema() from @nexus/kernel.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Check for z.object() calls in schema/contract files
        if (
          node.callee?.type === "MemberExpression" &&
          node.callee.object?.name === "z" &&
          node.callee.property?.name === "object"
        ) {
          const filename = context.getFilename?.() || context.filename || "";

          // Only enforce for contract/schema files
          if (filename.includes("contract") || filename.includes("schema")) {
            const hasSchemaId = node.arguments?.[0]?.properties?.some(
              (prop) =>
                prop.key?.name === "_schema_id" ||
                prop.key?.value === "_schema_id"
            );

            if (!hasSchemaId) {
              context.report({
                node,
                messageId: "missingSchemaHeader",
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: forbid-bypass-imports
 * Forbids bypassing @nexus/kernel imports.
 */
const forbidBypassImports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid bypassing @nexus/kernel imports. Use canonical imports only.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      bypassImport:
        'Direct "{{ module }}" import detected. Consider using @nexus/kernel for schema/contract definitions.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;

        // Direct zod imports in contract/schema files should use @nexus/kernel
        if (importSource === "zod") {
          const filename = context.getFilename?.() || context.filename || "";

          if (
            filename.includes("contract") ||
            filename.includes("schema") ||
            filename.includes("validation")
          ) {
            // Check if @nexus/kernel is already imported
            const sourceCode = context.getSourceCode?.() || context.sourceCode;
            const hasKernelImport = sourceCode?.ast?.body?.some(
              (stmt) =>
                stmt.type === "ImportDeclaration" &&
                stmt.source.value === "@nexus/kernel"
            );

            if (!hasKernelImport) {
              context.report({
                node,
                messageId: "bypassImport",
                data: { module: importSource },
              });
            }
          }
        }
      },
    };
  },
};

/**
 * The ESLint plugin object for flat config
 */
const plugin = {
  meta: {
    name: "@nexus/eslint-plugin-canon",
    version: "0.1.0",
  },
  rules: {
    "forbid-free-string-status": forbidFreeStringStatus,
    "require-schema-header": requireSchemaHeader,
    "forbid-bypass-imports": forbidBypassImports,
  },
};

// ESM default export for flat config
export default plugin;

// Named exports for flexibility
export { plugin };
export const rules = plugin.rules;
export const meta = plugin.meta;
