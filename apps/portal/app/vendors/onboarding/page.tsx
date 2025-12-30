/**
 * Vendor Onboarding Page with Instant-Check Validation
 *
 * Real-time validation, duplicate detection, smart defaults.
 */

import { VendorOnboardingForm } from '@/components/vendors/VendorOnboardingForm';
import { createCaseAction } from '@/app/cases/actions';

export default function VendorOnboardingPage() {
  const handleSubmit = async (formData: FormData): Promise<{ success: boolean; error?: string }> => {
    'use server';

    // TODO: Create vendor via vendorCRUD
    // For now, create onboarding case
    const result = await createCaseAction(formData);
    // Normalize result to expected type
    return {
      success: !!result.success,
      error: result.error,
    };
  };

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-max-w-2xl na-mx-auto">
        <VendorOnboardingForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

