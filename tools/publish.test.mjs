// tools/publish.test.mjs — unit tests for the curation gate.
// Run inside the container:  docker compose exec dev node tools/publish.test.mjs

import assert from "node:assert/strict";
import { targetMonday, headingFor, extractChecked } from "./publish.mjs";

// --- targetMonday ----------------------------------------------------------

// The killer case (handoff 8.3): Monday 11:30 PM Pacific is already Tuesday
// in UTC. Must still be that Monday, not a week ahead.
assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-08-11T06:30:00Z")),
  "2026-08-10", "Mon 11:30 PM PDT stays that Monday");

assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-08-10T20:00:00Z")),
  "2026-08-10", "Mon 1 PM PDT is that Monday");

assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-08-09T20:00:00Z")),
  "2026-08-10", "Sunday rolls to next Monday");

assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-08-08T09:00:00Z")),
  "2026-08-10", "Saturday rolls to Monday two days out");

// Mirror case: early-UTC Monday that is still Sunday evening Pacific.
assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-08-10T04:00:00Z")),
  "2026-08-10", "Sun 9 PM PDT (Mon 4 AM UTC) targets the imminent Monday");

// DST edges: fall-back and spring-forward Sundays.
assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-11-01T20:00:00Z")),
  "2026-11-02", "fall-back Sunday");
assert.equal(
  targetMonday("America/Los_Angeles", new Date("2026-03-08T20:00:00Z")),
  "2026-03-09", "spring-forward Sunday");

// --- headingFor -------------------------------------------------------------

assert.equal(headingFor("2026-08-10"), "August 10, 2026");
assert.equal(headingFor("2027-01-04"), "January 4, 2027");

// --- extractChecked ---------------------------------------------------------

const fixture = [
  "# Candidates — test",
  "",
  "- [ ] [Unchecked](https://example.com/no) *Nope* — 2026-08-05",
  "      Why it might matter: never published.",
  "- [x] [Checked one](https://example.com/one) *Source* — 2026-08-05",
  "      Why it might matter: rationale of checked item never leaks either.",
  "- [X] [Two links, date before pipe](https://example.com/two) *Other* — 2026-08-06 | [Primary](https://example.com/primary)",
  "- [x] [Date at end](https://example.com/three) *Third* — 2026-08-07",
].join("\n");

const lines = extractChecked(fixture);

assert.deepEqual(lines, [
  "- [Checked one](https://example.com/one) *Source*",
  "- [Two links, date before pipe](https://example.com/two) *Other* | [Primary](https://example.com/primary)",
  "- [Date at end](https://example.com/three) *Third*",
], "checked items only, verbatim, publication dates stripped in both positions");

assert.ok(!lines.join("\n").includes("Why it might matter"), "no rationale leaks");
assert.ok(!lines.join("\n").includes("Unchecked"), "no unchecked leaks");
assert.ok(!lines.join("\n").includes("2026-08-0"), "no publication dates leak");

// CRLF input (drafts touched by an editor that writes CRLF) parses identically.
assert.deepEqual(
  extractChecked("- [x] [A](https://example.com/a) *S* — 2026-08-05\r\n- [ ] [B](https://example.com/b) *S*\r\n"),
  ["- [A](https://example.com/a) *S*"],
  "CRLF handled");

// A checked line with no link is a hard error, not a silent drop.
assert.throws(
  () => extractChecked("- [x] no link here — 2026-08-18"),
  /no \[text\]\(https:\/\/\.\.\.\) link/,
  "linkless checked line throws");

// An em-dash date anywhere else in the text is not stripped.
assert.deepEqual(
  extractChecked("- [x] [Kernel — 2026-01-01 retrospective](https://example.com/k) *LWN* — 2026-08-05"),
  ["- [Kernel — 2026-01-01 retrospective](https://example.com/k) *LWN*"],
  "only the trailing metadata date is stripped, not dates inside headlines");

// The nastier variant: an in-headline em-dash date sitting right before a
// pipe must also survive — only the true trailing metadata date goes.
assert.deepEqual(
  extractChecked("- [x] [Roundup — 2026-01-01 | what changed](https://example.com/a) *LWN* — 2026-08-05"),
  ["- [Roundup — 2026-01-01 | what changed](https://example.com/a) *LWN*"],
  "date-before-pipe inside a headline is content, not metadata");

// Candidate numbers ("- [x] 7. [Headline]...") are curation metadata for
// voice-based selection — stripped on publish, in both one- and two-link
// forms, and harmless when absent.
assert.deepEqual(
  extractChecked([
    "- [x] 1. [First numbered](https://example.com/1) *Src* — 2026-08-05",
    "- [x] 12. [Two links](https://example.com/2) *Src* — 2026-08-06 | [Primary](https://example.com/p)",
    "- [x] [Unnumbered still fine](https://example.com/3) *Src* — 2026-08-07",
  ].join("\n")),
  [
    "- [First numbered](https://example.com/1) *Src*",
    "- [Two links](https://example.com/2) *Src* | [Primary](https://example.com/p)",
    "- [Unnumbered still fine](https://example.com/3) *Src*",
  ],
  "candidate numbers stripped; unnumbered entries unaffected");

// A headline that merely BEGINS with digits keeps them — the number
// marker only matches before the opening bracket.
assert.deepEqual(
  extractChecked("- [x] [3. The best kernel releases, ranked](https://example.com/k) *Src* — 2026-08-05"),
  ["- [3. The best kernel releases, ranked](https://example.com/k) *Src*"],
  "digits inside a headline are content");

console.log("publish.test: all assertions passed");
