import fs from 'fs';

const html = fs.readFileSync('scripts/diemchuan_flight_data.js', 'utf-8');

// Find flight data scripts
const scripts = [];
const regex = /self\.__next_f\.push\(\[(.*?)\]\)/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const content = m[1];
  if (content.includes('Đại học') || content.includes('Học viện') || content.includes('Cao đẳng') || content.includes('điểm') || content.includes('ngành')) {
    scripts.push(content);
  }
}

console.log(`Found ${scripts.length} flight data scripts with educational keywords.`);
scripts.forEach((s, idx) => {
  console.log(`Script #${idx} length: ${s.length}, snippet: ${s.substring(0, 200)}...`);
  fs.writeFileSync(`scripts/diemchuan_script_${idx}.js`, s, 'utf-8');
});
