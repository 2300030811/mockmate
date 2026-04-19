#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

function readFileSafe(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return fs.readFileSync(absolutePath, "utf8");
}

function extractThreshold(content, key) {
  if (!content) return null;
  const matcher = new RegExp(`${key}\\s*:\\s*(\\d+)`);
  const match = content.match(matcher);
  return match ? Number.parseInt(match[1], 10) : null;
}

const passes = [];
const warnings = [];
const failures = [];

function pass(name, detail) {
  passes.push({ name, detail });
}

function warn(name, detail) {
  warnings.push({ name, detail });
}

function fail(name, detail) {
  failures.push({ name, detail });
}

const packageJsonRaw = readFileSafe("package.json");
if (!packageJsonRaw) {
  fail("package.json", "missing");
} else {
  pass("package.json", "present");

  const packageJson = JSON.parse(packageJsonRaw);
  const scripts = packageJson.scripts || {};

  if (scripts["verify:career-ops"]) {
    pass("script:verify:career-ops", "present");
  } else {
    fail("script:verify:career-ops", "missing");
  }

  if (scripts["doctor:career-ops"]) {
    pass("script:doctor:career-ops", "present");
  } else {
    fail("script:doctor:career-ops", "missing");
  }

  if (scripts["test:coverage"]) {
    pass("script:test:coverage", "present");
  } else {
    fail("script:test:coverage", "missing");
  }
}

const vitestConfigRaw = readFileSafe("vitest.config.mts");
if (!vitestConfigRaw) {
  fail("vitest.config.mts", "missing");
} else {
  pass("vitest.config.mts", "present");

  const thresholds = {
    lines: extractThreshold(vitestConfigRaw, "lines"),
    functions: extractThreshold(vitestConfigRaw, "functions"),
    statements: extractThreshold(vitestConfigRaw, "statements"),
    branches: extractThreshold(vitestConfigRaw, "branches"),
  };

  const minimums = {
    lines: 60,
    functions: 60,
    statements: 50,
    branches: 60,
  };

  for (const key of Object.keys(thresholds)) {
    const value = thresholds[key];
    const minimum = minimums[key];

    if (value == null) {
      fail(`coverage:${key}`, "not found in config");
      continue;
    }

    if (value < minimum) {
      warn(`coverage:${key}`, `low threshold (${value} < recommended ${minimum})`);
    } else {
      pass(`coverage:${key}`, `ok (${value})`);
    }
  }
}

const requiredFiles = [
  "docs/CAREER_OPS_DATA_CONTRACT.md",
  "scripts/verify-career-ops.mjs",
  "app/api/cron/scan/route.ts",
  "app/api/cron/liveness/route.ts",
  "app/api/cron/cadence/route.ts",
  "app/api/cron/scan/route.test.ts",
  "app/api/cron/liveness/route.test.ts",
  "app/api/cron/cadence/route.test.ts",
  "lib/career-ops/status.test.ts",
  "lib/career-ops/cadence.test.ts",
  "lib/career-ops/recompute.test.ts",
  "lib/career-ops/patterns.test.ts",
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (fs.existsSync(absolutePath)) {
    pass(`file:${relativePath}`, "present");
  } else {
    fail(`file:${relativePath}`, "missing");
  }
}

if (!fs.existsSync(path.join(repoRoot, ".env.local"))) {
  warn(".env.local", "missing; local verification may fail until env is configured");
} else {
  pass(".env.local", "present");
}

function printGroup(title, items, label) {
  if (items.length === 0) return;

  console.log(`\n${title}`);
  for (const item of items) {
    console.log(`  [${label}] ${item.name} - ${item.detail}`);
  }
}

console.log("Career Ops Doctor Report");
console.log(`Repository: ${repoRoot}`);

printGroup("Passes", passes, "PASS");
printGroup("Warnings", warnings, "WARN");
printGroup("Failures", failures, "FAIL");

console.log("\nSummary");
console.log(`  Pass: ${passes.length}`);
console.log(`  Warn: ${warnings.length}`);
console.log(`  Fail: ${failures.length}`);

if (failures.length > 0) {
  process.exit(1);
}

process.exit(0);
