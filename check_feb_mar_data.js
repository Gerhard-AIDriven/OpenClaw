const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Checking Feb 2026 and Mar 2026 data in detail...\n');

// Check columns IK (Feb 2026) and IP (Mar 2026)
console.log('Sampling 10 products for Feb 2026 (Column IK) and Mar 2026 (Column IP):\n');

let febCount = 0, marCount = 0;

for (let r = 2; r <= Math.min(2 + 9, range.e.r); r++) {
  const codeCellRef = XLSX.utils.encode_cell({r, c: 0});
  const codeCell = ws[codeCellRef];
  const code = codeCell ? codeCell.v : '';
  
  const ikCellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IK')});
  const ikCell = ws[ikCellRef];
  const ikVal = ikCell ? parseFloat(ikCell.v) || 0 : 0;
  
  const ipCellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IP')});
  const ipCell = ws[ipCellRef];
  const ipVal = ipCell ? parseFloat(ipCell.v) || 0 : 0;
  
  console.log(`${code.toString().padEnd(8)} | IK (Feb): ${ikVal.toString().padEnd(8)} | IP (Mar): ${ipVal}`);
  
  if (ikVal > 0) febCount++;
  if (ipVal > 0) marCount++;
}

console.log('\n\nTotal scan of all products:');
let totalFebData = 0, totalMarData = 0;

for (let r = 2; r <= range.e.r; r++) {
  const ikCellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IK')});
  const ikCell = ws[ikCellRef];
  const ikVal = ikCell ? parseFloat(ikCell.v) || 0 : 0;
  
  const ipCellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IP')});
  const ipCell = ws[ipCellRef];
  const ipVal = ipCell ? parseFloat(ipCell.v) || 0 : 0;
  
  if (ikVal > 0) totalFebData++;
  if (ipVal > 0) totalMarData++;
}

console.log(`Feb 2026 (IK): ${totalFebData} products with non-zero sales qty`);
console.log(`Mar 2026 (IP): ${totalMarData} products with non-zero sales qty`);

// Also check IF (Jan 2026) to verify it has data
console.log('\n\nVerifying Jan 2026 (IF):');
let totalJanData = 0;
for (let r = 2; r <= range.e.r; r++) {
  const ifCellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IF')});
  const ifCell = ws[ifCellRef];
  const ifVal = ifCell ? parseFloat(ifCell.v) || 0 : 0;
  if (ifVal > 0) totalJanData++;
}
console.log(`Jan 2026 (IF): ${totalJanData} products with non-zero sales qty`);
