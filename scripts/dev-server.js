#!/usr/bin/env node
/**
 * Development server for @aibos/kernel
 * Serves the built package for testing purposes
 * Port: 9000 (matches Next.js devtools convention)
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 9000;

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve registry snapshot
  if (req.url === '/registry.snapshot.json' || req.url === '/') {
    const snapshotPath = join(__dirname, '..', 'registry.snapshot.json');
    if (existsSync(snapshotPath)) {
      const snapshot = readFileSync(snapshotPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(snapshot);
      return;
    }
  }

  // Serve package info
  if (req.url === '/package.json') {
    const packagePath = join(__dirname, '..', 'package.json');
    if (existsSync(packagePath)) {
      const pkg = readFileSync(packagePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(pkg);
      return;
    }
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      package: '@aibos/kernel',
      version: '1.1.0',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
});

server.listen(PORT, () => {
  console.log(`\n✅ Kernel dev server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  - http://localhost:${PORT}/health - Health check`);
  console.log(`  - http://localhost:${PORT}/registry.snapshot.json - Registry snapshot`);
  console.log(`  - http://localhost:${PORT}/package.json - Package info`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or use a different port.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

