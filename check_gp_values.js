const XLSX = require('xlsx');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];

// Find month columns
const monthLocations = [];
for (let c = 0; c <= 50; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: value,
      monthCol: c,
      qtyCol: c + 1,
      gpPercentCol: c + 4
    });
  }
}

console.log('Sample GP% values from different rows:\n');

// Check a few sample products
for (let r = 2; r <= 6; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code) continue;
  
  console.log(`\nProduct: ${code} - ${desc.toString().substring(0, 40)}`);
  console.log('Month | GP% Raw Value | Possible %');
  console.log('------|---------------|----------');
  
  for (let i = 0; i < Math.min(5, monthLocations.length); i++) {
    const gpCell = ws[XLSX.utils.encode_cell({r, c: monthLocations[i].gpPercentCol})]?.v || 0;
    const raw = parseFloat(gpCell) || 0;
    const asPercent = (raw / 100).toFixed(2);
    console.log(`${monthLocations[i].month} | ${raw.toFixed(2).padEnd(13)} | ${asPercent}%`);
  }
}
