import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="card p-6 max-w-md w-full text-center space-y-4">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">404</h1>
        <p className="text-[length:var(--nx-body-size)] text-nx-text-main">Page not found</p>
        <Link href="/">
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
            Go home
          </button>
        </Link>
      </div>
    </div>
  );
}
