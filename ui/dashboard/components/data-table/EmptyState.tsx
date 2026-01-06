/**
 * EmptyState - No records found message
 * Based on Figma design: node 424:3085 (empty state)
 */

export function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="text-title font-medium text-gray-400 mb-2">
        NO RECORDS FOUND
      </div>
      <div className="text-body text-gray-500">
        Try adjusting your filters or search query
      </div>
    </div>
  );
}
