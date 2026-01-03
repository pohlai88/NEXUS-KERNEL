// @aibos/kernel - Next.js Route Handlers Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Route handler utilities for kernel operations in Next.js App Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from "next/server";
import {
  getCachedConcepts,
  getCachedValueSets,
  getCachedValues,
  getKernelVersion,
} from "./server-components.js";
import { validateKernelIntegrity, KERNEL_VERSION } from "../version.js";

/**
 * GET /api/kernel/concepts
 * 
 * Returns all kernel concepts.
 * 
 * @example
 * ```typescript
 * // app/api/kernel/concepts/route.ts
 * import { handleGetConcepts } from '@aibos/kernel/nextjs';
 * 
 * export const GET = handleGetConcepts;
 * ```
 */
export async function handleGetConcepts(): Promise<NextResponse> {
  try {
    const concepts = await getCachedConcepts();
    return NextResponse.json({
      success: true,
      data: concepts,
      version: KERNEL_VERSION,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kernel/valuesets
 * 
 * Returns all kernel value sets.
 */
export async function handleGetValueSets(): Promise<NextResponse> {
  try {
    const valueSets = await getCachedValueSets();
    return NextResponse.json({
      success: true,
      data: valueSets,
      version: KERNEL_VERSION,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kernel/values
 * 
 * Returns all kernel values.
 */
export async function handleGetValues(): Promise<NextResponse> {
  try {
    const values = await getCachedValues();
    return NextResponse.json({
      success: true,
      data: values,
      version: KERNEL_VERSION,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kernel/version
 * 
 * Returns kernel version information.
 */
export async function handleGetVersion(): Promise<NextResponse> {
  try {
    const version = await getKernelVersion();
    return NextResponse.json({
      success: true,
      data: version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kernel/validate
 * 
 * Validates kernel integrity.
 */
export async function handleValidateKernel(): Promise<NextResponse> {
  try {
    validateKernelIntegrity();
    return NextResponse.json({
      success: true,
      message: "Kernel integrity validated successfully",
      version: KERNEL_VERSION,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        version: KERNEL_VERSION,
      },
      { status: 400 }
    );
  }
}

/**
 * GET /api/kernel/concept/:code
 * 
 * Returns a specific concept by code.
 */
export async function handleGetConcept(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse> {
  try {
    const { code } = await params;
    const concepts = await getCachedConcepts();
    
    // Find concept by code (CONCEPT.INVOICE -> "INVOICE")
    const conceptCode = code.toUpperCase();
    const conceptId = `CONCEPT_${conceptCode}`;
    
    if (!(conceptId in concepts)) {
      return NextResponse.json(
        {
          success: false,
          error: `Concept not found: ${code}`,
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        code: conceptCode,
        id: concepts[conceptCode as keyof typeof concepts],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

