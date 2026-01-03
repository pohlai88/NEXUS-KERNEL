import { describe, it, expect, beforeEach } from "vitest";
import { lazyValueSetLoader, getCountries, getCurrencies, preloadLargeValueSets, LARGE_VALUE_SETS } from "./values.lazy";
import { VALUE } from "./values";

describe("Lazy Value Set Loader", () => {
  beforeEach(() => {
    lazyValueSetLoader.clear();
  });

  describe("Lazy loading", () => {
    it("should load COUNTRIES lazily", async () => {
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(false);
      
      const countries = await getCountries();
      
      expect(countries).toBeDefined();
      expect(countries.MALAYSIA).toBe(VALUE.COUNTRIES.MALAYSIA);
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(true);
    });

    it("should load CURRENCIES lazily", async () => {
      expect(lazyValueSetLoader.isLoaded("CURRENCIES")).toBe(false);
      
      const currencies = await getCurrencies();
      
      expect(currencies).toBeDefined();
      expect(currencies.US_DOLLAR).toBe(VALUE.CURRENCIES.US_DOLLAR);
      expect(lazyValueSetLoader.isLoaded("CURRENCIES")).toBe(true);
    });

    it("should cache loaded value sets", async () => {
      const countries1 = await getCountries();
      const countries2 = await getCountries();
      
      // Should return same reference (cached)
      expect(countries1).toBe(countries2);
    });
  });

  describe("Preloading", () => {
    it("should preload value sets", () => {
      preloadLargeValueSets();
      
      // Should be loading (promise exists)
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(true);
      expect(lazyValueSetLoader.isLoaded("CURRENCIES")).toBe(true);
    });

    it("should allow manual preload", async () => {
      lazyValueSetLoader.preload("COUNTRIES");
      
      // Should be cached
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(true);
      
      const countries = await getCountries();
      expect(countries).toBeDefined();
    });
  });

  describe("Cache management", () => {
    it("should clear cache", async () => {
      await getCountries();
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(true);
      
      lazyValueSetLoader.clear();
      expect(lazyValueSetLoader.isLoaded("COUNTRIES")).toBe(false);
    });
  });

  describe("LARGE_VALUE_SETS constant", () => {
    it("should include COUNTRIES and CURRENCIES", () => {
      expect(LARGE_VALUE_SETS).toContain("COUNTRIES");
      expect(LARGE_VALUE_SETS).toContain("CURRENCIES");
    });
  });
});

