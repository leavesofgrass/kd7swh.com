#!/usr/bin/env node
// tools/publish.mjs — drafts/<Monday>.md  ->  content/lun/<Monday>.md
//
// The curation gate. Emits ONLY lines whose checkbox is checked "- [x]",
// verbatim. Unchecked items and the indented "Why it might matter"
// rationale lines are dropped BY CONSTRUCTION: they simply never match the
// CHECKED pattern. Do not rewrite this as parse-then-filter — the filter
// would become the thing that can be wrong. (AGENT-HANDOFF.md section 10.)
//
// Usage:
//   node tools/publish.mjs [--date=YYYY-MM-DD] [--force]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

// Paths are anchored to the project root (this file's parent's parent), so
// the script behaves identically from the repo root or inside the container.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Matches ONLY a checked task-list item; captures the payload verbatim.
const CHECKED = /^\s*-\s*\[[xX]\]\s+(.+?)\s*$/;

// A publication-date suffix: em dash + ISO date, at end of line or
// immediately before an appended " | [Label](url)" second link. Curation
// metadata, stripped before emitting. Nothing else is ever altered.
const PUB_DATE = /\s+—\s+\d{4}-\d{2}-\d{2}(?=$|\s+\|)/;

// Every published line must carry at least one markdown link to http(s).
const LINK = /\[[^\]]*\]\(https?:\/\/[^)\s]+\)/;

const DATE_ARG = /^\d{4}-\d{2}-\d{2}$/;

// Today if it is Monday in the given zone, otherwise the next Monday.
// Computed with Intl against an explicit timeZone — never local Date
// methods; the container is only *also* set to TZ=America/Los_Angeles.
export function targetMonday(tz = "America/Los_Angeles", now = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  const dow = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, weekday: "short",
  }).format(now);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const delta = map[dow] === 1 ? 0 : (8 - map[dow]) % 7;
  const base = new Date(`${ymd}T12:00:00Z`); // noon UTC dodges DST edges
  base.setUTCDate(base.getUTCDate() + delta);
  return base.toISOString().slice(0, 10);
}

export function headingFor(isoDate) {
  // Format in UTC or the heading shifts a day.
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

// Pure extraction: raw drafts text in, publishable lines out.
// Throws with a message on a checked line that carries no link.
export function extractChecked(raw) {
  const lines = [];
  for (const line of raw.split(/\r?\n/)) {
    const match = CHECKED.exec(line);
    if (!match) continue; // unchecked items and rationale lines land here
    const entry = match[1].replace(PUB_DATE, "");
    if (!LINK.test(entry)) {
      throw new Error(`checked line has no [text](https://...) link:\n  ${line}`);
    }
    lines.push(`- ${entry}`);
  }
  return lines;
}

function fail(message) {
  console.error(`publish: ${message}`);
  process.exit(1);
}

async function main() {
  let dateArg = null;
  let force = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--force") {
      force = true;
    } else if (arg.startsWith("--date=")) {
      dateArg = arg.slice("--date=".length);
      // Validate BEFORE the value goes anywhere near a path.
      if (!DATE_ARG.test(dateArg)) {
        fail(`--date must be YYYY-MM-DD, got: ${JSON.stringify(dateArg)}`);
      }
    } else {
      fail(`unknown argument: ${JSON.stringify(arg)}. Use --date=YYYY-MM-DD and/or --force.`);
    }
  }

  const date = dateArg ?? targetMonday();
  const draftsPath = path.join(ROOT, "drafts", `${date}.md`);
  const outPath = path.join(ROOT, "content", "lun", `${date}.md`);

  let raw;
  try {
    raw = await readFile(draftsPath, "utf8");
  } catch {
    fail(`no drafts file for ${date}. Looked for: ${draftsPath}`);
  }

  let lines;
  try {
    lines = extractChecked(raw);
  } catch (err) {
    fail(err.message);
  }

  if (lines.length === 0) {
    fail("Nothing is checked. Curate first.");
  }

  if (existsSync(outPath) && !force) {
    fail(`${outPath} already exists. Re-run with --force to overwrite.`);
  }

  const page = `---
date: ${date}
---

## ${headingFor(date)}

${lines.join("\n")}
`;

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, page, "utf8");

  console.log(`publish: ${date}`);
  console.log(`publish: wrote ${outPath}`);
  console.log(`publish: ${lines.length} item${lines.length === 1 ? "" : "s"}:`);
  for (const line of lines) console.log(`  ${line}`);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await main();
}
