'use client';

import { getCachedConcepts, getCachedValueSets, getCachedValues } from '@nexus/kernel/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { DataTable } from '@/components/data-table';
import { demoMetadataUsers } from './demo-data';

/**
 * Metadata Catalog - Data Dictionary & Documentation
 * 
 * Purpose: Comprehensive documentation of all kernel entities with field meanings
 * Audience: Developers, data analysts, business stakeholders
 * Pattern: Documentation-first approach (every field has purpose & meaning)
 * 
 * NEW: Demonstrates Figma Data Table v2 design with metadata documentation tracking
 */

// Note: metadata export removed as this is now a client component due to DataTable event handlers

function getConceptMetadata(conceptCode: string) {
  const metadata: Record<string, { description: string; category: string; fields: Record<string, string> }> = {
    CONCEPT_ACCOUNT: {
      description: 'Chart of Accounts entry - fundamental accounting entity for tracking financial transactions',
      category: 'ENTITY',
      fields: {
        code: 'Unique identifier for the concept (immutable)',
        category: 'ENTITY or ATTRIBUTE classification',
        description: 'Human-readable explanation of what this concept represents',
        canonical_name: 'The definitive name used across all systems',
        examples: 'Real-world usage scenarios'
      }
    },
    CONCEPT_INVOICE: {
      description: 'Commercial invoice document - legal instrument for billing and payment collection',
      category: 'ENTITY',
      fields: {
        code: 'Unique identifier following CONCEPT_ prefix convention',
        category: 'ENTITY - represents a business object',
        description: 'Details the invoice purpose, lifecycle, and compliance requirements',
        canonical_name: 'INVOICE - standardized across jurisdictions',
        related_concepts: 'Links to PAYMENT, TAX, CUSTOMER concepts'
      }
    },
    CONCEPT_PAYMENT_METHOD: {
      description: 'Method of payment execution - defines how monetary value is transferred',
      category: 'ATTRIBUTE',
      fields: {
        code: 'Unique identifier for the concept',
        category: 'ATTRIBUTE - describes properties of entities',
        description: 'Explains payment method characteristics, security, and settlement time',
        canonical_name: 'PAYMENT_METHOD - standardized term',
        valueset: 'PAYMENT_METHOD valueset contains actual methods (CASH, CARD, BANK_TRANSFER)'
      }
    }
  };
  return metadata[conceptCode] || {
    description: 'Kernel concept - represents a business entity or attribute in the L0 ontology',
    category: 'UNKNOWN',
    fields: {
      code: 'Unique concept identifier',
      category: 'Classification (ENTITY or ATTRIBUTE)',
      description: 'Purpose and meaning of this concept'
    }
  };
}

function getValueSetMetadata(valueSetCode: string) {
  const metadata: Record<string, { description: string; usage: string; governance: string }> = {
    PAYMENT_METHOD: {
      description: 'Enumeration of payment execution methods supported by the business',
      usage: 'Used in Payment, Invoice, PurchaseOrder entities to specify how money is transferred',
      governance: 'Tier 1 Canon - Required for Sales and Purchasing modules. Add new methods via kernel update only.'
    },
    TAX_TYPE: {
      description: 'Classification of tax obligations (GST, VAT, Sales Tax, Income Tax, etc.)',
      usage: 'Critical for Tax Compliance module. Maps to tax calculation rules and reporting categories',
      governance: 'Tier 1 Canon - Jurisdiction-specific. Must align with local tax authority definitions.'
    },
    ACCOUNT_TYPE: {
      description: 'Chart of Accounts classification (Asset, Liability, Income, Expense, Equity)',
      usage: 'Fundamental for Finance module. Determines financial statement presentation and balance rules',
      governance: 'Tier 1 Canon - Follows double-entry accounting principles. Immutable after transaction posting.'
    }
  };
  return metadata[valueSetCode] || {
    description: 'Value set defining allowed values for a specific business domain',
    usage: 'Referenced by one or more entities to constrain field values',
    governance: 'Managed via kernel updates. Check canon requirements for tier classification.'
  };
}

