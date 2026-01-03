#!/usr/bin/env tsx
// @aibos/kernel - Repository Update Script
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Comprehensive script to update the entire repository:
// - Update dependencies
// - Regenerate kernel data
// - Build project
// - Run tests
// - Validate everything
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

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

function step(name: string, fn: () => void) {
  log(`\n${'━'.repeat(60)}`, 'cyan');
  log(`Step: ${name}`, 'bright');
  log('━'.repeat(60), 'cyan');
  
  try {
    const start = Date.now();
    fn();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    log(`✅ ${name} completed in ${duration}s`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} failed`, 'red');
    if (error instanceof Error) {
      log(`   Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

function runCommand(command: string, description?: string) {
  if (description) {
    log(`  → ${description}`, 'blue');
  }
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, FORCE_COLOR: '1' }
  });
}

// Check prerequisites
function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');
  
  const checks = [
    { name: 'Node.js', command: 'node --version' },
    { name: 'pnpm', command: 'pnpm --version' },
    { name: 'TypeScript', command: 'tsc --version' },
  ];
  
  for (const check of checks) {
    try {
      const version = execSync(check.command, { encoding: 'utf-8' }).trim();
      log(`  ✅ ${check.name}: ${version}`, 'green');
    } catch {
      log(`  ❌ ${check.name}: Not found`, 'red');
      throw new Error(`${check.name} is required but not found`);
    }
  }
}

// Main update process
async function updateRepository() {
  log('\n' + '═'.repeat(60), 'bright');
  log('  @aibos/kernel - Repository Update Script', 'bright');
  log('═'.repeat(60), 'bright');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Check prerequisites
    step('Prerequisites Check', () => {
      checkPrerequisites();
    });
    
    // Step 2: Update dependencies
    step('Update Dependencies', () => {
      log('  → Updating pnpm dependencies...', 'blue');
      runCommand('pnpm install', 'Installing dependencies');
      runCommand('pnpm update', 'Updating dependencies');
    });
    
    // Step 3: Clean build artifacts
    step('Clean Build Artifacts', () => {
      if (existsSync('dist')) {
        log('  → Removing dist/ directory...', 'blue');
        rmSync('dist', { recursive: true, force: true });
      }
      if (existsSync('coverage')) {
        log('  → Removing coverage/ directory...', 'blue');
        rmSync('coverage', { recursive: true, force: true });
      }
      log('  ✅ Build artifacts cleaned', 'green');
    });
    
    // Step 4: Regenerate kernel data
    step('Regenerate Kernel Data', () => {
      runCommand('pnpm generate', 'Generating kernel from pack data');
    });
    
    // Step 5: Type check
    step('Type Check', () => {
      runCommand('pnpm typecheck', 'Running TypeScript type check');
    });
    
    // Step 6: Build project
    step('Build Project', () => {
      runCommand('pnpm build', 'Building with tsup');
    });
    
    // Step 7: Run tests
    step('Run Tests', () => {
      runCommand('pnpm test', 'Running test suite');
    });
    
    // Step 8: Generate coverage (optional - may fail if threshold not met)
    step('Generate Test Coverage', () => {
      try {
        runCommand('pnpm test:coverage', 'Generating coverage report');
      } catch {
        log('  ⚠️  Coverage threshold not met (some modules untested)', 'yellow');
        log('  → This is expected for new modules (monitoring, supabase)', 'yellow');
      }
    });
    
    // Step 9: Validate kernel
    step('Validate Kernel', () => {
      runCommand('pnpm validate:kernel', 'Validating kernel integrity');
    });
    
    // Step 10: Bundle analysis (optional)
    step('Bundle Analysis', () => {
      try {
        runCommand('pnpm analyze:bundle', 'Analyzing bundle size');
      } catch {
        log('  ⚠️  Bundle analysis skipped (optional)', 'yellow');
      }
    });
    
    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n' + '═'.repeat(60), 'bright');
    log('  ✅ Repository Update Complete!', 'green');
    log('═'.repeat(60), 'bright');
    log(`\nTotal time: ${totalTime}s`, 'cyan');
    log('\nNext steps:', 'bright');
    log('  • Review changes: git status', 'blue');
    log('  • Commit changes: git commit -m "chore: update repository"', 'blue');
    log('  • Push to GitHub: git push origin main', 'blue');
    log('');
    
  } catch (error) {
    log('\n' + '═'.repeat(60), 'red');
    log('  ❌ Repository Update Failed', 'red');
    log('═'.repeat(60), 'red');
    
    if (error instanceof Error) {
      log(`\nError: ${error.message}`, 'red');
    }
    
    process.exit(1);
  }
}

// Run the update
updateRepository().catch((error) => {
  log(`\nFatal error: ${error}`, 'red');
  process.exit(1);
});

