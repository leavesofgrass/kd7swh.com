// tools/spaceweather.mjs — pure interpretation library for /propagation/.
//
// No I/O, no clock reads: every function takes its inputs (and `now` where
// time matters) so it can be tested exactly like tools/publish.mjs. The
// fetch wrapper (fetch-spaceweather.mjs) does all network and file work and
// calls buildSnapshot() here.
//
// Sourcing convention, kept honest on the page:
//   [NOAA]  — citable to NOAA SWPC (spaceweather.gov), authoritative.
//   [N0NBH] — Paul Herrman N0NBH's hamqsl.com interpretation tables.
//   [conv]  — general ham convention, weaker sourcing; hedged in wording.

// ------------------------------------------------------------ Kp notation

// Kp is reported in thirds of a unit. NOAA serves floats like 2.67 (and
// sometimes strings). Convert to the standard "3−" / "3" / "3+" notation.
export function kpToThirds(kp, { ascii = false } = {}) {
  const v = Number(kp);
  if (!Number.isFinite(v)) return null;
  const minus = ascii ? "-" : "−"; // ASCII hyphen vs MINUS SIGN
  const t = Math.round(v * 3); // total thirds
  const q = Math.floor(t / 3);
  const r = t - q * 3;
  if (r === 0) return `${q}`;
  if (r === 1) return `${q}+`;
  return `${q + 1}${minus}`;
}

// The leading integer of the thirds notation — what NOAA's G-scale keys on
// (Kp 4.67 displays "5−" and is a G1 storm).
export function kpLevel(kp) {
  const s = kpToThirds(kp, { ascii: true });
  if (s === null) return null;
  return parseInt(s, 10);
}

// Filled cells (0–9) for the aria-hidden block meter.
export function kpCells(kp) {
  const v = Number(kp);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(9, Math.round(v)));
}

// Activity band + plain words. Bands keyed on the NOAA G-scale integer.
// [NOAA] Kp 5+ is a geomagnetic storm; G1=5, G2=6, G3=7, G4=8, G5=9.
export function kpBand(kp) {
  const lvl = kpLevel(kp);
  if (lvl === null) return { label: "unknown", words: "geomagnetic activity is unknown" };
  if (lvl <= 2) return { label: "quiet", words: "quiet — stable HF conditions" };
  if (lvl === 3) return { label: "unsettled", words: "unsettled — minor absorption on polar paths" };
  if (lvl === 4) return { label: "active", words: "active — some HF degradation at high latitudes" };
  if (lvl === 5) return { label: "minor storm (G1)", words: "minor geomagnetic storm (G1) — weaker HF on higher latitudes, aurora possible far north" };
  if (lvl === 6) return { label: "moderate storm (G2)", words: "moderate geomagnetic storm (G2) — HF fades at higher latitudes; aurora toward the northern horizon" };
  if (lvl === 7) return { label: "strong storm (G3)", words: "strong geomagnetic storm (G3) — HF degraded; aurora can reach as far south as Oregon" };
  if (lvl === 8) return { label: "severe storm (G4)", words: "severe geomagnetic storm (G4) — widespread HF problems; aurora well south" };
  // NOAA bins Kp 9− (≈8.67) as G4; only Kp 9.0 ("9o") is G5.
  const disp = kpToThirds(kp, { ascii: true });
  if (disp && disp.includes("-")) return { label: "severe storm (G4)", words: "severe geomagnetic storm (G4) — widespread HF problems; aurora well south" };
  return { label: "extreme storm (G5)", words: "extreme geomagnetic storm (G5) — HF blackout on many paths; aurora at low latitudes" };
}

// --------------------------------------------------------- solar wind / Bz

// [NOAA] Storms need a southward interplanetary field (Bz) to couple energy
// into the magnetosphere; SWPC's real-time plot shades Bz < −5 nT as the
// meaningful-southward line.
export function bzWords(bz) {
  if (bz == null) return "the north–south field (Bz) is unknown";
  const v = Number(bz);
  if (!Number.isFinite(v)) return "the north–south field (Bz) is unknown";
  const val = `${v.toFixed(1)} nT`;
  if (v <= -5) return `Bz ${val} — meaningfully southward, which can drive geomagnetic storms`;
  if (v < 0) return `Bz ${val} — slightly southward, north of the −5 nT concern line`;
  return `Bz ${val} — northward, unfavorable for storms (quieting)`;
}

