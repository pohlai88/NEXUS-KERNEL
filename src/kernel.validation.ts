// @aibos/kernel - Kernel Validation (Zod-based)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validates kernel registry against frozen contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import {
    ConceptShapeSchema,
    ValueSetShapeSchema,
    ValueShapeSchema,
    PackShapeSchema,
    KernelRegistryShapeSchema,
    type ConceptShape,
    type ValueSetShape,
    type ValueShape,
    type KernelRegistryShape,
    NamingLaws,
} from "./kernel.contract";
import { CanonError } from "./errors";

/**
 * Validate a concept shape
 * @throws CanonError on validation failure
 */
export function validateConcept(concept: unknown): ConceptShape {
    const result = ConceptShapeSchema.safeParse(concept);
    if (!result.success) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Concept validation failed: ${result.error.message}`,
            { errors: result.error.errors, data: concept }
        );
    }

    // Additional naming law validation
    if (!NamingLaws.isValidConceptCode(result.data.code)) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Invalid concept code (must be UPPERCASE_SNAKE_CASE): ${result.data.code}`,
            { code: result.data.code, error_type: "INVALID_CONCEPT_CODE" }
        );
    }

    return result.data;
}

/**
 * Validate a value set shape
 * @throws CanonError on validation failure
 */
export function validateValueSet(valueSet: unknown): ValueSetShape {
    const result = ValueSetShapeSchema.safeParse(valueSet);
    if (!result.success) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Value set validation failed: ${result.error.message}`,
            { errors: result.error.errors, data: valueSet }
        );
    }

    // Additional naming law validation
    if (!NamingLaws.isValidValueSetCode(result.data.code)) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Invalid value set code (must be UPPERCASE_SNAKE_CASE): ${result.data.code}`,
            { code: result.data.code, error_type: "INVALID_VALUESET_CODE" }
        );
    }

    return result.data;
}

/**
 * Validate a value shape
 * @throws CanonError on validation failure
 */
export function validateValue(value: unknown): ValueShape {
    const result = ValueShapeSchema.safeParse(value);
    if (!result.success) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Value validation failed: ${result.error.message}`,
            { errors: result.error.errors, data: value }
        );
    }

    // Additional naming law validation
    if (!NamingLaws.isValidValueCode(result.data.code)) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Invalid value code (must be UPPERCASE_SNAKE_CASE): ${result.data.code}`,
            { code: result.data.code, error_type: "INVALID_VALUE_CODE" }
        );
    }

    return result.data;
}

/**
 * Validate kernel registry integrity
 * @throws CanonError on validation failure
 */
