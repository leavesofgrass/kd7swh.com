#!/usr/bin/env node
// tools/add-story.mjs — inject a late-breaking story into this week's
// candidate file, correctly formatted, without hand-editing.
//
//   node tools/add-story.mjs <url> [--source="Name"] [--checked] [--date=YYYY-MM-DD]
//
// Writes to drafts/<Monday>.md (creating it with the standard header if it
// does not exist). The entry is UNCHECKED unless --checked is given —
// passing --checked is Jon checking the box, just from the command line.
// The headline is taken from the page's own metadata (og:title, falling
// back to <title>) because the editorial rule is "headline exactly as
// published" — verify the printed result and edit the drafts file if the
// site lied about its own title.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { targetMonday, headingFor, extractChecked } from "./publish.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATE_ARG = /^\d{4}-\d{2}-\d{2}$/;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function fail(message) {
  console.error(`add-story: ${message}`);
  process.exit(1);
}

function decode(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html, name) {
  // The content capture must be quote-AWARE: sites routinely serve raw
  // apostrophes inside double-quoted attributes ("...don't..."), and a
  // capture that stops at either quote character truncates the headline.
  const CONTENT = `content=(?:"([^"]*)"|'([^']*)')`;
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]*?${CONTENT}|` +
      `<meta[^>]+${CONTENT}[^>]*?(?:property|name)=["']${name}["']`,
    "i"
  );
  const m = re.exec(html);
  if (!m) return null;
  const raw = m[1] ?? m[2] ?? m[3] ?? m[4];
  if (raw == null) return null;
  const out = decode(raw);
  return out.trim() ? out : null; // empty content= falls through to <title>
}

// The repo's date discipline: Pacific, via Intl — never toISOString, which
// is UTC and rolls to tomorrow at 5 PM Pacific (the killer case in
// publish.test.mjs applies here too).
function todayPacific() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// ---------------------------------------------------------------- arguments

let url = null;
let source = null;
let checked = false;
let dateArg = null;

for (const arg of process.argv.slice(2)) {
  if (arg === "--checked") checked = true;
  else if (arg.startsWith("--source=")) source = arg.slice(9);
  else if (arg.startsWith("--date=")) {
    dateArg = arg.slice(7);
    if (!DATE_ARG.test(dateArg)) fail(`--date must be YYYY-MM-DD, got: ${JSON.stringify(dateArg)}`);
  } else if (!url) url = arg;
  else fail(`unexpected argument: ${JSON.stringify(arg)}`);
}

if (!url) fail("usage: add-story <url> [--source=\"Name\"] [--checked] [--date=YYYY-MM-DD]");
let parsed;
try {
  parsed = new URL(url);
} catch {
  fail(`not a valid URL: ${JSON.stringify(url)}`);
}
if (!/^https?:$/.test(parsed.protocol)) fail("only http(s) URLs are supported");

// ------------------------------------------------------------------- fetch

let html;
let landedUrl = parsed.href;
try {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(20000),
    redirect: "follow",
  });
  if (!res.ok) fail(`the page answered HTTP ${res.status} — check the URL`);
  landedUrl = res.url || parsed.href;
  html = await res.text();
} catch (err) {
  if (err?.name === "TimeoutError") fail("the page took longer than 20s to answer");
  fail(`could not fetch the page: ${err.message}`);
}

// Canonical URL for both the duplicate check and the written entry: the
// post-redirect address, with parentheses percent-encoded (RFC 3986-safe)
// so neither markdown-it nor the publish gate can misread the link.
const finalUrl = landedUrl.replace(/\(/g, "%28").replace(/\)/g, "%29");

// ----------------------------------------------------------- extract fields

let headline = meta(html, "og:title") ?? meta(html, "twitter:title");
let fromTitleTag = false;
if (!headline) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  headline = m ? decode(m[1]) : null;
  fromTitleTag = true;
}

if (!headline) fail("could not find a headline on that page — add the entry by hand");

// <title> tags often carry site branding as a trailing "[Site]" suffix
// (LWN does this). That suffix is chrome, not headline — but only when the
// text came from <title>; og:title endings are kept verbatim.
if (fromTitleTag) {
  headline = headline.replace(/\s*\[[^\]]*\]\s*$/, "").trim() || headline;
}

// Square brackets inside a headline would break both markdown link syntax
// and the deliberately strict link validation in publish.mjs. Parentheses
// keep the wording readable; the notice tells Jon to eyeball it.
if (/[\[\]]/.test(headline)) {
  console.log("add-story: note — square brackets in the headline were replaced with parentheses; verify the wording against the article.");
  headline = headline.replace(/\[/g, "(").replace(/\]/g, ")");
}

if (!source) source = meta(html, "og:site_name") ?? parsed.hostname.replace(/^www\./, "");

const published = meta(html, "article:published_time");
const pubDate =
  published && /^\d{4}-\d{2}-\d{2}/.test(published)
    ? published.slice(0, 10)
    : todayPacific();

// ------------------------------------------------------------------- write

const date = dateArg ?? targetMonday();
const draftsDir = path.join(ROOT, "drafts");
const draftsPath = path.join(draftsDir, `${date}.md`);

let text;
if (existsSync(draftsPath)) {
  text = await readFile(draftsPath, "utf8");
  // Symmetric duplicate check: catch the entry whether either side carries
  // a trailing slash.
  const bare = finalUrl.replace(/\/$/, "");
  if (text.includes(`](${bare})`) || text.includes(`](${bare}/)`)) {
    fail(`that URL is already in drafts/${date}.md`);
  }
  if (!text.endsWith("\n")) text += "\n";
} else {
  text = `# Candidates — net of Monday, ${headingFor(date)}

Check the box on anything that runs. Unchecked items are never published and
never read on the air.

`;
}

// Candidates carry a number so a week can be curated by voice ("run 1,
// 4, 9"). A late addition continues the sequence from what the file
// already holds.
const num = (text.match(/^- \[[ xX]\]/gm) || []).length + 1;

// Belt and suspenders: the finished line must survive the publish gate
// UNCHANGED except for the stripped number and date suffix. If any
// future format drift would alter it, refuse now — not at 7 PM on a
// Monday.
const publishedForm = `- [${headline}](${finalUrl}) *${source}*`;
let roundTrip;
try {
  roundTrip = extractChecked(`- [x] ${num}. [${headline}](${finalUrl}) *${source}* — ${pubDate}`);
} catch (err) {
  fail(`this entry would fail the publish gate (${err.message}) — add it to the drafts file by hand`);
}
if (roundTrip[0] !== publishedForm) {
  fail(
    `this entry would be altered at publish time — add it by hand instead:\n` +
      `  expected:  ${publishedForm}\n` +
      `  publishes: ${roundTrip[0]}`
  );
}

const box = checked ? "x" : " ";
const entry =
  `- [${box}] ${num}. [${headline}](${finalUrl}) *${source}* — ${pubDate}\n` +
  `      Why it might matter: late addition, ${todayPacific()} — fill in before the net.\n`;

await mkdir(draftsDir, { recursive: true });
await writeFile(draftsPath, text + entry, "utf8");

console.log(`add-story: drafts/${date}.md`);
console.log(`add-story: added ${checked ? "CHECKED" : "unchecked"}:`);
console.log(`  - [${box}] ${num}. [${headline}](${finalUrl}) *${source}* — ${pubDate}`);
if (!checked) console.log("add-story: check its box when you decide it runs.");
console.log("add-story: then publish as usual (tools\\monday.ps1).");
