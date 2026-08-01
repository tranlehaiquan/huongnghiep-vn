/**
 * crawler-tuyensinh247-full.js
 * Crawls and extracts all major fields (Ngành & Nhóm ngành đào tạo) from diemthi.tuyensinh247.com payload.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://diemthi.tuyensinh247.com/nganh-dao-tao.html';

export async function crawlTuyensinh247Majors() {
  console.log(`🚀 Crawling Tuyensinh247 Major Dataset from ${TARGET_URL}...`);

  const { data: html } = await axios.get(TARGET_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9',
    },
    timeout: 15000,
  });

  const extractedCategories = [];
  const regex = /"id":(\d+),"name":"([^"]+)","slug":"([^"]+)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const [_, id, name, slug] = match;
    // Decode unicode escape sequences if any
    const decodedName = name.replace(/\\u[\dA-F]{4}/gi, (match) =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
    );
    extractedCategories.push({ id: +id, name: decodedName, slug });
  }

  // Also regex match all major titles / codes
  const majorRegex = /"major_code":"([^"]+)","major_name":"([^"]+)"/g;
  const extractedMajors = [];
  while ((match = majorRegex.exec(html)) !== null) {
    const [_, code, name] = match;
    const decodedName = name.replace(/\\u[\dA-F]{4}/gi, (match) =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
    );
    extractedMajors.push({ code, name: decodedName });
  }

  // Fallback: search for strings in flight payload
  const stringMatches = html.match(/"title":"([^"]+)","url":"([^"]+)"/g) || [];

  console.log(`✅ Extracted ${extractedCategories.length} categories, ${extractedMajors.length} specific majors.`);

  const result = {
    sourceUrl: TARGET_URL,
    crawledAt: new Date().toISOString(),
    categoriesCount: extractedCategories.length,
    majorsCount: extractedMajors.length,
    categories: extractedCategories,
    majors: extractedMajors,
    rawPayloadMatches: stringMatches.slice(0, 20),
  };

  const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247_majors.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`💾 Saved crawled dataset to: ${outputPath}`);

  return result;
}

crawlTuyensinh247Majors();
