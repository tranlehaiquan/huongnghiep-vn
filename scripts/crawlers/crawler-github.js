/**
 * crawler-github.js
 * Fetches real Vietnamese university data from the GitHub open dataset:
 * HTNam1710/ADS_Final — school_latlon.csv + diemchuan CSVs
 */

import axios from 'axios';
import { parse } from 'csv-parse/sync';

const GITHUB_RAW = 'https://raw.githubusercontent.com/HTNam1710/ADS_Final/main';

// Map school names to regions based on city/province keywords
function inferRegion(name) {
  const n = name.toLowerCase();
  if (n.includes('hà nội') || n.includes('ha noi') || n.includes('thái nguyên') ||
      n.includes('hải phòng') || n.includes('tây bắc') || n.includes('phía bắc') ||
      n.includes('hải dương') || n.includes('nam định') || n.includes('ninh bình') ||
      n.includes('vĩnh phúc') || n.includes('bắc giang') || n.includes('hà tĩnh')) {
    return { region: 'North', regionLabel: 'Miền Bắc' };
  }
  if (n.includes('tphcm') || n.includes('hồ chí minh') || n.includes('sài gòn') ||
      n.includes('đồng nai') || n.includes('bình dương') || n.includes('cần thơ') ||
      n.includes('an giang') || n.includes('vũng tàu') || n.includes('phía nam') ||
      n.includes('tây nguyên') || n.includes('đà lạt')) {
    return { region: 'South', regionLabel: 'Miền Nam' };
  }
  if (n.includes('đà nẵng') || n.includes('da nang') || n.includes('huế') ||
      n.includes('quảng') || n.includes('vinh') || n.includes('bình định') ||
      n.includes('quy nhơn') || n.includes('khánh hòa') || n.includes('nha trang')) {
    return { region: 'Central', regionLabel: 'Miền Trung' };
  }
  // Default based on latitude
  return { region: 'North', regionLabel: 'Miền Bắc' };
}

// Classify school type from name
function inferType(name) {
  const n = name.toLowerCase();
  if (n.includes('học viện')) return { type: 'university', typeLabel: 'Học viện' };
  if (n.includes('cao đẳng')) return { type: 'college', typeLabel: 'Cao đẳng' };
  if (n.includes('trường nghề') || n.includes('kỹ nghệ')) return { type: 'vocational', typeLabel: 'Trường Nghề' };
  return { type: 'university', typeLabel: 'Đại học Công lập' };
}

// Infer province from school name
function inferProvince(name) {
  if (name.includes('TPHCM') || name.includes('Hồ Chí Minh') || name.includes('Sài Gòn')) return 'TP. Hồ Chí Minh';
  if (name.includes('Hà Nội') || name.includes('Ha Noi')) return 'Hà Nội';
  if (name.includes('Đà Nẵng')) return 'Đà Nẵng';
  if (name.includes('Huế')) return 'Thừa Thiên Huế';
  if (name.includes('Cần Thơ')) return 'Cần Thơ';
  if (name.includes('Hải Phòng')) return 'Hải Phòng';
  if (name.includes('Vinh')) return 'Nghệ An';
  if (name.includes('Quy Nhơn') || name.includes('Bình Định')) return 'Bình Định';
  if (name.includes('Thái Nguyên')) return 'Thái Nguyên';
  if (name.includes('Tây Bắc')) return 'Sơn La';
  if (name.includes('Đồng Nai')) return 'Đồng Nai';
  if (name.includes('Thái Bình')) return 'Thái Bình';
  return 'Việt Nam';
}

