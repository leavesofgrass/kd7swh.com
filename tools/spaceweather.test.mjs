// tools/spaceweather.test.mjs — run inside the container:
//   docker compose exec dev node tools/spaceweather.test.mjs
// Fixtures are captured from live NOAA products (Aug 2026).

import assert from "node:assert/strict";
import {
  kpToThirds, kpLevel, kpCells, kpBand, bzWords, sfiWords, flareWords,
  parseKpProduct, parseFlux, parseWind, parseScales, parseFlare,
  parseGeomagForecastGrid, parseHemiPower, parseDailyIndicesSSN, parseWwv,
  computeFreshness, buildSnapshot,
} from "./spaceweather.mjs";

// --- Kp thirds notation ----------------------------------------------------
assert.equal(kpToThirds(0), "0");
assert.equal(kpToThirds(0.33), "0+");
assert.equal(kpToThirds(0.67), "1−");
assert.equal(kpToThirds(1.0), "1");
assert.equal(kpToThirds(2.33), "2+");
assert.equal(kpToThirds(2.67), "3−");
assert.equal(kpToThirds(3.0), "3");
assert.equal(kpToThirds(8.67), "9−");
assert.equal(kpToThirds(9), "9");
assert.equal(kpToThirds(2.6700001), "3−", "float noise tolerated");
assert.equal(kpToThirds("2.67"), "3−", "string input (products serve strings)");
assert.equal(kpToThirds(2.67, { ascii: true }), "3-", "ascii uses hyphen");
assert.equal(kpToThirds("nope"), null);

// --- Kp level / cells / band ----------------------------------------------
assert.equal(kpLevel(4.67), 5, "4.67 displays 5− → G-scale level 5");
assert.equal(kpLevel(4.33), 4, "4.33 displays 4+ → level 4");
assert.equal(kpCells(2.67), 3);
assert.equal(kpCells(12), 9, "clamped to 9");
assert.equal(kpCells(-1), 0, "clamped to 0");
assert.equal(kpBand(1).label, "quiet");
assert.equal(kpBand(3).label, "unsettled");
assert.equal(kpBand(4.67).label, "minor storm (G1)");
assert.equal(kpBand(7).label, "strong storm (G3)");
assert.ok(kpBand(7).words.includes("Oregon"), "G3 words mention Oregon (NOAA scales page)");
assert.equal(kpBand(9).label, "extreme storm (G5)");
// NOAA bins Kp 9− (≈8.67) as G4; only Kp 9.0 is G5.
assert.equal(kpBand(8.67).label, "severe storm (G4)", "9− is G4, not G5");
assert.equal(kpBand(9.0).label, "extreme storm (G5)", "9o is G5");

// --- Bz / SFI / flare wording ---------------------------------------------
assert.ok(bzWords(-2.3).includes("slightly southward"));
assert.ok(bzWords(-5).includes("meaningfully southward"), "−5 is the boundary");
assert.ok(bzWords(3).includes("northward"));
assert.ok(bzWords(null).includes("unknown"));
assert.ok(sfiWords(142).startsWith("142"));
assert.ok(sfiWords(60).includes("very low"));
assert.ok(sfiWords(210).includes("very high"));
assert.equal(flareWords("X2.0").r, "R3+");
assert.equal(flareWords("M1.2").r, "R1–R2");
assert.equal(flareWords("C1.0").r, null);
assert.ok(flareWords(null).words.includes("no significant flare"));

// --- bandConditions -------------------------------------------------------
import { bandConditions } from "./spaceweather.mjs";
const bc = bandConditions(96, 1.67, new Date("2026-08-11T22:00:00Z"));
assert.equal(bc.hf.length, 8, "eight HF bands");
assert.equal(bc.hf[0].band, "80 m");
assert.equal(bc.hf[0].night.label, "Good", "80m good at night");
assert.equal(bc.hf[0].day.label, "Poor", "80m poor by day (absorption)");
assert.equal(bc.hf[7].band, "10 m");
assert.equal(bc.hf[7].day.label, "Closed", "10m closed at SFI 96");
assert.ok(bc.vhf.six_m.includes("sporadic-E"), "August is Es season");
// Every rating carries all four channels (word/symbol/ascii/class).
for (const b of bc.hf) for (const r of [b.day, b.night]) {
  assert.ok(r.label && r.mark && r.ascii && r.cls, "rating has word+symbol+ascii+class");
}
// A high-flux day opens the high bands; a storm slams them shut.
assert.equal(bandConditions(200, 1, new Date("2026-01-11T12:00:00Z")).hf[7].day.label, "Good", "10m good at SFI 200");
const storm = bandConditions(200, 8, new Date("2026-01-11T12:00:00Z"));
assert.ok(["Poor", "Closed"].includes(storm.hf[0].night.label), "big storm hurts low bands at night");
assert.equal(storm.vhf.aurora, true, "Kp 8 flags auroral VHF");
assert.equal(bandConditions(null, 3), null, "no flux → no estimate");

