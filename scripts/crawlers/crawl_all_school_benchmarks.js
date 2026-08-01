/**
 * crawl_all_school_benchmarks.js
 * Batch crawls admission benchmark scores for ALL universities & colleges from Tuyensinh247.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

async function crawlAllSchoolBenchmarks() {
  const schoolListFile = path.join(process.cwd(), 'src/data/tuyensinh247_diemchuan_schools.json');

  if (!fs.existsSync(schoolListFile)) {
    console.error('❌ tuyensinh247_diemchuan_schools.json not found!');
    return;
  }

  const { schools } = JSON.parse(fs.readFileSync(schoolListFile, 'utf-8'));
  console.log(`🚀 Batch crawling benchmark scores for ALL ${schools.length} schools from Tuyensinh247...`);

  const benchmarkResults = [];
  const CONCURRENCY = 6;

  async function fetchSchoolData(school, index) {
    try {
      const { data: html } = await axios.get(school.detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 12000,
      });

      const $ = cheerio.load(html);
      const majors = [];

      $('table tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 3) {
          const majorName = $(tds[0]).text().trim();
          const blocksStr = $(tds[1]).text().trim();
          const scoreStr = $(tds[2]).text().trim();
          const noteStr = tds.length >= 4 ? $(tds[3]).text().trim() : '';

          if (majorName && majorName.length > 2 && !majorName.includes('STT')) {
            majors.push({
              majorName,
              blocks: blocksStr.split(/[,;\/]+/).map(b => b.trim()).filter(Boolean),
              score: scoreStr,
              note: noteStr,
            });
          }
        }
      });

      console.log(`[${index + 1}/${schools.length}] ✅ ${school.code} - ${school.name}: ${majors.length} majors`);
      return {
        code: school.code,
        name: school.name,
        slug: school.slug,
        detailUrl: school.detailUrl,
        majorsCount: majors.length,
        majors,
      };
    } catch (e) {
      console.warn(`[${index + 1}/${schools.length}] ⚠️ Failed to fetch ${school.code} - ${school.name}: ${e.message}`);
      return {
        code: school.code,
        name: school.name,
        slug: school.slug,
        detailUrl: school.detailUrl,
        majorsCount: 0,
        majors: [],
      };
    }
  }

  // Process in concurrent batches
  for (let i = 0; i < schools.length; i += CONCURRENCY) {
    const chunk = schools.slice(i, i + CONCURRENCY);
    const promises = chunk.map((school, idx) => fetchSchoolData(school, i + idx));
    const results = await Promise.all(promises);
    benchmarkResults.push(...results);
    // Small delay between batches to be polite
    await new Promise(r => setTimeout(r, 100));
  }

  const output = {
    source: 'https://diemthi.tuyensinh247.com/diem-chuan.html',
    crawledAt: new Date().toISOString(),
    totalSchoolsCount: benchmarkResults.length,
    schools: benchmarkResults,
  };

  const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247_school_benchmarks.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  const totalMajors = benchmarkResults.reduce((acc, s) => acc + s.majorsCount, 0);
  console.log(`\n🎉 SUCCESS! Crawled ${benchmarkResults.length} schools with ${totalMajors} total majors! Saved to: ${outputPath}`);
}

crawlAllSchoolBenchmarks();
