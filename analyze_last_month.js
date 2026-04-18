const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery.xls');
const ws = wb.Sheets['Sheet1'];

const range = XLSX.utils.decode_range(ws['!ref']);

// Extract all data
const data = [];
for (let r = 1; r <= range.e.r; r++) {
  const row = {};
  for (let c = 0; c <= range.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({r, c});
    const cell = ws[cellRef];
    const colLetter = XLSX.utils.encode_col(c);
    row[colLetter] = cell ? cell.v : '';
  }
  data.push(row);
}

// Identify product code column (A) and description column (B)
const products = [];

data.forEach((row, idx) => {
  if (idx < 1) return; // Skip header
  
  const code = row.A;
  const desc = row.B;
  
  if (!code || typeof code !== 'string' || code.trim() === 'Total (Overall)') {
    return;
  }
  
  // Find all month columns (C onwards, excluding non-numeric columns)
  const monthCols = [];
  for (let c = 2; c <= range.e.c; c++) {
    const col = XLSX.utils.encode_col(c);
    const header = data[0][col];
    // Check if it looks like a date (MM/DD/YY format)
    if (header && typeof header === 'string' && header.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      monthCols.push({col, header});
    }
  }
  
  // Find last month with sales > 0
  let lastMonth = 'No sales recorded';
  for (let i = monthCols.length - 1; i >= 0; i--) {
    const val = parseFloat(row[monthCols[i].col]) || 0;
    if (val > 0) {
      lastMonth = monthCols[i].header;
      break;
    }
  }
  
  products.push({
    code: code.toString().trim(),
    description: desc ? desc.toString().trim() : '',
    lastMonthWithSales: lastMonth
  });
});

// Save to JSON
fs.writeFileSync('butchery_last_sales_month.json', JSON.stringify(products, null, 2));

console.log('Processed ' + products.length + ' products');
console.log('Sample output:');
console.log(JSON.stringify(products.slice(0, 5), null, 2));
