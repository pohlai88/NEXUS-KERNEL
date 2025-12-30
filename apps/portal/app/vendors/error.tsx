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
    <div className="na-shell-main na-p-6">
      <div className="na-card na-p-6">
        <h2 className="na-h2 na-text-danger">Something went wrong!</h2>
        <p className="na-data na-mb-4">{error.message}</p>
        <button className="na-btn na-btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}

