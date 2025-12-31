"use client";

/**
 * Tenant Configuration Modal
 *
 * Allows editing L1 tenant settings via server action
 */

import { useState, useTransition } from "react";
import { updateTenantConfig } from "./actions";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  subscription_tier: "free" | "basic" | "professional" | "enterprise";
  max_users: number;
  max_companies: number;
}

interface TenantConfigModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export function TenantConfigModal({
  tenant,
  isOpen,
  onClose,
}: TenantConfigModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: tenant.name,
    status: tenant.status,
    subscription_tier: tenant.subscription_tier,
    max_users: tenant.max_users,
    max_companies: tenant.max_companies,
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateTenantConfig({
        id: tenant.id,
        ...formData,
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to update tenant");
      }
    });
  };

  return (
    <div className="na-fixed na-inset-0 na-z-50 na-flex na-items-center na-justify-center na-bg-black/50">
      <div className="na-card na-p-6 na-w-full na-max-w-md na-mx-4">
        <h2 className="na-h4 na-mb-4">Configure Tenant: {tenant.name}</h2>

        {error && (
          <div className="na-p-3 na-mb-4 na-bg-danger-subtle na-text-danger na-rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="na-space-y-4">
          <div>
            <label className="na-block na-text-sm na-font-medium na-mb-1">
              Name
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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Tenant["status"],
                })
              }
              className="na-input na-w-full"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div>
            <label className="na-block na-text-sm na-font-medium na-mb-1">
              Subscription Tier
            </label>
            <select
              value={formData.subscription_tier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subscription_tier: e.target
                    .value as Tenant["subscription_tier"],
                })
              }
              className="na-input na-w-full"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="na-grid na-grid-cols-2 na-gap-4">
            <div>
              <label className="na-block na-text-sm na-font-medium na-mb-1">
                Max Users
              </label>
              <input
                type="number"
                value={formData.max_users}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_users: parseInt(e.target.value) || 0,
                  })
                }
                className="na-input na-w-full"
                min="1"
              />
            </div>
            <div>
              <label className="na-block na-text-sm na-font-medium na-mb-1">
                Max Companies
              </label>
              <input
                type="number"
                value={formData.max_companies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_companies: parseInt(e.target.value) || 0,
                  })
                }
                className="na-input na-w-full"
                min="1"
              />
            </div>
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
