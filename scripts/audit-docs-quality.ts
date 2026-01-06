#!/usr/bin/env tsx
// @aibos/kernel - Documentation Quality Audit Script
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Audits the quality of remaining documentation files
// Ensures all whitelisted docs meet minimum quality standards (5/10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface DocQualityMetrics {
  file: string;
  exists: boolean;
  size: number;
  hasTitle: boolean;
  hasStructure: boolean;
  hasContent: boolean;
  hasMetadata: boolean;
  hasExamples: boolean;
  linkCount: number;
  codeBlockCount: number;
  qualityScore: number;
  issues: string[];
}

const REQUIRED_DOCS = {
  root: ['README.md', 'CHANGELOG.md', 'LICENSE'],
  docs: [
    'PRD-KERNEL_NPM.md',
    'PRD-KERNEL_ERP_PRODUCTION_READY.md',
    'NEXUS_CANON_V5_KERNEL_DOCTRINE.md',
  ],
};

function auditDocument(filePath: string, fileName: string): DocQualityMetrics {
  const metrics: DocQualityMetrics = {
    file: fileName,
    exists: false,
    size: 0,
    hasTitle: false,
    hasStructure: false,
    hasContent: false,
    hasMetadata: false,
    hasExamples: false,
    linkCount: 0,
    codeBlockCount: 0,
    qualityScore: 0,
    issues: [],
  };

  if (!existsSync(filePath)) {
    metrics.issues.push('File does not exist');
    return metrics;
  }

  metrics.exists = true;
  const content = readFileSync(filePath, 'utf-8');
  metrics.size = content.length;

  // LICENSE files are special - they don't need markdown formatting
  const isLicense = fileName.toLowerCase().includes('license');
  if (isLicense) {
    // LICENSE files just need to exist and have content
    let score = 0;
    if (metrics.exists) score += 3;
    if (metrics.size > 500) score += 2;
    if (metrics.size > 1000) score += 2;
    if (content.includes('MIT') || content.includes('Apache') || content.includes('GPL')) score += 2;
    if (content.includes('Copyright') || content.includes('copyright')) score += 1;
    metrics.qualityScore = Math.min(10, score);
    return metrics;
  }

  // Check for title (H1)
  metrics.hasTitle = /^#\s+.+$/m.test(content);
  if (!metrics.hasTitle) {
    metrics.issues.push('Missing H1 title');
  }

  // Check for structure (multiple headings)
  const headingCount = (content.match(/^#{1,6}\s+.+$/gm) || []).length;
  metrics.hasStructure = headingCount >= 3;
  if (!metrics.hasStructure) {
    metrics.issues.push(`Insufficient structure (${headingCount} headings, need 3+)`);
  }

  // Check for substantial content (at least 500 chars)
  metrics.hasContent = content.length >= 500;
  if (!metrics.hasContent) {
    metrics.issues.push(`Content too short (${content.length} chars, need 500+)`);
  }

  // Check for metadata (status, version, date, etc.)
  const metadataPatterns = [
    /status|Status|STATUS/i,
    /version|Version|VERSION/i,
    /date|Date|DATE/i,
    /author|Author|AUTHOR/i,
  ];
  metrics.hasMetadata = metadataPatterns.some((pattern) => pattern.test(content));
  if (!metrics.hasMetadata) {
    metrics.issues.push('Missing metadata (status, version, date, etc.)');
  }

  // Check for code examples (CHANGELOG doesn't need them)
  const isChangelog = fileName.toLowerCase().includes('changelog');
  metrics.codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
  metrics.hasExamples = metrics.codeBlockCount > 0;
  if (!metrics.hasExamples && !isChangelog) {
    metrics.issues.push('No code examples found');
  }

  // Count links
  metrics.linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;

  // Calculate quality score (0-10)
  let score = 0;
  if (metrics.exists) score += 2;
  if (metrics.hasTitle) score += 1;
  if (metrics.hasStructure) score += 1;
  if (metrics.hasContent) score += 1;
  if (metrics.hasMetadata) score += 1;
  if (metrics.hasExamples || isChangelog) score += 1;
  if (metrics.linkCount > 0) score += 1;
  if (metrics.size > 2000) score += 1;
  if (metrics.size > 5000) score += 1;
  if (headingCount >= 10) score += 1;

  metrics.qualityScore = Math.min(10, score);

  return metrics;
}

function auditAllDocs() {
  log('\n' + '═'.repeat(60), 'bright');
  log('  Documentation Quality Audit', 'bright');
  log('═'.repeat(60), 'bright');

  const allMetrics: DocQualityMetrics[] = [];

  // Audit root-level docs
  log('\n📄 Root-Level Documentation', 'cyan');
  for (const doc of REQUIRED_DOCS.root) {
    const filePath = join(process.cwd(), doc);
    const metrics = auditDocument(filePath, doc);
    allMetrics.push(metrics);

    const statusColor = metrics.qualityScore >= 5 ? 'green' : 'red';
    log(`\n  ${doc}`, 'bright');
    log(`    Quality Score: ${metrics.qualityScore}/10`, statusColor);
    log(`    Size: ${metrics.size.toLocaleString()} bytes`);
    log(`    Headings: ${(metrics.file.match(/^#{1,6}\s+.+$/gm) || []).length || 'N/A'}`);
    log(`    Code Blocks: ${metrics.codeBlockCount}`);
    log(`    Links: ${metrics.linkCount}`);

    if (metrics.issues.length > 0) {
      log(`    Issues:`, 'yellow');
      metrics.issues.forEach((issue) => log(`      - ${issue}`, 'yellow'));
    }
  }

  // Audit docs/ directory
  log('\n📁 docs/ Directory Documentation', 'cyan');
  for (const doc of REQUIRED_DOCS.docs) {
    const filePath = join(process.cwd(), 'docs', doc);
    const metrics = auditDocument(filePath, `docs/${doc}`);
    allMetrics.push(metrics);

    const statusColor = metrics.qualityScore >= 5 ? 'green' : 'red';
    log(`\n  ${doc}`, 'bright');
    log(`    Quality Score: ${metrics.qualityScore}/10`, statusColor);
    log(`    Size: ${metrics.size.toLocaleString()} bytes`);
    log(`    Headings: ${(metrics.file.match(/^#{1,6}\s+.+$/gm) || []).length || 'N/A'}`);
    log(`    Code Blocks: ${metrics.codeBlockCount}`);
    log(`    Links: ${metrics.linkCount}`);

    if (metrics.issues.length > 0) {
      log(`    Issues:`, 'yellow');
      metrics.issues.forEach((issue) => log(`      - ${issue}`, 'yellow'));
    }
  }

  // Summary
  log('\n' + '═'.repeat(60), 'bright');
  log('  Audit Summary', 'bright');
  log('═'.repeat(60), 'bright');

  const totalDocs = allMetrics.length;
  const passingDocs = allMetrics.filter((m) => m.qualityScore >= 5).length;
  const avgScore =
    allMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / totalDocs;

  log(`\nTotal Documents: ${totalDocs}`, 'cyan');
  log(`Passing (≥5/10): ${passingDocs}/${totalDocs}`, passingDocs === totalDocs ? 'green' : 'yellow');
  log(`Average Score: ${avgScore.toFixed(1)}/10`, avgScore >= 5 ? 'green' : 'red');

  // List failing docs
  const failingDocs = allMetrics.filter((m) => m.qualityScore < 5);
  if (failingDocs.length > 0) {
    log(`\n⚠️  Documents Below Quality Threshold (5/10):`, 'yellow');
    failingDocs.forEach((doc) => {
      log(`  - ${doc.file}: ${doc.qualityScore}/10`, 'red');
      doc.issues.forEach((issue) => log(`    → ${issue}`, 'yellow'));
    });
  }

  // Recommendations
  log('\n📋 Recommendations:', 'cyan');
  allMetrics.forEach((doc) => {
    if (doc.qualityScore < 5) {
      log(`  ${doc.file}:`, 'yellow');
      if (!doc.hasTitle) log('    → Add a clear H1 title', 'blue');
      if (!doc.hasStructure) log('    → Add more sections/headings', 'blue');
      if (!doc.hasContent) log('    → Expand content (minimum 500 chars)', 'blue');
      if (!doc.hasMetadata) log('    → Add metadata (status, version, date)', 'blue');
      if (!doc.hasExamples) log('    → Add code examples', 'blue');
      if (doc.linkCount === 0) log('    → Add cross-references/links', 'blue');
    }
  });

  // Final verdict
  log('\n' + '═'.repeat(60), 'bright');
  if (passingDocs === totalDocs && avgScore >= 5) {
    log('  ✅ All Documentation Meets Quality Standards', 'green');
    log('═'.repeat(60), 'bright');
    return 0;
  } else {
    log('  ❌ Some Documentation Needs Improvement', 'red');
    log('═'.repeat(60), 'bright');
    return 1;
  }
}

// Run audit
const exitCode = auditAllDocs();
process.exit(exitCode);

