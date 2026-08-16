const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Finding exact month label columns...\n');

// Scan row 0 from column IE onwards to find month labels
console.log('Row 0 (Month Labels) from column IE onwards:');
for (let c = XLSX.utils.decode_col('IE'); c <= XLSX.utils.decode_col('IT'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  if (value && value.toString().match(/\d{2}\/\d{2}\/\d{2}/)) {
    console.log(`  ${col}: "${value}"`);
  }
}

console.log('\n\nDetailed structure (Row 0 and Row 1) from IE to IT:');
for (let c = XLSX.utils.decode_col('IE'); c <= XLSX.utils.decode_col('IT'); c++) {
  const col = XLSX.utils.encode_col(c);
  const cell0 = ws[XLSX.utils.encode_cell({r: 0, c})];
  const cell1 = ws[XLSX.utils.encode_cell({r: 1, c})];
  const val0 = cell0 ? cell0.v : '';
  const val1 = cell1 ? cell1.v : '';
  console.log(`${col}: Row0="${val0}", Row1="${val1}"`);
}

console.log('\n\nSales Qty columns for 2026:');
// Based on your info:
// Jan 26: IE to II (month in IE, qty should be 2nd col = IF)
// Feb 26: IJ to IN (month in IJ, qty should be 2nd col = IK)
// Mar 26: IP to IS (month in IP, qty should be 1st col = IP)

console.log('According to your mapping:');
console.log('  Jan 2026 month: IE, Sales Qty column: IF');
console.log('  Feb 2026 month: IJ, Sales Qty column: IK');
console.log('  Mar 2026 month: IP, Sales Qty column: IP');

// Check if these actually have "Sales Quantity"
console.log('\nVerifying which columns have "Sales Quantity" header (Row 1):');
const checkCols = ['IF', 'IK', 'IP'];
checkCols.forEach(col => {
  const cell = ws[XLSX.utils.encode_cell({r: 1, c: XLSX.utils.decode_col(col)})];
  const val = cell ? cell.v : '';
  console.log(`  ${col}: "${val}"`);
});

// Scan sample data to see which columns have actual values in 2026
console.log('\n\nScanning sample products for 2026 data:');
let foundInIF = 0, foundInIK = 0, foundInIP = 0;

for (let r = 2; r <= range.e.r; r++) {
  const ifVal = parseFloat(ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IF')})]?.v || 0) || 0;
  const ikVal = parseFloat(ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IK')})]?.v || 0) || 0;
  const ipVal = parseFloat(ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IP')})]?.v || 0) || 0;
  
  if (ifVal > 0) foundInIF++;
  if (ikVal > 0) foundInIK++;
  if (ipVal > 0) foundInIP++;
}

console.log(`  Column IF (Jan 2026 Qty): ${foundInIF} products with data`);
console.log(`  Column IK (Feb 2026 Qty): ${foundInIK} products with data`);
console.log(`  Column IP (Mar 2026 Qty): ${foundInIP} products with data`);