export function windWords(speedKmS, bz) {
  const parts = [];
  const s = Number(speedKmS);
  if (Number.isFinite(s)) {
    let q = "typical";
    if (s >= 700) q = "very fast";
    else if (s >= 500) q = "elevated";
    else if (s < 350) q = "slow";
    parts.push(`solar wind ${Math.round(s)} km/s (${q})`);
  }
  parts.push(bzWords(bz));
  return parts.join("; ");
}

// ----------------------------------------------------------- solar flux

// [N0NBH] F10.7 solar flux bands (hamqsl.com/solar2.html). NOAA does not
// publish band-opening thresholds, so this interpretation is attributed to
// N0NBH on the page. Floor ~64 is the quiet-Sun background.
export function sfiWords(sfi) {
  const v = Number(sfi);
  if (!Number.isFinite(v)) return "solar flux is unknown";
  if (v >= 200) return `${Math.round(v)} — very high; reliable openings across the HF bands and into 6 m`;
  if (v >= 150) return `${Math.round(v)} — high; excellent on the upper HF bands, 10 m lively`;
  if (v >= 120) return `${Math.round(v)} — good; the higher bands through 10 m should be workable`;
  if (v >= 90) return `${Math.round(v)} — fair; solid up through 15 m`;
  if (v >= 70) return `${Math.round(v)} — low; the lower bands carry, upper bands thin`;
  return `${Math.round(v)} — very low; bands above 40 m largely unusable`;
}

// --------------------------------------------------------------- flares

// [NOAA] X-ray class → R-scale radio-blackout level and HF wording.
export function flareWords(maxClass) {
  if (!maxClass || typeof maxClass !== "string") {
    return { r: null, words: "no significant flare in progress" };
  }
  const letter = maxClass[0].toUpperCase();
  if (letter === "X") return { r: "R3+", words: `${maxClass} flare — wide-area HF blackout on the sunlit side` };
  if (letter === "M") return { r: "R1–R2", words: `${maxClass} flare — HF degradation or short blackout on the sunlit side` };
  if (letter === "C") return { r: null, words: `${maxClass} flare — minor, little HF impact` };
  return { r: null, words: `${maxClass} — background X-ray level, no HF impact` };
}

// ------------------------------------------------------- band conditions

// Estimated HF band conditions from solar flux + Kp. This is OUR rough model,
// not a measurement and not N0NBH's table — the SFI tiers follow the
// conventional relationship (higher flux opens higher bands; higher Kp
// degrades HF, worst on low bands at night and at high latitudes). Ground
// truth is real-time reporting (prop.kc2g.com, PSK Reporter); the page says so.
//
// Each rating carries the word (meaning), a filled-to-empty symbol (grayscale/
// print cue), an ASCII mark (plain-text edition), and a class (color cue) —
// four channels, so color is never load-bearing.
const RATINGS = {
  3: { label: "Good", score: 3, mark: "●", ascii: "#", cls: "good" },
  2: { label: "Fair", score: 2, mark: "◐", ascii: "+", cls: "fair" },
  1: { label: "Poor", score: 1, mark: "○", ascii: "-", cls: "poor" },
  0: { label: "Closed", score: 0, mark: "·", ascii: ".", cls: "closed" },
};
function rating(score) { return RATINGS[Math.max(0, Math.min(3, Math.round(score)))]; }
function tier(sfi, g, f, p) { return sfi >= g ? 3 : sfi >= f ? 2 : sfi >= p ? 1 : 0; }

