import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testSchoolBenchmarkCrawl() {
  const url = 'https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-bach-khoa-ha-noi-BKA.html';
  console.log(`📥 Crawling sample benchmark scores for ${url}...`);

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  const $ = cheerio.load(html);
  const rows = [];

  // Extract table rows from diem-chuan page
  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 3) {
      const code = $(tds[0]).text().trim();
      const majorName = $(tds[1]).text().trim();
      const blocks = $(tds[2]).text().trim();
      const score = $(tds[3]) ? $(tds[3]).text().trim() : '';
      if (majorName && (code || score)) {
        rows.push({ code, majorName, blocks, score });
      }
    }
  });

  console.log(`✅ Extracted ${rows.length} benchmark score rows for BKA!`);
  console.log('Sample rows:', rows.slice(0, 10));
}

testSchoolBenchmarkCrawl();
