#!/usr/bin/env node
/**
 * NEXUS-KERNEL Development Daemon
 * Manages all dev servers with auto-restart and port cleanup
 */

import { spawn } from 'child_process';
import { createServer } from 'net';

const PORTS = {
  DEV: 9000,
  DASHBOARD: 9001,
  STRATEGIC: 8080
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(service: string, message: string, color: string = COLORS.reset) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${color}[${timestamp}] [${service}]${COLORS.reset} ${message}`);
}

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function killPort(port: number): Promise<void> {
  log('Daemon', `Checking port ${port}...`, COLORS.yellow);
  
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      const findCmd = spawn('powershell', [
        '-Command',
        `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Get-Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`
      ]);
      
      findCmd.on('close', () => {
        setTimeout(() => resolve(), 500); // Wait for port to be freed
      });
    });
  } else {
    return new Promise((resolve) => {
      const findCmd = spawn('lsof', ['-ti', `:${port}`]);
      let pid = '';
      
      findCmd.stdout.on('data', (data) => {
        pid += data.toString();
      });
      
      findCmd.on('close', () => {
        if (pid.trim()) {
          spawn('kill', ['-9', pid.trim()]);
          setTimeout(() => resolve(), 500);
        } else {
          resolve();
        }
      });
    });
  }
}

async function ensurePortsFree(): Promise<void> {
  log('Daemon', 'Cleaning up ports...', COLORS.yellow);
  
  for (const [name, port] of Object.entries(PORTS)) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      log('Daemon', `Port ${port} (${name}) is in use, killing process...`, COLORS.red);
      await killPort(port);
      log('Daemon', `Port ${port} freed ✓`, COLORS.green);
    } else {
      log('Daemon', `Port ${port} (${name}) is available ✓`, COLORS.green);
    }
  }
}

async function startDaemon() {
  console.log('\n' + '═'.repeat(70));
  console.log(`  🛡️  NEXUS-KERNEL DEVELOPMENT DAEMON`);
  console.log('═'.repeat(70) + '\n');
  
  // Clean up ports first
  await ensurePortsFree();
  
  console.log('\n' + '─'.repeat(70));
  console.log('  Starting services...\n');
  
  // Start concurrently with all services
  const daemon = spawn('pnpm', [
    'concurrently',
    '"pnpm dev:server"',
    '"pnpm dashboard:watch"',
    '"pnpm dashboard:strategic"',
    '"pnpm dashboard:watch-css"',
    '--names', 'Dev:9000,ERP:9001,Web:8080,CSS',
    '--prefix-colors', 'green,cyan,magenta,yellow',
    '--kill-others-on-fail',
    '--restart-tries', '3'
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  daemon.on('error', (error) => {
    log('Daemon', `Error: ${error.message}`, COLORS.red);
  });
  
  daemon.on('exit', (code) => {
    if (code !== 0) {
      log('Daemon', `Exited with code ${code}`, COLORS.red);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Daemon', 'Shutting down...', COLORS.yellow);
    daemon.kill();
    process.exit(0);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('  📍 Access URLs:');
  console.log(`     Dev Server:        http://localhost:${PORTS.DEV}`);
  console.log(`     ERP Dashboard:     http://localhost:${PORTS.DASHBOARD}`);
  console.log(`     Strategic:         http://localhost:${PORTS.STRATEGIC}/kernel-strategic-dashboard.html`);
  console.log('═'.repeat(70));
  console.log('  💡 Press Ctrl+C to stop all services\n');
}

startDaemon().catch(error => {
  log('Daemon', `Fatal error: ${error.message}`, COLORS.red);
  process.exit(1);
});
