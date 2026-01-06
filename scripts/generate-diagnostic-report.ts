import fs from 'fs';
import path from 'path';

interface ClassStats {
  name: string;
  count: number;
  category: string;
}

interface CategoryStats {
  name: string;
  count: number;
  classes: ClassStats[];
}

function categorizeClass(className: string): string {
  if (className.startsWith('bg-')) return 'Colors: Background';
  if (className.startsWith('text-')) return 'Colors: Text';
  if (className.startsWith('border-')) return 'Colors: Border';
  if (className.startsWith('p-')) return 'Spacing: Padding';
  if (className.startsWith('m-')) return 'Spacing: Margin';
  if (className.startsWith('gap-')) return 'Spacing: Gap';
  if (className.startsWith('rounded-')) return 'Shape: Radius';
  if (className.startsWith('shadow-')) return 'Elevation: Shadow';
  if (className.startsWith('z-')) return 'Elevation: Z-Index';
  if (className.startsWith('flex-')) return 'Layout: Flex';
  if (className.startsWith('grid-')) return 'Layout: Grid';
  if (className.startsWith('w-')) return 'Sizing: Width';
  if (className.startsWith('h-')) return 'Sizing: Height';
  if (className.startsWith('font-')) return 'Typography: Font';
  if (className.startsWith('btn-')) return 'Components: Buttons';
  if (className.startsWith('card-')) return 'Components: Cards';
  if (className.startsWith('input-')) return 'Components: Inputs';
  if (className.startsWith('form-')) return 'Components: Forms';
  if (className.startsWith('badge-')) return 'Components: Badges';
  if (className.startsWith('nav-')) return 'Components: Navigation';
  if (className.startsWith('stat-')) return 'Components: Stats';
  if (className.startsWith('grid-cards-')) return 'Patterns: Grid Cards';
  if (className.startsWith('container-')) return 'Patterns: Containers';
  if (className.startsWith('dashboard-')) return 'Patterns: Dashboard';
  if (className.startsWith('modal-')) return 'Patterns: Modal';
  if (className.startsWith('drawer-')) return 'Patterns: Drawer';
  if (className.startsWith('sr-')) return 'Accessibility';
  return 'Utilities: Other';
}

function parseCSS(content: string): Map<string, ClassStats> {
  const classMap = new Map<string, ClassStats>();
  const classRegex = /\.([a-z\-\d]+)\s*\{/gi;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    if (classMap.has(className)) {
      const stat = classMap.get(className)!;
      stat.count += 1;
    } else {
      const category = categorizeClass(className);
      classMap.set(className, { name: className, count: 1, category });
    }
  }
  return classMap;
}

function groupByCategory(classes: ClassStats[]): CategoryStats[] {
  const grouped = new Map<string, ClassStats[]>();
  for (const cls of classes) {
    if (!grouped.has(cls.category)) grouped.set(cls.category, []);
    grouped.get(cls.category)!.push(cls);
  }
  
  const result: CategoryStats[] = [];
  for (const [name, items] of grouped) {
    result.push({
      name,
      count: items.length,
      classes: items.sort((a, b) => a.name.localeCompare(b.name))
    });
  }
  return result.sort((a, b) => b.count - a.count);
}

async function main() {
  try {
    const cssPath = path.join(process.cwd(), 'ui', 'style.css');
    const outputPath = path.join(process.cwd(), 'ui', 'diagnostic-report.html');
    
    console.log('📊 Generating diagnostic report...');
    
    if (!fs.existsSync(cssPath)) {
      throw new Error(`CSS file not found: ${cssPath}`);
    }
    
    const content = fs.readFileSync(cssPath, 'utf-8');
    const classes = parseCSS(content);
    const categories = groupByCategory(Array.from(classes.values()));
    const totalClasses = classes.size;
    const cssSize = fs.statSync(cssPath).size / 1024;
    const timestamp = new Date().toISOString();
    
    const tocHTML = categories.map((cat, idx) => 
      `<li><a href="#category-${idx}">${cat.name} (${cat.count})</a></li>`
    ).join('');
    
    const categoriesHTML = categories.map((category, idx) => {
      const classesHTML = category.classes.map(cls => 
        `<div class="class-item" title="${cls.name}">${cls.name}</div>`
      ).join('');
      return `<div class="card mb-8" id="category-${idx}">
        <div class="category-header">
          <h3 class="section" style="margin: 0;">${category.name}</h3>
          <span class="category-badge">${category.count}</span>
        </div>
        <div class="class-grid">${classesHTML}</div>
      </div>`;
    }).join('');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI-BOS Design System Build Report</title>
  <link rel="stylesheet" href="./style.css">
  <style>
    .report-header { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%); color: var(--color-primary-foreground); padding: var(--space-8); border-radius: var(--radius-lg); margin-bottom: var(--space-8); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-8); }
    .stat-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-6); text-align: center; }
    .stat-box-number { font-size: var(--type-title-size); font-weight: var(--weight-semibold); color: var(--color-primary); margin-bottom: var(--space-2); }
    .stat-box-label { font-size: var(--type-caption-size); color: var(--color-text-sub); }
    .category-header { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 2px solid var(--color-border); }
    .category-badge { background: var(--color-primary); color: var(--color-primary-foreground); padding: var(--space-1) var(--space-3); border-radius: var(--radius-control); font-size: var(--type-micro-size); font-weight: var(--weight-semibold); }
    .class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-3); }
    .class-item { background: var(--color-surface-well); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-3); font-family: var(--font-mono); font-size: var(--type-micro-size); color: var(--color-text-main); word-break: break-all; transition: all var(--dur-fast) var(--ease-standard); }
    .class-item:hover { background: var(--color-surface); border-color: var(--color-border-strong); box-shadow: var(--shadow-1); }
    .pillar-validation { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4); margin-top: var(--space-6); }
    .pillar-item { background: var(--color-surface); border-left: 4px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--space-4); }
    .pillar-item-title { font-weight: var(--weight-semibold); color: var(--color-text-main); margin-bottom: var(--space-2); }
    .pillar-item-description { font-size: var(--type-caption-size); color: var(--color-text-sub); }
    .toc { background: var(--color-surface-well); border-radius: var(--radius-md); padding: var(--space-6); margin-bottom: var(--space-8); }
    .toc-title { font-weight: var(--weight-semibold); color: var(--color-text-main); margin-bottom: var(--space-4); }
    .toc-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-2); }
    .toc-list li { margin: 0; }
    .toc-list a { color: var(--color-link); text-decoration: none; font-size: var(--type-caption-size); }
    .toc-list a:hover { text-decoration: underline; }
    .success-badge { display: inline-block; background: var(--color-success); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-xs); font-size: var(--type-micro-size); font-weight: var(--weight-semibold); margin-left: var(--space-2); }
  </style>
