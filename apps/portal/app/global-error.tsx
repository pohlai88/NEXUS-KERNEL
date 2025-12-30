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
        <div className="flex min-h-screen flex-col items-center justify-center na-p-8">
          <div className="na-card na-p-6 max-w-md w-full text-center space-y-4">
            <h1 className="na-h2">
              Something went wrong
            </h1>
            <p className="na-data">
              {error.message || 'An unexpected error occurred'}
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
      </body>
    </html>
  );
}
