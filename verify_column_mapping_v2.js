const XLSX = require('xlsx');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];

console.log('\n📊 VERIFYING COLUMN MAPPING\n');
console.log('Row 0 (Months):');
console.log('Column | Value');
console.log('-------|-------');

// Check columns H, L, P, T, etc. for month headers
const monthColumns = [
  { col: 7, label: 'H' },   // H = col 7 (0-indexed)
  { col: 11, label: 'L' },  // L = col 11
  { col: 15, label: 'P' },  // P = col 15
  { col: 19, label: 'T' },  // T = col 19
  { col: 23, label: 'X' }   // X = col 23
];

monthColumns.forEach(m => {
  const cellRef = XLSX.utils.encode_cell({r: 0, c: m.col});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  console.log(`${m.label} (${m.col}) | ${value}`);
});

console.log('\n\nRow 1 (Column Headers):');
console.log('Column | Value');
console.log('-------|-------');

const headerCols = [
  { col: 0, label: 'A' },
  { col: 1, label: 'B' },
  { col: 2, label: 'C' },
  { col: 3, label: 'D' },
  { col: 4, label: 'E' },
  { col: 5, label: 'F' },
  { col: 6, label: 'G' },
  { col: 7, label: 'H' },
  { col: 8, label: 'I' },
  { col: 9, label: 'J' },
  { col: 10, label: 'K' }
];

headerCols.forEach(h => {
  const cellRef = XLSX.utils.encode_cell({r: 1, c: h.col});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  console.log(`${h.label} | ${value}`);
});

console.log('\n\nSample Product Row (Row 2):');
console.log('Column | Header | Value');
console.log('-------|--------|-------');

headerCols.forEach(h => {
  const headerRef = XLSX.utils.encode_cell({r: 1, c: h.col});
  const headerCell = ws[headerRef];
  const header = headerCell ? headerCell.v?.toString() : '';
  
  const dataRef = XLSX.utils.encode_cell({r: 2, c: h.col});
  const dataCell = ws[dataRef];
  const value = dataCell ? dataCell.v?.toString() : '';
  
  console.log(`${h.label} | ${header.substring(0, 15).padEnd(15)} | ${value}`);
});

console.log('\n\nMarch 2022 Data (Expected in Columns H-K):');
console.log('Expected: H=Sales VAT, I=Qty, J=GP Ratio%, K=GP%');
console.log('Row | H (VAT) | I (Qty) | J (GP%) | K (GP%)');
console.log('----|---------|---------|---------|--------');

for (let r = 2; r <= 4; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v?.toString().substring(0, 6) || '';
  const h = ws[XLSX.utils.encode_cell({r, c: 7})]?.v?.toString().substring(0, 8) || '';
  const i = ws[XLSX.utils.encode_cell({r, c: 8})]?.v?.toString().substring(0, 8) || '';
  const j = ws[XLSX.utils.encode_cell({r, c: 9})]?.v?.toString().substring(0, 8) || '';
  const k = ws[XLSX.utils.encode_cell({r, c: 10})]?.v?.toString().substring(0, 8) || '';
  console.log(`${r} | ${h} | ${i} | ${j} | ${k}`);
}

console.log('\n\nChecking for correct month spacing (should be every 4 columns):');
const range = XLSX.utils.decode_range(ws['!ref']);
let monthCount = 0;
for (let c = 7; c <= range.e.c; c += 4) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    monthCount++;
    if (monthCount <= 5 || monthCount > 45) {
      console.log(`Month ${monthCount}: Column ${XLSX.utils.encode_col(c)} = ${value}`);
    } else if (monthCount === 6) {
      console.log('...');
    }
  }
}
console.log(`\nTotal months found: ${monthCount}`);
