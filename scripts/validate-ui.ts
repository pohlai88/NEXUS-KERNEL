#!/usr/bin/env node
/**
 * NEXUS-KERNEL UI Validation Script
 * Tests strategic dashboard integration and functionality
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function pass(test: string, message: string, details?: any) {
  results.push({ test, status: 'PASS', message, details });
}

function fail(test: string, message: string, details?: any) {
  results.push({ test, status: 'FAIL', message, details });
}

function warn(test: string, message: string, details?: any) {
  results.push({ test, status: 'WARN', message, details });
}

console.log('\n' + '═'.repeat(70));
console.log('  🔬 NEXUS-KERNEL UI VALIDATION');
console.log('═'.repeat(70) + '\n');

// Test 1: File Existence
console.log('📁 Testing file structure...\n');

const filesToCheck = [
  { path: 'ui/packages/kernel-strategic-dashboard.html', required: true },
  { path: 'ui/packages/mckinsey-reporting-format_clean_8pages.html', required: true },
  { path: 'ui/packages/executive-summary.html', required: true },
  { path: 'ui/style.css', required: true },
  { path: 'ui/input.css', required: true },
  { path: 'scripts/serve-dashboard.ts', required: true },
  { path: 'scripts/dev-daemon.ts', required: true }
];

filesToCheck.forEach(({ path, required }) => {
  const fullPath = join(ROOT_DIR, path);
  if (existsSync(fullPath)) {
    const stats = statSync(fullPath);
    pass(
      `File: ${path}`,
      `Exists (${(stats.size / 1024).toFixed(2)} KB)`,
      { size: stats.size, modified: stats.mtime }
    );
  } else {
    if (required) {
      fail(`File: ${path}`, 'Missing required file');
    } else {
      warn(`File: ${path}`, 'Optional file not found');
    }
  }
});

// Test 2: HTML Structure Validation
console.log('\n📄 Validating HTML structure...\n');

try {
  const dashboardPath = join(ROOT_DIR, 'ui/packages/kernel-strategic-dashboard.html');
  const htmlContent = readFileSync(dashboardPath, 'utf-8');
  
  // Check for CSS link
  if (htmlContent.includes('<link rel="stylesheet" href="../style.css">')) {
    pass('CSS Link', 'External stylesheet correctly linked');
  } else {
    fail('CSS Link', 'Missing or incorrect stylesheet link');
  }
  
  // Check for XSS protection
  if (htmlContent.includes('function sanitizeHTML') && htmlContent.includes('function parseHTML')) {
    pass('XSS Protection', 'Security functions implemented');
  } else {
    fail('XSS Protection', 'Missing security sanitization functions');
  }
  
  // Check for localStorage integration
  if (htmlContent.includes('localStorage.setItem') && htmlContent.includes('localStorage.getItem')) {
    pass('Local Storage', 'Save/load functionality present');
  } else {
    warn('Local Storage', 'No localStorage integration found');
  }
  
  // Check for editable sections
  const editableSections = (htmlContent.match(/data-section="/g) || []).length;
  if (editableSections > 0) {
    pass('Editable Sections', `${editableSections} editable sections found`);
  } else {
    warn('Editable Sections', 'No editable sections detected');
  }
  
  // Check for McKinsey visual elements
  const hasObsidianShards = htmlContent.includes('insight-shard');
  const hasHarveyBalls = htmlContent.includes('harvey');
  const hasGoverningThought = htmlContent.includes('exec-recommendation');
  
  if (hasObsidianShards) pass('Obsidian Shards', 'Diamond markers present');
  if (hasHarveyBalls) pass('Harvey Balls', 'Scoring matrix present');
  if (hasGoverningThought) pass('Governing Thought', 'Executive headers present');
  
  // Check responsive design
  if (htmlContent.includes('@media')) {
    pass('Responsive Design', 'Media queries implemented');
  } else {
    warn('Responsive Design', 'No responsive breakpoints found');
  }
  
} catch (error: any) {
  fail('HTML Validation', `Failed to read HTML: ${error.message}`);
}

// Test 3: CSS Validation
console.log('\n🎨 Validating CSS system...\n');

try {
  const cssPath = join(ROOT_DIR, 'ui/style.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  
  const cssSize = statSync(cssPath).size;
  pass('CSS File Size', `${(cssSize / 1024).toFixed(2)} KB ${cssSize <= 90000 ? '✓ Optimized' : '⚠ Large'}`);
  
  // Check for design tokens
  const hasColorTokens = cssContent.includes('--color-primary') || cssContent.includes('color-primary');
  const hasSpacingTokens = cssContent.includes('--space-') || cssContent.includes('gap-');
  const hasTypography = cssContent.includes('--type-') || cssContent.includes('text-');
  
  if (hasColorTokens) pass('Color Tokens', 'Design system colors present');
  if (hasSpacingTokens) pass('Spacing Tokens', 'Rhythm system present');
  if (hasTypography) pass('Typography', 'Type scale present');
  
  // Count utility classes (rough estimate)
  const classMatches = cssContent.match(/\.[a-z-]+\s*{/g) || [];
  pass('Utility Classes', `~${classMatches.length} classes detected`);
  
} catch (error: any) {
  fail('CSS Validation', `Failed to read CSS: ${error.message}`);
}

// Test 4: JavaScript Functionality
console.log('\n⚙️ Validating JavaScript functionality...\n');

try {
  const dashboardPath = join(ROOT_DIR, 'ui/packages/kernel-strategic-dashboard.html');
  const htmlContent = readFileSync(dashboardPath, 'utf-8');
  
  const requiredFunctions = [
    'openEditModal',
    'closeEditModal',
    'saveEdit',
    'saveToLocal',
    'loadFromLocal',
    'exportData',
    'sanitizeHTML',
    'parseHTML'
  ];
  
  requiredFunctions.forEach(fn => {
    if (htmlContent.includes(`function ${fn}`)) {
      pass(`Function: ${fn}`, 'Implemented');
    } else {
      warn(`Function: ${fn}`, 'Not found or named differently');
    }
  });
  
} catch (error: any) {
  fail('JavaScript Validation', `Failed to validate JS: ${error.message}`);
}

// Test 5: Server Configuration
console.log('\n🌐 Validating server configuration...\n');

try {
  const packagePath = join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  
  const requiredScripts = [
    'dev:daemon',
    'dashboard:serve',
    'dashboard:watch',
    'dashboard:strategic',
    'dashboard:daemon',
    'dashboard:watch-css'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      pass(`Script: ${script}`, packageJson.scripts[script]);
    } else {
      fail(`Script: ${script}`, 'Missing from package.json');
    }
  });
  
  // Check for concurrently dependency
  if (packageJson.devDependencies?.concurrently) {
    pass('Dependency: concurrently', `v${packageJson.devDependencies.concurrently}`);
  } else {
    fail('Dependency: concurrently', 'Missing - required for daemon mode');
  }
  
} catch (error: any) {
  fail('Server Configuration', `Failed to validate: ${error.message}`);
}

// Print Results
console.log('\n' + '═'.repeat(70));
console.log('  📊 VALIDATION RESULTS');
console.log('═'.repeat(70) + '\n');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const warnings = results.filter(r => r.status === 'WARN').length;

results.forEach(({ test, status, message, details }) => {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  const color = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${icon}${reset} ${test.padEnd(45)} ${message}`);
  if (details && status === 'FAIL') {
    console.log(`   └─ ${JSON.stringify(details)}`);
  }
});

console.log('\n' + '─'.repeat(70));
console.log(`  Total Tests: ${results.length}`);
console.log(`  ${passed > 0 ? '\x1b[32m' : ''}✓ Passed: ${passed}\x1b[0m`);
console.log(`  ${failed > 0 ? '\x1b[31m' : ''}✗ Failed: ${failed}\x1b[0m`);
console.log(`  ${warnings > 0 ? '\x1b[33m' : ''}⚠ Warnings: ${warnings}\x1b[0m`);
console.log('─'.repeat(70));

if (failed === 0) {
  console.log('\n  🎉 All critical tests passed! Dashboard is ready.\n');
  console.log('  📍 Access URLs:');
  console.log('     Strategic Dashboard: http://localhost:8080/kernel-strategic-dashboard.html');
  console.log('     ERP Dashboard:       http://localhost:9001');
  console.log('     Dev Server:          http://localhost:9000\n');
  process.exit(0);
} else {
  console.log(`\n  ⚠️  ${failed} critical test(s) failed. Please review.\n`);
  process.exit(1);
}
