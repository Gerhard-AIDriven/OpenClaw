const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery.xls');
const ws = wb.Sheets['Sheet1'];

// Get range
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Sheet dimensions: ' + (range.e.r + 1) + ' rows x ' + (range.e.c + 1) + ' cols');

// Print first 5 rows, all columns
console.log('\nFirst 5 rows (raw cell values):');
for (let r = 0; r < Math.min(5, range.e.r + 1); r++) {
  console.log('\nRow ' + r + ':');
  for (let c = 0; c <= Math.min(10, range.e.c); c++) {
    const cellRef = XLSX.utils.encode_cell({r, c});
    const cell = ws[cellRef];
    const colLetter = XLSX.utils.encode_col(c);
    const value = cell ? cell.v : '';
    console.log('  Col ' + colLetter + ': ' + value);
  }
}

// Get header row (should be row 0 or 1)
console.log('\n\nAll column headers (row 0):');
for (let c = 0; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v : '';
  const colLetter = XLSX.utils.encode_col(c);
  if (value) {
    console.log('  ' + colLetter + ': ' + value);
  }
}
