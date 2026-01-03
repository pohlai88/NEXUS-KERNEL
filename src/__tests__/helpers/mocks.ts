/**
 * Test Mocks
 * Mock implementations for testing
 */

import { vi } from "vitest";

/**
 * Mock console methods to avoid noise in tests
 */
export function mockConsole() {
  const originalConsole = { ...console };
  
  return {
    restore: () => {
      Object.assign(console, originalConsole);
    },
    mock: () => {
      console.log = vi.fn();
      console.warn = vi.fn();
      console.error = vi.fn();
      console.info = vi.fn();
    },
  };
}

/**
 * Mock file system operations
 */
export function createMockFileSystem() {
  const files = new Map<string, string>();
  
  return {
    readFile: (path: string): string | undefined => {
      return files.get(path);
    },
    writeFile: (path: string, content: string): void => {
      files.set(path, content);
    },
    exists: (path: string): boolean => {
      return files.has(path);
    },
    clear: (): void => {
      files.clear();
    },
    getAllFiles: (): string[] => {
      return Array.from(files.keys());
    },
  };
}

/**
 * Create a mock concept registry
 */
export function createMockConceptRegistry() {
  return {
    CONCEPT: {
      TEST_CONCEPT_1: "CONCEPT_TEST_1",
      TEST_CONCEPT_2: "CONCEPT_TEST_2",
    },
    CONCEPT_COUNT: 2,
  };
}

/**
 * Create a mock value registry
 */
export function createMockValueRegistry() {
  return {
    VALUESET: {
      TEST_VALUESET: "VALUESET_GLOBAL_TEST",
    },
    VALUE: {
      TEST_VALUESET: {
        VALUE_1: "TEST_VALUE_1",
        VALUE_2: "TEST_VALUE_2",
      },
    },
    VALUESET_COUNT: 1,
    VALUE_COUNT: 2,
  };
}

