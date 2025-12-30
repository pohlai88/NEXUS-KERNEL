/**
 * Vendor Onboarding Form with Instant-Check Validation
 * 
 * Real-time validation as vendor types (no waiting for rejection).
 */

'use client';

import { useState, useTransition } from 'react';
import { VendorSearchRepository } from '@/src/repositories/vendor-search-repository';

interface VendorOnboardingFormProps {
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function VendorOnboardingForm({ onSubmit }: VendorOnboardingFormProps) {
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchRepo = new VendorSearchRepository();

  // Real-time validation
  const validateLegalName = async (value: string) => {
    if (value.length < 2) {
      setValidationErrors((prev) => ({ ...prev, legalName: 'Legal name must be at least 2 characters' }));
      return;
    }
    if (value.length > 200) {
      setValidationErrors((prev) => ({ ...prev, legalName: 'Legal name must be less than 200 characters' }));
      return;
    }

    // Check for duplicates (Duplicate Destroyer)
    const duplicates = await searchRepo.checkDuplicates(value, displayName || null, 'default'); // TODO: Get tenantId
    if (duplicates.length > 0) {
      setDuplicateWarning(
        `Potential duplicate found: ${duplicates[0].vendor.legal_name} (${(duplicates[0].similarity_score * 100).toFixed(0)}% similar)`
      );
    } else {
      setDuplicateWarning(null);
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.legalName;
      return newErrors;
    });
  };

  const validateTaxId = async (value: string) => {
    // Real-time tax ID validation (format depends on country)
    if (countryCode === 'MY') {
      // Malaysia: SSM format validation
      if (value && !/^\d{6,12}[A-Z]?$/.test(value)) {
        setValidationErrors((prev) => ({ ...prev, taxId: 'Invalid SSM format' }));
        return;
      }
    } else if (countryCode === 'SG') {
      // Singapore: UEN format validation
      if (value && !/^\d{8,9}[A-Z]$/.test(value)) {
        setValidationErrors((prev) => ({ ...prev, taxId: 'Invalid UEN format' }));
        return;
      }
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.taxId;
      return newErrors;
    });
  };

  const validateEmail = (value: string) => {
    if (!value.includes('@')) {
      setValidationErrors((prev) => ({ ...prev, email: 'Email must contain "@"' }));
      return;
    }
    const [local, domain] = value.split('@');
    if (!local || !domain) {
      setValidationErrors((prev) => ({ ...prev, email: 'Email must have text before and after "@"' }));
      return;
    }
    if (!domain.includes('.')) {
      setValidationErrors((prev) => ({ ...prev, email: 'Email domain must contain "."' }));
      return;
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('legal_name', legalName);
      formData.append('display_name', displayName);
      formData.append('tax_id', taxId);
      formData.append('country_code', countryCode);
      formData.append('email', email);
      formData.append('phone', phone);

      const result = await onSubmit(formData);
      if (result.error) {
        setValidationErrors({ submit: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="na-card na-p-6">
      <h2 className="na-h2 na-mb-6">Vendor Onboarding</h2>

      {duplicateWarning && (
        <div className="na-card na-p-4 na-bg-warn-subtle na-text-warn na-mb-4">
          <p className="na-metadata">{duplicateWarning}</p>
        </div>
      )}

      <div className="na-space-y-4">
        <div>
          <label className="na-metadata na-mb-2 na-block">Legal Name *</label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => {
              setLegalName(e.target.value);
              validateLegalName(e.target.value);
            }}
            className={`na-input na-w-full ${validationErrors.legalName ? 'na-border-danger' : ''}`}
            required
          />
          {validationErrors.legalName && (
            <p className="na-text-danger na-text-sm na-mt-1">{validationErrors.legalName}</p>
          )}
        </div>

        <div>
          <label className="na-metadata na-mb-2 na-block">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (legalName) validateLegalName(legalName);
            }}
            className="na-input na-w-full"
          />
        </div>

        <div>
          <label className="na-metadata na-mb-2 na-block">Country Code *</label>
          <select
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              if (taxId) validateTaxId(taxId);
            }}
            className="na-input na-w-full"
            required
          >
            <option value="">Select Country</option>
            <option value="MY">Malaysia</option>
            <option value="SG">Singapore</option>
            <option value="ID">Indonesia</option>
            <option value="TH">Thailand</option>
          </select>
        </div>

        <div>
          <label className="na-metadata na-mb-2 na-block">Tax ID *</label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => {
              setTaxId(e.target.value);
              validateTaxId(e.target.value);
            }}
            className={`na-input na-w-full ${validationErrors.taxId ? 'na-border-danger' : ''}`}
            required
          />
          {validationErrors.taxId && (
            <p className="na-text-danger na-text-sm na-mt-1">{validationErrors.taxId}</p>
          )}
        </div>

        <div>
          <label className="na-metadata na-mb-2 na-block">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            className={`na-input na-w-full ${validationErrors.email ? 'na-border-danger' : ''}`}
            required
          />
          {validationErrors.email && (
            <p className="na-text-danger na-text-sm na-mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="na-metadata na-mb-2 na-block">Phone *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="na-input na-w-full"
            required
          />
        </div>

        {validationErrors.submit && (
          <div className="na-card na-p-4 na-bg-danger-subtle na-text-danger">
            <p className="na-metadata">{validationErrors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          className="na-btn na-btn-primary na-w-full"
          disabled={isPending || Object.keys(validationErrors).length > 0}
        >
          {isPending ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}