// --- parseKpProduct: both shapes ------------------------------------------
assert.deepEqual(
  parseKpProduct([
    { time_tag: "2026-08-11T18:00:00", Kp: 2.33, a_running: 9 },
    { time_tag: "2026-08-11T21:00:00", Kp: 2.67, a_running: 8 },
  ]),
  { value: 2.67, a_running: 8, time_tag: "2026-08-11T21:00:00Z" },
  "object-array shape, takes last, appends Z to naive stamp");
assert.equal(
  parseKpProduct([
    ["time_tag", "Kp", "a_running"],
    ["2026-08-11T18:00:00", "2.33", "9"],
    ["2026-08-11T21:00:00", "2.67", "8"],
  ]).value, 2.67, "header-row array-of-arrays shape");
assert.equal(parseKpProduct([]), null, "empty array");

// --- parseFlux / parseWind ------------------------------------------------
assert.deepEqual(parseFlux([{ flux: 96, time_tag: "2026-08-11T20:00:00" }]),
  { value: 96, time_tag: "2026-08-11T20:00:00Z" });
const wind = parseWind([{ proton_speed: 446, time_tag: "2026-08-11T22:57:00Z" }],
  [{ bt: 5, bz_gsm: 3, time_tag: "2026-08-11T22:57:00Z" }]);
assert.equal(wind.speed_km_s, 446);
assert.equal(wind.bz_nt, 3);
assert.equal(wind.bz_southward, false);
const windS = parseWind([{ proton_speed: 500 }], [{ bt: 8, bz_gsm: -7 }]);
assert.equal(windS.bz_southward, true, "Bz −7 is southward");

// --- parseScales: nulls in forecast ---------------------------------------
const scales = parseScales({
  "0": { DateStamp: "2026-08-11", TimeStamp: "23:02:00",
    R: { Scale: "0", Text: "none" }, S: { Scale: "0", Text: "none" }, G: { Scale: "1", Text: "minor" } },
  "1": { DateStamp: "2026-08-12", R: { Scale: null, Text: null, MinorProb: "25", MajorProb: "5" }, S: { Scale: null, Prob: "10" }, G: { Scale: "1", Text: null } },
});
assert.equal(scales.R.scale, "0");
assert.equal(scales.G.text, "minor");
assert.equal(scales.forecast[0].R_minor, 25);
assert.equal(scales.forecast[0].G, "1");

// --- parseFlare: max_class null → prefer current_class --------------------
const flare = parseFlare([{ current_class: "C1.0", max_class: null, begin_time: "2026-08-11T22:55:00Z", max_time: "Unk", end_time: "Unk" }]);
assert.equal(flare.max_class, "C1.0", "falls back to current_class");
assert.equal(flare.max_time, null, "'Unk' becomes null");
assert.equal(flare.in_progress, true, "no end_time → in progress");
assert.equal(parseFlare([{ max_class: "M5.1", end_time: "2026-08-11T23:30:00Z" }]).in_progress, false);

// --- parseGeomagForecastGrid: real 8×3 grid -------------------------------
const GEOMAG = `:Product: Geomagnetic Forecast
:Issued: 2026 Aug 11 2205 UTC
NOAA Kp index forecast 12 Aug - 14 Aug
             Aug 12    Aug 13    Aug 14
00-03UT        2.33      1.67      2.00
03-06UT        2.33      2.00      1.67
12-15UT        2.33      1.67      3.00
21-00UT        2.00      1.67      3.67`;
const grid = parseGeomagForecastGrid(GEOMAG, new Date("2026-08-11T22:00:00Z"));
assert.equal(grid.length, 3, "three forecast days");
assert.equal(grid[0].label, "Aug 12");
assert.equal(grid[0].date, "2026-08-12", "label resolved to full date via now");
assert.equal(grid[2].max, 3.67, "day 3 max Kp");
assert.equal(grid[0].max, 2.33);
// Inline storm tags like "(G1)" must NOT inject their digit as a Kp value.
const stormGrid = parseGeomagForecastGrid(
  "NOAA Kp index forecast\n             Aug 12\n00-03UT   5.33 (G1)\n03-06UT   6.00 (G2)",
  new Date("2026-08-11T22:00:00Z"));
assert.equal(stormGrid[0].max, 6.0, "storm-tag digits excluded; max is 6.00 not a stray 1/2");
assert.deepEqual(stormGrid[0].values, [5.33, 6.0], "only the X.XX Kp values parsed");
// December→January rollover: a Jan label seen from December is next year.
const roll = parseGeomagForecastGrid(
  "NOAA Kp index forecast\n             Jan 01\n00-03UT   2.00",
  new Date("2026-12-31T22:00:00Z"));
