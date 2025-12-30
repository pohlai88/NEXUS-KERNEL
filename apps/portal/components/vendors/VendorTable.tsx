/**
 * Vendor Table Component
 * 
 * Client Component with realtime data sync.
 * Uses Supabase Realtime for live updates (data sync only, no presence).
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { VendorInlineEdit } from './VendorInlineEdit';
import type { Vendor } from '@/src/repositories/vendor-repository';

interface VendorTableProps {
    initialVendors: Vendor[];
}

export function VendorTable({ initialVendors }: VendorTableProps) {
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to vendor changes (Realtime Data Sync - P0)
        const channel = supabase
            .channel('vendors-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vmp_vendors',
                },
                (payload: {
                    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
                    new?: Record<string, unknown>;
                    old?: Record<string, unknown>;
                }) => {
                    if (payload.eventType === 'INSERT' && payload.new) {
                        // Map database row to Vendor (direct mapping)
                        const newVendor = mapRowToVendor(payload.new);
                        setVendors((prev) => [...prev, newVendor]);
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        const updatedVendor = mapRowToVendor(payload.new);
                        setVendors((prev) =>
                            prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
                        );
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        setVendors((prev) => prev.filter((v) => v.id === (payload.old as any).id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div className="na-card na-p-6">
            <div className="na-table-wrap">
                <table className="na-table-frozen">
                    <thead>
                        <tr>
                            <th className="na-th">Legal Name</th>
                            <th className="na-th">Display Name</th>
                            <th className="na-th">Country</th>
                            <th className="na-th">Email</th>
                            <th className="na-th">Phone</th>
                            <th className="na-th">Status</th>
                            <th className="na-th">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className="na-tr">
                                <VendorInlineEdit
                                    vendorId={vendor.id}
                                    field="legal_name"
                                    value={vendor.legal_name}
                                />
                                <VendorInlineEdit
                                    vendorId={vendor.id}
                                    field="display_name"
                                    value={vendor.display_name || ''}
                                />
                                <VendorInlineEdit
                                    vendorId={vendor.id}
                                    field="country_code"
                                    value={vendor.country_code}
                                />
                                <VendorInlineEdit
                                    vendorId={vendor.id}
                                    field="email"
                                    value={vendor.email || ''}
                                    type="email"
                                />
                                <VendorInlineEdit
                                    vendorId={vendor.id}
                                    field="phone"
                                    value={vendor.phone || ''}
                                    type="tel"
                                />
                                <td className="na-td">
                                    <span
                                        className={`na-status na-status-${vendor.status.toLowerCase()}`}
                                    >
                                        {vendor.status}
                                    </span>
                                </td>
                                <td className="na-td">
                                    <a
                                        href={`/vendors/${vendor.id}`}
                                        className="na-btn na-btn-ghost na-text-sm"
                                    >
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper to map database row to Vendor (direct mapping, no translation)
function mapRowToVendor(row: Record<string, unknown>): Vendor {
    return {
        id: row.id as string,
        tenant_id: row.tenant_id as string,
        legal_name: row.legal_name as string,
        display_name: (row.display_name as string) || undefined,
        country_code: row.country_code as string,
        email: (row.email as string) || undefined,
        phone: (row.phone as string) || undefined,
        status: row.status as Vendor['status'],
        official_aliases: (row.official_aliases as Vendor['official_aliases']) || [],
        created_at: row.created_at as string,
        updated_at: (row.updated_at as string) || null,
        deleted_at: (row.deleted_at as string) || null,
        deletedAt: row.deleted_at ? new Date(row.deleted_at as string) : null,
        deletedBy: null,
    };
}

