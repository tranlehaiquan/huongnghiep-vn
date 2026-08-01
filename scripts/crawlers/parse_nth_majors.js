import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function parseNthPage() {
  const url = 'https://diemthi.tuyensinh247.com/thong-tin-dai-hoc-ngoai-thuong-co-so-phia-bac-NTH.html';
  console.log(`📥 Fetching ${url}...`);

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  const $ = cheerio.load(html);
  const majors = [];

  // Look for Next.js flight data or HTML table/cards with majors
  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 2) {
      const code = $(tds[0]).text().trim();
      const name = $(tds[1]).text().trim();
      const blocks = tds.length >= 3 ? $(tds[2]).text().trim() : '';
      if (name && (code || blocks)) {
        majors.push({ code, name, blocks });
      }
    }
  });

  // Also search for Next.js flight script payload containing majors
  $('script').each((i, el) => {
    const content = $(el).html() || '';
    if (content.includes('majors') || content.includes('nganh') || content.includes('Kinh tế quốc tế')) {
      // search for json objects
      const unescaped = content.replace(/\\"/g, '"');
      const matches = unescaped.match(/"major_name":"([^"]+)"/g) || unescaped.match(/"name":"([^"]+)"/g);
      if (matches) {
        console.log(`Found script tag #${i} with ${matches.length} major matches`);
      }
    }
  });

  console.log(`✅ Extracted ${majors.length} majors from HTML table for NTH!`);
  console.log('Sample majors:', majors);
}

parseNthPage();
