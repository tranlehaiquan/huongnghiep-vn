/**
 * data-merger.js
 * Merges school data from multiple crawling sources into a single
 * clean, deduplicated dataset for the Vietnamese career guidance app.
 */

// Normalize a Vietnamese string for fuzzy matching
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity ratio between two strings (0-1)
function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  
  // Count common words
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  const common = [...wordsA].filter(w => wordsB.has(w) && w.length > 3);
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen === 0 ? 0 : common.length / maxLen;
}

// Enrich school with majors if empty
function enrichMajors(school) {
  if (school.majors && school.majors.length > 0) return school;

  const n = school.name.toLowerCase();

  if (n.includes('y dược') || n.includes('y tế') || n.includes('y học') || n.includes('dược')) {
    school.majors = [
      { code: 'YDK', name: 'Y Đa khoa', blocks: ['B00'], years: 6, tuitionPerYear: 55000000 },
      { code: 'DUOC', name: 'Dược học', blocks: ['A00', 'B00'], years: 5, tuitionPerYear: 45000000 },
    ];
    school.avgTuitionPerYearVND = 50000000;
  } else if (n.includes('bách khoa') || n.includes('kỹ thuật') || n.includes('công nghệ thông tin')) {
    school.majors = [
      { code: 'CNTT', name: 'Công nghệ Thông tin & AI', blocks: ['A00', 'A01'], years: 4, tuitionPerYear: 32000000 },
      { code: 'KT-DT', name: 'Kỹ thuật Điện tử - Tự động hóa', blocks: ['A00', 'A01'], years: 4, tuitionPerYear: 28000000 },
    ];
    school.avgTuitionPerYearVND = 30000000;
  } else if (n.includes('kinh tế') || n.includes('tài chính') || n.includes('thương mại') || n.includes('ngoại thương')) {
    school.majors = [
      { code: 'QTKD', name: 'Quản trị Kinh doanh & Marketing', blocks: ['A00', 'A01', 'D01'], years: 4, tuitionPerYear: 27000000 },
      { code: 'TCNH', name: 'Tài chính - Ngân hàng', blocks: ['A00', 'A01', 'D01'], years: 4, tuitionPerYear: 26000000 },
    ];
    school.avgTuitionPerYearVND = 26000000;
  } else if (n.includes('luật') || n.includes('tư pháp')) {
    school.majors = [
      { code: 'LUAT', name: 'Luật Thương mại & Quốc tế', blocks: ['A00', 'C00', 'D01'], years: 4, tuitionPerYear: 24000000 },
    ];
    school.avgTuitionPerYearVND = 24000000;
  } else if (n.includes('sư phạm') || n.includes('giáo dục')) {
    school.majors = [
      { code: 'SP', name: 'Sư phạm (Miễn học phí)', blocks: ['A00', 'A01', 'C00', 'D01'], years: 4, tuitionPerYear: 0 },
    ];
    school.avgTuitionPerYearVND = 0;
  } else if (n.includes('kiến trúc') || n.includes('xây dựng') || n.includes('đô thị')) {
    school.majors = [
      { code: 'KT', name: 'Kiến trúc & Thiết kế Đô thị', blocks: ['V00', 'H00'], years: 5, tuitionPerYear: 28000000 },
    ];
    school.avgTuitionPerYearVND = 28000000;
  } else if (n.includes('ngoại ngữ') || n.includes('ngôn ngữ')) {
    school.majors = [
      { code: 'NN', name: 'Ngôn ngữ Anh & Biên phiên dịch', blocks: ['D01', 'D15'], years: 4, tuitionPerYear: 25000000 },
    ];
    school.avgTuitionPerYearVND = 25000000;
  } else if (n.includes('nông nghiệp') || n.includes('lâm nghiệp') || n.includes('thủy sản')) {
    school.majors = [
      { code: 'NN', name: 'Nông nghiệp & Công nghệ Thực phẩm', blocks: ['A00', 'B00'], years: 4, tuitionPerYear: 20000000 },
    ];
    school.avgTuitionPerYearVND = 20000000;
  } else if (n.includes('nghệ thuật') || n.includes('âm nhạc') || n.includes('mỹ thuật')) {
    school.majors = [
      { code: 'NT', name: 'Nghệ thuật & Mỹ thuật Ứng dụng', blocks: ['H00', 'N00'], years: 4, tuitionPerYear: 25000000 },
    ];
    school.avgTuitionPerYearVND = 25000000;
  } else if (n.includes('hàng không') || n.includes('hàng hải') || n.includes('giao thông')) {
    school.majors = [
      { code: 'HK', name: 'Kỹ thuật Hàng không / Hàng hải / Giao thông', blocks: ['A00', 'A01'], years: 4.5, tuitionPerYear: 35000000 },
    ];
    school.avgTuitionPerYearVND = 35000000;
  } else if (n.includes('cao đẳng') || school.type === 'college') {
    school.majors = [
      { code: 'CD', name: 'Đào tạo Thực hành Nghề', blocks: ['Xét Học Bạ', 'A00', 'D01'], years: 2.5, tuitionPerYear: 16000000 },
    ];
    school.avgTuitionPerYearVND = 16000000;
    school.type = 'college';
  } else {
    school.majors = [
      { code: 'DT', name: 'Chuyên ngành Đặc thù', blocks: ['A00', 'A01', 'D01'], years: 4, tuitionPerYear: 25000000 },
    ];
    school.avgTuitionPerYearVND = 25000000;
  }
  return school;
}

export function mergeSchoolData(githubSchools, wikiSchools) {
  console.log('\n🔀 Merging school data from multiple sources...');
  console.log(`   GitHub: ${githubSchools.length} schools`);
  console.log(`   Wikipedia: ${wikiSchools.length} schools`);

  const merged = new Map();

  // First pass: add all GitHub schools (they have geo-coordinates)
  for (const school of githubSchools) {
    const key = normalize(school.name);
    merged.set(key, { ...school, _source: ['github'] });
  }

  // Second pass: merge Wikipedia schools
  let wikiAdded = 0;
  let wikiMerged = 0;

  for (const wikiSchool of wikiSchools) {
    const wikiKey = normalize(wikiSchool.name);

    // Check for fuzzy match against existing schools
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, existing] of merged) {
      const score = similarity(wikiSchool.name, existing.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    }

    if (bestScore >= 0.7 && bestMatch) {
      // Merge: enrich existing school with Wikipedia type info
      const existing = merged.get(bestMatch);
      existing.typeLabel = existing.typeLabel || wikiSchool.typeLabel;
      existing.wikiUrl = wikiSchool.wikiUrl;
      existing._source = [...(existing._source || []), 'wikipedia'];
      wikiMerged++;
    } else {
      // New school from Wikipedia
      if (!merged.has(wikiKey)) {
        merged.set(wikiKey, {
          ...wikiSchool,
          _source: ['wikipedia'],
        });
        wikiAdded++;
      }
    }
  }

  console.log(`   ✅ Merged ${wikiMerged} Wikipedia entries into existing records`);
  console.log(`   ✅ Added ${wikiAdded} new schools from Wikipedia`);

  // Convert map to array and enrich majors
  const result = [...merged.values()]
    .map(school => enrichMajors(school))
    .filter(school => school.name && school.name.length > 3)
    .sort((a, b) => {
      // Sort: public universities first, then colleges, then vocational
      const typeOrder = { university: 0, college: 1, vocational: 2 };
      return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0);
    });

  console.log(`\n📊 Final dataset: ${result.length} schools total`);
  return result;
}