export function bandConditions(sfi, kp, now = new Date()) {
  const s = num(sfi), k = num(kp);
  if (s == null || k == null) return null;
  const gen = k >= 8 ? 3 : k >= 6 ? 2 : k >= 5 ? 1 : 0;   // storm penalty to all HF
  const lowNight = k >= 4 ? 1 : 0;                        // auroral absorption, low bands at night
  const HF = [
    { band: "80 m", day: 1, night: 3, low: true },
    { band: "40 m", day: 2, night: 3, low: true },
    { band: "30 m", day: s >= 100 ? 3 : 2, night: 3, low: true },
    { band: "20 m", day: s >= 90 ? 3 : 2, night: s >= 100 ? 2 : 1 },
    { band: "17 m", day: tier(s, 110, 95, 80), night: s >= 130 ? 1 : 0 },
    { band: "15 m", day: tier(s, 120, 100, 85), night: 0 },
    { band: "12 m", day: tier(s, 130, 110, 95), night: 0 },
    { band: "10 m", day: tier(s, 140, 120, 100), night: 0 },
  ];
  const hf = HF.map((b) => ({
    band: b.band,
    day: rating(b.day - gen),
    night: rating(b.night - gen - (b.low ? lowNight : 0)),
  }));
  // VHF is not flux-driven — it turns on sporadic-E (season) and aurora (Kp).
  const month = (now instanceof Date ? now : new Date(now)).getUTCMonth() + 1;
  const esSeason = month >= 5 && month <= 8; // northern-summer sporadic-E, approx
  return {
    hf,
    vhf: {
      es_season: esSeason,
      aurora: k >= 5,
      six_m: (esSeason ? "sporadic-E likely in season" : "quiet; F2 openings only at very high flux")
        + (k >= 5 ? "; auroral propagation possible now" : ""),
      two_m: "mostly tropo and local"
        + (esSeason ? "; sporadic-E possible" : "")
        + (k >= 6 ? "; auroral propagation possible now" : ""),
    },
  };
}

// =============================================================== parsers

// noaa-planetary-k-index.json: array of {time_tag, Kp, a_running} OR a
// header-row array-of-arrays. Returns the newest reading.
export function parseKpProduct(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  let rows = data;
  if (Array.isArray(data[0])) {
    // Header row of column names, then value rows.
    const header = data[0].map((h) => String(h).toLowerCase());
    const iTime = header.indexOf("time_tag");
    const iKp = header.findIndex((h) => h === "kp" || h === "kp_index");
    const iA = header.indexOf("a_running");
    rows = data.slice(1).map((r) => ({
      time_tag: r[iTime],
      Kp: r[iKp],
      a_running: iA >= 0 ? r[iA] : null,
    }));
  }
  const last = rows[rows.length - 1];
  if (!last) return null;
  return {
    value: num(last.Kp),
    a_running: num(last.a_running),
    time_tag: normTime(last.time_tag),
  };
}

// summary/10cm-flux.json: [{flux, time_tag}]
export function parseFlux(data) {
  const row = firstRow(data);
  if (!row) return null;
  return { value: num(row.flux), time_tag: normTime(row.time_tag) };
}

// summary/solar-wind-speed.json + solar-wind-mag-field.json
export function parseWind(speedData, magData) {
  const s = firstRow(speedData) || {};
  const m = firstRow(magData) || {};
  const bz = num(m.bz_gsm);
  return {
    speed_km_s: num(s.proton_speed),
    bt_nt: num(m.bt),
    bz_nt: bz,
    bz_southward: bz == null ? null : bz <= -5,
    time_tag: normTime(m.time_tag || s.time_tag),
  };
}

// noaa-scales.json: object keyed "-1".."3". Returns observed "now" (key 0)
// and the 3-day forecast (keys 1..3). Values are strings or null.
export function parseScales(data) {
  if (!data || typeof data !== "object") return null;
  const cell = (o, k) => (o && o[k] && o[k].Scale != null
    ? { scale: String(o[k].Scale), text: o[k].Text || null }
    : { scale: null, text: null });
  const now = data["0"] || {};
  const forecast = [];
  for (const k of ["1", "2", "3"]) {
    const d = data[k];
    if (!d) continue;
    forecast.push({
      date_stamp: d.DateStamp || null,
      R_minor: numOrNull(d.R && d.R.MinorProb),
      R_major: numOrNull(d.R && d.R.MajorProb),
      S_prob: numOrNull(d.S && d.S.Prob),
      G: cell(d, "G").scale,
    });
  }
  return {
    date_stamp: now.DateStamp || null,
    time_stamp: now.TimeStamp || null,
    time_tag: now.DateStamp && now.TimeStamp ? `${now.DateStamp}T${now.TimeStamp}Z` : (now.DateStamp ? `${now.DateStamp}T00:00:00Z` : null),
    R: cell(now, "R"),
    S: cell(now, "S"),
    G: cell(now, "G"),
    forecast,
  };
}

