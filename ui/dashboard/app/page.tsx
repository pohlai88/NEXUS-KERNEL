import { getCachedConcepts, getCachedValueSets, getCachedValues } from '@aibos/kernel/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart } from '@/components/charts';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Analytics computation (simplified from v2.0)
function computeAnalytics(valueSets: Set<string>) {
  const rootDir = join(process.cwd(), '..', '..');
  const canonPath = join(rootDir, 'kernel_canon_requirements.json');
  const globalPath = join(rootDir, 'kernel_global_config_requirements.json');
  
  if (!existsSync(canonPath) || !existsSync(globalPath)) {
    return null;
  }
  
  const canonReqs = JSON.parse(readFileSync(canonPath, 'utf-8'));
  const globalReqs = JSON.parse(readFileSync(globalPath, 'utf-8'));
  
  const allCanons = { ...canonReqs.tier1, ...canonReqs.tier2 };
  
  const coverage = Object.entries(allCanons).map(([key, req]: [string, any]) => {
    const missing = req.required.filter((vs: string) => !valueSets.has(vs));
    const pct = ((req.required.length - missing.length) / req.required.length) * 100;
    const status = missing.length === 0 ? 'READY' : pct > 50 ? 'PARTIAL' : 'BLOCKED';
    const tier = canonReqs.tier1[key] ? 1 : 2;
    
    return { name: key, tier, required: req.required.length, missing, pct, status, description: req.description };
  });

  const tier1 = coverage.filter(c => c.tier === 1);
  const verdict = tier1.every(c => c.status === 'READY') ? 'READY' : 
                  tier1.some(c => c.status === 'BLOCKED') ? 'NOT READY' : 'PARTIAL';

  return { coverage, verdict, tier1 };
}

function getTemplateStats() {
  const rootDir = join(process.cwd(), '..', '..');
  const templatesDir = join(rootDir, 'templates');
  
  if (!existsSync(templatesDir)) return [];
  
  const files = readdirSync(templatesDir).filter(f => f.startsWith('template-') && f.endsWith('.pack.json'));
  
  return files.map(file => {
    const content = JSON.parse(readFileSync(join(templatesDir, file), 'utf-8'));
    const jurisdiction = file.replace('template-', '').replace('.pack.json', '');
    const valueSets = new Set(content.values?.map((v: any) => v.value_set_code) || []);
    
    return {
      jurisdiction,
      name: content.name,
      valueCount: content.values?.length || 0,
      valueSetCount: valueSets.size
    };
  }).sort((a, b) => b.valueCount - a.valueCount);
}

