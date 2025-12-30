import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center na-p-8">
      <div className="na-card na-p-6 max-w-md w-full text-center space-y-4">
        <h1 className="na-h1">404</h1>
        <p className="na-data">Page not found</p>
        <Link href="/">
          <button className="na-btn na-btn-primary w-full">
            Go home
          </button>
        </Link>
      </div>
    </div>
  );
}