// goes xray-flares-latest.json: [{max_class, current_class, begin_time, ...}]
export function parseFlare(data) {
  const row = firstRow(data);
  if (!row) return null;
  const cls = row.max_class || row.current_class || null;
  const inProgress = !row.end_time || row.end_time === "Unk";
  return {
    max_class: cls,
    begin_time: normTime(row.begin_time),
    max_time: row.max_time && row.max_time !== "Unk" ? normTime(row.max_time) : null,
    in_progress: cls ? inProgress : false,
    time_tag: normTime(row.time_tag),
  };
}

// text/3-day-geomag-forecast.txt: the 8×3 Kp grid. Returns per-day max Kp
// with a resolved YYYY-MM-DD date (labels like "Aug 12" carry no year, so
// `now` supplies it with a December→January rollover guard).
export function parseGeomagForecastGrid(text, now = new Date()) {
  if (typeof text !== "string") return null;
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((l) => /Kp index forecast/i.test(l));
  if (head < 0) return null;
  const dateLine = lines[head + 1] || "";
  const labels = dateLine.trim().split(/\s{2,}/).filter(Boolean);
  const refYear = (now instanceof Date ? now : new Date(now)).getUTCFullYear();
  const refMonth = (now instanceof Date ? now : new Date(now)).getUTCMonth(); // 0-based
  const days = labels.map((label) => {
    const m = label.match(/(\w{3})\s+(\d{1,2})/);
    let date = null;
    if (m && MONTHS[m[1]]) {
      const mo = parseInt(MONTHS[m[1]], 10) - 1;
      // Rollover: a January label seen from December belongs to next year.
      const year = mo < refMonth - 6 ? refYear + 1 : refYear;
      date = `${year}-${MONTHS[m[1]]}-${String(m[2]).padStart(2, "0")}`;
    }
    return { label, date, values: [], max: null };
  });
  for (let i = head + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*\d{2}-\d{2}UT/.test(line)) continue;
    const rest = line.replace(/^\s*\d{2}-\d{2}UT\s*/, "");
    // Kp is always formatted X.XX; requiring the decimal excludes any inline
    // storm tag like "(G1)" whose digit would otherwise parse as a value.
    const nums = (rest.match(/\d+\.\d+/g) || []).map(Number);
    nums.forEach((n, c) => { if (days[c]) days[c].values.push(n); });
  }
  for (const d of days) d.max = d.values.length ? Math.max(...d.values) : null;
  return days.length ? days : null;
}

// text/aurora-nowcast-hemi-power.txt: last data row → northern power (GW).
export function parseHemiPower(text) {
  if (typeof text !== "string") return null;
  const lines = text.split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
  const last = lines[lines.length - 1];
  if (!last) return null;
  // Columns: "obsDate_obsTime  fcstDate_fcstTime  northGW  southGW" — the
  // datetimes are underscore-joined, so the row has four whitespace fields.
  const fields = last.trim().split(/\s+/);
  // Guard against an HTTP-200 HTML error body: a real row is four fields
  // starting with an underscore-joined datetime.
  if (fields.length < 4 || !/^\d{4}-\d{2}-\d{2}_/.test(fields[0])) return null;
  const fcst = fields[1]; // forecast valid time, "YYYY-MM-DD_HH:MM"
  return {
    gw_north: num(fields[fields.length - 2]),
    time_tag: /_/.test(fcst) ? normTime(fcst.replace("_", "T")) : null,
  };
}

// text/daily-solar-indices.txt (DSD): newest daily SESC sunspot number.
export function parseDailyIndicesSSN(text) {
  if (typeof text !== "string") return null;
  const rows = text.split(/\r?\n/).filter((l) => /^\d{4}\s+\d{2}\s+\d{2}\s+/.test(l));
  const last = rows[rows.length - 1];
  if (!last) return null;
  const f = last.trim().split(/\s+/);
  // YYYY MM DD  RadioFlux  Sunspot  ...  (-999 is NOAA's missing-value sentinel)
  let ssn = num(f[4]);
  if (ssn === -999) ssn = null;
  const y = f[0], mo = f[1], d = f[2];
  return {
    value: ssn,
    time_tag: `${y}-${mo}-${d}T00:00:00Z`,
  };
}

