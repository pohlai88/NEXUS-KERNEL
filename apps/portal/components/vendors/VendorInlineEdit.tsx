/**
 * Vendor Inline Edit Component
 * 
 * Silent Killer Feature: Excel-like inline editing.
 * Optimistic updates for instant feedback.
 */

'use client';

import { useState, useTransition } from 'react';
import { updateVendorFieldAction } from '@/app/vendors/actions';

interface VendorInlineEditProps {
    vendorId: string;
    field: string;
    value: string;
    type?: 'text' | 'email' | 'tel' | 'select';
    options?: string[];
}

export function VendorInlineEdit({
    vendorId,
    field,
    value,
    type = 'text',
    options,
}: VendorInlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }

        startTransition(async () => {
            try {
                // Create FormData for Server Action
                const formData = new FormData();
                formData.append(field, editValue);

                // Call Server Action
                const result = await updateVendorFieldAction(vendorId, field, editValue);
                if (result.error) {
                    setError(result.error);
                    setEditValue(value); // Rollback
                } else {
                    setIsEditing(false);
                    setError(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Update failed');
                setEditValue(value); // Rollback
            }
        });
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
        setError(null);
    };

    if (isEditing) {
        return (
            <td className="na-td">
                {type === 'select' && options ? (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        className="na-input"
                        autoFocus
                        disabled={isPending}
                    >
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                        className="na-input"
                        autoFocus
                        disabled={isPending}
                    />
                )}
                {error && <span className="na-text-danger na-text-sm">{error}</span>}
            </td>
        );
    }

    return (
        <td
            className="na-td na-cursor-pointer na-hover-bg-paper-2 na-transition-colors"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {value || <span className="na-metadata">—</span>}
        </td>
    );
}

