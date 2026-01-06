export default function Loading() {
  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="card p-6 text-center">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-4">Loading Documents...</h1>
        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">Please wait while we fetch your documents.</p>
        <div className="animate-spin h-5 w-5 border-2 border-nx-primary border-t-transparent rounded-full animate-spin h-8 w-8 border-2 border-nx-primary border-t-transparent rounded-full mt-6" role="status" aria-label="Loading"></div>
      </div>
    </div>
  );
}

