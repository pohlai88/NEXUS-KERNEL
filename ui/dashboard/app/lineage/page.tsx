import { getCachedConcepts, getCachedValueSets, getCachedValues } from '@nexus/kernel/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * Data Lineage Explorer
 * 
 * Purpose: Visualize relationships and dependencies in the NEXUS-KERNEL ontology
 * Patterns: Concept → ValueSet → Value hierarchy with template usage tracking
 * Use Case: Impact analysis, dependency mapping, template design validation
 */

export const metadata = {
  title: 'Data Lineage | NEXUS-KERNEL',
  description: 'Visualize concept dependencies, value set relationships, and template usage patterns'
};

interface LineageNode {
  type: 'CONCEPT' | 'VALUESET' | 'VALUE' | 'TEMPLATE';
  code: string;
  label: string;
  children: LineageNode[];
  metadata?: Record<string, any>;
}

function buildConceptLineage(conceptCode: string, valueSetsObj: any, valuesObj: any): LineageNode {
  // Find value sets that reference this concept
  const relatedValueSets = Object.values(valueSetsObj).filter((vs: any) => 
    vs.code.includes(conceptCode.replace('CONCEPT_', ''))
  );
  
  const children: LineageNode[] = relatedValueSets.map((vs: any) => {
    // Find values in this value set
    const vsValues = Object.values(valuesObj).filter((v: any) => v.value_set_code === vs.code);
    
    return {
      type: 'VALUESET',
      code: vs.code,
      label: vs.description,
      metadata: { value_count: vsValues.length },
      children: vsValues.slice(0, 5).map((v: any) => ({
        type: 'VALUE',
        code: v.code,
        label: v.label || v.code,
        metadata: v,
        children: []
      }))
    };
  });
  
  return {
    type: 'CONCEPT',
    code: conceptCode,
    label: conceptCode.replace('CONCEPT_', ''),
    children,
    metadata: { downstream_count: children.length }
  };
}

