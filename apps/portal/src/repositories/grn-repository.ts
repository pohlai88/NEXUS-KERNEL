/**
 * Goods Receipt Note (GRN) Repository
 * 
 * GRN operations for vendors: Submit, Track status.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { DocumentRepository } from './document-repository';

export interface GoodsReceiptNote {
    id: string;
    company_id: string;
    vendor_id: string;
    po_number: string | null;
    grn_number: string;
    total_amount: number | null;
    status: string;
    document_id: string | null;
    submitted_at: string | null;
    submitted_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubmitGRNParams {
    po_number: string;
    grn_number: string;
    total_amount?: number;
    document_id?: string;
    submitted_by: string;
    company_id: string;
    vendor_id: string;
}

export class GRNRepository {
    private supabase = createServiceClient();
    private auditTrail = new AuditTrailRepository();
    private documentRepo = new DocumentRepository();

    /**
     * Find GRN by ID
     */
    async findById(grnId: string): Promise<GoodsReceiptNote | null> {
        const { data, error } = await this.supabase
            .from('vmp_grn_refs')
            .select('*')
            .eq('id', grnId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to get GRN: ${error.message}`);
        }

        return this.mapRowToGRN(data);
    }

    /**
     * Get GRNs for vendor
     */
    async getByVendor(
        vendorId: string,
        companyIds: string[],
        filters?: { status?: string; po_number?: string }
    ): Promise<GoodsReceiptNote[]> {
        let query = this.supabase
            .from('vmp_grn_refs')
            .select('*')
            .eq('vendor_id', vendorId)
            .in('company_id', companyIds)
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.po_number) {
            query = query.eq('po_number', filters.po_number);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get GRNs: ${error.message}`);
        }

        return (data || []).map((row) => this.mapRowToGRN(row));
    }

    /**
     * Submit GRN
     */
    async submit(
        params: SubmitGRNParams,
        requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
    ): Promise<GoodsReceiptNote> {
        // Check if GRN with same number already exists
        const { data: existing } = await this.supabase
            .from('vmp_grn_refs')
            .select('id')
            .eq('grn_number', params.grn_number)
            .eq('company_id', params.company_id)
            .single();

        if (existing) {
            throw new Error(`GRN ${params.grn_number} already exists`);
        }

        // Create GRN record
        const { data: grnData, error } = await this.supabase
            .from('vmp_grn_refs')
            .insert({
                company_id: params.company_id,
                vendor_id: params.vendor_id,
                po_number: params.po_number,
                grn_number: params.grn_number,
                total_amount: params.total_amount || null,
                status: 'pending',
                document_id: params.document_id || null,
                submitted_at: new Date().toISOString(),
                submitted_by: params.submitted_by,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to submit GRN: ${error.message}`);
        }

        // Create audit trail record
        await this.auditTrail.insert({
            entity_type: 'grn',
            entity_id: grnData.id,
            action: 'submit',
            action_by: params.submitted_by,
            new_state: grnData,
            workflow_stage: 'pending',
            workflow_state: {
                po_number: params.po_number,
                grn_number: params.grn_number,
                total_amount: params.total_amount,
            },
            tenant_id: params.company_id, // Using company_id as tenant_id for now
            ip_address: requestContext?.ip_address,
            user_agent: requestContext?.user_agent,
            request_id: requestContext?.request_id,
        });

        return this.mapRowToGRN(grnData);
    }

    /**
     * Map database row to GoodsReceiptNote
     */
    private mapRowToGRN(row: unknown): GoodsReceiptNote {
        const r = row as Record<string, unknown>;
        return {
            id: r.id as string,
            company_id: r.company_id as string,
            vendor_id: r.vendor_id as string,
            po_number: (r.po_number as string) || null,
            grn_number: r.grn_number as string,
            total_amount: (r.total_amount as number) || null,
            status: r.status as string,
            document_id: (r.document_id as string) || null,
            submitted_at: (r.submitted_at as string) || null,
            submitted_by: (r.submitted_by as string) || null,
            created_at: r.created_at as string,
            updated_at: r.updated_at as string,
        };
    }
}

