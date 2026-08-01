import schoolsData from '../data/vietnamSchools.json';

export interface SchoolMajor {
  code?: string;
  name: string;
  blocks?: string[];
  years?: number;
  tuitionPerYear?: number;
  cutoffScore2024?: string;
  note?: string;
}

export interface SchoolRecord {
  id: string;
  name: string;
  shortName?: string;
  typeLabel?: string;
  regionLabel?: string;
  region?: string;
  province?: string;
  website?: string;
  avgTuitionPerYearVND?: number;
  majors?: SchoolMajor[];
}

export interface MajorSearchResult {
  schoolId: string;
  schoolName: string;
  shortName?: string;
  province?: string;
  website?: string;
  region?: string;
  regionLabel?: string;
  major: {
    name: string;
    code?: string;
    blocks?: string[];
    cutoffScore2024?: string;
    tuitionPerYear?: number;
  };
}

const schools = schoolsData as SchoolRecord[];

// Precompute normalized school names once at startup for performance
const normalizedSchools = schools.map(school => ({
  school,
  normName: normalizeVietnamese(school.name),
  normShort: normalizeVietnamese(school.shortName || ''),
}));

// Precompute normalized major names across all schools for fast major search
interface NormMajor {
  school: SchoolRecord;
  major: SchoolMajor;
  normMajorName: string;
  majorWords: string[];
}

const normalizedMajors: NormMajor[] = [];
for (const school of schools) {
  for (const major of school.majors || []) {
    const normMajorName = normalizeVietnamese(major.name);
    const majorWords = normMajorName.split(/\s+/).filter(w => w.length > 1);
    normalizedMajors.push({ school, major, normMajorName, majorWords });
  }
}

export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

// Common stopwords to filter out of partial matches
const STOPWORDS = new Set(['truong', 'dai', 'hoc', 'cao', 'dang', 'vien', 'khoa', 'lien', 'ket']);

// Regional keyword detection
function detectRegion(normQuery: string): 'North' | 'Central' | 'South' | null {
  if (normQuery.includes('mien nam') || normQuery.includes('phia nam') || normQuery.includes('tphcm') || normQuery.includes('sai gon') || normQuery.includes('ho chi minh')) {
    return 'South';
  }
  if (normQuery.includes('mien bac') || normQuery.includes('phia bac') || normQuery.includes('ha noi') || normQuery.includes('bac ninh') || normQuery.includes('bac giang')) {
    return 'North';
  }
  if (normQuery.includes('mien trung') || normQuery.includes('phia trung') || normQuery.includes('da nang') || normQuery.includes('hue') || normQuery.includes('quang')) {
    return 'Central';
  }
  return null;
}

// Detect if query is asking for "top N most expensive / cheapest schools"
function detectTopNTuition(normQuery: string): { topN: number; order: 'desc' | 'asc' } | null {
  const topMatch = normQuery.match(/top\s*(\d+)/);
  const n = topMatch ? parseInt(topMatch[1]) : null;
  const wantsCheap = normQuery.includes('re nhat') || normQuery.includes('hoc phi thap') || normQuery.includes('chi phi thap') || normQuery.includes('phi re');
  const wantsExpensive = normQuery.includes('hoc phi cao') || normQuery.includes('dat nhat') || normQuery.includes('chi phi cao') || normQuery.includes('phi cao');
  if (n && (wantsCheap || wantsExpensive)) {
    return { topN: n, order: wantsExpensive ? 'desc' : 'asc' };
  }
  return null;
}

/**
 * Search schools offering a given major (ngành học).
 * Query can be: "Công nghệ thông tin", "Y đa khoa", "Luật", "Kinh tế", "Kỹ thuật điện tử", "Báo chí"...
 * Optionally filter by region: "CNTT miền nam", "Y khoa Hà Nội"...
 * Returns top matching schools and the matched major's details (cutoff score, tuition, exam blocks).
 */
