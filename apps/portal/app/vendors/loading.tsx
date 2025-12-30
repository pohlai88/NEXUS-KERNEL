/**
 * Vendor List Loading State
 */

export default function VendorsLoading() {
    return (
        <div className="na-shell-main na-p-6">
            <div className="na-card na-p-6">
                <div className="na-flex na-items-center na-gap-4">
                    <div className="na-spinner" />
                    <p className="na-metadata">Loading vendors...</p>
                </div>
            </div>
        </div>
    );
}