export function validateKernelRegistry(
    registry: unknown
): KernelRegistryShape {
    const result = KernelRegistryShapeSchema.safeParse(registry);
    if (!result.success) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Kernel registry validation failed: ${result.error.message}`,
            { errors: result.error.errors }
        );
    }

    // Uniqueness checks
    const conceptCodes = new Set<string>();
    for (const concept of result.data.concepts) {
        if (conceptCodes.has(concept.code)) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Duplicate concept code: ${concept.code}`,
                { code: concept.code, error_type: "DUPLICATE_CONCEPT_CODE" }
            );
        }
        conceptCodes.add(concept.code);
    }

    const valueSetCodes = new Set<string>();
    for (const valueSet of result.data.value_sets) {
        if (valueSetCodes.has(valueSet.code)) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Duplicate value set code: ${valueSet.code}`,
                { code: valueSet.code, error_type: "DUPLICATE_VALUESET_CODE" }
            );
        }
        valueSetCodes.add(valueSet.code);
    }

    // Value set reference validation
    const validValueSetCodes = new Set(
        result.data.value_sets.map((vs) => vs.code)
    );
    for (const value of result.data.values) {
        if (!validValueSetCodes.has(value.value_set_code)) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Value references unknown value set: ${value.value_set_code}`,
                {
                    value_code: value.code,
                    value_set_code: value.value_set_code,
                    error_type: "INVALID_VALUESET_REFERENCE",
                }
            );
        }
    }

    // Value code uniqueness per value set
    const valueCodesBySet = new Map<string, Set<string>>();
    for (const value of result.data.values) {
        const setCode = value.value_set_code;
        if (!valueCodesBySet.has(setCode)) {
            valueCodesBySet.set(setCode, new Set());
        }
        const codes = valueCodesBySet.get(setCode)!;
        if (codes.has(value.code)) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Duplicate value code in value set: ${value.code} in ${setCode}`,
                { value_code: value.code, value_set_code: setCode, error_type: "DUPLICATE_VALUE_CODE" }
            );
        }
        codes.add(value.code);
    }

    // Pack-level invariants
    validatePackInvariants(result.data);

    return result.data;
}

/**
 * Validate pack-level invariants
 * @throws CanonError on validation failure
 */
function validatePackInvariants(registry: KernelRegistryShape): void {
    // Group values by value set
    const valuesBySet = new Map<string, ValueShape[]>();
    for (const value of registry.values) {
        if (!valuesBySet.has(value.value_set_code)) {
            valuesBySet.set(value.value_set_code, []);
        }
        valuesBySet.get(value.value_set_code)!.push(value);
    }

    // Invariant 1: Every value set must have at least 2 values (prevents dead enums)
    for (const valueSet of registry.value_sets) {
        const setValues = valuesBySet.get(valueSet.code) || [];
        if (setValues.length < 2) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Value set must have at least 2 values: ${valueSet.code} has ${setValues.length}`,
                { value_set_code: valueSet.code, value_count: setValues.length, error_type: "INSUFFICIENT_VALUES" }
            );
        }
    }

    // Invariant 2: sort_order must be continuous per set (1..n)
    for (const [setCode, setValues] of valuesBySet.entries()) {
        const valuesWithOrder = setValues.filter((v) => v.sort_order !== undefined);
        if (valuesWithOrder.length === 0) continue; // Optional sort_order

        const sortOrders = valuesWithOrder
            .map((v) => v.sort_order!)
            .sort((a, b) => a - b);

        // Check continuity: should be 1, 2, 3, ..., n
        for (let i = 0; i < sortOrders.length; i++) {
            if (sortOrders[i] !== i + 1) {
                throw new CanonError(
                    "VALIDATION_FAILED",
                    `Sort order must be continuous (1..n): ${setCode} has gaps`,
                    {
                        value_set_code: setCode,
                        expected: i + 1,
                        actual: sortOrders[i],
                        all_orders: sortOrders,
                        error_type: "NON_CONTINUOUS_SORT_ORDER",
                    }
                );
            }
        }
    }
}

/**
 * Validate a pack structure
 * @throws CanonError on validation failure
 */
export function validatePack(pack: unknown): void {
    const result = PackShapeSchema.safeParse(pack);
    if (!result.success) {
        throw new CanonError(
            "VALIDATION_FAILED",
            `Pack validation failed: ${result.error.message}`,
            { errors: result.error.errors }
        );
    }

    // Validate pack contents
    for (const concept of result.data.concepts) {
        validateConcept(concept);
    }

    for (const valueSet of result.data.value_sets) {
        validateValueSet(valueSet);
    }

    for (const value of result.data.values) {
        validateValue(value);
    }

    // Validate value set references
    const validValueSetCodes = new Set(
        result.data.value_sets.map((vs) => vs.code)
    );
    for (const value of result.data.values) {
        if (!validValueSetCodes.has(value.value_set_code)) {
            throw new CanonError(
                "VALIDATION_FAILED",
                `Value in pack references unknown value set: ${value.value_set_code}`,
                {
                    pack_id: result.data.id,
                    value_code: value.code,
                    value_set_code: value.value_set_code,
                    error_type: "INVALID_VALUESET_REFERENCE",
                }
            );
        }
    }
}

