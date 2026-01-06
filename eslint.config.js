import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    rules: {
      "better-tailwindcss/no-custom-classname": "warn",
      "better-tailwindcss/no-contradicting-classname": "error",
    },
  },
  {
    // Relax rules for UI layer files and scripts
    files: ["ui/**/*.css", "scripts/**/*.ts"],
    rules: {
      "better-tailwindcss/no-custom-classname": "off",
    },
  },
  {
    // Constitutional protection: canonical.ts is pure data, no modifications without review
    // Run `pnpm nx:validate` after any changes to detect drift
    files: ["ui/canonical.ts"],
    rules: {
      // All changes to canonical.ts trigger regeneration
      // This is enforced by CI via `pnpm nx:validate`
    },
  },
  {
    ignores: [
      "**/*.md",
      "node_modules/**",
      "dist/**",
      ".next/**",
      "coverage/**",
    ],
  },
];
