/**
 * Vendor Onboarding Page with Instant-Check Validation
 * 
 * Real-time validation, duplicate detection, smart defaults.
 */

import { VendorOnboardingForm } from '@/components/vendors/VendorOnboardingForm';
import { createCaseAction } from '@/app/cases/actions';

export default function VendorOnboardingPage() {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    
    // TODO: Create vendor via vendorCRUD
    // For now, create onboarding case
    const result = await createCaseAction(formData);
    return result;
  };

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <VendorOnboardingForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

