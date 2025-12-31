import canonPlugin from "@nexus/eslint-plugin-canon";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Nexus Canon compliance rules
  {
    plugins: {
      "@nexus/canon": canonPlugin,
    },
    rules: {
      "@nexus/canon/forbid-free-string-status": "error",
      "@nexus/canon/require-schema-header": "warn",
      "@nexus/canon/forbid-bypass-imports": "warn",
      // Kernel SSOT enforcement - prevents raw identifier strings
      "@nexus/canon/no-kernel-string-literals": "error",
    },
  },
  // TypeScript strict rules - PREVENTION IS BETTER THAN CURE
  {
    rules: {
      // Prevent common type errors
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "off", // Too strict for now
      "@typescript-eslint/strict-boolean-expressions": "off", // Too strict for now

      // React safety
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",

      // Import hygiene
      "no-duplicate-imports": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
