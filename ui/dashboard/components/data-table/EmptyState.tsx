/**
 * EmptyState - No records found message
 * Based on Figma design: node 424:3085 (empty state)
 */

export function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="text-title font-medium text-nx-text-faint mb-2">
        NO RECORDS FOUND
      </div>
      <div className="text-body text-nx-text-muted">
        Try adjusting your filters or search query
      </div>
    </div>
  );
}
