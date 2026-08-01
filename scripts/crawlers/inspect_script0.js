import fs from 'fs';

const unescaped = fs.readFileSync('scripts/diemchuan_script_0.js', 'utf-8').replace(/\\"/g, '"');

console.log('Unescaped length:', unescaped.length);

// Find any strings matching school name patterns or codes
const sample = unescaped.substring(0, 3000);
console.log('Sample start of script 0:', sample);