function getValueMetadata(valueCode: string, valueSetCode: string) {
  return {
    code: 'Unique identifier within the value set',
    label: 'Human-readable display text (localized)',
    description: 'Detailed explanation of when to use this value',
    metadata: 'Additional attributes (sort_order, is_default, validation_rules)',
    business_rules: 'Constraints or special handling requirements for this value',
    examples: 'Real-world scenarios where this value applies'
  };
}

export default async function CatalogPage() {
  const conceptsObj = await getCachedConcepts();
  const valueSetsObj = await getCachedValueSets();
  const valuesObj = await getCachedValues();
  
  const concepts = Object.values(conceptsObj);
  const valueSets = Object.values(valueSetsObj);
  const values = Object.values(valuesObj);
  
  // Group concepts by category
  const conceptsByCategory = concepts.reduce((acc, concept) => {
    const category = (concept as any)?.category || 'UNKNOWN';
    if (!acc[category]) acc[category] = [];
    acc[category].push(concept);
    return acc;
  }, {} as Record<string, typeof concepts>);
  
  // Get value counts per value set
  const valueCountsBySet = values.reduce((acc, value) => {
    const setCode = (value as any)?.value_set_code;
    if (setCode) {
      acc[setCode] = (acc[setCode] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate total payable (documentation tasks overdue)
  const totalPayable = demoMetadataUsers
    .filter(u => u.paymentStatus === 'Overdue' || u.paymentStatus === 'Unpaid')
    .reduce((sum, u) => sum + u.amount, 0);
  
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto" style={{ padding: 'var(--space-page)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-section)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <Link 
              href="/" 
              className="text-caption"
              style={{ color: 'var(--color-link)', transition: 'color var(--dur-fast) var(--ease-standard)' }}
            >
              ← Back to Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-display">Metadata Catalog</h1>
            <p className="text-body" style={{ color: 'var(--color-text-sub)', marginTop: 'var(--space-2)' }}>
              Complete data dictionary with field meanings, types, and usage documentation
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-dashboard" style={{ marginBottom: 'var(--space-section)' }}>
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Total Concepts</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {concepts.length}
              </CardTitle>
              <p className="text-micro" style={{ marginTop: 'var(--space-1)' }}>
                Business entities & attributes
              </p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Value Sets</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {valueSets.length}
              </CardTitle>
              <p className="text-micro" style={{ marginTop: 'var(--space-1)' }}>
                Enumeration definitions
              </p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Total Values</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {values.length}
              </CardTitle>
              <p className="text-micro" style={{ marginTop: 'var(--space-1)' }}>
                Allowed enumeration values
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* DataTable Demo - Metadata Documentation Status */}
        <div style={{ marginBottom: 'var(--space-section)' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 className="text-title">Documentation Tracking (Figma Data Table v2 Demo)</h2>
            <p className="text-body" style={{ color: 'var(--color-text-sub)', marginTop: 'var(--space-2)' }}>
              Track documentation status for kernel concepts and value sets. Filter by completion status,
              search by name, and expand rows to view documentation activities. This table implements all
              14 Figma Data Table v2 Community designs with Quantum Obsidian design tokens.
            </p>
          </div>
          
          <DataTable
            users={demoMetadataUsers}
            totalPayable={totalPayable}
            currency="USD"
            onPayDues={() => console.log('Complete pending documentation tasks')}
          />
        </div>

        {/*   </p>
            </CardHeader>
          </Card>
        </div>

        {/* Concepts Documentation */}
        <Card style={{ marginBottom: 'var(--space-section)' }}>
          <CardHeader>
            <CardTitle className="text-title">Concepts (Business Ontology)</CardTitle>
            <CardDescription>
              Concepts define WHAT EXISTS in AI-BOS. Each concept represents a business entity (INVOICE, CUSTOMER)
              or attribute (PAYMENT_METHOD, TAX_TYPE) with precise semantic meaning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(conceptsByCategory).map(([category, items]) => (
              <div 
                key={category} 
                style={{ 
                  marginBottom: 'var(--space-8)'
                }}
                className="last:mb-0"
              >
                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <Badge variant={category === 'ENTITY' ? 'default' : 'secondary'}>
                    {category}
                  </Badge>
                  <span className="text-caption">({items.length} concepts)</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {items.slice(0, 10).map((concept: any) => {
                    const meta = getConceptMetadata(concept.code);
                    return (
                      <div 
                        key={concept.code} 
                        className="interactive"
                        style={{ 
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-4)'
                        }}
                      >
                        <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                          <div>
                            <code className="text-body" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>
                              {concept.code}
                            </code>
                            <p className="text-body" style={{ color: 'var(--color-text-main)', marginTop: 'var(--space-1)' }}>
                              {concept.description}
                            </p>
                          </div>
                          <Badge variant="outline">{meta.category}</Badge>
                        </div>
                        
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          <div className="text-micro">
                            <span style={{ fontWeight: 'var(--weight-semibold)' }}>Purpose:</span> {meta.description}
                          </div>
                          <details className="text-micro">
                            <summary className="cursor-pointer" style={{ color: 'var(--color-link)', cursor: 'pointer' }}>
                              Field Documentation
                            </summary>
                            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', paddingLeft: 'var(--space-4)', borderLeft: '2px solid var(--color-border)' }}>
                              {Object.entries(meta.fields).map(([field, desc]) => (
                                <div key={field}>
                                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{field}</span>: {desc}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </div>
                    );
                  })}
                  {items.length > 10 && (
                    <p className="text-sm text-text-muted text-center py-2">
                      + {items.length - 10} more {category.toLowerCase()} concepts
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Value Sets Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Value Sets (Enumerations)</CardTitle>
            <CardDescription>
              Value sets define allowed values for specific domains. Each value set contains enumerated values
              with governance rules and usage constraints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Value Set Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Values</TableHead>
                    <TableHead>Usage & Governance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valueSets.slice(0, 20).map((vs: any) => {
                    const meta = getValueSetMetadata(vs.code);
                    const count = valueCountsBySet[vs.code] || 0;
                    return (
                      <TableRow key={vs.code}>
                        <TableCell className="font-mono text-primary">{vs.code}</TableCell>
                        <TableCell className="max-w-md">
                          <div className="space-y-1">
                            <p className="text-sm">{vs.description}</p>
                            <p className="text-xs text-text-muted">{meta.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{count}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-text-sub max-w-xs">
                          <details>
                            <summary className="cursor-pointer text-link hover:text-link-hover">
                              View Details
                            </summary>
                            <div className="mt-2 space-y-1">
                              <div><span className="font-semibold">Usage:</span> {meta.usage}</div>
                              <div><span className="font-semibold">Governance:</span> {meta.governance}</div>
                            </div>
                          </details>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {valueSets.length > 20 && (
                <p className="text-sm text-text-muted text-center py-4">
                  + {valueSets.length - 20} more value sets
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Field Documentation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Field Documentation Standards</CardTitle>
            <CardDescription>Understanding metadata fields and their purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-main mb-2">Concept Fields</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="text-primary">code</code> - Unique immutable identifier (CONCEPT_ prefix)</div>
                  <div><code className="text-primary">category</code> - ENTITY (objects) or ATTRIBUTE (properties)</div>
                  <div><code className="text-primary">description</code> - Business purpose and semantic meaning</div>
                  <div><code className="text-primary">canonical_name</code> - Standardized term across systems</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-text-main mb-2">Value Set Fields</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="text-primary">code</code> - Unique valueset identifier</div>
                  <div><code className="text-primary">description</code> - Domain and usage explanation</div>
                  <div><code className="text-primary">governance</code> - Tier classification and update rules</div>
                  <div><code className="text-primary">values</code> - Array of allowed enumeration values</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-text-main mb-2">Value Fields</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="text-primary">code</code> - Unique value identifier within set</div>
                  <div><code className="text-primary">label</code> - Display text (localized)</div>
                  <div><code className="text-primary">description</code> - When to use this value</div>
                  <div><code className="text-primary">metadata</code> - Additional attributes (sort_order, is_default, etc.)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
