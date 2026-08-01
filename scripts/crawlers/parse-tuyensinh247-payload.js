/**
 * parse-tuyensinh247-payload.js
 * Extracts all major groups and majors from Tuyensinh247 next_flight_data.js payload.
 */

import fs from 'fs';
import path from 'path';

export function parseTuyensinh247Payload() {
  console.log('🚀 Parsing Tuyensinh247 payload from scripts/next_flight_data.js...');
  const filePath = path.join(process.cwd(), 'scripts/next_flight_data.js');

  if (!fs.existsSync(filePath)) {
    console.error('❌ next_flight_data.js not found!');
    return null;
  }

  const text = fs.readFileSync(filePath, 'utf-8');

  // Match all "major_groups":[{ ... }]
  const keyIndex = text.indexOf('"major_groups":[');
  if (keyIndex === -1) {
    console.error('❌ "major_groups":[" not found in file');
    return null;
  }

  const startArr = keyIndex + '"major_groups":'.length;
  let depth = 0;
  let endArr = -1;
  for (let i = startArr; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') {
      depth--;
      if (depth === 0) {
        endArr = i + 1;
        break;
      }
    }
  }

  if (endArr === -1) {
    console.error('❌ Could not find closing bracket for major_groups');
    return null;
  }

  const jsonStr = text.substring(startArr, endArr);
  const majorGroups = JSON.parse(jsonStr);

  let totalMajorsCount = 0;
  const groups = majorGroups.map((g) => {
    const majors = (g.majors || []).map((m) => {
      totalMajorsCount++;
      return {
        id: m.id,
        code: m.code || null,
        name: m.name,
        alias: m.alias,
        description: m.description && !m.description.startsWith('$') ? m.description : '',
        codeList: m.code_list ? m.code_list.split(';').map((c) => c.trim()).filter(Boolean) : [],
      };
    });

    return {
      id: g.id,
      title: g.title.trim(),
      alias: g.alias,
      icon: g.icon,
      majorsCount: majors.length,
      majors,
    };
  });

  const output = {
    source: 'https://diemthi.tuyensinh247.com/nganh-dao-tao.html',
    crawledAt: new Date().toISOString(),
    totalGroups: groups.length,
    totalMajors: totalMajorsCount,
    groups,
  };

  const outputPath = path.join(process.cwd(), 'src/data/tuyensinh247Catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Extracted ${groups.length} major groups with ${totalMajorsCount} total submajors!`);
  console.log(`💾 Saved catalog to: ${outputPath}`);

  return output;
}

parseTuyensinh247Payload();
