import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function fetchDiemChuanPayload() {
  console.log('📥 Fetching https://diemthi.tuyensinh247.com/diem-chuan.html...');
  const { data: html } = await axios.get('https://diemthi.tuyensinh247.com/diem-chuan.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  console.log('HTML byte size:', html.length);
  fs.writeFileSync('scripts/diemchuan_flight_data.js', html, 'utf-8');

  // Check if schools or diemchuan payload exist in HTML
  if (html.includes('universities') || html.includes('schools') || html.includes('diemchuan') || html.includes('Bách Khoa')) {
    console.log('✅ Found school & benchmark keywords in page source!');
  }
}

fetchDiemChuanPayload();