// text/wwv.txt: the verbatim bulletin + its :Issued: time.
export function parseWwv(text) {
  if (typeof text !== "string") return null;
  // Reject an HTTP-200 HTML error body: the real bulletin has NOAA headers.
  if (!/:Issued:|Geophysical Alert/i.test(text)) return null;
  const m = text.match(/:Issued:\s*(\d{4})\s+(\w{3})\s+(\d{2})\s+(\d{2})(\d{2})\s*UTC/i);
  const issued = m ? monthStampToIso(m) : null;
  return { text, issued, time_tag: issued };
}

// ============================================================ freshness

// Per-metric cadence table (minutes). stale/expired are ages of the data's
// own time_tag, not of the fetch — NOAA can serve 200 OK with a stuck value.
export const CADENCE = {
  sfi: { stale: 30 * 60, expired: 72 * 60 },
  // The daily sunspot number is issued with an inherent ~1-day lag, so
  // don't flag it stale until well past that.
  ssn: { stale: 48 * 60, expired: 96 * 60 },
  kp: { stale: 6 * 60, expired: 24 * 60 },
  bands: { stale: 6 * 60, expired: 24 * 60 },
  solar_wind: { stale: 2 * 60, expired: 24 * 60 },
  scales_now: { stale: 30 * 60, expired: 72 * 60 },
  outlook: { stale: 30 * 60, expired: 72 * 60 },
  flare: { stale: 3 * 60, expired: 24 * 60 },
  aurora_power: { stale: 2 * 60, expired: 24 * 60 },
  wwv: { stale: 7 * 60, expired: 24 * 60 },
};

export function computeFreshness(timeTag, cadence, now) {
  if (!timeTag || !cadence) return { stale: false, expired: false, age_minutes: null };
  const t = Date.parse(timeTag);
  const n = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(t) || !Number.isFinite(n)) return { stale: false, expired: false, age_minutes: null };
  const age = (n - t) / 60000;
  return { stale: age > cadence.stale, expired: age > cadence.expired, age_minutes: Math.round(age) };
}

// =========================================================== helpers

