#!/usr/bin/env node
// tools/fetch-spaceweather.mjs — build-time NOAA fetch for /propagation/.
//
// Thin I/O wrapper around tools/spaceweather.mjs. Fetches each NOAA SWPC
// product independently (best-effort), parses via the pure library, merges
// over the last-known-good file (per-metric carry-forward), and writes
// content/_data/spaceweather.json. ALWAYS exits 0 unless it cannot write
// the file — a NOAA outage must never block a site deploy.
//
// Stdlib-only (Node's global fetch + node:fs), like guard.mjs, so it runs
// under the CI bind-mount invocation that hides node_modules.
//
//   docker compose run --rm fetch

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  parseFlux, parseKpProduct, parseWind, parseScales, parseFlare,
  parseGeomagForecastGrid, parseHemiPower, parseDailyIndicesSSN, parseWwv,
  buildSnapshot,
} from "./spaceweather.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content", "_data", "spaceweather.json");
const B = "https://services.swpc.noaa.gov/";
const UA = "kd7swh.com/propagation (static-site build; contact via github.com/leavesofgrass)";

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function getText(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// Each source: id → async parse. Failures resolve to null (Promise.allSettled).
const SOURCES = {
  sfi: () => getJson(B + "products/summary/10cm-flux.json").then(parseFlux),
  kp: () => getJson(B + "products/noaa-planetary-k-index.json").then(parseKpProduct),
  scales_now: () => getJson(B + "products/noaa-scales.json").then(parseScales),
  flare: () => getJson(B + "json/goes/primary/xray-flares-latest.json").then(parseFlare),
  ssn: () => getText(B + "text/daily-solar-indices.txt").then(parseDailyIndicesSSN),
  aurora_power: () => getText(B + "text/aurora-nowcast-hemi-power.txt").then(parseHemiPower),
  wwv: () => getText(B + "text/wwv.txt").then(parseWwv),
  // solar_wind needs two endpoints; outlook is derived from scales.
  _wind_speed: () => getJson(B + "products/summary/solar-wind-speed.json"),
  _wind_mag: () => getJson(B + "products/summary/solar-wind-mag-field.json"),
  _geomag: () => getText(B + "text/3-day-geomag-forecast.txt"),
};

async function main() {
  const ids = Object.keys(SOURCES);
  const settled = await Promise.allSettled(ids.map((id) => SOURCES[id]()));
  const raw = {};
  ids.forEach((id, i) => {
    raw[id] = settled[i].status === "fulfilled" ? settled[i].value : null;
    if (settled[i].status === "rejected") {
      console.error(`fetch: ${id} failed — ${settled[i].reason?.message || settled[i].reason}`);
    }
  });

  // Compose the multi-endpoint metrics.
  const responses = {
    sfi: raw.sfi, kp: raw.kp, scales_now: raw.scales_now, flare: raw.flare,
    ssn: raw.ssn, aurora_power: raw.aurora_power, wwv: raw.wwv,
    solar_wind: raw._wind_speed || raw._wind_mag ? parseWind(raw._wind_speed, raw._wind_mag) : null,
    outlook: null,
  };
  // Outlook: the geomag grid (clean 3-day-ahead Kp, e.g. Aug 12–14) is the
  // spine; R/S/G probabilities come from the scales forecast matched BY DATE
  // (the two NOAA products start on different days, so index-pairing would
  // misalign). A day with no scales match shows "—" rather than wrong data.
  const now = new Date();
  const grid = raw._geomag ? parseGeomagForecastGrid(raw._geomag, now) : null;
  if (grid) {
    const byDate = new Map();
    for (const f of (responses.scales_now?.forecast || [])) {
      if (f.date_stamp) byDate.set(f.date_stamp, f);
    }
    const days = grid.map((g) => {
      const f = g.date ? byDate.get(g.date) : null;
      return {
        date: g.date, label: g.label, max_kp: g.max,
        r_minor_prob: f ? f.R_minor : null,
        r_major_prob: f ? f.R_major : null,
        s_prob: f ? f.S_prob : null,
        g_scale: f ? f.G : null,
      };
    });
    responses.outlook = { days, time_tag: grid[0]?.date ? `${grid[0].date}T00:00:00Z` : null };
  }

  let previous = null;
  try { previous = JSON.parse(await readFile(OUT, "utf8")); } catch { /* first run */ }

  const snapshot = buildSnapshot(responses, previous, new Date());

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

  const ok = snapshot.fetch_meta.attempts.filter((a) => a.ok).length;
  const carried = snapshot.fetch_meta.attempts.filter((a) => a.carried_forward).length;
  console.log(`fetch: wrote ${path.relative(ROOT, OUT)} — ${ok} fresh, ${carried} carried forward${snapshot.fetch_meta.total_outage ? ", TOTAL OUTAGE" : ""}`);
}

main().catch((err) => {
  // Only a write failure should be fatal; network failures are handled above.
  console.error(`fetch: fatal — ${err.message}`);
  process.exit(1);
});
