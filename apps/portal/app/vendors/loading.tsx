/**
 * Vendor List Loading State
 */

export default function VendorsLoading() {
    return (
        <div className="shell p-6">
            <div className="card p-6">
                <div className="flex items-center gap-4">
                    <div className="animate-spin h-5 w-5 border-2 border-nx-primary border-t-transparent rounded-full" />
                    <p className="caption">Loading vendors...</p>
                </div>
            </div>
        </div>
    );
}

