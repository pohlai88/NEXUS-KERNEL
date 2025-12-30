'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-text-center">
        <h1 className="na-h1 na-mb-4">Something went wrong!</h1>
        <p className="na-body na-mb-6">{error.message}</p>
        <button
          className="na-btn na-btn-primary"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

