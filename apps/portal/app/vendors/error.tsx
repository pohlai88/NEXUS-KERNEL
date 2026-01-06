/**
 * Vendor List Error Boundary
 */

'use client';

import { useEffect } from 'react';

export default function VendorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vendors page error:', error);
  }, [error]);

  return (
    <div className="shell p-6">
      <div className="card p-6">
        <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main text-nx-danger">Something went wrong!</h2>
        <p className="text-[length:var(--nx-body-size)] text-nx-text-main mb-4">{error.message}</p>
        <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}

