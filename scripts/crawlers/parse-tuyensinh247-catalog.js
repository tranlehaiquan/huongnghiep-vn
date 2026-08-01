import fs from 'fs';

const content = fs.readFileSync('scripts/next_flight_data.js', 'utf-8');
const idx = content.indexOf('"major_groups":[');
console.log('Index of major_groups:', idx);

if (idx !== -1) {
  const start = idx + '"major_groups":'.length;
  // find matching bracket
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
  console.log('Start:', start, 'End:', end);
  const jsonStr = content.substring(start, end);
  console.log('String length:', jsonStr.length);
  const groups = JSON.parse(jsonStr);
  console.log('Successfully parsed', groups.length, 'major groups!');
  
  let totalMajors = 0;
  const cleanGroups = groups.map((group) => {
    const majors = (group.majors || []).map((m) => {
      totalMajors++;
      return {
        id: m.id,
        code: m.code,
        name: m.name,
        alias: m.alias,
        description: m.description && !m.description.startsWith('$') ? m.description : '',
        codeList: m.code_list ? m.code_list.split(';').map(c => c.trim()).filter(Boolean) : [],
      };
    });

    return {
      id: group.id,
      title: group.title,
      alias: group.alias,
      icon: group.icon,
      majorsCount: majors.length,
      majors,
    };
  });

  const catalog = {
    source: 'https://diemthi.tuyensinh247.com/nganh-dao-tao.html',
    updatedAt: new Date().toISOString(),
    groupsCount: cleanGroups.length,
    totalMajors,
    groups: cleanGroups,
  };

  fs.writeFileSync('src/data/tuyensinh247Catalog.json', JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`💾 Saved catalog with ${cleanGroups.length} groups & ${totalMajors} majors to src/data/tuyensinh247Catalog.json`);
}
