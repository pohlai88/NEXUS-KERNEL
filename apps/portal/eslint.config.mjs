import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import canonPlugin from "@nexus/eslint-plugin-canon";

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
