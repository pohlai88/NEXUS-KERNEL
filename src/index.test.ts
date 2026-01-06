import { describe, it, expect } from "vitest";

describe("index", () => {
  it("should export all expected modules", async () => {
    const index = await import("./index");

    // Core exports
    expect(index).toHaveProperty("CONCEPT");
    expect(index).toHaveProperty("VALUESET");
    expect(index).toHaveProperty("VALUE");

    // Version exports
    expect(index).toHaveProperty("KERNEL_VERSION");

    // Document types
    expect(index).toHaveProperty("DOCUMENT_TYPE");

    // Namespace prefixes
    expect(index).toHaveProperty("NAMESPACE_PREFIX");

    // Semantic roots
    expect(index).toHaveProperty("SEMANTIC_ROOT");

    // Utilities
    expect(index).toHaveProperty("CanonId");
    expect(index).toHaveProperty("CanonError");
    expect(index).toHaveProperty("createStatusSet");
    expect(index).toHaveProperty("validateOrThrow");
    expect(index).toHaveProperty("createContractSchema");
    expect(index).toHaveProperty("SchemaHeader");

    // Manifest - just check that manifest exports exist
    const manifestExports = Object.keys(index).filter((key) =>
      key.toLowerCase().includes("manifest")
    );
    expect(manifestExports.length).toBeGreaterThan(0);
  });

  it("should export concepts registry", async () => {
    const index = await import("./index");
    expect(index.CONCEPT).toBeDefined();
    expect(typeof index.CONCEPT).toBe("object");
  });

  it("should export values registry", async () => {
    const index = await import("./index");
    expect(index.VALUESET).toBeDefined();
    expect(index.VALUE).toBeDefined();
  });
});