export function searchSchoolsByMajor(
  queryText: string,
  maxResults = 8,
): MajorSearchResult[] {
  const normQuery = normalizeVietnamese(queryText);
  if (!normQuery || normQuery.length < 2) return [];

  const targetRegion = detectRegion(normQuery);

  // Strip regional keywords from the major query for cleaner major matching
  const cleanedQuery = normQuery
    .replace(/mien nam|mien bac|mien trung|phia nam|phia bac|phia trung|ha noi|tphcm|sai gon|da nang|hue/g, '')
    .trim();

  const scored: { result: MajorSearchResult; score: number }[] = [];

  for (const { school, major, normMajorName, majorWords } of normalizedMajors) {
    // Region filter
    if (targetRegion && school.region !== targetRegion) continue;

    let score = 0;

    // 1. Exact major name match
    if (normMajorName && cleanedQuery.includes(normMajorName)) {
      score += 100;
    }
    // 2. Major name contains the query
    else if (normMajorName && normMajorName.includes(cleanedQuery) && cleanedQuery.length >= 3) {
      score += 80;
    }
    // 3. Partial word matches
    else {
      const queryWords = cleanedQuery.split(/\s+/).filter(w => w.length > 1);
      const matchCount = queryWords.filter(qw => majorWords.some(mw => mw.includes(qw) || qw.includes(mw))).length;
      if (matchCount >= 1) {
        score += matchCount * 30;
        // Bonus for consecutive word matches
        if (matchCount >= 2) score += 20;
      }
    }

    if (score > 0) {
      scored.push({
        score,
        result: {
          schoolId: school.id,
          schoolName: school.name,
          shortName: school.shortName,
          province: school.province,
          website: school.website,
          region: school.region,
          regionLabel: school.regionLabel,
          major: {
            name: major.name,
            code: major.code,
            blocks: major.blocks,
            cutoffScore2024: major.cutoffScore2024,
            tuitionPerYear: major.tuitionPerYear,
          },
        },
      });
    }
  }

  // Sort: higher score first, then by cutoffScore2024 descending as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aScore = parseFloat(a.result.major.cutoffScore2024 || '0') || 0;
    const bScore = parseFloat(b.result.major.cutoffScore2024 || '0') || 0;
    return bScore - aScore;
  });

  return scored.slice(0, maxResults).map(({ result }) => result);
}

/**
 * Smart RAG database matcher for user queries (school search).
 * Supports: specific school names, abbreviations, regional filters, tuition ranking queries.
 */
export function searchSchoolsInQuery(queryText: string, maxResults = 5): SchoolRecord[] {
  const normQuery = normalizeVietnamese(queryText);
  if (!normQuery || normQuery.length < 2) return [];

  // --- Special case: Top N cheapest/expensive tuition ---
  const topNTuition = detectTopNTuition(normQuery);
  const targetRegion = detectRegion(normQuery);

  if (topNTuition) {
    let candidates = schools.filter(s => s.avgTuitionPerYearVND && s.avgTuitionPerYearVND > 0);
    if (targetRegion) {
      candidates = candidates.filter(s => s.region === targetRegion);
    }
    candidates.sort((a, b) =>
      topNTuition.order === 'desc'
        ? (b.avgTuitionPerYearVND || 0) - (a.avgTuitionPerYearVND || 0)
        : (a.avgTuitionPerYearVND || 0) - (b.avgTuitionPerYearVND || 0)
    );
    return candidates.slice(0, topNTuition.topN).map(trimSchool);
  }

  // --- Normal keyword-based school lookup ---
  const scored: { school: SchoolRecord; score: number }[] = [];

  for (const { school, normName, normShort } of normalizedSchools) {
    let score = 0;

    // 1. Exact shortName match (e.g. "HDU", "FTU", "HUST", "RMIT", "NEU")
    if (normShort && normShort.length >= 2 && normQuery.includes(normShort)) {
      score += 100;
    }

    // 2. Full name match
    if (normName && normQuery.includes(normName)) {
      score += 80;
    } else if (normName) {
      // 3. Partial meaningful word matches
      const nameWords = normName.split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w));
      const matchCount = nameWords.filter(w => normQuery.includes(w)).length;
      if (matchCount >= 2) {
        score += matchCount * 25;
      } else if (matchCount === 1 && nameWords.length <= 3) {
        score += 15;
      }
    }

    // 4. Regional boost when query specifies a region
    if (targetRegion) {
      if (school.region === targetRegion) {
        score += score > 0 ? 20 : 5;
      } else if (score > 0) {
        score -= 30;
      }
    }

    if (score > 0) {
      scored.push({ school, score });
    }
  }

  // --- Pure region listing (no school name keywords) ---
  if (scored.length === 0 && targetRegion) {
    return schools
      .filter(s => s.region === targetRegion)
      .slice(0, maxResults)
      .map(trimSchool);
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map(({ school }) => trimSchool(school));
}

/** Trim school data to essential fields for token efficiency */
function trimSchool(school: SchoolRecord): SchoolRecord {
  return {
    id: school.id,
    name: school.name,
    shortName: school.shortName,
    typeLabel: school.typeLabel,
    regionLabel: school.regionLabel,
    province: school.province,
    website: school.website,
    avgTuitionPerYearVND: school.avgTuitionPerYearVND,
    majors: (school.majors || []).slice(0, 12).map(m => ({
      name: m.name,
      code: m.code,
      blocks: m.blocks,
      cutoffScore2024: m.cutoffScore2024,
      tuitionPerYear: m.tuitionPerYear,
    })),
  };
}
