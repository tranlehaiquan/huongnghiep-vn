import { VIETNAM_CAREER_DATA, type CareerField } from '../data/vietnamCareerData';
import { normalizeVietnamese } from './schoolMatcher';

export type { CareerField };

// Precompute normalized career data at startup
const normalizedCareers = VIETNAM_CAREER_DATA.map(career => ({
  career,
  normTitle: normalizeVietnamese(career.title),
  normCategory: normalizeVietnamese(career.category),
  normMajorName: normalizeVietnamese(career.majorName),
  normDescription: normalizeVietnamese(career.description),
  normKeywords: [
    ...normalizeVietnamese(career.title).split(/\s+/),
    ...normalizeVietnamese(career.majorName).split(/\s+/),
    ...normalizeVietnamese(career.category).split(/\s+/),
    ...career.primaryExamBlocks.map(b => b.toLowerCase()),
    ...(career.isHot2026 ? ['hot', 'nong', 'tiem nang', 'xu huong'] : []),
  ].filter(w => w.length > 1),
}));

export interface CareerSearchResult {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  majorName: string;
  degreeType: string;
  durationYears: number;
  primaryExamBlocks: string[];
  avgTuitionPerYearVND: number;
  salariesVND: {
    entry: number;
    mid: number;
    senior: number;
    lead: number;
  };
  topSchools: string[];
  isHot2026?: boolean;
}

/**
 * Search careers/jobs by keyword query.
 * Supports queries like:
 *   "công nghệ thông tin", "bác sĩ", "kỹ sư AI", "lương cao nhất", "ngành hot 2026",
 *   "marketing", "bán dẫn", "tài chính", "thiết kế", "y dược", "khối A01", "lương bao nhiêu"
 */
export function searchCareers(
  queryText: string,
  maxResults = 5,
): CareerSearchResult[] {
  const normQuery = normalizeVietnamese(queryText);
  if (!normQuery || normQuery.length < 2) return [];

  // --- Special case: "lương cao nhất" / top salary careers ---
  const wantsHighSalary =
    normQuery.includes('luong cao') || normQuery.includes('luong nhieu') || normQuery.includes('thu nhap cao');
  if (wantsHighSalary) {
    return [...VIETNAM_CAREER_DATA]
      .sort((a, b) => b.salariesVND.senior - a.salariesVND.senior)
      .slice(0, maxResults)
      .map(trimCareer);
  }

  // --- Special case: "hot 2026" / trending careers ---
  const wantsHot =
    normQuery.includes('hot') || normQuery.includes('nong') || normQuery.includes('tiem nang') || normQuery.includes('xu huong');
  if (wantsHot) {
    return VIETNAM_CAREER_DATA
      .filter(c => c.isHot2026)
      .slice(0, maxResults)
      .map(trimCareer);
  }

  // --- Exam block filter ---
  const examBlockMatch = normQuery.match(/\b(a00|a01|b00|c00|d01|d07|v00|h00)\b/i);
  const targetBlock = examBlockMatch ? examBlockMatch[1].toUpperCase() : null;

  const scored: { career: CareerField; score: number }[] = [];

  for (const { career, normTitle, normCategory, normMajorName, normDescription, normKeywords } of normalizedCareers) {
    // Exam block filter
    if (targetBlock && !career.primaryExamBlocks.includes(targetBlock)) continue;

    let score = 0;

    // 1. Exact title match
    if (normTitle.includes(normQuery)) score += 100;
    // 2. Major name match
    else if (normMajorName.includes(normQuery)) score += 80;
    // 3. Category match
    else if (normCategory.includes(normQuery)) score += 60;
    // 4. Description keyword match
    else if (normDescription.includes(normQuery)) score += 40;
    // 5. Partial keyword match
    else {
      const queryWords = normQuery.split(/\s+/).filter(w => w.length > 1);
      const matchCount = queryWords.filter(qw =>
        normKeywords.some(kw => kw.includes(qw) || qw.includes(kw))
      ).length;
      if (matchCount >= 1) {
        score += matchCount * 25;
      }
    }

    // Hot 2026 bonus
    if (career.isHot2026) score += 5;

    if (score > 0) {
      scored.push({ career, score });
    }
  }

  // If block filter was specified with no other keywords, return all careers for that block
  if (targetBlock && scored.length === 0) {
    return VIETNAM_CAREER_DATA
      .filter(c => c.primaryExamBlocks.includes(targetBlock))
      .slice(0, maxResults)
      .map(trimCareer);
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map(({ career }) => trimCareer(career));
}

function trimCareer(career: CareerField): CareerSearchResult {
  return {
    id: career.id,
    title: career.title,
    icon: career.icon,
    category: career.category,
    description: career.description,
    majorName: career.majorName,
    degreeType: career.degreeType,
    durationYears: career.durationYears,
    primaryExamBlocks: career.primaryExamBlocks,
    avgTuitionPerYearVND: career.avgTuitionPerYearVND,
    salariesVND: career.salariesVND,
    topSchools: career.topSchools,
    isHot2026: career.isHot2026,
  };
}
