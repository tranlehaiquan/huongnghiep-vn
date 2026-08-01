/**
 * enrich_smart_school_majors.js
 * Smart fuzzy-matching school names and enriching all 262+ schools with their complete Tuyensinh247 majors list.
 */

import fs from 'fs';
import path from 'path';

const schoolsPath = path.join(process.cwd(), 'src/data/vietnamSchools.json');
const benchmarksPath = path.join(process.cwd(), 'src/data/tuyensinh247_school_benchmarks.json');

const schools = JSON.parse(fs.readFileSync(schoolsPath, 'utf-8'));
const benchmarks = JSON.parse(fs.readFileSync(benchmarksPath, 'utf-8')).schools || [];

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/trường|đại học|học viện|cao đẳng|cơ sở|phía bắc|phía nam|tphcm|hà nội|hcm/g, '')
    .replace(/[^a-z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, '')
    .trim();
}

console.log(`🚀 Smart matching ${schools.length} schools with ${benchmarks.length} Tuyensinh247 benchmark datasets...`);

let enrichedCount = 0;
let totalMajorsAdded = 0;

const updatedSchools = schools.map((school) => {
  const normSchool = normalizeName(school.name);
  const normShort = normalizeName(school.shortName);

  const matched = benchmarks.find((b) => {
    const normB = normalizeName(b.name);
    if (!normB || normB.length < 3) return false;
    return (
      normSchool.includes(normB) ||
      normB.includes(normSchool) ||
      (normShort && (normShort.includes(normB) || normB.includes(normShort))) ||
      (school.code && b.code && school.code.toLowerCase() === b.code.toLowerCase())
    );
  });

  if (matched && matched.majors && matched.majors.length > 0) {
    enrichedCount++;
    const seenNames = new Set();
    const cleanMajors = [];

    matched.majors.forEach((m, idx) => {
      const name = m.majorName.trim();
      if (name && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        cleanMajors.push({
          code: m.code || `M${idx + 1}`,
          name,
          blocks: m.blocks && m.blocks.length > 0 ? m.blocks : ['A00', 'A01', 'D01'],
          years: school.type === 'college' ? 3 : 4,
          tuitionPerYear: school.avgTuitionPerYearVND || 25000000,
          cutoffScore2024: m.score || '—',
          note: m.note || '',
        });
      }
    });

    totalMajorsAdded += cleanMajors.length;
    console.log(` ✅ Matched "${school.name}" ➔ "${matched.name}" (${cleanMajors.length} majors)`);

    return {
      ...school,
      majorsCount: cleanMajors.length,
      majors: cleanMajors,
    };
  }

  return school;
});

fs.writeFileSync(schoolsPath, JSON.stringify(updatedSchools, null, 2), 'utf-8');

console.log(`🎉 SUCCESS! Smart-enriched ${enrichedCount} schools with a total of ${totalMajorsAdded} complete majors!`);
