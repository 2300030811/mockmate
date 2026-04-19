#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseDotenv } from "dotenv";

const repoRoot = process.cwd();

function readDotenvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  return parseDotenv(raw);
}

const envFromDotFiles = {
  ...readDotenvFile(path.join(repoRoot, ".env")),
  ...readDotenvFile(path.join(repoRoot, ".env.local")),
};

function envValue(key) {
  const fromProcess = process.env[key];
  if (typeof fromProcess === "string" && fromProcess.trim()) return fromProcess.trim();

  const fromDot = envFromDotFiles[key];
  if (typeof fromDot === "string" && fromDot.trim()) return fromDot.trim();

  return "";
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function fileContains(relativePath, key) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return false;
  const content = fs.readFileSync(absolutePath, "utf8");
  return content.includes(key);
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

function checkEnv(key, required = true) {
  const value = envValue(key);
  if (value) {
    pass(`env:${key}`, "set");
    return;
  }

  if (required) {
    fail(`env:${key}`, "missing");
  } else {
    warn(`env:${key}`, "missing (optional but recommended)");
  }
}

function checkFile(relativePath, required = true) {
  if (exists(relativePath)) {
    pass(`file:${relativePath}`, "present");
    return;
  }

  if (required) {
    fail(`file:${relativePath}`, "missing");
  } else {
    warn(`file:${relativePath}`, "missing");
  }
}

checkFile(".env.example", true);
checkFile("docs/CAREER_OPS_DATA_CONTRACT.md", true);

checkEnv("NEXT_PUBLIC_SUPABASE_URL", false);
checkEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", false);
checkEnv("SUPABASE_SERVICE_ROLE_KEY", false);

checkEnv("CRON_SCAN_SECRET", false);
checkEnv("CRON_LIVENESS_SECRET", false);
checkEnv("CRON_CAREER_OPS_SECRET", false);

checkEnv("UPSTASH_REDIS_REST_URL", false);
checkEnv("UPSTASH_REDIS_REST_TOKEN", false);

checkFile("app/actions/career-ops.ts", true);
checkFile("app/api/cron/scan/route.ts", true);
checkFile("app/api/cron/liveness/route.ts", true);
checkFile("app/api/cron/cadence/route.ts", true);

checkFile("lib/career-ops/status.ts", true);
checkFile("lib/career-ops/dimensions.ts", true);
checkFile("lib/career-ops/summary.ts", true);
checkFile("lib/career-ops/patterns.ts", true);
checkFile("lib/career-ops/recompute.ts", true);
checkFile("lib/career-ops/cadence.ts", true);
checkFile("lib/career-ops/liveness.ts", true);

checkFile("lib/db/migrations/add_career_ops_tracking.sql", true);
checkFile("lib/db/migrations/add_career_ops_pattern_dimensions.sql", true);

if (exists(".env.example")) {
  const envExampleChecks = [
    "CRON_SCAN_SECRET=",
    "CRON_LIVENESS_SECRET=",
    "CRON_CAREER_OPS_SECRET=",
    "SUPABASE_SERVICE_ROLE_KEY=",
  ];

  for (const key of envExampleChecks) {
    if (fileContains(".env.example", key)) {
      pass(`env-example:${key.replace("=", "")}`, "present");
    } else {
      fail(`env-example:${key.replace("=", "")}`, "missing");
    }
  }
}

if (fileContains("README.md", "cp .env.example .env.local")) {
  pass("readme:env-copy-step", "present");
} else {
  warn("readme:env-copy-step", "missing expected setup step for .env.example");
}

function printGroup(title, items, label) {
  if (items.length === 0) return;

  console.log(`\n${title}`);
  for (const item of items) {
    console.log(`  [${label}] ${item.name} - ${item.detail}`);
  }
}

console.log("Career Ops Verify Report");
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