export default async function DashboardPage() {
  const conceptsObj = await getCachedConcepts();
  const valueSetsObj = await getCachedValueSets();
  const valuesObj = await getCachedValues();
  
  // Convert objects to arrays
  const concepts = Object.values(conceptsObj);
  const valueSets = Object.values(valueSetsObj);
  const values = Object.values(valuesObj);
  
  const valueSetCodes = new Set(valueSets.map((vs: any) => vs.code));
  const analytics = computeAnalytics(valueSetCodes);
  const templates = getTemplateStats();
  
  const totalValueSets = valueSets.length;
  const totalValues = values.length;
  const totalConcepts = concepts.length;
  
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto" style={{ padding: 'var(--space-page)' }}>
        <div className="space-y-2" style={{ marginBottom: 'var(--space-section)' }}>
          {/* Header with Quantum Obsidian typography */}
          <h1 className="text-display">NEXUS-KERNEL Dashboard</h1>
          <p className="text-body" style={{ color: 'var(--color-text-sub)' }}>
            Production-grade L0 business constitution monitor
          </p>
        </div>

        {/* Stats Grid - using grid-dashboard utility */}
        <div className="grid-dashboard" style={{ marginBottom: 'var(--space-section)' }}>
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Total Concepts</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {totalConcepts}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Value Sets</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {totalValueSets}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Values</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {totalValues}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader style={{ paddingBottom: 'var(--space-2)' }}>
              <CardDescription>Jurisdictions</CardDescription>
              <CardTitle className="text-title" style={{ color: 'var(--color-primary)' }}>
                {templates.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Verdict Alert */}
        {analytics && (
          <Alert 
            className={
              analytics.verdict === 'READY' ? 'border-success bg-success-bg' :
              analytics.verdict === 'PARTIAL' ? 'border-warning bg-warning-bg' :
              'border-danger bg-danger-bg'
            }
            style={{ marginBottom: 'var(--space-section)' }}
          >
            <AlertDescription className="flex items-center justify-between">
              <span className="text-section">
                Production Readiness: <Badge variant={
                  analytics.verdict === 'READY' ? 'default' : 'destructive'
                }>{analytics.verdict}</Badge>
              </span>
              <span className="text-caption">
                {analytics.tier1.filter(c => c.status === 'READY').length}/{analytics.tier1.length} Tier 1 Canons Complete
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Coverage Trend Visualization */}
        {analytics && analytics.coverage && analytics.coverage.length > 0 && (
          <div style={{ marginBottom: 'var(--space-section)' }}>
            <LineChart
              data={{
                labels: analytics.coverage.slice(0, 6).map((c: any) => c.name),
                datasets: [{
                  label: 'Coverage %',
                  data: analytics.coverage.slice(0, 6).map((c: any) => {
                    const pct = Math.round(c.pct);
                    return isNaN(pct) ? 0 : pct;
                  }),
                  color: 'var(--color-primary)',
                  fill: true
                }]
              }}
              title="Canon Coverage Overview"
              subtitle="Completion percentage across top business domains"
              height={240}
              showLegend={false}
              showGrid={true}
              animate={true}
            />
          </div>
        )}

        {/* Coverage Matrix */}
        {analytics && (
          <Card style={{ marginBottom: 'var(--space-section)' }}>
            <CardHeader>
              <CardTitle className="text-title">Canon Compliance</CardTitle>
              <CardDescription>Coverage across business domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {analytics.coverage.slice(0, 10).map((canon: any) => (
                  <div key={canon.name} className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                        <span className="text-body" style={{ fontWeight: 'var(--weight-medium)' }}>
                          {canon.name}
                        </span>
                        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                          <Badge variant={
                            canon.status === 'READY' ? 'default' :
                            canon.status === 'PARTIAL' ? 'secondary' :
                            'destructive'
                          }>
                            {canon.status}
                          </Badge>
                          <span className="text-caption">{Math.round(canon.pct)}%</span>
                        </div>
                      </div>
                      <div 
                        className="rounded-full overflow-hidden" 
                        style={{ 
                          height: 'var(--space-2)', 
                          background: 'var(--color-surface-well)' 
                        }}
                      >
                        <div 
                          className={`h-full transition-all ${
                            canon.status === 'READY' ? 'bg-success' :
                            canon.status === 'PARTIAL' ? 'bg-warning' :
                            'bg-danger'
                          }`}
                          style={{ width: `${canon.pct}%` }}
                        />
                      </div>
                      {canon.missing.length > 0 && (
                        <p className="text-micro" style={{ marginTop: 'var(--space-1)' }}>
                          Missing: {canon.missing.slice(0, 3).join(', ')}
                          {canon.missing.length > 3 && ` +${canon.missing.length - 3} more`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jurisdiction Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-title">Jurisdictional Templates</CardTitle>
            <CardDescription>Coverage by country/region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
              {templates.map(t => (
                <div 
                  key={t.jurisdiction} 
                  className="interactive"
                  style={{ 
                    padding: 'var(--space-4)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div className="text-body" style={{ fontWeight: 'var(--weight-semibold)', textTransform: 'capitalize' }}>
                    {t.jurisdiction}
                  </div>
                  <div className="text-caption" style={{ marginTop: 'var(--space-1)' }}>
                    {t.name}
                  </div>
                  <div className="flex text-micro" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <span>{t.valueSetCount} sets</span>
                    <span>{t.valueCount.toLocaleString()} values</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
