"use client";

/**
 * Group Configuration Modal
 *
 * Allows editing group settings via server action
 */

import { useState, useTransition } from "react";
import { updateGroupConfig } from "./actions";

interface Group {
  id: string;
  name: string;
  legal_name: string;
  country_code: string;
}

interface GroupConfigModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupConfigModal({
  group,
  isOpen,
  onClose,
}: GroupConfigModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: group.name,
    legal_name: group.legal_name,
    country_code: group.country_code,
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateGroupConfig({
        id: group.id,
        ...formData,
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to update group");
      }
    });
  };

  return (
    <div className="na-fixed na-inset-0 na-z-50 na-flex na-items-center na-justify-center na-bg-black/50">
      <div className="na-card na-p-6 na-w-full na-max-w-md na-mx-4">
        <h2 className="na-h4 na-mb-4">Configure Group: {group.name}</h2>

        {error && (
          <div className="na-p-3 na-mb-4 na-bg-danger-subtle na-text-danger na-rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="na-space-y-4">
          <div>
            <label className="na-block na-text-sm na-font-medium na-mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="na-input na-w-full"
              required
            />
          </div>

          <div>
            <label className="na-block na-text-sm na-font-medium na-mb-1">
              Legal Name
            </label>
            <input
              type="text"
              value={formData.legal_name}
              onChange={(e) =>
                setFormData({ ...formData, legal_name: e.target.value })
              }
              className="na-input na-w-full"
              required
            />
          </div>

          <div>
            <label className="na-block na-text-sm na-font-medium na-mb-1">
              Country Code
            </label>
            <select
              value={formData.country_code}
              onChange={(e) =>
                setFormData({ ...formData, country_code: e.target.value })
              }
              className="na-input na-w-full"
            >
              <option value="SG">SG - Singapore</option>
              <option value="MY">MY - Malaysia</option>
              <option value="US">US - United States</option>
              <option value="GB">GB - United Kingdom</option>
            </select>
          </div>

          <div className="na-flex na-gap-3 na-justify-end na-pt-4">
            <button
              type="button"
              onClick={onClose}
              className="na-btn na-btn-secondary"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="na-btn na-btn-primary"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
