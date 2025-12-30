/**
 * L0 Kernel: Employee Claim Concept
 * 
 * Shadow Vendor: Employee = Vendor (L0)
 * Claims as Invoices: Same database table, same process.
 */

import { defineConcept, type ConceptDefinition } from './concept';
import { createStatusSet, type StatusSet } from './status';
import { z } from 'zod';

/**
 * Vendor Type Status Set
 * 
 * Defines vendor types including employees as claimants.
 */
export const VendorType = createStatusSet([
  'SUPPLIER_EXTERNAL', // Acme Corp (External vendor)
  'SUPPLIER_INTERNAL', // Subsidiary B (Internal vendor)
  'EMPLOYEE_CLAIMANT', // John Doe (Staff - Shadow Vendor)
]);

/**
 * Claim Category Status Set
 * 
 * The "Allowed List" - No more free-text "Miscellaneous"
 */
export const ClaimCategory = createStatusSet([
  'MEDICAL',
  'TRAVEL',
  'ENTERTAINMENT',
  'OFFICE_SUPPLIES',
  'FUEL',
  'MEALS',
  'ACCOMMODATION',
  'OTHER',
]);

/**
 * Claim Status Status Set
 */
export const ClaimStatus = createStatusSet([
  'DRAFT',
  'SUBMITTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELLED',
]);

/**
 * Employee Claim Contract Schema
 * 
 * Defines the structure for employee claims (treating them as invoices).
 */
export const EmployeeClaimSchema = z.object({
  // Employee Identity (Links to Vendor Profile)
  employee_id: z.string().uuid(), // Links to auth.users.id
  employee_vendor_id: z.string().uuid(), // Links to vmp_vendors.id (auto-created)
  
  // Claim Details
  amount: z.number().positive({ message: 'Amount must be positive' }),
  category: z.enum(ClaimCategory.values as [string, ...string[]]),
  merchant_name: z.string().min(1, 'Merchant name is required'),
  claim_date: z.string().datetime(), // ISO 8601
  
  // THE EVIDENCE (Required - "No Receipt, No Coin")
  receipt_url: z.string().url({ message: 'Receipt URL is required' }),
  receipt_file_id: z.string().uuid().optional(), // Links to documents table
  
  // Context specific to claim type
  metadata: z.object({
    attendees: z.array(z.string()).optional(), // Required for Entertainment
    odometer_start: z.number().optional(), // Required for Fuel/Mileage
    odometer_end: z.number().optional(),
    odometer_photo_url: z.string().url().optional(), // Required for Fuel
    destination: z.string().optional(), // For Travel
    purpose: z.string().optional(), // Business purpose
    currency_code: z.string().default('USD'),
  }).optional(),
  
  // Multi-Company Support (Federation)
  charge_to_tenant_id: z.string().uuid().optional(), // Charge to different subsidiary
  
  // Status
  status: z.enum(ClaimStatus.values as [string, ...string[]]).default('DRAFT'),
});

export type EmployeeClaimPayload = z.infer<typeof EmployeeClaimSchema>;

/**
 * Employee Claim Concept Definition
 */
export const EMPLOYEE_CLAIM_CONCEPT: ConceptDefinition = defineConcept({
  id: 'concept_employee_claim',
  name: 'Employee Claim',
  description: 'Employee claims treated as vendor invoices. Employee = Vendor (Shadow Vendor). Claims as Invoices. Same database table, same process.',
  version: '1.0.0',
});

/**
 * Claim Policy Limits (L1 Domain Policy Configuration)
 * 
 * These limits are enforced by the Code Gate (policy hooks).
 */
export const CLAIM_POLICY_LIMITS = {
  MEDICAL: { max_per_claim: 500, max_per_year: 2000 },
  TRAVEL: { max_per_claim: 5000, max_per_year: 20000 },
  ENTERTAINMENT: { max_per_claim: 200, max_per_year: 1000 },
  OFFICE_SUPPLIES: { max_per_claim: 50, auto_approve: true }, // Auto-approve under $50
  FUEL: { max_per_claim: 200, requires_odometer: true },
  MEALS: { max_per_claim: 100, max_per_day: 50 },
  ACCOMMODATION: { max_per_claim: 300, max_per_night: 150 },
  OTHER: { max_per_claim: 500, requires_approval: true },
} as const;

/**
 * Export for use in other layers
 */
export {
  VendorType,
  ClaimCategory,
  ClaimStatus,
  EmployeeClaimSchema,
  type EmployeeClaimPayload,
  EMPLOYEE_CLAIM_CONCEPT as EmployeeClaimConcept,
  CLAIM_POLICY_LIMITS,
};

