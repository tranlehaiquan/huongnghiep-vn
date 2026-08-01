import fs from 'fs';

const content = fs.readFileSync('scripts/diemchuan_script_0.js', 'utf-8');

console.log('Inspecting diemchuan_script_0.js length:', content.length);

// Search for JSON objects containing school names, codes, regions, or benchmark score tables
const unescaped = content.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

// Look for lists of universities/colleges
const schoolListMatch = unescaped.match(/"universities":(\[\{.*?\}\])/);
if (schoolListMatch) {
  console.log('Found universities list payload!');
  const universities = JSON.parse(schoolListMatch[1]);
  console.log(`Parsed ${universities.length} universities! Sample:`, universities.slice(0, 5));
} else {
  console.log('No direct "universities" key match. Searching for school names...');
  
  // Extract all school cards / links
  const schools = [];
  const regex = /"name":"([^"]+)","code":"([^"]+)"/g;
  let m;
  while ((m = regex.exec(unescaped)) !== null) {
    schools.push({ name: m[1], code: m[2] });
  }
  console.log(`Found ${schools.length} schools with code via regex. Sample:`, schools.slice(0, 10));

  // Extract all benchmark rows if present
  const rows = [];
  const rowRegex = /"major_name":"([^"]+)","score":([0-9.]+)/g;
  while ((m = rowRegex.exec(unescaped)) !== null) {
    rows.push({ major: m[1], score: +m[2] });
  }
  console.log(`Found ${rows.length} major scores. Sample:`, rows.slice(0, 10));
}
