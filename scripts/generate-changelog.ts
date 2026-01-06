#!/usr/bin/env node
/**
 * Auto-Changelog Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates changelog entries from pack changes
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { PackShape } from "../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const PACKS_DIR = join(ROOT_DIR, "packs");
const CHANGELOG_FILE = join(ROOT_DIR, "CHANGELOG.md");

function loadPacks(): PackShape[] {
  const packFiles = readdirSync(PACKS_DIR).filter((f) => f.endsWith(".pack.json"));
  return packFiles.map((file) => {
    const content = readFileSync(join(PACKS_DIR, file), "utf-8");
    return JSON.parse(content) as PackShape;
  });
}

function generateChangelogEntry(): string {
  const packs = loadPacks();
  const today = new Date().toISOString().split("T")[0];

  // Calculate totals
  const totalConcepts = packs.reduce((sum, p) => sum + p.concepts.length, 0);
  const totalValueSets = packs.reduce((sum, p) => sum + p.value_sets.length, 0);
  const totalValues = packs.reduce((sum, p) => sum + p.values.length, 0);

  // Group by domain
  const packsByDomain = new Map<string, PackShape[]>();
  for (const pack of packs) {
    if (!packsByDomain.has(pack.domain)) {
      packsByDomain.set(pack.domain, []);
    }
    packsByDomain.get(pack.domain)!.push(pack);
  }

  let entry = `## [Unreleased] - ${today}\n\n### Added\n\n`;
  entry += `- **Kernel v1.0.0** - Complete ERP kernel with ${totalConcepts} concepts, ${totalValueSets} value sets, ${totalValues} values\n\n`;

  entry += `#### Packs (${packs.length} total)\n\n`;
  for (const [domain, domainPacks] of Array.from(packsByDomain.entries()).sort()) {
    entry += `**${domain}** (${domainPacks.length} pack${domainPacks.length > 1 ? "s" : ""}):\n`;
    for (const pack of domainPacks.sort((a, b) => a.id.localeCompare(b.id))) {
      const concepts = pack.concepts.length;
      const valueSets = pack.value_sets.length;
      const values = pack.values.length;
      entry += `  - \`${pack.id}\` v${pack.version}: ${concepts} concepts, ${valueSets} value sets, ${values} values\n`;
    }
    entry += "\n";
  }

  entry += `### Infrastructure\n\n`;
  entry += `- **Pack-based generation** - Industrialized kernel generation from JSON packs\n`;
  entry += `- **Invariants A-F** - Automated quality gates (uniqueness, continuity, semantics, line concepts, overwrite policy, naming)\n`;
  entry += `- **Priority & authoritative_for** - Cross-pack conflict resolution\n`;
  entry += `- **14 production packs** - Core, Finance, Inventory, Sales, Purchase, Manufacturing, HR, Project, Asset, Tax, Payments, Warehouse, Admin, Compliance\n\n`;

  return entry;
}

function main() {
  const entry = generateChangelogEntry();
  const existing = readFileSync(CHANGELOG_FILE, "utf-8");

  // Insert after the header
  const headerEnd = existing.indexOf("## [");
  if (headerEnd === -1) {
    console.error("Could not find changelog header");
    process.exit(1);
  }

  const newContent = existing.slice(0, headerEnd) + entry + "\n" + existing.slice(headerEnd);
  writeFileSync(CHANGELOG_FILE, newContent);
  console.log("✅ Changelog updated");
}

main();

