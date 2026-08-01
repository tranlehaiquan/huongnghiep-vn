import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function inspectPage() {
  const { data: html } = await axios.get('https://diemthi.tuyensinh247.com/nganh-dao-tao.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  console.log('HTML length:', html.length);
  
  const $ = cheerio.load(html);
  
  $('script').each((i, el) => {
    const content = $(el).html() || '';
    if (content.includes('self.__next_f.push')) {
      if (content.includes('ketoan') || content.includes('cntt') || content.includes('bandan') || content.includes('yduoc') || content.includes('kinhte')) {
        console.log(`Found keywords in self.__next_f.push script tag #${i}, length:`, content.length);
        fs.appendFileSync('scripts/next_flight_data.js', content + '\n\n');
      }
    }
  });

  const icons = [];
  $('link[rel="preload"][as="image"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) icons.push(href);
  });
  console.log('Preloaded icon images:', icons);
}

inspectPage();
