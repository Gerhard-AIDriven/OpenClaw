const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Searching for 2026 month headers...\n');

// Scan entire header row (row 0) for 2026 dates
const headerCells = [];
for (let c = 200; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v : '';
  
  if (value && value.toString().includes('26')) {
    const colLetter = XLSX.utils.encode_col(c);
    headerCells.push({col: colLetter, value, colIndex: c});
    console.log(`Column ${colLetter} (index ${c}): ${value}`);
  }
}

console.log('\n\nAll header cells near end of range:');
for (let c = range.e.c - 20; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v : '';
  const colLetter = XLSX.utils.encode_col(c);
  if (value) {
    console.log(`  ${colLetter}: "${value}"`);
  }
}

// Now check which rows have data in 2026
console.log('\n\nScanning for non-zero values in 2026 months...');

let productsWithData = [];

for (let r = 2; r <= range.e.r; r++) {
  let has2026Data = false;
  
  for (const info of headerCells) {
    const cellRef = info.col + (r + 1);
    const cell = ws[cellRef];
    const val = cell ? parseFloat(cell.v) || 0 : 0;
    
    if (val > 0) {
      has2026Data = true;
      break;
    }
  }
  
  if (has2026Data) {
    const codeCellRef = 'A' + (r + 1);
    const codeCell = ws[codeCellRef];
    const descCellRef = 'B' + (r + 1);
    const descCell = ws[descCellRef];
    const code = codeCell ? codeCell.v : '';
    const desc = descCell ? descCell.v : '';
    productsWithData.push({code, desc});
  }
}

console.log(`\nProducts with 2026 sales data: ${productsWithData.length}\n`);
console.log('First 10:');
productsWithData.slice(0, 10).forEach(p => {
  console.log(`  ${p.code} | ${p.desc}`);
});