assert.equal(roll[0].date, "2027-01-01", "Jan label from December rolls to next year");

// --- parseHemiPower: underscore-joined datetimes (real NOAA format) --------
const HEMI = `# header line
2026-08-11_22:30  2026-08-11_23:00   25   18
2026-08-11_23:00  2026-08-11_23:30   30   20`;
assert.equal(parseHemiPower(HEMI).gw_north, 30, "last row, northern GW, underscore format");
assert.equal(parseHemiPower(HEMI).time_tag, "2026-08-11T23:30Z", "forecast time parsed (NOAA gives HH:MM, no seconds)");

const DSD = `:Product: Daily Solar Data DSD.txt
#  header
2026 08 10  96     52      400      0    -999      *   1  0  0
2026 08 11  96     48      380      0    -999      *   0  0  0`;
assert.equal(parseDailyIndicesSSN(DSD).value, 48, "newest SSN row");
// NOAA's -999 missing-value sentinel must become null, not a literal -999.
const DSD_MISSING = `:Product: DSD\n2026 08 11  96     -999      380      0`;
assert.equal(parseDailyIndicesSSN(DSD_MISSING).value, null, "-999 sentinel → null");

const WWV = `:Product: Geophysical Alert Message wwv.txt
:Issued: 2026 Aug 11 2105 UTC
Solar flux 96 and estimated planetary A-index 9.`;
const wwv = parseWwv(WWV);
assert.equal(wwv.text, WWV, "WWV text preserved byte-for-byte");
assert.equal(wwv.issued, "2026-08-11T21:05:00Z");
assert.equal(wwv.time_tag, "2026-08-11T21:05:00Z", "wwv time_tag = issued");
// An HTTP-200 HTML error body must be rejected, not shown as the bulletin.
assert.equal(parseWwv("<html><body>503 Service Unavailable</body></html>"), null, "HTML body rejected");
assert.equal(parseHemiPower("<html>error</html>"), null, "aurora HTML body rejected");

// Empty/blank numeric fields are non-numeric, not 0.
assert.equal(parseFlux([{ flux: "", time_tag: "2026-08-11T20:00:00" }]).value, null, "empty flux → null, not 0");
assert.equal(parseKpProduct([{ time_tag: "2026-08-11T21:00:00Z", Kp: "  " }]).value, null, "blank Kp → null");

// --- freshness (time_tag age, not fetch) ----------------------------------
const now = new Date("2026-08-11T23:00:00Z");
assert.equal(computeFreshness("2026-08-11T21:00:00Z", { stale: 360, expired: 1440 }, now).stale, false, "2h < 6h");
assert.equal(computeFreshness("2026-08-11T14:00:00Z", { stale: 360, expired: 1440 }, now).stale, true, "9h > 6h stale");
assert.equal(computeFreshness("2026-08-10T20:00:00Z", { stale: 360, expired: 1440 }, now).expired, true, "27h > 24h expired");

// --- buildSnapshot: fresh, carry-forward, total outage --------------------
const responses = {
  sfi: parseFlux([{ flux: 142, time_tag: "2026-08-11T20:00:00" }]),
  kp: parseKpProduct([{ time_tag: "2026-08-11T21:00:00Z", Kp: 2.67, a_running: 8 }]),
  solar_wind: parseWind([{ proton_speed: 412 }], [{ bt: 5, bz_gsm: -2.3, time_tag: "2026-08-11T22:57:00Z" }]),
  scales_now: null, outlook: null, flare: null, aurora_power: null, ssn: null, wwv: null,
};
const snap = buildSnapshot(responses, null, now);
assert.equal(snap.metrics.kp.display, "3−");
assert.ok(snap.metrics.kp.words.includes("unsettled"));
assert.equal(snap.metrics.kp.cells, 3);
assert.equal(snap.metrics.sfi.value, 142);
assert.equal(snap.metrics.scales_now.unavailable, true, "no data and no previous → unavailable");
assert.equal(snap.fetch_meta.schema_version, 1);

// carry-forward: kp fails this round but previous snapshot had it
const later = new Date("2026-08-11T23:30:00Z");
const carried = buildSnapshot({ ...responses, kp: null }, snap, later);
assert.equal(carried.metrics.kp.value, 2.67, "kp carried forward from previous");
assert.equal(carried.metrics.kp.unavailable, false);
assert.equal(carried.fetch_meta.attempts.find((a) => a.id === "kp").carried_forward, true);

// total outage: no responses, no previous
const outage = buildSnapshot(
  { sfi: null, ssn: null, kp: null, solar_wind: null, scales_now: null, outlook: null, flare: null, aurora_power: null, wwv: null },
  null, now);
assert.equal(outage.fetch_meta.total_outage, true, "everything unavailable → total outage flag");

console.log("spaceweather.test: all assertions passed");
