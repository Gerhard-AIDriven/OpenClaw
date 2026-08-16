const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];

// Check product 11142 (PORK FILLET) which showed Jan 2026 but has data in Feb/Mar
const productCode = '11142';
console.log(`Tracing product ${productCode} across all 2026 months:\n`);

// Find the row for this product
let targetRow = -1;
for (let r = 2; r <= 205; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  if (code?.toString().trim() === productCode) {
    targetRow = r;
    break;
  }
}

if (targetRow === -1) {
  console.log('Product not found');
  process.exit(1);
}

console.log(`Found at row ${targetRow}\n`);

// Check each 2026 month: Jan (IF), Feb (IK), Mar (IP)
const months2026 = [
  {name: 'January 2026', monthCol: 'IE', qtyCol: 'IF'},
  {name: 'February 2026', monthCol: 'IJ', qtyCol: 'IK'},
  {name: 'March 2026', monthCol: 'IO', qtyCol: 'IP'}
];

months2026.forEach(m => {
  const monthCell = ws[XLSX.utils.encode_cell({r: 0, c: XLSX.utils.decode_col(m.monthCol)})];
  const monthVal = monthCell ? monthCell.v : '';
  
  const qtyCell = ws[XLSX.utils.encode_cell({r: targetRow, c: XLSX.utils.decode_col(m.qtyCol)})];
  const qtyVal = qtyCell ? parseFloat(qtyCell.v) || 0 : 0;
  
  console.log(`${m.name} (${monthVal})`);
  console.log(`  Qty Column: ${m.qtyCol}`);
  console.log(`  Value: ${qtyVal}`);
  console.log();
});

// Also scan all months for this product to find the truly last one
console.log('\n\nFull month scan for this product:');

const monthLocations = [];
for (let c = 0; c <= 260; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: value,
      col: XLSX.utils.encode_col(c),
      qtyCol: XLSX.utils.encode_col(c + 1)
    });
  }
}

let lastWithData = null;
monthLocations.forEach(m => {
  const qtyCell = ws[XLSX.utils.encode_cell({r: targetRow, c: XLSX.utils.decode_col(m.qtyCol)})];
  const qtyVal = qtyCell ? parseFloat(qtyCell.v) || 0 : 0;
  
  if (qtyVal > 0) {
    console.log(`${m.month.padEnd(10)} (${m.qtyCol}): ${qtyVal}`);
    lastWithData = {month: m.month, qty: qtyVal};
  }
});

console.log(`\nLast month with data: ${lastWithData?.month} (Qty: ${lastWithData?.qty})`);
