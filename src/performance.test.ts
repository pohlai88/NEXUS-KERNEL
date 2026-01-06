import { describe, it, expect } from "vitest";
import { CONCEPT } from "./concepts";
import { VALUESET, VALUE } from "./values";

describe("Performance Benchmarks", () => {
  describe("Lookup Latency", () => {
    it("should have concept lookup < 10ms p95", () => {
      const iterations = 1000;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const _ = CONCEPT.SALES_INVOICE;
        const end = performance.now();
        times.push(end - start);
      }

      times.sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95 = times[p95Index];

      expect(p95).toBeLessThan(10); // 10ms target
    });

    it("should have value set lookup < 10ms p95", () => {
      const iterations = 1000;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const _ = VALUESET.ACCOUNT_TYPE;
        const end = performance.now();
        times.push(end - start);
      }

      times.sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95 = times[p95Index];

      expect(p95).toBeLessThan(10); // 10ms target
    });

    it("should have value lookup < 10ms p95", () => {
      const iterations = 1000;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const _ = VALUE.ACCOUNT_TYPE.ASSET;
        const end = performance.now();
        times.push(end - start);
      }

      times.sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95 = times[p95Index];

      expect(p95).toBeLessThan(10); // 10ms target
    });
  });

  describe("Registry Generation Time", () => {
    it("should generate registry in reasonable time", () => {
      const start = performance.now();
      // Simulate registry access (actual generation is done at build time)
      const _ = Object.keys(CONCEPT).length;
      const _2 = Object.keys(VALUESET).length;
      const end = performance.now();
      const duration = end - start;

      // Registry access should be very fast (< 1ms)
      expect(duration).toBeLessThan(1);
    });

    it("should access all concepts quickly", () => {
      const start = performance.now();
      const conceptKeys = Object.keys(CONCEPT);
      const conceptCount = conceptKeys.length;
      const end = performance.now();
      const duration = end - start;

      // Accessing all concept keys should be < 5ms
      expect(duration).toBeLessThan(5);
      expect(conceptCount).toBeGreaterThan(180);
    });

    it("should access all value sets quickly", () => {
      const start = performance.now();
      const valueSetKeys = Object.keys(VALUESET);
      const valueSetCount = valueSetKeys.length;
      const end = performance.now();
      const duration = end - start;

      // Accessing all value set keys should be < 5ms
      expect(duration).toBeLessThan(5);
      expect(valueSetCount).toBeGreaterThan(60);
    });
  });

  describe("Memory Usage", () => {
    it("should have reasonable memory footprint", () => {
      // This is a basic check - actual memory profiling would need more sophisticated tools
      const conceptCount = Object.keys(CONCEPT).length;
      const valueSetCount = Object.keys(VALUESET).length;
      
      // Verify we can access all data without issues
      expect(conceptCount).toBeGreaterThan(0);
      expect(valueSetCount).toBeGreaterThan(0);
    });

    it("should not leak memory on repeated lookups", () => {
      const iterations = 10000;
      const startMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const _ = CONCEPT.SALES_INVOICE;
        const _2 = VALUESET.ACCOUNT_TYPE;
        const _3 = VALUE.ACCOUNT_TYPE.ASSET;
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be minimal (< 1MB for 10k iterations)
      // This is a rough check - actual profiling needed for precise measurement
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe("Bulk Operations", () => {
    it("should handle bulk concept lookups efficiently", () => {
      const iterations = 1000;
      const conceptKeys = Object.keys(CONCEPT).slice(0, 100); // Test with 100 concepts
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        for (const key of conceptKeys) {
          const _ = CONCEPT[key as keyof typeof CONCEPT];
        }
      }

      const end = performance.now();
      const duration = end - start;
      const avgPerLookup = duration / (iterations * conceptKeys.length);

      // Average lookup should be < 0.01ms (10 microseconds)
      expect(avgPerLookup).toBeLessThan(0.01);
    });

    it("should handle bulk value lookups efficiently", () => {
      const iterations = 100;
      const valueSetKeys = Object.keys(VALUESET).slice(0, 20); // Test with 20 value sets
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        for (const key of valueSetKeys) {
          const _ = VALUESET[key as keyof typeof VALUESET];
          // Access a few values from each value set
          const valueSet = VALUESET[key as keyof typeof VALUESET];
          if (valueSet && typeof valueSet === "object") {
            const valueKeys = Object.keys(valueSet).slice(0, 5);
            for (const vKey of valueKeys) {
              const _2 = (valueSet as Record<string, string>)[vKey];
            }
          }
        }
      }

      const end = performance.now();
      const duration = end - start;
      const avgPerOperation = duration / (iterations * valueSetKeys.length * 5);

      // Average operation should be < 0.1ms
      expect(avgPerOperation).toBeLessThan(0.1);
    });
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent lookups efficiently", async () => {
      const iterations = 100;
      const promises: Promise<void>[] = [];

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const _ = CONCEPT.SALES_INVOICE;
            const _2 = VALUESET.ACCOUNT_TYPE;
            const _3 = VALUE.ACCOUNT_TYPE.ASSET;
          })
        );
      }

      await Promise.all(promises);

      const end = performance.now();
      const duration = end - start;
      const avgPerLookup = duration / (iterations * 3);

      // Average concurrent lookup should be < 0.1ms
      expect(avgPerLookup).toBeLessThan(0.1);
    });
  });
});
