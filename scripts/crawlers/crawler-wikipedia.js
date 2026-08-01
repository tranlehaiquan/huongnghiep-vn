/**
 * crawler-wikipedia.js (v2)
 * Correctly parses the Wikipedia table structure for Vietnamese universities.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const WIKI_URL = 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_tr%C6%B0%E1%BB%9Dng_%C4%91%E1%BA%A1i_h%E1%BB%8Dc%2C_h%E1%BB%8Dc_vi%E1%BB%87n_v%C3%A0_cao_%C4%91%E1%BA%B3ng_t%E1%BA%A1i_Vi%E1%BB%87t_Nam';

function inferRegionFromName(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('hà nội') || n.includes('ha noi') || n.includes('thái nguyên') ||
      n.includes('hải phòng') || n.includes('tây bắc') || n.includes('hải dương') ||
      n.includes('bắc giang') || n.includes('hà tĩnh') || n.includes('bắc ninh') ||
      n.includes('nam định') || n.includes('thái bình') || n.includes('hưng yên') ||
      n.includes('ninh bình') || n.includes('phú thọ') || n.includes('lạng sơn') ||
      n.includes('vinh') || n.includes('nghệ an')) {
    return { region: 'North', regionLabel: 'Miền Bắc' };
  }
  if (n.includes('tphcm') || n.includes('hồ chí minh') || n.includes('sài gòn') ||
      n.includes('đồng nai') || n.includes('bình dương') || n.includes('cần thơ') ||
      n.includes('an giang') || n.includes('vũng tàu') || n.includes('phía nam') ||
      n.includes('đà lạt') || n.includes('lâm đồng') || n.includes('kiên giang')) {
    return { region: 'South', regionLabel: 'Miền Nam' };
  }
  if (n.includes('đà nẵng') || n.includes('da nang') || n.includes('huế') || n.includes('hue') ||
      n.includes('quảng') || n.includes('bình định') || n.includes('quy nhơn') ||
      n.includes('khánh hòa') || n.includes('nha trang') || n.includes('phú yên')) {
    return { region: 'Central', regionLabel: 'Miền Trung' };
  }
  return { region: 'North', regionLabel: 'Miền Bắc' };
}

function inferProvinceFromName(name) {
  const n = name || '';
  if (n.includes('Hà Nội') || n.includes('Ha Noi')) return 'Hà Nội';
  if (n.includes('TPHCM') || n.includes('Hồ Chí Minh') || n.includes('Sài Gòn')) return 'TP. Hồ Chí Minh';
  if (n.includes('Đà Nẵng')) return 'Đà Nẵng';
  if (n.includes('Huế')) return 'Thừa Thiên Huế';
  if (n.includes('Cần Thơ')) return 'Cần Thơ';
  if (n.includes('Hải Phòng')) return 'Hải Phòng';
  if (n.includes('Thái Nguyên')) return 'Thái Nguyên';
  if (n.includes('Vinh') || n.includes('Nghệ An')) return 'Nghệ An';
  if (n.includes('Đồng Nai')) return 'Đồng Nai';
  if (n.includes('Tây Bắc')) return 'Sơn La';
  if (n.includes('Thái Bình')) return 'Thái Bình';
  if (n.includes('Quy Nhơn') || n.includes('Bình Định')) return 'Bình Định';
  if (n.includes('Khánh Hòa') || n.includes('Nha Trang')) return 'Khánh Hòa';
  if (n.includes('Cần Thơ')) return 'Cần Thơ';
  return 'Việt Nam';
}

function parseSectionTypeLabel(headingText) {
  const t = (headingText || '').toLowerCase();
  if (t.includes('quốc gia')) return 'Đại học Quốc gia';
  if (t.includes('vùng')) return 'Đại học Vùng';
  if (t.includes('tư thục')) return 'Đại học Tư thục';
  if (t.includes('bộ y tế') || t.includes('y dược')) return 'Bộ Y Tế';
  if (t.includes('công thương')) return 'Bộ Công Thương';
  if (t.includes('xây dựng')) return 'Bộ Xây dựng';
  if (t.includes('tài chính') && !t.includes('học viện')) return 'Bộ Tài chính';
  if (t.includes('tư pháp')) return 'Bộ Tư pháp';
  if (t.includes('nông nghiệp')) return 'Bộ Nông nghiệp';
  if (t.includes('ngân hàng nhà nước')) return 'Ngân hàng Nhà nước';
  if (t.includes('giao thông')) return 'Bộ GTVT';
  if (t.includes('văn hóa') || t.includes('du lịch')) return 'Bộ VHTT&DL';
  if (t.includes('lao động')) return 'Tổng Liên đoàn Lao động';
  if (t.includes('cao đẳng')) return 'Cao đẳng';
  if (t.includes('học viện')) return 'Học viện';
  return 'Bộ Giáo dục & Đào tạo';
}

export async function fetchSchoolsFromWikipedia() {
  console.log('📥 Fetching school list from Wikipedia...');

  const { data: html } = await axios.get(WIKI_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (educational-research-tool; non-commercial)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'vi,en;q=0.9',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);
  const schools = [];
  const seenNames = new Set();
  let currentTypeLabel = 'Đại học Công lập';

  // Walk through the main content section by section
  const content = $('#mw-content-text .mw-parser-output');

  content.children().each((_, el) => {
    const tag = (el.tagName || '').toLowerCase();

    // Update context from headings
    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const headingText = $(el).find('.mw-headline').text().trim() || $(el).text().trim();
      if (headingText && !headingText.includes('Tham khảo') && !headingText.includes('Chú thích')) {
        currentTypeLabel = parseSectionTypeLabel(headingText);
      }
      return;
    }

    // Parse tables (wikitable structure)
    if (tag === 'table') {
      $(el).find('tr').each((_, row) => {
        // Skip header rows
        if ($(row).find('th').length > 2) return;

        const cells = $(row).find('td');
        if (cells.length < 1) return;

        // Try to find a school name — usually in a link
        let nameEl = null;
        let name = '';
        let href = '';

        cells.each((_, cell) => {
          const link = $(cell).find('a').first();
          const text = link.text().trim() || $(cell).text().trim();
          if (text.length > 10 &&
              (text.includes('Đại học') || text.includes('Học viện') ||
               text.includes('Cao đẳng') || text.includes('Trường'))) {
            name = text;
            href = link.attr('href') || '';
            nameEl = cell;
          }
        });

        if (!name || seenNames.has(name)) return;
        seenNames.add(name);

        const type = name.toLowerCase().includes('cao đẳng') ? 'college' : 'university';
        const typeLabel = name.toLowerCase().includes('cao đẳng') ? 'Cao đẳng' : currentTypeLabel;
        const regionData = inferRegionFromName(name);
        const province = inferProvinceFromName(name);
        const wikiUrl = href.startsWith('/wiki/') ? `https://vi.wikipedia.org${href}` : '';

        schools.push({
          id: `WIKI_${schools.length + 1}`,
          name: name.replace(/\[.*?\]/g, '').trim(),
          shortName: name.replace(/^(Đại học|Học viện|Trường|Phân hiệu)\s+/i, '').replace(/\[.*?\]/g, '').trim(),
          type,
          typeLabel,
          ...regionData,
          province,
          website: wikiUrl,
          wikiUrl,
          avgTuitionPerYearVND: type === 'college' ? 15000000 : 25000000,
          majors: [],
          source: 'wikipedia',
        });
      });
      return;
    }

    // Parse unordered lists (li items)
    if (tag === 'ul' || tag === 'ol') {
      $(el).find('li').each((_, li) => {
        const link = $(li).find('a').first();
        const text = link.text().trim() || $(li).text().trim();

        if (!text || text.length < 8) return;
        if (!text.includes('Đại học') && !text.includes('Học viện') &&
            !text.includes('Cao đẳng') && !text.includes('Trường')) return;
        if (text.includes('[') && !text.includes('Đại học')) return;
        if (seenNames.has(text)) return;
        seenNames.add(text);

        const href = link.attr('href') || '';
        const type = text.toLowerCase().includes('cao đẳng') ? 'college' : 'university';
        const typeLabel = type === 'college' ? 'Cao đẳng' : currentTypeLabel;
        const regionData = inferRegionFromName(text);
        const province = inferProvinceFromName(text);
        const wikiUrl = href.startsWith('/wiki/') ? `https://vi.wikipedia.org${href}` : '';

        schools.push({
          id: `WIKI_${schools.length + 1}`,
          name: text.replace(/\[.*?\]/g, '').trim(),
          shortName: text.replace(/^(Đại học|Học viện|Trường|Phân hiệu)\s+/i, '').replace(/\[.*?\]/g, '').trim(),
          type,
          typeLabel,
          ...regionData,
          province,
          website: wikiUrl,
          wikiUrl,
          avgTuitionPerYearVND: type === 'college' ? 15000000 : 25000000,
          majors: [],
          source: 'wikipedia',
        });
      });
    }
  });

  // Deduplicate final list
  const unique = schools.filter((s, i, arr) =>
    s.name.length > 5 && arr.findIndex(x => x.name === s.name) === i
  );

  console.log(`✅ Wikipedia: Fetched ${unique.length} unique schools`);
  return unique;
}
