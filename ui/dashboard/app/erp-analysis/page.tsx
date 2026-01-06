import { promises as fs } from 'fs';
import { join } from 'path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

/**
 * ERPNext Gap Analysis
 * 
 * Purpose: Compare ERPNext Standard features vs NEXUS-KERNEL implementation
 * Analysis: Available in ERPNext → Implemented in Kernel → Gaps to Close
 * Use Case: Product roadmap, feature prioritization, compliance verification
 */

export const metadata = {
  title: 'ERPNext Gap Analysis | NEXUS-KERNEL',
  description: 'Compare ERPNext standard features vs implemented capabilities and identify gaps'
};

interface ERPNextAccount {
  account_name: string;
  account_type: string;
  root_type: string;
  is_group: boolean;
  parent_account: string;
}

interface ERPNextTax {
  name: string;
  rate: number;
  type: string;
  account_head: string;
}

interface ERPNextPaymentTerm {
  payment_term_name: string;
  credit_days: number;
  due_date_based_on: string;
}

interface TemplateValue {
  code: string;
  value_set_code: string;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface TemplateData {
  id: string;
  name: string;
  values: TemplateValue[];
  referenced_value_sets: string[];
  referenced_concepts: string[];
}

interface GapAnalysisRow {
  feature: string;
  category: string;
  jurisdiction: string;
  erpnext_available: boolean;
  kernel_implemented: boolean;
  status: 'Complete' | 'Partial' | 'Gap' | 'Not Applicable';
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
}

async function loadERPNextData() {
  const dataPath = join(process.cwd(), '..', '..', 'data');
  
  const accountsData = JSON.parse(
    await fs.readFile(join(dataPath, 'erpnext-chart-of-accounts.json'), 'utf-8')
  );
  
  const taxData = JSON.parse(
    await fs.readFile(join(dataPath, 'erpnext-tax-codes.json'), 'utf-8')
  );
  
  const paymentTermsData = JSON.parse(
    await fs.readFile(join(dataPath, 'erpnext-payment-terms.json'), 'utf-8')
  );
  
  return { accounts: accountsData, taxes: taxData, paymentTerms: paymentTermsData };
}

async function loadTemplateData(templateId: string): Promise<TemplateData | null> {
  try {
    const templatePath = join(process.cwd(), '..', '..', 'templates', `template-${templateId}.pack.json`);
    const data = JSON.parse(await fs.readFile(templatePath, 'utf-8'));
    return data;
  } catch (error) {
    return null;
  }
}

function analyzeGaps(
  erpnextData: { accounts: any; taxes: any; paymentTerms: any },
  templates: Record<string, TemplateData>
): GapAnalysisRow[] {
  const gaps: GapAnalysisRow[] = [];
  
  // Analyze Chart of Accounts coverage
  Object.entries(erpnextData.accounts).forEach(([jurisdiction, accounts]) => {
    const accountList = accounts as ERPNextAccount[];
    const template = templates[jurisdiction.toLowerCase()];
    
    const erpnextAccountTypes = new Set(accountList.map(a => a.account_type));
    const kernelAccountTypes = template
      ? new Set(template.values.filter(v => v.value_set_code === 'ACCOUNT_TYPE').map(v => v.code))
      : new Set();
    
    erpnextAccountTypes.forEach(accountType => {
      const implemented = kernelAccountTypes.has(accountType.toUpperCase().replace(/ /g, '_'));
      gaps.push({
        feature: `Account Type: ${accountType}`,
        category: 'Chart of Accounts',
        jurisdiction,
        erpnext_available: true,
        kernel_implemented: implemented,
        status: implemented ? 'Complete' : 'Gap',
        priority: accountType === 'Asset' || accountType === 'Liability' ? 'High' : 'Medium',
        notes: implemented ? 'Fully implemented' : 'Missing from kernel template'
      });
    });
    
    // Analyze specific accounts
    const criticalAccounts = accountList.filter(a => 
      ['Cash', 'Bank', 'Accounts Receivable', 'Accounts Payable', 'Sales', 'Cost of Goods Sold'].includes(a.account_name)
    );
    
    criticalAccounts.forEach(account => {
      const hasAccount = template?.values.some(v => 
        v.label?.includes(account.account_name) || v.description?.includes(account.account_name)
      );
      
      gaps.push({
        feature: `Critical Account: ${account.account_name}`,
        category: 'Chart of Accounts',
        jurisdiction,
        erpnext_available: true,
        kernel_implemented: hasAccount || false,
        status: hasAccount ? 'Complete' : 'Gap',
        priority: 'High',
        notes: hasAccount ? 'Core account configured' : 'Core account missing'
      });
    });
  });
  
  // Analyze Tax Code coverage
  Object.entries(erpnextData.taxes).forEach(([jurisdiction, taxes]) => {
    const taxList = taxes as ERPNextTax[];
    const template = templates[jurisdiction.toLowerCase()];
    
    taxList.forEach(tax => {
      const hasTax = template?.values.some(v => 
        v.value_set_code === 'TAX_CODE' && 
        (v.label?.includes(tax.name) || v.metadata?.rate === tax.rate)
      );
      
      gaps.push({
        feature: `Tax Code: ${tax.name} (${tax.rate}%)`,
        category: 'Tax & Compliance',
        jurisdiction,
        erpnext_available: true,
        kernel_implemented: hasTax || false,
        status: hasTax ? 'Complete' : 'Gap',
        priority: tax.rate > 0 ? 'High' : 'Medium',
        notes: hasTax ? 'Tax configured' : 'Tax code not configured'
      });
    });
  });
  
  // Analyze Payment Terms (global, not jurisdiction-specific)
  if (Array.isArray(erpnextData.paymentTerms)) {
    const paymentTermsList = erpnextData.paymentTerms as ERPNextPaymentTerm[];
    
    // Check each jurisdiction's template for payment terms
    Object.entries(templates).forEach(([jurisdictionKey, template]) => {
      const jurisdiction = jurisdictionKey.toUpperCase();
      
      paymentTermsList.forEach(term => {
        const hasTerm = template?.values.some(v => 
          v.value_set_code === 'PAYMENT_TERM' && v.label?.includes(term.payment_term_name)
        );
        
        gaps.push({
          feature: `Payment Term: ${term.payment_term_name}`,
          category: 'Payment Terms',
          jurisdiction,
          erpnext_available: true,
          kernel_implemented: hasTerm || false,
          status: hasTerm ? 'Complete' : 'Gap',
          priority: 'Medium',
          notes: hasTerm ? 'Payment term configured' : 'Payment term missing'
        });
      });
    });
  }
  
  return gaps;
}

export default async function ERPAnalysisPage() {
  const erpnextData = await loadERPNextData();
  
  // Load templates for key jurisdictions
  const templates: Record<string, TemplateData> = {};
  const jurisdictions = ['malaysia', 'singapore', 'australia', 'united-states', 'united-kingdom'];
  
  for (const jurisdiction of jurisdictions) {
    const template = await loadTemplateData(jurisdiction);
    if (template) {
      templates[jurisdiction] = template;
    }
  }
  
  const gaps = analyzeGaps(erpnextData, templates);
  
  // Calculate statistics
  const totalFeatures = gaps.length;
  const implemented = gaps.filter(g => g.kernel_implemented).length;
  const gapCount = gaps.filter(g => !g.kernel_implemented).length;
  const implementationRate = Math.round((implemented / totalFeatures) * 100);
  
  const gapsByCategory = gaps.reduce((acc, gap) => {
    if (!acc[gap.category]) acc[gap.category] = { total: 0, gaps: 0 };
    acc[gap.category].total++;
    if (!gap.kernel_implemented) acc[gap.category].gaps++;
    return acc;
  }, {} as Record<string, { total: number; gaps: number }>);
  
  const gapsByJurisdiction = gaps.reduce((acc, gap) => {
    if (!acc[gap.jurisdiction]) acc[gap.jurisdiction] = { total: 0, gaps: 0 };
    acc[gap.jurisdiction].total++;
    if (!gap.kernel_implemented) acc[gap.jurisdiction].gaps++;
    return acc;
  }, {} as Record<string, { total: number; gaps: number }>);
  
  const highPriorityGaps = gaps.filter(g => !g.kernel_implemented && g.priority === 'High');
  
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
            <h1 className="text-4xl font-bold text-text-main">ERPNext Gap Analysis</h1>
            <p className="text-text-sub mt-2">
              Compare ERPNext standard features vs NEXUS-KERNEL implementation across jurisdictions
            </p>
          </div>
        </div>

        {/* Implementation Status Alert */}
        {implementationRate < 70 && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Action Required:</strong> {implementationRate}% implementation rate detected. 
              {highPriorityGaps.length} high-priority gaps need immediate attention for production readiness.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>ERPNext Features</CardDescription>
              <CardTitle className="text-3xl text-primary">{totalFeatures}</CardTitle>
              <p className="text-xs text-text-muted mt-1">Available in ERPNext</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Implemented</CardDescription>
              <CardTitle className="text-3xl text-success">{implemented}</CardTitle>
              <p className="text-xs text-text-muted mt-1">In NEXUS-KERNEL</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gaps</CardDescription>
              <CardTitle className="text-3xl text-destructive">{gapCount}</CardTitle>
              <p className="text-xs text-text-muted mt-1">Missing features</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Implementation Rate</CardDescription>
              <CardTitle className="text-3xl text-accent">{implementationRate}%</CardTitle>
              <p className="text-xs text-text-muted mt-1">Coverage percentage</p>
            </CardHeader>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gaps by Category</CardTitle>
              <CardDescription>Feature implementation status across business domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gapsByCategory).map(([category, stats]) => {
                  const percentage = Math.round(((stats.total - stats.gaps) / stats.total) * 100);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-text-main">{category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={stats.gaps > 0 ? 'destructive' : 'secondary'}>
                            {stats.gaps} gaps
                          </Badge>
                          <span className="text-sm text-text-sub">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-canvas-overlay rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percentage === 100 ? 'bg-success' : percentage >= 70 ? 'bg-accent' : 'bg-destructive'
                          }`}
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
              <CardTitle>Gaps by Jurisdiction</CardTitle>
              <CardDescription>Regional implementation coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gapsByJurisdiction).map(([jurisdiction, stats]) => {
                  const percentage = Math.round(((stats.total - stats.gaps) / stats.total) * 100);
                  return (
                    <div key={jurisdiction} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-text-main">{jurisdiction}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={stats.gaps > 0 ? 'destructive' : 'secondary'}>
                            {stats.gaps} gaps
                          </Badge>
                          <span className="text-sm text-text-sub">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-canvas-overlay rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percentage === 100 ? 'bg-success' : percentage >= 70 ? 'bg-accent' : 'bg-destructive'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Priority Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              High Priority Gaps
              <Badge variant="destructive">{highPriorityGaps.length}</Badge>
            </CardTitle>
            <CardDescription>Critical features missing from NEXUS-KERNEL that exist in ERPNext</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highPriorityGaps.slice(0, 15).map((gap, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{gap.feature}</TableCell>
                      <TableCell><Badge variant="outline">{gap.category}</Badge></TableCell>
                      <TableCell>{gap.jurisdiction}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Gap</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-text-sub">{gap.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {highPriorityGaps.length > 15 && (
                <p className="text-sm text-text-muted text-center py-4">
                  + {highPriorityGaps.length - 15} more high-priority gaps
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full Gap Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Feature Matrix</CardTitle>
            <CardDescription>ERPNext Standard vs NEXUS-KERNEL Implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>ERPNext</TableHead>
                    <TableHead>Kernel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gaps.slice(0, 50).map((gap, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{gap.feature}</TableCell>
                      <TableCell><Badge variant="outline">{gap.category}</Badge></TableCell>
                      <TableCell className="text-sm">{gap.jurisdiction}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">✓</Badge>
                      </TableCell>
                      <TableCell>
                        {gap.kernel_implemented ? (
                          <Badge variant="secondary">✓</Badge>
                        ) : (
                          <Badge variant="destructive">✗</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={gap.status === 'Complete' ? 'secondary' : 'destructive'}>
                          {gap.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={gap.priority === 'High' ? 'destructive' : gap.priority === 'Medium' ? 'default' : 'outline'}
                        >
                          {gap.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {gaps.length > 50 && (
                <p className="text-sm text-text-muted text-center py-4">
                  + {gaps.length - 50} more features analyzed
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Gap Closure Roadmap</CardTitle>
            <CardDescription>Recommended prioritization for feature implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-destructive pl-4">
                <h3 className="font-semibold text-text-main">Phase 1: Critical Gaps (High Priority)</h3>
                <p className="text-sm text-text-sub mt-1">
                  Focus on {highPriorityGaps.length} high-priority gaps, particularly in Chart of Accounts 
                  and Tax & Compliance categories. These are blocking features for production deployment.
                </p>
              </div>
              
              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-semibold text-text-main">Phase 2: Medium Priority Enhancements</h3>
                <p className="text-sm text-text-sub mt-1">
                  Implement missing payment terms and secondary account types. Improves feature parity 
                  but not blocking for initial launch.
                </p>
              </div>
              
              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-text-main">Phase 3: Jurisdiction Expansion</h3>
                <p className="text-sm text-text-sub mt-1">
                  Extend coverage to additional jurisdictions once core features reach 100% implementation.
                  Prioritize markets with highest business demand.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
