import { z } from "zod";

/**
 * Creates a status set with readable enum values.
 * Internally maps to stable tokens if needed, but never exposes them to developers.
 */
export function createStatusSet<T extends readonly string[]>(values: T) {
    // Ensure we have at least one value for z.enum
    if (values.length === 0) {
        throw new Error("Status set must have at least one value");
    }

    const statusSet = z.enum(values as unknown as [string, ...string[]]);

    return {
        schema: statusSet,
        values: values as readonly string[],
        parse: (input: unknown) => statusSet.parse(input),
        safeParse: (input: unknown) => statusSet.safeParse(input),
        is: (value: string): value is T[number] => values.includes(value as T[number]),
    };
}

export type StatusSet<T extends readonly string[]> = ReturnType<typeof createStatusSet<T>>;

