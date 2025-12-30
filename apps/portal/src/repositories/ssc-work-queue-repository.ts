/**
 * Shared Service Center (SSC) Work Queue Repository
 * 
 * "God Mode": Unified work queue across all subsidiaries.
 * AP Clerk sees all pending invoices from all companies in one view.
 */

import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from './tenant-access-repository';

export interface SSCWorkItem {
  id: string;
  tenant_id: string;
  tenant_name: string;
  document_type: 'invoice' | 'po' | 'case' | 'payment';
  document_id: string;
  amount: number | null;
  currency_code: string | null;
  due_date: string | null;
  status: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface SSCWorkQueueFilters {
  document_type?: SSCWorkItem['document_type'];
  status?: string;
  priority?: SSCWorkItem['priority'];
  tenant_id?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export class SSCWorkQueueRepository {
  private supabase = createClient();
  private tenantAccessRepo = new TenantAccessRepository();

  /**
   * Get unified work queue for SSC user
   */
  async getWorkQueue(
    userId: string,
    filters?: SSCWorkQueueFilters
  ): Promise<SSCWorkItem[]> {
    // Get accessible tenant IDs
    const accessibleTenantIds = await this.tenantAccessRepo.getAccessibleTenantIds(userId);
    if (accessibleTenantIds.length === 0) {
      return [];
    }

    const workItems: SSCWorkItem[] = [];

    // Get pending invoices
    if (!filters?.document_type || filters.document_type === 'invoice') {
      let invoiceQuery = this.supabase
        .from('vmp_invoices')
        .select('*, tenants!inner(name)')
        .in('tenant_id', accessibleTenantIds)
        .in('status', ['pending', 'matched', 'approved']);

      if (filters?.status) {
        invoiceQuery = invoiceQuery.eq('status', filters.status);
      }

      if (filters?.tenant_id) {
        invoiceQuery = invoiceQuery.eq('tenant_id', filters.tenant_id);
      }

      if (filters?.due_date_from) {
        invoiceQuery = invoiceQuery.gte('due_date', filters.due_date_from);
      }

      if (filters?.due_date_to) {
        invoiceQuery = invoiceQuery.lte('due_date', filters.due_date_to);
      }

      const { data: invoices, error: invoiceError } = await invoiceQuery.order('due_date', { ascending: true });

      if (!invoiceError && invoices) {
        for (const invoice of invoices) {
          workItems.push({
            id: invoice.id,
            tenant_id: invoice.tenant_id,
            tenant_name: (invoice.tenants as { name: string })?.name || 'Unknown',
            document_type: 'invoice',
            document_id: invoice.id,
            amount: parseFloat((invoice.amount || 0).toString()),
            currency_code: invoice.currency_code || 'USD',
            due_date: invoice.due_date || null,
            status: invoice.status,
            priority: this.calculatePriority(invoice.due_date, invoice.amount),
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
          });
        }
      }
    }

    // Get pending purchase orders
    if (!filters?.document_type || filters.document_type === 'po') {
      // Similar query for POs if table exists
      // Implementation depends on actual PO table structure
    }

    // Get pending cases
    if (!filters?.document_type || filters.document_type === 'case') {
      let caseQuery = this.supabase
        .from('vmp_cases')
        .select('*, tenants!inner(name)')
        .in('tenant_id', accessibleTenantIds)
        .in('status', ['open', 'in_progress', 'pending']);

      if (filters?.status) {
        caseQuery = caseQuery.eq('status', filters.status);
      }

      if (filters?.tenant_id) {
        caseQuery = caseQuery.eq('tenant_id', filters.tenant_id);
      }

      const { data: cases, error: caseError } = await caseQuery.order('created_at', { ascending: false });

      if (!caseError && cases) {
        for (const caseItem of cases) {
          workItems.push({
            id: caseItem.id,
            tenant_id: caseItem.tenant_id,
            tenant_name: (caseItem.tenants as { name: string })?.name || 'Unknown',
            document_type: 'case',
            document_id: caseItem.id,
            amount: null,
            currency_code: null,
            due_date: null,
            status: caseItem.status,
            priority: this.calculateCasePriority(caseItem.status, caseItem.priority),
            created_at: caseItem.created_at,
            updated_at: caseItem.updated_at,
          });
        }
      }
    }

    // Sort by due date (earliest first), then by priority
    workItems.sort((a, b) => {
      if (a.due_date && b.due_date) {
        const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (dateDiff !== 0) return dateDiff;
      }
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return workItems;
  }

  /**
   * Bulk approve work items
   */
  async bulkApprove(
    workItemIds: string[],
    documentType: SSCWorkItem['document_type'],
    approvedBy: string
  ): Promise<void> {
    if (workItemIds.length === 0) {
      return;
    }

    switch (documentType) {
      case 'invoice':
        await this.supabase
          .from('vmp_invoices')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .in('id', workItemIds);
        break;

      case 'case':
        await this.supabase
          .from('vmp_cases')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .in('id', workItemIds);
        break;

      // Add other document types as needed
    }
  }

  /**
   * Calculate priority based on due date and amount
   */
  private calculatePriority(dueDate: string | null, amount: number | null): SSCWorkItem['priority'] {
    if (!dueDate) {
      return 'normal';
    }

    const daysUntilDue = Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      return 'urgent'; // Overdue
    }

    if (daysUntilDue === 0) {
      return 'high'; // Due today
    }

    if (daysUntilDue <= 3) {
      return 'high'; // Due within 3 days
    }

    if (amount && amount > 100000) {
      return 'high'; // Large amount
    }

    return 'normal';
  }

  /**
   * Calculate case priority
   */
  private calculateCasePriority(status: string, priority?: string): SSCWorkItem['priority'] {
    if (priority) {
      return priority as SSCWorkItem['priority'];
    }

    if (status === 'pending') {
      return 'high';
    }

    return 'normal';
  }
}