function LineageTree({ node, level = 0 }: { node: LineageNode; level?: number }) {
  const indent = level * 24;
  
  const typeColors = {
    CONCEPT: 'bg-primary/10 text-primary border-primary/20',
    VALUESET: 'bg-info/10 border-info/20',
    VALUE: 'bg-canvas-overlay text-text-main border-border',
    TEMPLATE: 'bg-success/10 text-success border-success/20'
  };
  
  const typeIcons = {
    CONCEPT: '🎯',
    VALUESET: '📋',
    VALUE: '•',
    TEMPLATE: '📦'
  };
  
  return (
    <div style={{ marginLeft: `${indent}px`, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div 
        className={`border rounded-lg ${typeColors[node.type]}`}
        style={{ 
          padding: 'var(--space-3)', 
          transition: 'all var(--dur-fast) var(--ease-standard)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <span className="text-section">{typeIcons[node.type]}</span>
          <div className="flex-1">
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <Badge variant="outline" className="text-micro">{node.type}</Badge>
              <code className="text-caption" style={{ fontWeight: 'var(--weight-semibold)' }}>{node.code}</code>
            </div>
            <p className="text-micro" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-sub)' }}>
              {node.label}
            </p>
            {node.metadata && node.metadata.value_count !== undefined && (
              <p className="text-micro" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                {node.metadata.value_count} values
              </p>
            )}
          </div>
        </div>
      </div>
      
      {node.children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {node.children.map((child, idx) => (
            <LineageTree key={`${child.code}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function LineagePage() {
  const conceptsObj = await getCachedConcepts();
  const valueSetsObj = await getCachedValueSets();
  const valuesObj = await getCachedValues();
  
  const concepts = Object.values(conceptsObj);
  const valueSets = Object.values(valueSetsObj);
  const values = Object.values(valuesObj);
  
  // Build lineage for key concepts
  const keyConceptCodes = [
    'CONCEPT_PAYMENT_METHOD',
    'CONCEPT_ACCOUNT',
    'CONCEPT_TAX_TYPE',
    'CONCEPT_INVOICE',
    'CONCEPT_CUSTOMER'
  ].filter(code => (conceptsObj as any)[code]);
  
  const lineageTrees = keyConceptCodes.map(code => 
    buildConceptLineage(code, valueSetsObj, valuesObj)
  );
  
  // Calculate dependency stats
  const valueSetDependencies = valueSets.reduce((acc, vs: any) => {
    const count = Object.values(valuesObj).filter((v: any) => v.value_set_code === vs.code).length;
    return acc + (count > 0 ? 1 : 0);
  }, 0);
  
  const orphanedValueSets = valueSets.length - valueSetDependencies;
  
  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-link hover:text-link-hover">
              ← Back to Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-main">Data Lineage Explorer</h1>
            <p className="text-text-sub mt-2">Visualize concept relationships, value set dependencies, and template usage patterns</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Relationships</CardDescription>
              <CardTitle className="text-3xl text-primary">{values.length}</CardTitle>
              <p className="text-xs text-text-muted mt-1">Value → ValueSet connections</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Value Sets</CardDescription>
              <CardTitle className="text-3xl text-accent">{valueSetDependencies}</CardTitle>
              <p className="text-xs text-text-muted mt-1">Value sets with values</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Coverage</CardDescription>
              <CardTitle className="text-3xl text-success">
                {Math.round((valueSetDependencies / valueSets.length) * 100)}%
              </CardTitle>
              <p className="text-xs text-text-muted mt-1">ValueSet implementation rate</p>
            </CardHeader>
          </Card>
        </div>

        {/* Lineage Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Concept → ValueSet → Value Lineage</CardTitle>
            <CardDescription>
              Tracing data flow from abstract concepts through value sets to concrete enumerated values.
              This shows how business ontology (concepts) materializes into usable data (values).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lineageTrees.map(tree => (
                <div key={tree.code} className="border border-border rounded-lg p-4">
                  <LineageTree node={tree} />
                </div>
              ))}
              
              {lineageTrees.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  <p>No lineage data available for key concepts</p>
                  <p className="text-sm mt-2">Ensure concepts are properly linked to value sets</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dependency Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Value Set Distribution</CardTitle>
              <CardDescription>How values are distributed across value sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {valueSets.slice(0, 10).map((vs: any, idx: number) => {
                  const count = Object.values(valuesObj).filter((v: any) => v.value_set_code === vs.code).length;
                  const percentage = (count / values.length) * 100;
                  return (
                    <div key={`valueset-${vs.code || idx}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <code className="text-primary">{vs.code}</code>
                        <span className="text-text-sub">{count} values</span>
                      </div>
                      <div className="w-full bg-canvas-overlay rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dependency Health</CardTitle>
              <CardDescription>Orphaned and incomplete relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-canvas-overlay rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-main">Orphaned Value Sets</p>
                    <p className="text-xs text-text-muted">Value sets without any values</p>
                  </div>
                  <Badge variant={orphanedValueSets > 0 ? 'destructive' : 'secondary'}>
                    {orphanedValueSets}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-canvas-overlay rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-main">Implementation Rate</p>
                    <p className="text-xs text-text-muted">Value sets with values assigned</p>
                  </div>
                  <Badge variant="secondary">
                    {Math.round((valueSetDependencies / valueSets.length) * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-canvas-overlay rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-main">Average Values per Set</p>
                    <p className="text-xs text-text-muted">Mean number of values</p>
                  </div>
                  <Badge variant="secondary">
                    {valueSetDependencies > 0 ? Math.round(values.length / valueSetDependencies) : 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lineage Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Common Lineage Patterns</CardTitle>
            <CardDescription>Typical relationship structures in NEXUS-KERNEL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-text-main">1:N Pattern (Concept → Multiple ValueSets)</p>
                <p className="text-text-sub">
                  Example: CONCEPT_ACCOUNT → ACCOUNT_TYPE, ACCOUNT_CATEGORY, ACCOUNT_SUBTYPE
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Used when a business concept has multiple classification dimensions
                </p>
              </div>
              
              <div className="border-l-4 border-accent pl-4">
                <p className="font-semibold text-text-main">1:1 Pattern (Concept → Single ValueSet)</p>
                <p className="text-text-sub">
                  Example: CONCEPT_PAYMENT_METHOD → PAYMENT_METHOD valueset
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Simple enumeration where concept and valueset align directly
                </p>
              </div>
              
              <div className="border-l-4 border-success pl-4">
                <p className="font-semibold text-text-main">Hierarchical Pattern (ValueSet → Nested Values)</p>
                <p className="text-text-sub">
                  Example: ACCOUNT_TYPE → Asset → Current Asset → Cash & Bank
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Used for Chart of Accounts and hierarchical classifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
