export default function Loading() {
  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-card na-p-6 na-text-center">
        <h1 className="na-h1 na-mb-4">Loading Documents...</h1>
        <p className="na-body">Please wait while we fetch your documents.</p>
        <div className="na-spinner na-spinner-lg na-mt-6" role="status" aria-label="Loading"></div>
      </div>
    </div>
  );
}

