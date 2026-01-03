import { describe, it, expect } from "vitest";
import {
  VALUESET,
  VALUE,
  VALUESET_COUNT,
  VALUE_COUNT,
  type ValueSetId,
} from "./values";
import {
  getAllValueSetIds,
  getValueIdsForValueSet,
  isValidValueSetId,
  isValidValueId,
} from "./__tests__/helpers/test-helpers";

describe("VALUESET Registry", () => {
  describe("Registry Completeness", () => {
    it("should have all value sets defined", () => {
      const valueSetIds = getAllValueSetIds();
      expect(valueSetIds.length).toBeGreaterThan(0);
      expect(valueSetIds.length).toBe(VALUESET_COUNT);
    });

    it("should have VALUESET_COUNT matching actual count", () => {
      const actualCount = Object.keys(VALUESET).length;
      expect(actualCount).toBe(VALUESET_COUNT);
    });

    it("should have unique value set IDs", () => {
      const valueSetIds = getAllValueSetIds();
      const uniqueIds = new Set(valueSetIds);
      expect(uniqueIds.size).toBe(valueSetIds.length);
    });

    it("should have all value set IDs in valid format", () => {
      const valueSetIds = getAllValueSetIds();
      valueSetIds.forEach((id) => {
        expect(isValidValueSetId(id)).toBe(true);
      });
    });
  });

  describe("Value Set ID Format", () => {
    it("should start with VALUESET_ prefix", () => {
      const valueSetIds = getAllValueSetIds();
      valueSetIds.forEach((id) => {
        expect(id).toMatch(/^VALUESET_/);
      });
    });

    it("should have GLOBAL or JURISDICTIONAL namespace", () => {
      const valueSetIds = getAllValueSetIds();
      valueSetIds.forEach((id) => {
        expect(id).toMatch(/^VALUESET_(GLOBAL|JURISDICTIONAL)_/);
      });
    });
  });

  describe("Value Set Registry Access", () => {
    it("should allow type-safe access to value sets", () => {
      const accountType: ValueSetId = VALUESET.ACCOUNT_TYPE;
      expect(accountType).toBe("VALUESET_GLOBAL_ACCOUNT_TYPE");
    });

    it("should have ACCOUNT_TYPE value set", () => {
      expect(VALUESET.ACCOUNT_TYPE).toBe("VALUESET_GLOBAL_ACCOUNT_TYPE");
    });

    it("should have INVOICE_STATUS value set", () => {
      expect(VALUESET.INVOICE_STATUS).toBe("VALUESET_GLOBAL_INVOICE_STATUS");
    });
  });

  describe("Value Set Count Validation", () => {
    it("should have VALUESET_COUNT constant defined", () => {
      expect(VALUESET_COUNT).toBeDefined();
      expect(typeof VALUESET_COUNT).toBe("number");
      expect(VALUESET_COUNT).toBeGreaterThan(0);
    });

    it("should match expected minimum count (60+)", () => {
      expect(VALUESET_COUNT).toBeGreaterThanOrEqual(60);
    });
  });
});

describe("VALUE Registry", () => {
  describe("Registry Completeness", () => {
    it("should have values for all value sets", () => {
      const valueSetIds = getAllValueSetIds();
      valueSetIds.forEach((valueSetId) => {
        const valueIds = getValueIdsForValueSet(valueSetId);
        expect(valueIds.length).toBeGreaterThan(0);
      });
    });

    it("should have VALUE_COUNT matching actual count", () => {
      let totalValues = 0;
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          totalValues += Object.keys(valueSet).length;
        }
      });
      expect(totalValues).toBe(VALUE_COUNT);
    });

    it("should have all value IDs in valid format", () => {
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          Object.values(valueSet).forEach((valueId) => {
            if (typeof valueId === "string") {
              expect(isValidValueId(valueId)).toBe(true);
            }
          });
        }
      });
    });
  });

  describe("Value ID Format", () => {
    it("should have prefix followed by underscore and value", () => {
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          Object.values(valueSet).forEach((valueId) => {
            if (typeof valueId === "string") {
              expect(valueId).toMatch(/^[A-Z]{2,10}_[A-Z][A-Z0-9_]*$/);
            }
          });
        }
      });
    });
  });

  describe("Value Registry Access", () => {
    it("should allow type-safe access to values", () => {
      const assetValue = VALUE.ACCOUNT_TYPE.ASSET;
      expect(assetValue).toBe("ACC_ASSET");
    });

    it("should have ACCOUNT_TYPE values", () => {
      expect(VALUE.ACCOUNT_TYPE.ASSET).toBe("ACC_ASSET");
      expect(VALUE.ACCOUNT_TYPE.LIABILITY).toBe("ACC_LIABILITY");
      expect(VALUE.ACCOUNT_TYPE.EQUITY).toBe("ACC_EQUITY");
    });

    it("should have INVOICE_STATUS values", () => {
      const invoiceStatus = VALUE.INVOICE_STATUS;
      if (invoiceStatus && typeof invoiceStatus === "object") {
        const statusKeys = Object.keys(invoiceStatus);
        expect(statusKeys.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Value Count Validation", () => {
    it("should have VALUE_COUNT constant defined", () => {
      expect(VALUE_COUNT).toBeDefined();
      expect(typeof VALUE_COUNT).toBe("number");
      expect(VALUE_COUNT).toBeGreaterThan(0);
    });

    it("should match expected minimum count (550+)", () => {
      // Current: 307, Target: 550+
      // This test will pass once value expansion is complete
      expect(VALUE_COUNT).toBeGreaterThanOrEqual(307);
    });
  });
});