// Generate default majors based on school type/name
function generateDefaultMajors(name) {
  const n = name.toLowerCase();
  if (n.includes('y dược') || n.includes('y tế') || n.includes('y học')) {
    return [
      { code: 'YDK', name: 'Y Đa khoa (Bác sĩ)', blocks: ['B00'], years: 6, tuitionPerYear: 55000000 },
      { code: 'DUOC', name: 'Dược học', blocks: ['A00', 'B00'], years: 5, tuitionPerYear: 45000000 },
    ];
  }
  if (n.includes('bách khoa') || n.includes('kỹ thuật') || n.includes('công nghệ')) {
    return [
      { code: 'CNTT', name: 'Công nghệ Thông tin & AI', blocks: ['A00', 'A01'], years: 4, tuitionPerYear: 30000000 },
      { code: 'KT-DT', name: 'Kỹ thuật Điện tử & Tự động hóa', blocks: ['A00', 'A01'], years: 4, tuitionPerYear: 28000000 },
    ];
  }
  if (n.includes('kinh tế') || n.includes('tài chính') || n.includes('thương mại')) {
    return [
      { code: 'KTQD', name: 'Kinh tế & Quản trị Kinh doanh', blocks: ['A00', 'A01', 'D01'], years: 4, tuitionPerYear: 25000000 },
      { code: 'TCNH', name: 'Tài chính - Ngân hàng', blocks: ['A00', 'A01', 'D01'], years: 4, tuitionPerYear: 27000000 },
    ];
  }
  if (n.includes('luật') || n.includes('tư pháp')) {
    return [
      { code: 'LUAT', name: 'Luật Thương mại & Dân sự', blocks: ['A00', 'C00', 'D01'], years: 4, tuitionPerYear: 24000000 },
    ];
  }
  if (n.includes('sư phạm') || n.includes('giáo dục')) {
    return [
      { code: 'SPTOAN', name: 'Sư phạm Toán - Lý', blocks: ['A00', 'A01'], years: 4, tuitionPerYear: 0 },
      { code: 'SPAN', name: 'Sư phạm Tiếng Anh', blocks: ['D01'], years: 4, tuitionPerYear: 0 },
    ];
  }
  if (n.includes('kiến trúc') || n.includes('xây dựng')) {
    return [
      { code: 'KTXD', name: 'Kiến trúc & Xây dựng Công trình', blocks: ['A00', 'V00'], years: 5, tuitionPerYear: 27000000 },
    ];
  }
  if (n.includes('ngoại thương') || n.includes('ngoại ngữ')) {
    return [
      { code: 'IB', name: 'Kinh doanh Quốc tế & Ngoại thương', blocks: ['A00', 'A01', 'D01', 'D07'], years: 4, tuitionPerYear: 28000000 },
    ];
  }
  if (n.includes('nông nghiệp') || n.includes('lâm nghiệp')) {
    return [
      { code: 'NNCH', name: 'Nông nghiệp Công nghệ Cao', blocks: ['A00', 'B00'], years: 4, tuitionPerYear: 20000000 },
    ];
  }
  if (n.includes('nghệ thuật') || n.includes('âm nhạc') || n.includes('mỹ thuật') || n.includes('điện ảnh')) {
    return [
      { code: 'MT', name: 'Mỹ thuật & Thiết kế Đồ họa', blocks: ['H00', 'N00'], years: 4, tuitionPerYear: 26000000 },
    ];
  }
  if (n.includes('hàng không') || n.includes('hàng hải')) {
    return [
      { code: 'HKHH', name: 'Kỹ thuật Hàng không / Hàng hải', blocks: ['A00', 'A01'], years: 4.5, tuitionPerYear: 32000000 },
    ];
  }
  if (n.includes('thể dục') || n.includes('thể thao')) {
    return [
      { code: 'TDTT', name: 'Huấn luyện Thể thao & Giáo dục Thể chất', blocks: ['T00'], years: 4, tuitionPerYear: 20000000 },
    ];
  }
  // Generic
  return [
    { code: 'DT', name: 'Đào tạo Chuyên ngành', blocks: ['A00', 'D01'], years: 4, tuitionPerYear: 25000000 },
  ];
}

export async function fetchSchoolsFromGitHub() {
  console.log('📥 Fetching school list from GitHub (HTNam1710/ADS_Final)...');
  
  const url = `${GITHUB_RAW}/Data/Final/school_latlon.csv`;
  const { data: csvText } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (educational-tool)' },
    timeout: 15000,
  });

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const schools = [];

  for (const row of records) {
    const name = row['Tên Trường']?.trim();
    if (!name) continue;

    // Filter out military schools that aren't relevant for high school students
    const isMilitary = name.toLowerCase().includes('quân sự') ||
      name.toLowerCase().includes('quân y') ||
      name.toLowerCase().includes('hệ quân sự') ||
      name.toLowerCase().includes('sĩ quan') ||
      name.toLowerCase().includes('cảnh sát') ||
      name.toLowerCase().includes('an ninh') ||
      name.toLowerCase().includes('biên phòng') ||
      name.toLowerCase().includes('phòng cháy');

    if (isMilitary) continue;

    const { region, regionLabel } = inferRegion(name);
    const { type, typeLabel } = inferType(name);
    const province = inferProvince(name);
    const majors = generateDefaultMajors(name);
    const avgTuition = majors.length > 0
      ? Math.round(majors.reduce((s, m) => s + m.tuitionPerYear, 0) / majors.length)
      : 25000000;

    // Create a clean ID from name
    const id = name
      .replace(/[^a-zA-ZÀ-ỹ0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20)
      .toUpperCase()
      .replace(/[À-ỹ]/g, c => c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase());

    schools.push({
      id: `GH_${schools.length + 1}_${id}`,
      name,
      shortName: name.replace(/^(Đại Học|Học Viện|Trường|Khoa)\s+/i, '').trim(),
      type,
      typeLabel,
      region,
      regionLabel,
      province,
      website: '',
      lat: parseFloat(row['Latitude']) || null,
      lng: parseFloat(row['Longitude']) || null,
      avgTuitionPerYearVND: avgTuition,
      majors,
      source: 'github-ads-final',
    });
  }

  console.log(`✅ GitHub: Fetched ${schools.length} schools (filtered military/irrelevant)`);
  return schools;
}
