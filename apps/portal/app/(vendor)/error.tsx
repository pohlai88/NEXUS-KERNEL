'use client';

import { useEffect } from 'react';

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vendor route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center na-p-8">
      <div className="na-card na-p-6 max-w-md w-full text-center space-y-4">
        <h1 className="na-h2">Vendor Error</h1>
        <p className="na-data">
          {error.message || 'An error occurred in the vendor section'}
        </p>
        {error.digest && (
          <p className="na-metadata">
            Error ID: {error.digest}
          </p>
        )}
        <button className="na-btn na-btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
