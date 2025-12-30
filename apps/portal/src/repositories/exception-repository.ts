/**
 * Exception Repository with Severity Tagging
 *
 * PRD A-01: Exception-First Workload (MUST)
 * - Default view shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { ExceptionDetectionService, type InvoiceException, type ExceptionType, type ExceptionSeverity } from '../services/exception-detection-service';

export interface ExceptionFilters {
  status?: 'open' | 'in_progress' | 'resolved' | 'ignored';
  severity?: ExceptionSeverity;
  exception_type?: ExceptionType;
  invoice_id?: string;
  vendor_id?: string;
}

export interface ExceptionSummary {
  total: number;
  blocking: number; // critical + high
  needs_action: number; // medium
  safe: number; // low
  by_type: Record<ExceptionType, number>;
  by_severity: Record<ExceptionSeverity, number>;
}

export class ExceptionRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();
  private detectionService = new ExceptionDetectionService();

  /**
   * Detect and create exceptions for an invoice
   */
  async detectAndCreate(
    invoiceId: string,
    tenantId: string,
    detectedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InvoiceException[]> {
    // Detect exceptions
    const detectedExceptions = await this.detectionService.detectExceptions(invoiceId, tenantId);

    // Create exception records
    const createdExceptions: InvoiceException[] = [];

    for (const exception of detectedExceptions) {
      // Check if exception already exists
      const existing = await this.getByInvoiceAndType(invoiceId, exception.exception_type, tenantId);
      if (existing && existing.status === 'open') {
        continue; // Skip if already exists and open
      }

      // Create exception
      const { data: exceptionData, error } = await this.supabase
        .from('invoice_exceptions')
        .insert({
          tenant_id: tenantId,
          invoice_id: invoiceId,
          exception_type: exception.exception_type,
          severity: exception.severity,
          status: exception.status,
          title: exception.title,
          description: exception.description,
          exception_data: exception.exception_data,
          detected_at: exception.detected_at,
        })
        .select()
        .single();

      if (error) {
        console.error(`Failed to create exception: ${error.message}`);
        continue;
      }

      // Create audit trail
      await this.auditTrail.insert({
        entity_type: 'invoice_exception',
        entity_id: exceptionData.id,
        action: 'detect',
        action_by: detectedBy,
        new_state: exceptionData as Record<string, unknown>,
        workflow_stage: 'open',
        workflow_state: {
          exception_type: exception.exception_type,
          severity: exception.severity,
          invoice_id: invoiceId,
        },
        tenant_id: tenantId,
        ip_address: requestContext?.ip_address,
        user_agent: requestContext?.user_agent,
        request_id: requestContext?.request_id,
      });

      createdExceptions.push(this.mapRowToException(exceptionData));
    }

    return createdExceptions;
  }

  /**
   * Get exceptions with filters (Exception-First View)
   * PRD A-01: Default view shows only problems
   */
  async getExceptions(filters?: ExceptionFilters, tenantId?: string): Promise<InvoiceException[]> {
    let query = this.supabase
      .from('invoice_exceptions')
      .select('*')
      .order('severity', { ascending: false }) // Critical first
      .order('detected_at', { ascending: false }); // Newest first

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default: Only show open exceptions (Exception-First)
      query = query.eq('status', 'open');
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.exception_type) {
      query = query.eq('exception_type', filters.exception_type);
    }

    if (filters?.invoice_id) {
      query = query.eq('invoice_id', filters.invoice_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get exceptions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToException(row));
  }

  /**
   * Get exception summary
   */
  async getSummary(tenantId: string): Promise<ExceptionSummary> {
    const { data, error } = await this.supabase
      .from('invoice_exceptions')
      .select('exception_type, severity, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'open');

    if (error) {
      throw new Error(`Failed to get exception summary: ${error.message}`);
    }

    const summary: ExceptionSummary = {
      total: data?.length || 0,
      blocking: 0,
      needs_action: 0,
      safe: 0,
      by_type: {} as Record<ExceptionType, number>,
      by_severity: {} as Record<ExceptionSeverity, number>,
    };

    for (const row of data || []) {
      const severity = row.severity as ExceptionSeverity;
      const type = row.exception_type as ExceptionType;

      // Count by severity
      summary.by_severity[severity] = (summary.by_severity[severity] || 0) + 1;

      // Count by type
      summary.by_type[type] = (summary.by_type[type] || 0) + 1;

      // Count by category
      if (severity === 'critical' || severity === 'high') {
        summary.blocking++;
      } else if (severity === 'medium') {
        summary.needs_action++;
      } else {
        summary.safe++;
      }
    }

    return summary;
  }

  /**
   * Resolve exception
   */
  async resolve(
    exceptionId: string,
    resolvedBy: string,
    resolutionNotes: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InvoiceException> {
    const currentException = await this.getById(exceptionId);
    if (!currentException) {
      throw new Error('Exception not found');
    }

    const { data: updatedException, error } = await this.supabase
      .from('invoice_exceptions')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution_notes: resolutionNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', exceptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve exception: ${error.message}`);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'invoice_exception',
      entity_id: exceptionId,
      action: 'resolve',
      action_by: resolvedBy,
      old_state: currentException,
      new_state: updatedException,
      workflow_stage: 'resolved',
      workflow_state: {
        resolution_notes: resolutionNotes,
      },
      tenant_id: currentException.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToException(updatedException);
  }

  /**
   * Get exception by ID
   */
  async getById(exceptionId: string): Promise<InvoiceException | null> {
    const { data, error } = await this.supabase
      .from('invoice_exceptions')
      .select('*')
      .eq('id', exceptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get exception: ${error.message}`);
    }

    return this.mapRowToException(data);
  }

  /**
   * Get exception by invoice and type
   */
  async getByInvoiceAndType(
    invoiceId: string,
    exceptionType: ExceptionType,
    tenantId: string
  ): Promise<InvoiceException | null> {
    const { data, error } = await this.supabase
      .from('invoice_exceptions')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('exception_type', exceptionType)
      .eq('tenant_id', tenantId)
      .eq('status', 'open')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    return this.mapRowToException(data);
  }

  /**
   * Map database row to InvoiceException
   */
  private mapRowToException(row: unknown): InvoiceException {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      invoice_id: r.invoice_id as string,
      exception_type: r.exception_type as ExceptionType,
      severity: r.severity as ExceptionSeverity,
      status: r.status as 'open' | 'in_progress' | 'resolved' | 'ignored',
      title: r.title as string,
      description: r.description as string,
      exception_data: (r.exception_data as Record<string, unknown>) || {},
      detected_at: r.detected_at as string,
      resolved_at: (r.resolved_at as string) || null,
      resolved_by: (r.resolved_by as string) || null,
      resolution_notes: (r.resolution_notes as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}

