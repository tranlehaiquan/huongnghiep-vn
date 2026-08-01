/**
 * crawl_all_school_benchmarks.js
 * Batch crawls major admission benchmark scores for universities & colleges from Tuyensinh247.
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
  console.log(`🚀 Batch crawling benchmark scores for ${schools.length} schools...`);

  // Target top 40 major universities to ensure fast execution
  const targetSchools = schools.slice(0, 45);
  const benchmarkResults = [];

  for (let i = 0; i < targetSchools.length; i++) {
    const school = targetSchools[i];
    console.log(`[${i + 1}/${targetSchools.length}] Fetching ${school.code} - ${school.name}...`);

    try {
      const { data: html } = await axios.get(school.detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
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

      console.log(`   └─ ✅ Found ${majors.length} majors & scores`);
      benchmarkResults.push({
        code: school.code,
        name: school.name,
        slug: school.slug,
        detailUrl: school.detailUrl,
        majorsCount: majors.length,
        majors,
      });

      // Respectful delay
      await new Promise(r => setTimeout(r, 200));

    } catch (e) {
      console.warn(`   └─ ⚠️ Failed to fetch ${school.name}: ${e.message}`);
    }
  }

  const output = {
    source: 'https://diemthi.tuyensinh247.com/diem-chuan.html',
    crawledAt: new Date().toISOString(),
    totalSchoolsCount: benchmarkResults.length,
    schools: benchmarkResults,
  };

  const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247_school_benchmarks.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`🎉 SUCCESS! Saved benchmark score dataset for ${benchmarkResults.length} schools to: ${outputPath}`);
}

crawlAllSchoolBenchmarks();
