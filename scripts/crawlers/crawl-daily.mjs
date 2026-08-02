#!/usr/bin/env node
/**
 * crawl-daily.mjs
 * Daily crawler for TuyenSinh247 — university admission benchmark scores.
 *
 * Usage:
 *   node scripts/crawlers/crawl-daily.mjs
 *
 * Output:
 *   src/data/tuyensinh247_school_benchmarks.json
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

const OUTPUT_FILE = path.join(ROOT, 'src/data/tuyensinh247_school_benchmarks.json');
const LIST_URL    = 'https://diemthi.tuyensinh247.com/diem-chuan.html';
const CONCURRENCY = 5;
const DELAY_MS    = 800;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; HuongNghiepVN-Crawler/1.0; +https://huongnghiep.vn)',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      return data;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`    Retry ${i + 1}/${retries} for ${url}`);
      await sleep(2000 * (i + 1));
    }
  }
}

async function crawl() {
  console.log('🚀 HướngNghiệp VN — TuyenSinh247 Daily Crawler');
  console.log('─'.repeat(60));

  // ── Step 1: Fetch school list ──────────────────────────────
  console.log('\n📋 Fetching school list from TuyenSinh247...');
  const listHtml = await fetchHtml(LIST_URL);
  const $ = cheerio.load(listHtml);

  const seen = new Set();
  const schools = [];

  $('a[href*="/diem-chuan/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const name = $(el).text().trim();
    if (!href || !name || name.length < 3) return;

    const fullUrl    = href.startsWith('http') ? href : `https://diemthi.tuyensinh247.com${href}`;
    const slugMatch  = href.match(/\/diem-chuan\/([^.]+)\.html/);
    const slug       = slugMatch?.[1] || '';
    const codeMatch  = slug.match(/-([A-Z0-9]{2,6})$/);
    const code       = codeMatch?.[1] || '';

    if (slug && !seen.has(slug)) {
      seen.add(slug);
      schools.push({ name, code, slug, detailUrl: fullUrl });
    }
  });

  console.log(`   ✅ Found ${schools.length} schools`);

  // ── Step 2: Crawl each school page ────────────────────────
  console.log('\n📚 Crawling benchmark scores...');
  const results = [];

  for (let i = 0; i < schools.length; i += CONCURRENCY) {
    const chunk = schools.slice(i, i + CONCURRENCY);

    const promises = chunk.map(async (school, idx) => {
      const pos = i + idx + 1;
      try {
        const html = await fetchHtml(school.detailUrl);
        const $s   = cheerio.load(html);
        const majors = [];

        $s('table tbody tr').each((_, tr) => {
          const tds = $s(tr).find('td');
          if (tds.length < 3) return;

          const majorName = $s(tds[0]).text().trim();
          const blocksRaw = $s(tds[1]).text().trim();
          const scoreStr  = $s(tds[2]).text().trim();
          const noteStr   = tds.length >= 4 ? $s(tds[3]).text().trim() : '';

          if (!majorName || majorName.length <= 2 || majorName.includes('STT')) return;

          const blocks = blocksRaw
            .split(/[,;\\/\s]+/)
            .map((b) => b.trim())
            .filter((b) => /^[A-Z]\d{2}$/.test(b));

          majors.push({ majorName, blocks, score: scoreStr, note: noteStr });
        });

        console.log(`   [${pos}/${schools.length}] ✅ ${school.code || '???'} — ${majors.length} majors`);
        return { ...school, majorsCount: majors.length, majors };
      } catch (e) {
        console.warn(`   [${pos}/${schools.length}] ⚠️  ${school.name}: ${e.message}`);
        return { ...school, majorsCount: 0, majors: [] };
      }
    });

    results.push(...(await Promise.all(promises)));
    if (i + CONCURRENCY < schools.length) await sleep(DELAY_MS);
  }

  // ── Step 3: Save output ────────────────────────────────────
  const totalMajors = results.reduce((s, r) => s + r.majorsCount, 0);
  const output = {
    source: LIST_URL,
    crawledAt: new Date().toISOString(),
    totalSchoolsCount: results.length,
    schools: results,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '─'.repeat(60));
  console.log(`🎉 Done! ${results.length} schools · ${totalMajors.toLocaleString()} majors`);
  console.log(`   Saved to: ${OUTPUT_FILE}`);
  console.log(`   Crawled at: ${output.crawledAt}`);
}

crawl().catch((e) => {
  console.error('❌ Crawler failed:', e.message);
  process.exit(1);
});
