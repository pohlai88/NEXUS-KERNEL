/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: "jsdom",
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Coverage thresholds (start conservative, increase over time)
      thresholds: {
        statements: 20,
        branches: 20,
        functions: 20,
        lines: 20,
      },

      // Include/exclude patterns
      include: [
        "src/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules",
        ".next",
        "coverage",
        "**/*.d.ts",
        "**/types/**",
        "**/*.config.*",
      ],
    },

    // Test file patterns
    include: ["**/*.{test,spec}.{ts,tsx}"],

    // Exclude patterns
    exclude: ["node_modules", ".next", "coverage"],

    // Setup files
    setupFiles: ["./vitest.setup.ts"],

    // Alias resolution (match tsconfig paths)
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/src": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
    },

    // Reporter configuration
    reporters: ["default", "html"],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
