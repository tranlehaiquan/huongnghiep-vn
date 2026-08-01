import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('scripts/next_flight_data.js', 'utf-8');

// Find major_groups
const keyword = '\\"major_groups\\":[';
const idx = content.indexOf(keyword);

if (idx !== -1) {
  const start = idx + keyword.length - 1; // start at '['
  let depth = 0;
  let end = -1;

  for (let i = start; i < content.length; i++) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  const rawString = content.substring(start, end);
  // Unescape the JSON string (replace \" with ")
  const unescaped = rawString.replace(/\\"/g, '"');
  const majorGroups = JSON.parse(unescaped);

  let totalMajors = 0;
  const cleanGroups = majorGroups.map((group) => {
    const majors = (group.majors || []).map((m) => {
      totalMajors++;
      return {
        id: m.id,
        code: m.code || null,
        name: m.name,
        alias: m.alias,
        description: m.description && !m.description.startsWith('$') ? m.description : '',
        codeList: m.code_list ? m.code_list.split(';').map(c => c.trim()).filter(Boolean) : [],
      };
    });

    return {
      id: group.id,
      title: group.title.trim(),
      alias: group.alias,
      icon: group.icon,
      majorsCount: majors.length,
      majors,
    };
  });

  const catalog = {
    source: 'https://diemthi.tuyensinh247.com/nganh-dao-tao.html',
    crawledAt: new Date().toISOString(),
    totalGroups: cleanGroups.length,
    totalMajors,
    groups: cleanGroups,
  };

  const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247Catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`🎉 SUCCESS! Crawled & saved ${cleanGroups.length} major groups and ${totalMajors} total submajors to: ${outputPath}`);
} else {
  console.error('❌ Could not locate keyword');
}
