const { google } = require("googleapis");

// Credentials: use env var in production (no key file on server), or local JSON file in dev
let credentials = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  } catch (e) {
    console.warn("[Google Sheets] Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON");
  }
}
if (!credentials) {
  try {
    // Local dev: key file is gitignored; copy from Google Cloud Console or use env var
    credentials = require("../fineanswer-sheets-integration-c29908b1decf.json");
  } catch (e) {
    // File missing (e.g. in production) – set GOOGLE_APPLICATION_CREDENTIALS_JSON
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: credentials || undefined,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// Extract the raw spreadsheet ID from a full URL or bare ID.
// Strips any trailing #gid=... fragment that comes from copy-pasting a sheet URL.
function extractSpreadsheetId(raw) {
  if (!raw) return null;
  // Full URL: extract ID segment
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Bare ID (possibly with a #gid=... fragment — strip it)
  return raw.trim().replace(/#.*$/, "");
}

const SPREADSHEET_ID = extractSpreadsheetId(process.env.GOOGLE_SPREADSHEET_ID);

// The single sheet tab to read data from
const FINAL_SHEET_NAME = "Final Sheet";

// In-memory cache
let cache = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Level Normalisation ──────────────────────────────────────────────────────
const LEVEL_CANON = {
  "master's (postgraduate)": "Master's (Postgraduate)",
  "master's": "Master's (Postgraduate)",
  masters: "Master's (Postgraduate)",
  postgraduate: "Master's (Postgraduate)",
  "master of": "Master's (Postgraduate)",
  msc: "Master's (Postgraduate)",
  "ma ": "Master's (Postgraduate)",
  mba: "Master's (Postgraduate)",

  "bachelor's (undergraduate)": "Bachelor's (Undergraduate)",
  "bachelor's": "Bachelor's (Undergraduate)",
  bachelors: "Bachelor's (Undergraduate)",
  undergraduate: "Bachelor's (Undergraduate)",
  "bachelor of": "Bachelor's (Undergraduate)",

  "postgraduate diploma": "Postgraduate Diploma",
  "post graduate diploma": "Postgraduate Diploma",
  "pg diploma": "Postgraduate Diploma",

  "higher diploma": "Higher Diploma",
  "hd ": "Higher Diploma",
};

// The four canonical level values the frontend exposes
const CANONICAL_LEVELS = new Set([
  "Master's (Postgraduate)",
  "Bachelor's (Undergraduate)",
  "Postgraduate Diploma",
  "Higher Diploma",
]);

function normalizeLevel(raw) {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim();
  if (LEVEL_CANON[lower]) return LEVEL_CANON[lower];
  for (const [key, canon] of Object.entries(LEVEL_CANON)) {
    if (lower.startsWith(key) || lower === key.trim()) return canon;
  }
  return raw.trim();
}

// ─── Sheet Structure Detection ────────────────────────────────────────────────
// Valid structure: row 0 = university name, row 1 = headers with "Campus" at A
function hasExpectedStructure(rows) {
  if (!rows || rows.length < 3) return false;
  const headerCell = (rows[1][0] || "").toString().trim().toLowerCase();
  return headerCell === "campus";
}

// ─── Single-Column Row Detection ─────────────────────────────────────────────
// Returns true when only column A has a value (used for university, level, and
// category header rows in the sheet).
function isSingleColumnRow(row) {
  if (!row || row.length === 0) return false;
  const first = (row[0] || "").toString().trim();
  if (!first) return false;
  for (let i = 1; i < row.length; i++) {
    if ((row[i] || "").toString().trim() !== "") return false;
  }
  return true;
}

// ─── Final Sheet Parser ───────────────────────────────────────────────────────
/**
 * The "Final Sheet" tab repeats the following block for every university:
 *
 *   Row A : University name          (only column A has a value)
 *   Row B : Column headers           (column A = "Campus")
 *   Row C : Level header             (e.g. "Master's (Postgraduate)")
 *   Row D : Category header          (e.g. "Business, Management & Law")
 *   Row E+: Data rows
 *
 * Single-column rows are classified as:
 *   • University name  – when the NEXT non-blank row has col A = "campus"
 *   • Level header     – when the value normalises to a canonical level
 *   • Category header  – everything else (the four subject area strings)
 */
function parseSheetRows(rows, sheet) {
  if (!hasExpectedStructure(rows)) return [];

  const programs = [];
  let currentUniversity = (rows[0][0] || "").toString().trim() || sheet;
  let currentLevel = "";
  let currentCategory = "";

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.every((cell) => (cell || "").toString().trim() === "")) {
      continue;
    }

    const colA = (row[0] || "").toString().trim();

    // ── Repeated column-header row ("Campus" in col A) ─────────────────────
    if (colA.toLowerCase() === "campus") {
      for (let j = i - 1; j >= 0; j--) {
        const prev = rows[j];
        if (!prev || prev.every((c) => (c || "").toString().trim() === ""))
          continue;
        if (isSingleColumnRow(prev)) {
          currentUniversity = (prev[0] || "").toString().trim();
          currentLevel = "";
          currentCategory = "";
        }
        break;
      }
      continue;
    }

    // ── Single-column row: university name / level / category ───────────────
    if (isSingleColumnRow(row)) {
      // Peek at the next non-blank row
      let nextRow = null;
      for (let j = i + 1; j < rows.length; j++) {
        const r = rows[j];
        if (r && !r.every((c) => (c || "").toString().trim() === "")) {
          nextRow = r;
          break;
        }
      }
      const nextColA = (nextRow?.[0] || "").toString().trim().toLowerCase();

      if (nextColA === "campus") {
        // University name row
        currentUniversity = colA;
        currentLevel = "";
        currentCategory = "";
      } else {
        const asLevel = normalizeLevel(colA);
        if (CANONICAL_LEVELS.has(asLevel)) {
          // Level header (e.g. "Master's (Postgraduate)")
          currentLevel = asLevel;
          currentCategory = "";
        } else {
          // Category header (e.g. "Business, Management & Law")
          currentCategory = colA;
        }
      }
      continue;
    }

    // ── Data row ───────────────────────────────────────────────────────────
    const programName = (row[2] || "").toString().trim();
    if (!programName) continue;

    programs.push({
      university: currentUniversity,
      campus: colA,
      referenceLink: (row[1] || "").toString().trim(),
      programName,
      nfqQqi: (row[3] || "").toString().trim(),
      availableIntakes: (row[4] || "").toString().trim(),
      duration: (row[5] || "").toString().trim(),
      tuitionFees: (row[6] || "").toString().trim(),
      englishRequirements: (row[7] || "").toString().trim(),
      academicRequirements: (row[8] || "").toString().trim(),
      level: currentLevel,
      category: currentCategory,
      country: "Ireland",
    });
  }

  return programs;
}

// ─── Public API ───────────────────────────────────────────────────────────────
async function getAllPrograms() {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  if (!credentials) {
    throw new Error(
      "Google Sheets credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS_JSON (full JSON string) in production, or add the service account key file locally.",
    );
  }
  if (!SPREADSHEET_ID) {
    throw new Error(
      "GOOGLE_SPREADSHEET_ID is not set in environment variables.",
    );
  }

  // Fetch only the "Final Sheet" tab
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${FINAL_SHEET_NAME}'`,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const rows = res.data.values || [];
  const allPrograms = parseSheetRows(rows, FINAL_SHEET_NAME);

  cache = { data: allPrograms, expiresAt: Date.now() + CACHE_TTL_MS };
  return allPrograms;
}

module.exports = { getAllPrograms };
