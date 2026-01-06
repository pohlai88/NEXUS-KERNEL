'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error to monitoring service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="card p-6 max-w-md w-full text-center space-y-4">
            <h1 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main">
              Something went wrong
            </h1>
            <p className="text-[length:var(--nx-body-size)] text-nx-text-main">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="caption">
                Error ID: {error.digest}
              </p>
            )}
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
