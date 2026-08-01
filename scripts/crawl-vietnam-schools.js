/**
 * crawl-vietnam-schools.js (v2 — Real Internet Crawler)
 * 
 * Multi-source crawler pipeline for Vietnamese university data.
 * 
 * Sources:
 *   1. GitHub: HTNam1710/ADS_Final (real school list + coordinates, CC open data)
 *   2. Wikipedia: vi.wikipedia.org (school classification by ministry/type)
 * 
 * Run: node scripts/crawl-vietnam-schools.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchSchoolsFromGitHub } from './crawlers/crawler-github.js';
import { fetchSchoolsFromWikipedia } from './crawlers/crawler-wikipedia.js';
import { mergeSchoolData } from './utils/data-merger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delay helper for polite crawling
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runCrawlerPipeline() {
  console.log('🚀 Vietnam Schools Real Internet Crawler Pipeline v2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Sources: GitHub (HTNam1710/ADS_Final) + Wikipedia VI');
  console.log('');

  const results = { github: [], wikipedia: [], merged: [] };
  const errors = [];

  // ── Source 1: GitHub Open Data ──────────────────────────────────────────────
  try {
    results.github = await fetchSchoolsFromGitHub();
  } catch (err) {
    console.error(`❌ GitHub crawler failed: ${err.message}`);
    errors.push({ source: 'github', error: err.message });
  }

  // Polite delay between sources
  await delay(1500);

  // ── Source 2: Wikipedia ──────────────────────────────────────────────────────
  try {
    results.wikipedia = await fetchSchoolsFromWikipedia();
  } catch (err) {
    console.error(`❌ Wikipedia crawler failed: ${err.message}`);
    errors.push({ source: 'wikipedia', error: err.message });
  }

  // ── Merge All Sources ────────────────────────────────────────────────────────
  if (results.github.length > 0 || results.wikipedia.length > 0) {
    results.merged = mergeSchoolData(results.github, results.wikipedia);
  } else {
    console.error('\n⚠️  All crawlers failed! No data to save.');
    process.exit(1);
  }

  // ── Save Output ──────────────────────────────────────────────────────────────
  const targetDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Clean output: remove internal metadata fields
  const cleanOutput = results.merged.map(({ _source, wikiUrl, lat, lng, ...school }) => ({
    ...school,
    // Keep lat/lng for potential map features
    ...(lat && lng ? { lat, lng } : {}),
  }));

  const outputPath = path.join(targetDir, 'vietnamSchools.json');
  fs.writeFileSync(outputPath, JSON.stringify(cleanOutput, null, 2), 'utf-8');

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CRAWLER PIPELINE SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  GitHub Schools:    ${results.github.length} records`);
  console.log(`  Wikipedia Schools: ${results.wikipedia.length} records`);
  console.log(`  Final Merged:      ${cleanOutput.length} unique schools`);

  const byRegion = cleanOutput.reduce((acc, s) => {
    acc[s.regionLabel || s.region] = (acc[s.regionLabel || s.region] || 0) + 1;
    return acc;
  }, {});
  console.log('\n  By Region:');
  Object.entries(byRegion).forEach(([r, c]) => console.log(`    ${r}: ${c}`));

  const byType = cleanOutput.reduce((acc, s) => {
    acc[s.typeLabel || s.type] = (acc[s.typeLabel || s.type] || 0) + 1;
    return acc;
  }, {});
  console.log('\n  By Type:');
  Object.entries(byType).slice(0, 8).forEach(([t, c]) => console.log(`    ${t}: ${c}`));

  if (errors.length > 0) {
    console.log(`\n  ⚠️  Errors: ${errors.map(e => e.source).join(', ')}`);
  }

  console.log(`\n✅ Saved to: ${outputPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runCrawlerPipeline().catch(err => {
  console.error('Fatal crawler error:', err);
  process.exit(1);
});
