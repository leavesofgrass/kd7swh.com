#!/usr/bin/env node
// tools/guard.mjs — leakage and shape checks. Run after a build, before a
// push. Three parts (AGENT-HANDOFF.md section 11.1):
//
//   1. Marker check   — candidate-file working material must never reach
//                       content/lun/: rationale lines, unchecked boxes,
//                       publication-date suffixes, Obsidian wikilinks.
//   2. Denylist check — the built _site must not contain any term from
//                       .guard-denylist (gitignored; absent in CI, where
//                       this check skips). Terms are never printed — only
//                       their line number in the denylist.
//   3. Shape check    — week files are named YYYY-MM-DD.md and no private
//                       working file is tracked by git.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

// ------------------------------------------------------------ 1. markers

const MARKERS = [
  { name: "rationale line ('Why it might matter')", re: /Why it might matter/ },
  { name: "unchecked task item ('- [ ]')", re: /^\s*-\s*\[ \]/m },
  { name: "publication-date suffix (em dash + ISO date at end of line)", re: /—\s*\d{4}-\d{2}-\d{2}\s*$/m },
  { name: "Obsidian wikilink ('[[')", re: /\[\[/ },
];

const lunDir = path.join(ROOT, "content", "lun");
const lunFiles = (await readdir(lunDir)).filter((f) => f.endsWith(".md"));

for (const file of lunFiles) {
  const text = await readFile(path.join(lunDir, file), "utf8");
  for (const marker of MARKERS) {
    if (marker.re.test(text)) {
      failures.push(`marker: content/lun/${file} contains ${marker.name}`);
    }
  }
}

// ----------------------------------------------------------- 2. denylist

const denylistPath = path.join(ROOT, ".guard-denylist");
const sitePath = path.join(ROOT, "_site");

if (!existsSync(denylistPath)) {
  notes.push("denylist: .guard-denylist not present (normal in CI) — check skipped");
} else if (!existsSync(sitePath)) {
  failures.push("denylist: _site does not exist — run the build first, then guard");
} else {
  const terms = (await readFile(denylistPath, "utf8"))
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  const TEXTLIKE = /\.(html|xml|txt|css|json|svg|webmanifest)$/i;

  async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) yield* walk(full);
      else if (TEXTLIKE.test(entry.name)) yield full;
    }
  }

  for await (const file of walk(sitePath)) {
    const text = (await readFile(file, "utf8")).toLowerCase();
    terms.forEach((term, i) => {
      if (text.includes(term.toLowerCase())) {
        // Never print the term itself — a public CI log would leak it.
        failures.push(
          `denylist: term #${i + 1} of .guard-denylist found in ${path.relative(ROOT, file)}`
        );
      }
    });
  }
}

// -------------------------------------------------------------- 3. shape

const WEEK_NAME = /^\d{4}-\d{2}-\d{2}\.md$/;
for (const file of lunFiles) {
  if (!WEEK_NAME.test(file)) {
    failures.push(`shape: content/lun/${file} is not named YYYY-MM-DD.md`);
  }
}

const NEVER_TRACKED = ["drafts/", ".env", ".guard-denylist", "AGENT-HANDOFF.md", "kd7swh-site-plan.md", "EDITORIAL.md"];
try {
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  for (const bad of NEVER_TRACKED) {
    const hit = tracked.find((f) => (bad.endsWith("/") ? f.startsWith(bad) : f === bad));
    if (hit) failures.push(`shape: ${hit} is tracked by git — it must never be committed`);
  }
} catch (err) {
  failures.push(`shape: could not run git ls-files (${err.message})`);
}

// --------------------------------------------------------------- verdict

for (const note of notes) console.log(`guard: ${note}`);

if (failures.length) {
  console.error(`guard: FAILED — ${failures.length} problem${failures.length === 1 ? "" : "s"}:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(`guard: OK — ${lunFiles.length} week file${lunFiles.length === 1 ? "" : "s"} checked, no leakage markers, shape clean`);
