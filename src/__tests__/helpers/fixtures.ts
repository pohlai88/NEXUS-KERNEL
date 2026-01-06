/**
 * Test Fixtures
 * Sample data for testing
 */

import type { ConceptShape, ValueSetShape, ValueShape } from "../../kernel.contract";

/**
 * Sample concept fixture
 */
export const sampleConcept: ConceptShape = {
  code: "TEST_CONCEPT",
  description: "Test concept for unit testing",
  domain: "CORE",
  category: "ENTITY",
  tags: ["test"],
};

/**
 * Sample value set fixture
 */
export const sampleValueSet: ValueSetShape = {
  code: "TEST_VALUESET",
  description: "Test value set for unit testing",
  domain: "CORE",
  jurisdiction: "GLOBAL",
  tags: ["test"],
  metadata: {
    prefix: "TST",
  },
};

/**
 * Sample value fixture
 */
export const sampleValue: ValueShape = {
  code: "VALUE_1",
  value_set_code: "TEST_VALUESET",
  label: "Test Value 1",
  description: "Test value for unit testing",
};

/**
 * Invalid concept fixture (missing required fields)
 */
export const invalidConcept: Partial<ConceptShape> = {
  code: "INVALID_CONCEPT",
  // Missing required fields
};

/**
 * Invalid value set fixture (missing required fields)
 */
export const invalidValueSet: Partial<ValueSetShape> = {
  code: "INVALID_VALUESET",
  // Missing required fields
};

/**
 * Invalid value fixture (missing required fields)
 */
export const invalidValue: Partial<ValueShape> = {
  code: "INVALID_VALUE",
  // Missing required fields
};

