/**
 * Tenants API Route
 * 
 * Get accessible tenants for current user (federated access).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from authentication
    const userId = request.headers.get('x-user-id') || 'system'; // Placeholder

    const tenantAccessRepo = new TenantAccessRepository();
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(userId);

    // Fetch tenant details
    const supabase = createClient();
    const tenantIds = accessibleTenants.map((t) => t.tenant_id);
    
    if (tenantIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, legal_name')
      .in('id', tenantIds);

    if (error) {
      throw new Error(`Failed to get tenants: ${error.message}`);
    }

    return NextResponse.json({ data: tenants || [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get tenants',
      },
      { status: 500 }
    );
  }
}

