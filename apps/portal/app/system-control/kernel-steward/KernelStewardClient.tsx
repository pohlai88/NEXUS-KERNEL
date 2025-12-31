"use client";

/**
 * Kernel Steward Client Components
 *
 * Wraps the Configure buttons with modal state management
 */

import { useState } from "react";
import { GroupConfigModal } from "./GroupConfigModal";
import { TenantConfigModal } from "./TenantConfigModal";

// ============================================================================
// Tenant Card with Configure Button
// ============================================================================

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  subscription_tier: "free" | "basic" | "professional" | "enterprise";
  max_users: number;
  max_companies: number;
}

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors">
        <div className="na-flex na-items-start na-justify-between">
          <div className="na-flex-1">
            <div className="na-flex na-items-center na-gap-2 na-mb-2">
              <span className="na-font-medium">{tenant.name}</span>
              <span
                className={`na-badge ${
                  tenant.status === "active"
                    ? "na-bg-success-subtle na-text-success"
                    : tenant.status === "suspended"
                    ? "na-bg-warning-subtle na-text-warning"
                    : "na-bg-muted"
                }`}
              >
                {tenant.status}
              </span>
            </div>
            <div className="na-text-sm na-text-muted na-mb-1">
              Slug: {tenant.slug}
            </div>
            <div className="na-text-sm na-text-muted">
              Tier: {tenant.subscription_tier || "free"}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="na-btn na-btn-sm na-btn-primary"
          >
            Configure
          </button>
        </div>
      </div>

      <TenantConfigModal
        tenant={tenant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// ============================================================================
// Group Card with Configure Button
// ============================================================================

interface Group {
  id: string;
  name: string;
  legal_name: string;
  country_code: string;
}

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors">
        <div className="na-flex na-items-start na-justify-between">
          <div className="na-flex-1">
            <div className="na-font-medium na-mb-2">{group.name}</div>
            <div className="na-text-sm na-text-muted na-mb-1">
              Legal: {group.legal_name}
            </div>
            <div className="na-text-sm na-text-muted">
              Country: {group.country_code}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="na-btn na-btn-sm na-btn-primary"
          >
            Configure
          </button>
        </div>
      </div>

      <GroupConfigModal
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// ============================================================================
// Credit Exposure Card with Adjust Button
// ============================================================================

interface CreditExposure {
  id: string;
  group_id: string;
  global_vendor_id: string;
  total_exposure: number;
  credit_limit: number;
  available_credit: number;
  is_over_limit: boolean;
  global_vendors?: { legal_name: string };
  groups?: { name: string };
}

interface CreditExposureCardProps {
  exposure: CreditExposure;
}

export function CreditExposureCard({ exposure }: CreditExposureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(
    exposure.credit_limit?.toString() || "0"
  );

  const handleSave = async () => {
    // Import dynamically to avoid client/server mismatch
    const { updateCreditLimit } = await import("./actions");
    await updateCreditLimit({
      group_id: exposure.group_id,
      global_vendor_id: exposure.global_vendor_id,
      credit_limit: parseFloat(newLimit) || 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors">
      <div className="na-flex na-items-start na-justify-between">
        <div className="na-flex-1">
          <div className="na-flex na-items-center na-gap-2 na-mb-2">
            <span className="na-font-medium">
              {exposure.global_vendors?.legal_name || "Unknown Vendor"}
            </span>
            {exposure.is_over_limit && (
              <span className="na-badge na-bg-danger-subtle na-text-danger">
                Over Limit
              </span>
            )}
          </div>
          <div className="na-text-sm na-text-muted na-mb-1">
            Group: {exposure.groups?.name || "N/A"}
          </div>
          <div className="na-text-sm na-text-muted na-mb-1">
            Exposure: ${exposure.total_exposure?.toLocaleString() || "0.00"} /
            Limit: ${exposure.credit_limit?.toLocaleString() || "0.00"}
          </div>
          <div className="na-text-sm na-text-muted">
            Available: ${exposure.available_credit?.toLocaleString() || "0.00"}
          </div>
        </div>

        {isEditing ? (
          <div className="na-flex na-items-center na-gap-2">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="na-input na-w-24"
              min="0"
            />
            <button
              onClick={handleSave}
              className="na-btn na-btn-sm na-btn-primary"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="na-btn na-btn-sm na-btn-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="na-btn na-btn-sm na-btn-primary"
          >
            Adjust Limit
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// L0 Metadata Card with Edit Button
// ============================================================================

interface GlobalMetadata {
  id: string;
  canonical_key: string;
  label: string;
  description: string;
  domain: string;
  module: string;
  tier: string;
}

interface MetadataCardProps {
  metadata: GlobalMetadata;
}

export function MetadataCard({ metadata }: MetadataCardProps) {
  return (
    <div className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors">
      <div className="na-flex na-items-start na-justify-between">
        <div className="na-flex-1">
          <div className="na-flex na-items-center na-gap-2 na-mb-2">
            <span className="na-font-medium">{metadata.label}</span>
            <span className="na-badge na-bg-primary-subtle na-text-primary">
              {metadata.tier}
            </span>
          </div>
          <div className="na-text-sm na-text-muted na-mb-1">
            Canonical Key: {metadata.canonical_key}
          </div>
          <div className="na-text-sm na-text-muted na-mb-1">
            Domain: {metadata.domain} / Module: {metadata.module}
          </div>
          <div className="na-text-sm na-text-muted">
            {metadata.description || "No description"}
          </div>
        </div>
        <button className="na-btn na-btn-sm na-btn-primary">Edit</button>
      </div>
    </div>
  );
}