function firstRow(data) {
  if (Array.isArray(data)) return data[0] || null;
  if (data && typeof data === "object") return data;
  return null;
}
// Number(), but empty string / whitespace / null are non-numeric, not 0.
function num(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function numOrNull(v) { return num(v); }
function normTime(t) {
  if (!t || typeof t !== "string") return null;
  // NOAA mixes "…Z" and naive UTC stamps; treat naive as UTC.
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(t) ? t.replace(/z$/, "Z") : `${t}Z`;
}
const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
function monthStampToIso([, y, mon, d, hh, mm]) {
  const mo = MONTHS[mon] || "01";
  return `${y}-${mo}-${d}T${hh}:${mm}:00Z`;
}

// =========================================================== snapshot

// Wrap a parsed metric in the standard envelope with freshness + provenance.
function metric(id, parsed, valueFields, sourceUrl, now, fetchedAt) {
  const cadence = CADENCE[id];
  if (!parsed) {
    return { ...blankFields(valueFields), source_url: sourceUrl, time_tag: null, fetched_at: fetchedAt || null, stale: false, expired: false, unavailable: true };
  }
  const fresh = computeFreshness(parsed.time_tag, cadence, now);
  return {
    ...pick(parsed, valueFields),
    source_url: sourceUrl,
    time_tag: parsed.time_tag || null,
    fetched_at: fetchedAt || null,
    age_minutes: fresh.age_minutes,
    stale: fresh.stale,
    expired: fresh.expired,
    unavailable: false,
  };
}
function pick(o, fields) {
  const out = {};
  for (const f of fields) out[f] = o[f] === undefined ? null : o[f];
  return out;
}
function blankFields(fields) {
  const out = {};
  for (const f of fields) out[f] = null;
  return out;
}

// Build the whole normalized snapshot. `responses` is a map of id → parsed
// result (or null on fetch failure). `previous` is last-known-good snapshot
// (or null). Per-metric: use fresh if present, else carry previous forward.
export function buildSnapshot(responses, previous, now) {
  const nowIso = (now instanceof Date ? now : new Date(now)).toISOString().replace(/\.\d{3}Z$/, "Z");
  const prevMetrics = (previous && previous.metrics) || {};

  const build = (id, parsed, valueFields, sourceUrl) => {
    if (parsed) return { metric: metric(id, parsed, valueFields, sourceUrl, now, nowIso), fresh: true };
    if (prevMetrics[id] && !prevMetrics[id].unavailable) {
      // Carry forward; recompute staleness against the new clock.
      const carried = { ...prevMetrics[id] };
      const fresh = computeFreshness(carried.time_tag, CADENCE[id], now);
      carried.stale = fresh.stale;
      carried.expired = fresh.expired;
      carried.age_minutes = fresh.age_minutes;
      return { metric: carried, fresh: false };
    }
    return { metric: metric(id, null, valueFields, sourceUrl, now, null), fresh: false };
  };

  const B = "https://services.swpc.noaa.gov/";
  const metrics = {};
  const attempts = [];
  const add = (id, parsed, valueFields, url) => {
    const r = build(id, parsed, valueFields, B + url);
    metrics[id] = r.metric;
    attempts.push({ id, ok: !!parsed, carried_forward: !parsed && !r.metric.unavailable });
  };

  // Enrich parsed metrics with interpretation words before wrapping.
  const kp = responses.kp;
  if (kp && kp.value != null) {
    const band = kpBand(kp.value);
    kp.display = kpToThirds(kp.value);
    kp.display_ascii = kpToThirds(kp.value, { ascii: true });
    kp.cells = kpCells(kp.value);
    kp.band = band.label;
    const lvl = kpLevel(kp.value);
    kp.cls = lvl <= 2 ? "good" : lvl <= 4 ? "fair" : "alert"; // color cue (never sole)
    kp.words = `Kp ${kp.display} (${kp.value.toFixed(2)}) — ${band.words}`;
    kp.words_ascii = `Kp ${kp.display_ascii} (${kp.value.toFixed(2)}) — ${band.words}`;
  }
  const sfi = responses.sfi;
  if (sfi && sfi.value != null) sfi.words = sfiWords(sfi.value);

  // Estimated band conditions need both solar flux and Kp.
  if (sfi && sfi.value != null && kp && kp.value != null) {
    const bc = bandConditions(sfi.value, kp.value, now);
    responses.bands = bc ? { ...bc, time_tag: kp.time_tag } : null;
  } else {
    responses.bands = null;
  }
  const ssn = responses.ssn;
  if (ssn && ssn.value != null) ssn.words = `${ssn.value} sunspots (SESC daily number)`;
  const wind = responses.solar_wind;
  if (wind) wind.words = windWords(wind.speed_km_s, wind.bz_nt);
  const flare = responses.flare;
  if (flare) {
    const fw = flareWords(flare.max_class);
    flare.words = fw.words;
    flare.r = fw.r;
  }
  const aurora = responses.aurora_power;
  if (aurora && aurora.gw_north != null) {
    aurora.words = `northern hemispheric power ${aurora.gw_north} GW`;
  }

  add("sfi", sfi, ["value", "words"], "products/summary/10cm-flux.json");
  add("ssn", ssn, ["value", "words"], "text/daily-solar-indices.txt");
  add("kp", kp, ["value", "display", "display_ascii", "cells", "band", "cls", "a_running", "words", "words_ascii"], "products/noaa-planetary-k-index.json");
  add("bands", responses.bands, ["hf", "vhf"], "products/noaa-planetary-k-index.json");
  add("solar_wind", wind, ["speed_km_s", "bt_nt", "bz_nt", "bz_southward", "words"], "products/summary/solar-wind-mag-field.json");
  add("scales_now", responses.scales_now, ["date_stamp", "R", "S", "G"], "products/noaa-scales.json");
  add("outlook", responses.outlook, ["days"], "products/noaa-scales.json");
  add("flare", flare, ["max_class", "r", "in_progress", "words"], "json/goes/primary/xray-flares-latest.json");
  add("aurora_power", aurora, ["gw_north", "words"], "text/aurora-nowcast-hemi-power.txt");
  add("wwv", responses.wwv, ["text", "issued"], "text/wwv.txt");

  const allGone = Object.values(metrics).every((m) => m.unavailable || m.expired);
  return {
    fetch_meta: { schema_version: 1, generated_at: nowIso, total_outage: allGone, attempts },
    metrics,
  };
}
