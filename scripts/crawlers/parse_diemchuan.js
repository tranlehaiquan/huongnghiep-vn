import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('scripts/diemchuan_flight_data.js', 'utf-8');

console.log('Searching for JSON data payloads in diem-chuan.html...');

// Look for university list or benchmark list
const schoolMatches = [];
const regexSchool = /"id":(\d+),"name":"([^"]+)","code":"([^"]+)"/g;
let match;
while ((match = regexSchool.exec(content)) !== null) {
  const [_, id, name, code] = match;
  schoolMatches.push({ id: +id, name: unescapeUnicode(name), code });
}

console.log(`Found ${schoolMatches.length} schools via regex match.`);

// Check for flight data strings with school objects
const flightIndex = content.indexOf('universities') !== -1 ? content.indexOf('universities') : content.indexOf('schools');
console.log('Flight index:', flightIndex);

// Regex for diem chuan / benchmark scores
const benchmarkRegex = /"school_name":"([^"]+)","major_name":"([^"]+)","benchmark_score":([0-9.]+)/g;
const benchmarkMatches = [];
while ((match = benchmarkRegex.exec(content)) !== null) {
  const [_, school, major, score] = match;
  benchmarkMatches.push({ school: unescapeUnicode(school), major: unescapeUnicode(major), score: +score });
}

console.log(`Found ${benchmarkMatches.length} benchmark score entries via regex match.`);

function unescapeUnicode(str) {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
  );
}

// Print sample
if (schoolMatches.length > 0) {
  console.log('Sample schools:', schoolMatches.slice(0, 10));
}
