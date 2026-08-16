const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

// Check specific columns for Feb, Mar, Apr 2026
// Feb 2026 = IK, Mar 2026 = IO, Apr 2026 would be... IU (if it exists)

const checkColumns = {
  'February 2026 (IK)': 'IK',
  'March 2026 (IO)': 'IO',
  'April 2026 (IU)': 'IU',
  'January 2026 (IE)': 'IE',
  'December 2025 (HZ)': 'HZ'
};

console.log('Checking for 2026 data in new file...\n');

// Get header row to verify month columns
console.log('Headers for 2026 period:');
const headerRow = 0;
for (const [monthName, col] of Object.entries(checkColumns)) {
  const cellRef = col + (headerRow + 1);
  const cell = ws[cellRef];
  const value = cell ? cell.v : '';
  console.log(`  ${monthName}: "${value}"`);
}

console.log('\n\nSample data from first 5 products for each month:\n');

for (const [monthName, col] of Object.entries(checkColumns)) {
  console.log(`\n${monthName} (Column ${col}, Sales Qty):`);
  let hasData = false;
  
  for (let r = 2; r <= Math.min(2 + 4, range.e.r); r++) {
    const cellRef = col + (r + 1);
    const cell = ws[cellRef];
    const val = cell ? parseFloat(cell.v) || 0 : 0;
    
    const codeCellRef = 'A' + (r + 1);
    const codeCell = ws[codeCellRef];
    const code = codeCell ? codeCell.v : '';
    
    if (val > 0) hasData = true;
    console.log(`    Row ${r} (${code}): ${val}`);
  }
  
  console.log(`    → Has data: ${hasData ? 'YES' : 'NO'}`);
}

console.log('\n\nTotal data summary:');
let totalActive = 0;
for (let r = 2; r <= range.e.r; r++) {
  const checkCols = ['IE', 'IK', 'IO']; // Jan, Feb, Mar 2026
  for (const col of checkCols) {
    const cellRef = col + (r + 1);
    const cell = ws[cellRef];
    const val = cell ? parseFloat(cell.v) || 0 : 0;
    if (val > 0) totalActive++;
  }
}

console.log(`  Total non-zero entries in Jan-Mar 2026: ${totalActive}`);
