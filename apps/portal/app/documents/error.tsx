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
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="card p-6 bg-nx-danger-bg text-nx-danger text-center">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-4">Something went wrong!</h1>
        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-6">{error.message}</p>
        <button
          className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

