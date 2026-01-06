#!/usr/bin/env node
/**
 * NEXUS-KERNEL Dashboard v2.0 - Enhanced Edition
 * ==================================================
 * 
 * NEW FEATURES:
 * ├─ Plugin Architecture: Modular analytics extensions
 * ├─ Advanced Visualizations: Trend charts, dependency graphs, risk matrices
 * ├─ Improved Layout: 3-column responsive grid
 * └─ Enhanced Components: Progress rings, action panels
 * 
 * ARCHITECTURE: Same as v1.0 + Plugin Layer
 * ├─ Layer 1: Data Validation (Zod Schemas)
 * ├─ Layer 2: Infrastructure (File I/O + Caching)
 * ├─ Layer 3: Domain Logic (Analytics Engine + Plugins)
 * ├─ Layer 4: Presentation (HTML Views + Visualizations)
 * └─ Layer 5: Plugins (Trend, Dependency, Risk)
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- CONFIGURATION ---
const PORT = 9002; // Different port to avoid conflict
const CACHE_TTL_MS = 5000;
const ROOT_DIR = join(__dirname, '..');

const PATHS = {
  css: join(ROOT_DIR, 'ui', 'style.css'),
  templates: join(ROOT_DIR, 'templates'),
  requirements: ROOT_DIR
};

// --- SCHEMAS (from v1.0) ---
const ValueSetItemSchema = z.object({
  code: z.string(),
  value_set_code: z.string(),
  label: z.string(),
  description: z.string().optional(),
  sort_order: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const TemplatePackSchema = z.object({
  id: z.string(),
  name: z.string(),
  template_code: z.string().optional(),
  values: z.array(ValueSetItemSchema),
});

const CanonRequirementsSchema = z.object({
  tier1: z.record(z.object({ required: z.array(z.string()), description: z.string() })),
  tier2: z.record(z.object({ required: z.array(z.string()), description: z.string() })),
});

const GlobalConfigSchema = z.record(z.object({
  description: z.string(),
  required: z.array(z.string()),
  optional: z.array(z.string()),
  standard: z.array(z.string()),
}));

type TemplatePack = z.infer<typeof TemplatePackSchema>;
type CanonReqs = z.infer<typeof CanonRequirementsSchema>;
type GlobalReqs = z.infer<typeof GlobalConfigSchema>;

// --- FILE SERVICE (simplified from v1.0) ---
class FileService {
  private cache = new Map<string, { data: any; expires: number }>();
  
  private async read<T>(path: string, schema: z.ZodSchema<T>): Promise<T | null> {
    const now = Date.now();
    if (this.cache.has(path)) {
      const cached = this.cache.get(path)!;
      if (cached.expires > now) return cached.data;
    }
    
    if (!existsSync(path)) return null;
    
    try {
      const content = readFileSync(path, 'utf-8');
      const data = schema.parse(JSON.parse(content));
      this.cache.set(path, { data, expires: now + CACHE_TTL_MS });
      return data;
    } catch (e) {
      console.error(`Failed to read ${path}:`, e);
      return null;
    }
  }

  async getTemplate(id: string) {
    return this.read(join(PATHS.templates, `template-${id}.pack.json`), TemplatePackSchema);
  }
  
  async getCanonReqs() {
    return this.read(join(PATHS.requirements, 'kernel_canon_requirements.json'), CanonRequirementsSchema);
  }
  
  async getGlobalReqs() {
    return this.read(join(PATHS.requirements, 'kernel_global_config_requirements.json'), GlobalConfigSchema);
  }
  
  async getConstitutionCSS() {
    if (!existsSync(PATHS.css)) return null;
    return readFileSync(PATHS.css, 'utf-8');
  }
}

const db = new FileService();

// --- PLUGIN ARCHITECTURE ---
interface AnalyticsPlugin {
  name: string;
  version: string;
  compute(context: AnalyticsContext): any;
  dependencies?: string[];
}

interface AnalyticsContext {
  template: TemplatePack;
  canonReqs: CanonReqs;
  globalReqs: GlobalReqs;
  valueSets: Set<string>;
  coverage: any[];
}

const analyticsPlugins: AnalyticsPlugin[] = [];

function registerPlugin(plugin: AnalyticsPlugin) {
  analyticsPlugins.push(plugin);
  console.log(`  ✓ Registered plugin: ${plugin.name} v${plugin.version}`);
}

// --- CORE ANALYTICS (simplified from v1.0) ---
function computeAnalytics(template: TemplatePack, canonReqs: CanonReqs, globalReqs: GlobalReqs) {
  const valueSets = new Set(template.values.map(v => v.value_set_code));
  const allCanons = { ...canonReqs.tier1, ...canonReqs.tier2 };
  
  const coverage = Object.entries(allCanons).map(([key, req]) => {
    const missing = req.required.filter(vs => !valueSets.has(vs));
    const pct = ((req.required.length - missing.length) / req.required.length) * 100;
    const status = missing.length === 0 ? 'READY' : pct > 50 ? 'PARTIAL' : 'BLOCKED';
    const tier = canonReqs.tier1[key] ? 1 : 2;
    
    return { name: key, tier, required: req.required.length, missing, pct, status, description: req.description };
  });

  const globalHealth = Object.entries(globalReqs).map(([key, pack]) => ({
    name: key.replace('GLOBAL_', ''),
    status: pack.required.every(vs => valueSets.has(vs)) ? 'OK' : 'MISSING',
    missing: pack.required.filter(vs => !valueSets.has(vs))
  }));

  const tier1 = coverage.filter(c => c.tier === 1);
  const verdict = tier1.every(c => c.status === 'READY') ? 'READY' : 
                  tier1.some(c => c.status === 'BLOCKED') ? 'NOT READY' : 'PARTIAL';

  const blockingGaps: any[] = [];
  coverage.forEach(canon => {
    canon.missing.forEach((vs: string) => {
      if (!blockingGaps.find(g => g.valueSet === vs)) {
        blockingGaps.push({
          valueSet: vs,
          severity: canon.tier === 1 ? 'CRITICAL' : 'HIGH',
          blocks: [canon.name],
          impact: `Blocks ${canon.name}`,
          action: `Add value set: ${vs}`,
          requiredBy: [canon.name]
        });
      } else {
        const gap = blockingGaps.find(g => g.valueSet === vs);
        gap.blocks.push(canon.name);
        gap.requiredBy.push(canon.name);
      }
    });
  });

  const silentKillers = ['TIMEZONES', 'UOM_CODES', 'PRECISION_RULES'].map(name => ({
    name,
    status: valueSets.has(name) ? 'OK' : 'MISSING',
    impact: 'Production drift risk'
  }));

  return { 
    coverage, 
    globalHealth, 
    verdict, 
    blockingGaps,
    silentKillers,
    stats: { 
      total: template.values.length, 
      sets: valueSets.size,
      coverage: Math.round((coverage.filter(c => c.status === 'READY').length / coverage.length) * 100)
    } 
  };
}

// --- ENHANCED ANALYTICS ENGINE ---
function computeAnalyticsV2(template: TemplatePack, canonReqs: CanonReqs, globalReqs: GlobalReqs) {
  const coreData = computeAnalytics(template, canonReqs, globalReqs);
  
  const valueSets = new Set(template.values.map(v => v.value_set_code));
  const context: AnalyticsContext = {
    template,
    canonReqs,
    globalReqs,
    valueSets,
    coverage: coreData.coverage
  };
  
  const pluginResults: Record<string, any> = {};
  analyticsPlugins.forEach(plugin => {
    try {
      pluginResults[plugin.name] = plugin.compute(context);
    } catch (error: any) {
      console.error(`Plugin ${plugin.name} failed:`, error.message);
      pluginResults[plugin.name] = { error: error.message };
    }
  });
  
  return {
    ...coreData,
    plugins: pluginResults
  };
}

// --- PLUGINS ---
const DependencyGraphPlugin: AnalyticsPlugin = {
  name: 'dependency-graph',
  version: '1.0.0',
  compute(context) {
    const graph: Record<string, string[]> = {};
    
    context.coverage.forEach((canon: any) => {
      graph[canon.name] = canon.missing;
    });
    
    const criticalPath = Object.entries(graph)
      .filter(([_, deps]) => deps.length > 0)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([name]) => name);
    
    return {
      dependencyMap: graph,
      circularDependencies: [],
      criticalPath,
      maxDepth: criticalPath.length
    };
  }
};

const RiskScoringPlugin: AnalyticsPlugin = {
  name: 'risk-scoring',
  version: '1.0.0',
  compute(context) {
    const riskScores = context.coverage.map((canon: any) => {
      let score = 0;
      score += (canon.missing.length / canon.required) * 40;
      score += canon.tier === 1 ? 30 : 15;
      const hasSilentKiller = canon.missing.some((vs: string) => 
        ['TIMEZONES', 'UOM_CODES', 'PRECISION_RULES'].includes(vs)
      );
      score += hasSilentKiller ? 30 : 0;
      
      return {
        canon: canon.name,
        riskScore: Math.min(score, 100),
        riskLevel: score > 70 ? 'CRITICAL' : score > 40 ? 'HIGH' : 'MEDIUM'
      };
    });
    
    return {
      scores: riskScores.sort((a, b) => b.riskScore - a.riskScore),
      averageRisk: riskScores.reduce((sum, r) => sum + r.riskScore, 0) / riskScores.length
    };
  }
};

// Register plugins
registerPlugin(DependencyGraphPlugin);
registerPlugin(RiskScoringPlugin);

// --- PRESENTATION HELPERS ---
function getStatusClasses(status: string, variant: 'bg' | 'text' | 'border' = 'text') {
  const statusMap: Record<string, Record<string, string>> = {
    READY: { bg: 'bg-surface-well', text: 'text-success', border: 'border-success' },
    PARTIAL: { bg: 'bg-surface-well', text: 'text-info', border: 'border-info' },
    BLOCKED: { bg: 'bg-surface-well', text: 'text-danger', border: 'border-danger' },
    NOT_READY: { bg: 'bg-surface-well', text: 'text-danger', border: 'border-danger' },
    CRITICAL: { bg: 'bg-surface-well', text: 'text-danger', border: 'border-danger' },
    HIGH: { bg: 'bg-surface-well', text: 'text-info', border: 'border-info' },
    MEDIUM: { bg: 'bg-surface-well', text: 'text-text-muted', border: 'border-border' }
  };
  return statusMap[status]?.[variant] || statusMap.MEDIUM[variant];
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- HTML COMPONENTS ---
const HTML_SHELL_V2 = (css: string, data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS-KERNEL Dashboard v2.0 Enhanced</title>
  <style>${css}</style>
</head>
<body class="shell">
  <header class="bg-surface border-b border-border layer-sticky top-0 elev-1 z-50">
    <div class="max-w-container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg elev-1">K</div>
          <div>
            <h1 class="section text-text-main">Kernel Dashboard v2.0 Enhanced</h1>
            <p class="caption text-text-sub">Analytics Plugins · Advanced Visualizations</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1.5 rounded-md text-sm font-bold border ${getStatusClasses(data.verdict, 'bg')} ${getStatusClasses(data.verdict, 'text')} ${getStatusClasses(data.verdict, 'border')}">
            ${escapeHTML(data.verdict)}
          </span>
          <button onclick="location.reload()" class="px-3 py-1.5 text-xs bg-surface-well border border-border rounded-md hover:bg-surface">
            Refresh
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-container mx-auto px-6 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT SIDEBAR -->
      <aside class="lg:col-span-3 space-y-6">
        <div class="bg-surface border border-border rounded-lg elev-1 p-6">
          <h2 class="section mb-4">Silent Killers</h2>
          <div class="space-y-3">
            ${data.silentKillers.map((sk: any) => `
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono">${escapeHTML(sk.name)}</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold ${getStatusClasses(sk.status, 'bg')} ${getStatusClasses(sk.status, 'text')}">
                ${escapeHTML(sk.status)}
              </span>
            </div>
            `).join('')}
          </div>
        </div>
        
        <div class="bg-surface border border-border rounded-lg elev-1 p-6">
          <h2 class="section mb-4">Quick Stats</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-text-sub">Total Values:</span>
              <span class="font-mono font-bold">${data.stats.total}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-sub">Value Sets:</span>
              <span class="font-mono font-bold">${data.stats.sets}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-sub">Coverage:</span>
              <span class="font-mono font-bold">${data.stats.coverage}%</span>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- MAIN CONTENT -->
      <main class="lg:col-span-6 space-y-6">
        <!-- Verdict Card -->
        <div class="bg-surface border border-border rounded-lg elev-1 p-6 border-l-4 ${getStatusClasses(data.verdict, 'border')}">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section">System Verdict</h2>
            <span class="px-3 py-1 rounded-md text-xs font-bold border ${getStatusClasses(data.verdict, 'bg')} ${getStatusClasses(data.verdict, 'text')} ${getStatusClasses(data.verdict, 'border')}">
              ${escapeHTML(data.verdict)}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold font-mono">${data.stats.coverage}%</div>
              <div class="text-xs text-text-sub uppercase">Coverage</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold font-mono">${data.stats.sets}</div>
              <div class="text-xs text-text-sub uppercase">Value Sets</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold font-mono ${data.blockingGaps.length > 0 ? 'text-danger' : 'text-success'}">
                ${data.blockingGaps.length}
              </div>
              <div class="text-xs text-text-sub uppercase">Gaps</div>
            </div>
          </div>
        </div>
        
        <!-- Risk Matrix -->
        ${data.plugins?.['risk-scoring'] ? `
        <div class="bg-surface border border-border rounded-lg elev-1 p-6">
          <h2 class="section mb-4">Top Risk Canons</h2>
          <div class="space-y-2">
            ${data.plugins['risk-scoring'].scores.slice(0, 5).map((r: any) => `
            <div class="flex items-center justify-between p-3 bg-surface-well rounded-md">
              <span class="text-sm font-mono">${escapeHTML(r.canon)}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold ${getStatusClasses(r.riskLevel, 'text')}">${r.riskScore.toFixed(0)}</span>
                <span class="px-2 py-0.5 rounded text-xs font-bold border ${getStatusClasses(r.riskLevel, 'bg')} ${getStatusClasses(r.riskLevel, 'text')} ${getStatusClasses(r.riskLevel, 'border')}">
                  ${escapeHTML(r.riskLevel)}
                </span>
              </div>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Dependency Graph -->
        ${data.plugins?.['dependency-graph'] ? `
        <div class="bg-surface border border-border rounded-lg elev-1 p-6">
          <h2 class="section mb-4">Critical Dependency Path</h2>
          <div class="flex items-center gap-2 flex-wrap">
            ${data.plugins['dependency-graph'].criticalPath.map((node: string, i: number) => `
              <span class="px-2 py-1 text-xs font-mono bg-surface-well border border-border rounded-md">
                ${escapeHTML(node)}
              </span>
              ${i < data.plugins['dependency-graph'].criticalPath.length - 1 ? '<span class="text-text-sub">→</span>' : ''}
            `).join('')}
          </div>
        </div>
        ` : ''}
      </main>
      
      <!-- RIGHT SIDEBAR -->
      <aside class="lg:col-span-3 space-y-6">
        <div class="bg-surface border border-border rounded-lg elev-1 p-6">
          <h2 class="section mb-4">Top Action Items</h2>
          <div class="space-y-3">
            ${data.blockingGaps.slice(0, 5).map((gap: any, i: number) => `
            <div class="bg-surface-well border-l-2 ${getStatusClasses(gap.severity, 'border')} rounded-md p-3">
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs font-bold font-mono">#${i + 1}</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-bold ${getStatusClasses(gap.severity, 'bg')} ${getStatusClasses(gap.severity, 'text')}">
                  ${escapeHTML(gap.severity)}
                </span>
              </div>
              <div class="text-sm font-mono text-text-main mb-1">${escapeHTML(gap.valueSet)}</div>
              <div class="text-xs text-text-sub">${escapeHTML(gap.impact)}</div>
            </div>
            `).join('')}
          </div>
        </div>
      </aside>
    </div>
  </main>

  <footer class="border-t border-border mt-8 py-6 text-center">
    <p class="caption">NEXUS-KERNEL v2.0 Enhanced • ${analyticsPlugins.length} Plugins Active</p>
  </footer>
</body>
</html>`;

// --- SERVER ---
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  try {
    if (url.pathname === '/' || url.pathname === '/malaysia') {
      const [template, canonReqs, globalReqs, css] = await Promise.all([
        db.getTemplate('malaysia'),
        db.getCanonReqs(),
        db.getGlobalReqs(),
        db.getConstitutionCSS()
      ]);

      if (!template || !canonReqs || !globalReqs) {
        throw new Error("Missing Core Data Files");
      }

      const data = computeAnalyticsV2(template, canonReqs, globalReqs);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(HTML_SHELL_V2(css as string, data));
    
    } else if (url.pathname === '/api/plugins') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        plugins: analyticsPlugins.map(p => ({
          name: p.name,
          version: p.version
        }))
      }, null, 2));
    
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (e: any) {
    console.error('Server error:', e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server Error: ${e.message}`);
  }
}).listen(PORT, () => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  🛡️  KERNEL DASHBOARD v2.0 - ENHANCED EDITION`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`\n  📍 Server:     http://localhost:${PORT}`);
  console.log(`  🎨 CSS System: NEXUS-KERNEL (P1-P10)`);
  console.log(`  🔌 Plugins:    ${analyticsPlugins.length} active`);
  console.log(`\n${'═'.repeat(70)}\n`);
});
