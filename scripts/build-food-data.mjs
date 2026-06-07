/**
 * Builds food-data.json from:
 *  1. McCance & Widdowson's (Excel, sheet "1.3 Proximates")
 *  2. Open Food Facts API — UK (≤10,000), Portugal (≤2,000), Switzerland (≤1,000)
 *
 * Output format per item: { food, "Caloric Value", Carbohydrates, Protein, Fat }
 * All values per 100 g. Items missing or zero for any of the four are dropped.
 * Deduplication by food name (case-insensitive); McCance entries take priority.
 */

import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Helpers ────────────────────────────────────────────────────────────────

function toTitleCase(str) {
  const lower = new Set(['a','an','and','as','at','but','by','for','in',
                         'nor','of','on','or','so','the','to','up','yet','with']);
  return str
    .toLowerCase()
    .replace(/[^\s]+/g, (word, offset) => {
      const bare = word.replace(/[^a-z]/g, '');
      if (offset > 0 && lower.has(bare)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

// McCance cells: "2.9", "Tr" (trace≈0), "N" (not measured)
function parseMcCanceVal(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s === '' || s === 'N' || s === 'N/A' || s === '-') return null;
  if (s === 'Tr') return 0; // trace — will fail the >0 filter
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function round1(n) { return Math.round(n * 10) / 10; }

// Returns null if any value is <= 0 after rounding, or kcal > 900 (kJ mixup guard)
function makeEntry(name, kcal, carbs, protein, fat) {
  const r = {
    food: toTitleCase(name.trim()),
    'Caloric Value': round1(kcal),
    Carbohydrates: round1(carbs),
    Protein: round1(protein),
    Fat: round1(fat),
  };
  if (r['Caloric Value'] <= 0 || r['Caloric Value'] > 900) return null;
  if (r.Carbohydrates <= 0 || r.Protein <= 0 || r.Fat <= 0) return null;
  return r;
}

// ── 1. McCance & Widdowson ─────────────────────────────────────────────────

function parseMcCance() {
  const path = join(ROOT, 'McCance_Widdowsons_Composition_of_Foods_Integrated_Dataset_2021..xlsx');
  const wb = XLSX.readFile(path);
  const ws = wb.Sheets['1.3 Proximates'];
  // header row 0, abbrevs row 1, full names row 2 → data from row 3
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const results = [];
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    const name = typeof row[1] === 'string' ? row[1].trim() : null;
    if (!name) continue;

    const kcal    = parseMcCanceVal(row[12]); // Energy (kcal)
    const carbs   = parseMcCanceVal(row[11]); // Carbohydrate (g)
    const protein = parseMcCanceVal(row[9]);  // Protein (g)
    const fat     = parseMcCanceVal(row[10]); // Fat (g)

    if (!kcal    || kcal    <= 0) continue;
    if (carbs   === null || carbs   <= 0) continue;
    if (protein === null || protein <= 0) continue;
    if (fat     === null || fat     <= 0) continue;

    const entry = makeEntry(name, kcal, carbs, protein, fat);
    if (entry) results.push(entry);
  }

  console.log(`McCance & Widdowson: ${results.length} valid entries`);
  return results;
}

// ── 2. Open Food Facts ─────────────────────────────────────────────────────

const OFF_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';
const PAGE_SIZE = 100; // API maximum
const UA = 'FitnessTrackerApp/1.0 (c.cassinjunior@gmail.com)';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(countryTag, page) {
  const url = new URL(OFF_BASE);
  url.searchParams.set('action', 'process');
  url.searchParams.set('tagtype_0', 'countries');
  url.searchParams.set('tag_contains_0', 'contains');
  url.searchParams.set('tag_0', countryTag);
  url.searchParams.set('fields', 'product_name,nutriments');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', String(PAGE_SIZE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sort_by', 'unique_scans_n'); // popular/quality-checked first

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const resp = await fetch(url.toString(), {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(30_000),
      });
      if (resp.ok) return await resp.json();
      // 503 → back off and retry
      const wait = 3000 * attempt;
      process.stdout.write(` [${resp.status}, retry ${attempt} in ${wait/1000}s]`);
      await sleep(wait);
    } catch (err) {
      const wait = 2000 * attempt;
      process.stdout.write(` [${err.message}, retry ${attempt} in ${wait/1000}s]`);
      await sleep(wait);
    }
  }
  return null;
}

async function fetchCountry(countryTag, targetCount) {
  const results = [];
  // API max is page_count=100 regardless of total; cap pages to what we need
  const maxPages = Math.min(100, Math.ceil(targetCount / PAGE_SIZE));

  for (let page = 1; page <= maxPages; page++) {
    if (results.length >= targetCount) break;

    process.stdout.write(`  ${countryTag} page ${page}/${maxPages}…`);
    const data = await fetchPage(countryTag, page);

    if (!data) { console.log(' skipped'); continue; }

    const products = data.products ?? [];
    if (products.length === 0) { console.log(' no more products'); break; }

    let added = 0;
    for (const p of products) {
      if (results.length >= targetCount) break;

      const name = p.product_name?.trim();
      if (!name) continue;

      const n = p.nutriments ?? {};
      const kcal    = n['energy-kcal_100g'];
      const carbs   = n['carbohydrates_100g'];
      const protein = n['proteins_100g'];
      const fat     = n['fat_100g'];

      if (typeof kcal    !== 'number' || kcal    <= 0) continue;
      if (typeof carbs   !== 'number' || carbs   <= 0) continue;
      if (typeof protein !== 'number' || protein <= 0) continue;
      if (typeof fat     !== 'number' || fat     <= 0) continue;

      const entry = makeEntry(name, kcal, carbs, protein, fat);
      if (!entry) continue;
      results.push(entry);
      added++;
    }

    console.log(` ${products.length} products → kept ${added} (total: ${results.length})`);

    if (page < maxPages && results.length < targetCount) await sleep(1200);
  }

  console.log(`  → ${countryTag} final: ${results.length} valid entries\n`);
  return results;
}

// ── 3. Combine & deduplicate ───────────────────────────────────────────────

function combineAndDedupe(datasets) {
  const seen = new Set();
  const output = [];
  for (const entries of datasets) {
    for (const item of entries) {
      const key = item.food.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        output.push(item);
      }
    }
  }
  return output;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Building food-data.json ===\n');

  console.log('1. Parsing McCance & Widdowson Excel…');
  const mcCance = parseMcCance();

  console.log('\n2. Fetching Open Food Facts — United Kingdom (target 10,000)…');
  const uk = await fetchCountry('en:united-kingdom', 10_000);

  console.log('\n3. Fetching Open Food Facts — Portugal (target 2,000)…');
  const pt = await fetchCountry('en:portugal', 2_000);

  console.log('\n4. Fetching Open Food Facts — Switzerland (target 1,000)…');
  const ch = await fetchCountry('en:switzerland', 1_000);

  console.log('\n5. Combining and deduplicating…');
  // McCance first → its entries win on name collision
  const combined = combineAndDedupe([mcCance, uk, pt, ch]);

  console.log(`   McCance:     ${mcCance.length}`);
  console.log(`   UK:          ${uk.length}`);
  console.log(`   Portugal:    ${pt.length}`);
  console.log(`   Switzerland: ${ch.length}`);
  console.log(`   Raw total:   ${mcCance.length + uk.length + pt.length + ch.length}`);
  console.log(`   After dedup: ${combined.length}`);

  writeFileSync(join(ROOT, 'food-data.json'), JSON.stringify(combined, null, 2), 'utf8');
  console.log('\nDone — food-data.json written.');
}

main().catch(err => { console.error(err); process.exit(1); });
