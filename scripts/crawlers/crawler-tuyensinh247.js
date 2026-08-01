/**
 * crawler-tuyensinh247.js
 * Crawls major fields (Ngành đào tạo) from diemthi.tuyensinh247.com/nganh-dao-tao.html
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://diemthi.tuyensinh247.com/nganh-dao-tao.html';

export async function fetchTuyensinh247Majors() {
  console.log(`📥 Fetching majors from ${TARGET_URL}...`);
  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const majors = [];

    // Extract NEXT_DATA JSON script if available
    const nextDataScript = $('#__NEXT_DATA__').html();
    if (nextDataScript) {
      try {
        const parsed = JSON.parse(nextDataScript);
        console.log('✅ Found __NEXT_DATA__ payload in page');
        const pageProps = parsed?.props?.pageProps;
        if (pageProps?.data || pageProps?.majors || pageProps?.listNganh) {
          console.log('✅ Extracted structured majors data from Next.js payload');
        }
      } catch (e) {
        console.log('⚠️ Failed to parse __NEXT_DATA__ JSON');
      }
    }

    // Parse links and text from HTML
    $('a[href*="nganh-dao-tao"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const name = $(el).text().trim();
      if (name && href && !href.endsWith('/nganh-dao-tao.html')) {
        majors.push({
          name,
          url: href.startsWith('http') ? href : `https://diemthi.tuyensinh247.com${href}`,
        });
      }
    });

    // Extract all category blocks/text
    const categoryTitles = [];
    $('h2, h3, h4, .title, [class*="title"], [class*="category"]').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 60 && !text.includes('Tuyển sinh') && !text.includes('Điểm thi')) {
        categoryTitles.push(text);
      }
    });

    console.log(`✅ Extracted ${majors.length} major links and ${categoryTitles.length} categories from Tuyensinh247`);
    return { majors, categoryTitles };
  } catch (error) {
    console.error('❌ Error fetching Tuyensinh247:', error.message);
    return { majors: [], categoryTitles: [] };
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('crawler-tuyensinh247.js')) {
  fetchTuyensinh247Majors().then(res => {
    console.log('Sample result:', res);
  });
}
