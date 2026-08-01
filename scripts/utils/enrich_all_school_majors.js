/**
 * enrich_all_school_majors.js
 * Enriches all 262+ schools in src/data/vietnamSchools.json with their complete crawled majors list from Tuyensinh247!
 */

import fs from 'fs';
import path from 'path';

const schoolsPath = path.join(process.cwd(), 'src/data/vietnamSchools.json');
const benchmarksPath = path.join(process.cwd(), 'src/data/tuyensinh247_school_benchmarks.json');

const schools = JSON.parse(fs.readFileSync(schoolsPath, 'utf-8'));
const benchmarks = JSON.parse(fs.readFileSync(benchmarksPath, 'utf-8')).schools || [];

console.log(`🚀 Enriching ${schools.length} schools with Tuyensinh247 crawled majors...`);

let enrichedCount = 0;
let totalMajorsAdded = 0;

const updatedSchools = schools.map((school) => {
  // Find matching crawled benchmark data
  const matched = benchmarks.find((b) =>
    school.name.toLowerCase().includes(b.name.toLowerCase()) ||
    b.name.toLowerCase().includes(school.name.toLowerCase()) ||
    (school.shortName && b.name.toLowerCase().includes(school.shortName.toLowerCase())) ||
    (school.code && b.code && school.code === b.code)
  );

  if (matched && matched.majors && matched.majors.length > 0) {
    enrichedCount++;
    // Deduplicate major names
    const seenNames = new Set();
    const cleanMajors = [];

    matched.majors.forEach((m, idx) => {
      const name = m.majorName.trim();
      if (name && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        cleanMajors.push({
          code: m.blocks && m.blocks[0] ? `M${idx + 1}` : 'NTH',
          name,
          examBlocks: m.blocks && m.blocks.length > 0 ? m.blocks : ['A00', 'A01', 'D01'],
          years: school.type === 'college' ? 3 : 4,
          tuitionPerYear: school.avgTuitionPerYearVND || 25000000,
          cutoffScore2024: m.score || '—',
        });
      }
    });

    totalMajorsAdded += cleanMajors.length;
    return {
      ...school,
      majorsCount: cleanMajors.length,
      majors: cleanMajors,
    };
  }

  return school;
});

fs.writeFileSync(schoolsPath, JSON.stringify(updatedSchools, null, 2), 'utf-8');

console.log(`🎉 SUCCESS! Enriched ${enrichedCount} schools with a total of ${totalMajorsAdded} complete majors!`);
