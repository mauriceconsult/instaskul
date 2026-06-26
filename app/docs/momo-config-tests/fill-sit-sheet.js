/**
 * fill-sit-sheet.js
 * Reads sit-results.json produced by momo-sit-runner.js and writes
 * Actual Results, ReferenceID, and Notes back into the MTN SIT spreadsheet
 * (Collection sheet), then saves a new filled copy.
 *
 * Usage:
 *   node fill-sit-sheet.js [results.json] [source.xlsx]
 *
 * Defaults:
 *   results : ./sit-results.json
 *   source  : first match of known xlsx filenames in current dir
 *   output  : ./UG_Momo_SIT_Filled.xlsx
 *
 * Dependencies: npm install xlsx
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Args / paths ─────────────────────────────────────────────────────────────

const resultsPath = process.argv[2] ?? resolve(__dirname, "sit-results.json");
const xlsxSrc     = process.argv[3] ?? findXlsx();
const xlsxOut     = resolve(__dirname, "UG_Momo_SIT_Filled.xlsx");

function findXlsx() {
  const candidates = [
    "UG Momo OpenAPI SIT Sheet (2).xlsx",   // Drive / local original name
    "UG_Momo_OpenAPI_SIT_Sheet__2_.xlsx",   // upload-escaped name
    "UG_Momo_OpenAPI_SIT_Sheet.xlsx",       // simplified copy
  ];
  for (const name of candidates) {
    const p = resolve(__dirname, name);
    if (existsSync(p)) return p;
  }
  console.error("⛔  SIT spreadsheet not found. Pass its path as the second argument:");
  console.error("    node fill-sit-sheet.js sit-results.json 'UG Momo OpenAPI SIT Sheet (2).xlsx'");
  process.exit(1);
}

// ─── Row map: TC# → 0-based row in Collection sheet ──────────────────────────
// Verified against actual spreadsheet. Excel row N = index N-1 here.

const TC_ROW = {
  "TC01-01":  4,   // Excel row  5
  "TC01-02":  8,   // Excel row  9
  "TC01-03": 12,   // Excel row 13
  "TC01-04": 16,   // Excel row 17
  "TC02-01": 21,   // Excel row 22
  "TC02-02": 25,   // Excel row 26
  "TC02-03": 29,   // Excel row 30
  "TC02-04": 33,   // Excel row 34
  "TC02-05": 37,   // Excel row 38
  "TC02-06": 41,   // Excel row 42
  "TC02-07": 45,   // Excel row 46
  "TC02-08": 49,   // Excel row 50
  "TC02-09": 53,   // Excel row 54
  "TC02-10": 57,   // Excel row 58
  "TC02-11": 61,   // Excel row 62
  "TC02-12": 66,   // Excel row 67
  "TC02-13": 70,   // Excel row 71
  "TC02-14": 74,   // Excel row 75
  "TC02-15": 78,   // Excel row 79
  "TC02-16": 82,   // Excel row 83
  "TC02-17": 86,   // Excel row 87
  "TC02-18": 90,   // Excel row 91
};

const COL_ACTUAL = 3; // D — Actual Results
const COL_REFID  = 4; // E — ReferenceID
const COL_NOTES  = 5; // F — Notes

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(resultsPath)) {
    console.error(`⛔  Results file not found: ${resultsPath}`);
    console.error("    Run: node momo-sit-runner.js  first.");
    process.exit(1);
  }

  const results = JSON.parse(readFileSync(resultsPath, "utf-8"));
  console.log(`\n📋  ${results.length} results loaded from ${resultsPath}`);
  console.log(`📄  Source xlsx: ${xlsxSrc}\n`);

  // Use buffer read/write — avoids xlsx sandbox path restrictions
  const wb = XLSX.read(readFileSync(xlsxSrc), { type: "buffer" });

  if (!wb.SheetNames.includes("Collection")) {
    console.error('⛔  Sheet "Collection" not found in workbook.');
    process.exit(1);
  }
  const ws = wb.Sheets["Collection"];

  let written = 0;
  for (const r of results) {
    const row0 = TC_ROW[r.tc];
    if (row0 === undefined) {
      console.warn(`  ⚠  Unknown TC "${r.tc}" — skipped`);
      continue;
    }

    // D — Actual Results
    ws[XLSX.utils.encode_cell({ r: row0, c: COL_ACTUAL })] = {
      v: `[${r.status}] ${r.actual}`,
      t: "s",
    };

    // E — ReferenceID (only when meaningful)
    if (r.referenceId && r.referenceId !== "N/A") {
      ws[XLSX.utils.encode_cell({ r: row0, c: COL_REFID })] = { v: r.referenceId, t: "s" };
    }

    // F — Notes
    if (r.notes) {
      ws[XLSX.utils.encode_cell({ r: row0, c: COL_NOTES })] = { v: r.notes, t: "s" };
    }

    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`  ${icon}  ${r.tc}  row ${row0 + 1}  →  ${r.actual.slice(0, 68)}`);
    written++;
  }

  const outBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  writeFileSync(xlsxOut, outBuf);

  console.log(`\n✔  ${written}/${results.length} results written`);
  console.log(`   Output: ${xlsxOut}\n`);
}

main();
