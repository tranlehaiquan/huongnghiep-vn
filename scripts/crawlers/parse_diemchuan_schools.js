import fs from 'fs';
import path from 'path';

let text = fs.readFileSync('scripts/diemchuan_script_0.js', 'utf-8');

// Unescape quotes
text = text.replace(/\\"/g, '"');

// Match all school links: href:"/diem-chuan/<slug>.html" ... strong children:"<code>" ... " - " ... "<name>"
const regex = /"href":"(\/diem-chuan\/([^"]+)-([A-Za-z0-9_]+)\.html)","children":\[\["\$","strong",null,\{"children":"([^"]+)"\}\]," - ","([^"]+)"\]/g;

const schools = [];
let match;

while ((match = regex.exec(text)) !== null) {
  const [_, href, slug, codeFromSlug, codeFromStrong, name] = match;
  schools.push({
    id: schools.length + 1,
    code: unescapeUnicode(codeFromStrong),
    name: unescapeUnicode(name),
    slug: `${slug}-${codeFromStrong}`,
    detailUrl: `https://diemthi.tuyensinh247.com${href}`,
  });
}

// Fallback: match any /diem-chuan/*.html link
if (schools.length === 0) {
  console.log('Trying fallback href matcher...');
  const fallbackRegex = /"href":"(\/diem-chuan\/([^"]+)\.html)"/g;
  let m;
  const seen = new Set();
  while ((m = fallbackRegex.exec(text)) !== null) {
    const url = m[1];
    const slugName = m[2];
    if (!seen.has(url)) {
      seen.add(url);
      schools.push({
        id: schools.length + 1,
        slug: slugName,
        detailUrl: `https://diemthi.tuyensinh247.com${url}`,
      });
    }
  }
}

console.log(`🎉 Parsed ${schools.length} University & College Benchmark pages from Tuyensinh247!`);

function unescapeUnicode(str) {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
  );
}

const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247_diemchuan_schools.json');
fs.writeFileSync(outputPath, JSON.stringify({
  source: 'https://diemthi.tuyensinh247.com/diem-chuan.html',
  crawledAt: new Date().toISOString(),
  totalSchoolsCount: schools.length,
  schools,
}, null, 2), 'utf-8');

console.log(`💾 Saved to: ${outputPath}`);