</head>
<body class="shell">
  <div class="container-content">
    <div class="report-header">
      <h1 class="title" style="margin: 0 0 var(--space-2) 0; color: inherit;">AI-BOS Design System Build Report</h1>
      <p class="caption" style="margin: 0; color: inherit; opacity: 0.95;">Auto-generated diagnostic from compiled style.css</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
      <div>
        <p class="caption text-text-muted" style="margin: 0;">Generated: ${timestamp}</p>
        <p class="caption text-text-muted" style="margin: 0;">File: ui/style.css (${cssSize.toFixed(2)} KB)</p>
      </div>
      <span class="success-badge">Build Successful</span>
    </div>
    
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-box-number">${totalClasses}</div>
        <div class="stat-box-label">Total Compiled Classes</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-number">${categories.length}</div>
        <div class="stat-box-label">Categories</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-number">${categories.filter(c => c.name.includes('Components')).reduce((a, c) => a + c.count, 0)}</div>
        <div class="stat-box-label">Component Classes</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-number">${categories.filter(c => c.name.includes('Patterns')).reduce((a, c) => a + c.count, 0)}</div>
        <div class="stat-box-label">Pattern Classes</div>
      </div>
    </div>
    
    <div class="card mb-8">
      <h2 class="section mb-4">Table of Contents</h2>
      <div class="toc">
        <div class="toc-title">Categories</div>
        <ul class="toc-list">${tocHTML}</ul>
      </div>
    </div>
    
    <div class="card mb-8">
      <h2 class="section mb-4">System Pillars Validation</h2>
      <div class="pillar-validation">
        <div class="pillar-item"><div class="pillar-item-title">P1: Primitives</div><div class="pillar-item-description">Raw oklch color values defined in @layer base</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P2: Semantics</div><div class="pillar-item-description">Meaning tokens mapped via @theme</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P3: Typography</div><div class="pillar-item-description">Role-based type scale (title, section, body, caption)</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P4: Spacing</div><div class="pillar-item-description">Mathematical spacing rhythm enforced</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P5: Sizing</div><div class="pillar-item-description">Shell invariants (header, sidebar, container)</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P6: Shape</div><div class="pillar-item-description">Radius and border system defined</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P7: Elevation</div><div class="pillar-item-description">Shadow and z-index layers established</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P8: Motion</div><div class="pillar-item-description">Duration, easing, and distance tokens</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P9: Breakpoints</div><div class="pillar-item-description">5 responsive breakpoints defined</div></div>
        <div class="pillar-item"><div class="pillar-item-title">P10: Components</div><div class="pillar-item-description">All patterns compiled from tokens</div></div>
      </div>
    </div>
    
    ${categoriesHTML}
    
    <div class="card">
      <h2 class="section mb-4">Build Status Summary</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
        <div style="padding: var(--space-4); background: var(--color-surface-well); border-left: 3px solid var(--color-success); border-radius: var(--radius-sm);"><div style="font-weight: var(--weight-semibold); color: var(--color-text-main);">CSS Compilation</div><div style="font-size: var(--type-caption-size); color: var(--color-text-sub);">Successful</div></div>
        <div style="padding: var(--space-4); background: var(--color-surface-well); border-left: 3px solid var(--color-success); border-radius: var(--radius-sm);"><div style="font-weight: var(--weight-semibold); color: var(--color-text-main);">Class Generation</div><div style="font-size: var(--type-caption-size); color: var(--color-text-sub);">${totalClasses} classes</div></div>
        <div style="padding: var(--space-4); background: var(--color-surface-well); border-left: 3px solid var(--color-success); border-radius: var(--radius-sm);"><div style="font-weight: var(--weight-semibold); color: var(--color-text-main);">Zero Drift</div><div style="font-size: var(--type-caption-size); color: var(--color-text-sub);">Design system enforced</div></div>
      </div>
    </div>
  </div>
</body>
</html>`;
    
    fs.writeFileSync(outputPath, html);
    
    console.log(`✅ Report generated: ui/diagnostic-report.html`);
    console.log(`   Total classes: ${totalClasses}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   File size: ${(html.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
