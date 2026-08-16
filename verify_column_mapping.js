const XLSX = require('xlsx');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Verifying column structure for 2026...\n');

// Check row 1 (index 1) which contains the month headers
console.log('Row 1 Headers (Month Indicators):');

// January 2026: columns IE to II
console.log('\nJanuary 2026 (IE to II):');
for (let c = XLSX.utils.decode_col('IE'); c <= XLSX.utils.decode_col('II'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 1, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  console.log(`  ${col}: "${value}"`);
}

// February 2026: columns IJ to IN
console.log('\nFebruary 2026 (IJ to IN):');
for (let c = XLSX.utils.decode_col('IJ'); c <= XLSX.utils.decode_col('IN'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 1, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  console.log(`  ${col}: "${value}"`);
}

// March 2026: columns IP to IS
console.log('\nMarch 2026 (IP to IS):');
for (let c = XLSX.utils.decode_col('IP'); c <= XLSX.utils.decode_col('IS'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 1, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  console.log(`  ${col}: "${value}"`);
}

// Check row 0 to see month headers
console.log('\n\nRow 0 Headers (Month Labels):');
console.log('IE to II (Jan 2026):');
for (let c = XLSX.utils.decode_col('IE'); c <= XLSX.utils.decode_col('II'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  if (value) console.log(`  ${col}: "${value}"`);
}

console.log('\nIJ to IN (Feb 2026):');
for (let c = XLSX.utils.decode_col('IJ'); c <= XLSX.utils.decode_col('IN'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  if (value) console.log(`  ${col}: "${value}"`);
}

console.log('\nIP to IS (Mar 2026):');
for (let c = XLSX.utils.decode_col('IP'); c <= XLSX.utils.decode_col('IS'); c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const col = XLSX.utils.encode_col(c);
  const value = cell ? cell.v : '';
  if (value) console.log(`  ${col}: "${value}"`);
}

// Now check actual data for sample products
console.log('\n\nSample Data for first 3 products:');
for (let r = 2; r <= 4; r++) {
  const codeCellRef = XLSX.utils.encode_cell({r, c: 0});
  const codeCell = ws[codeCellRef];
  const code = codeCell ? codeCell.v : '';
  
  console.log(`\nProduct ${r-1} (Code: ${code}):`);
  
  // Check Sales Qty columns
  console.log('  Jan 2026 (Sales Qty = IG):');
  const igCell = ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IG')})];
  console.log(`    IG: ${igCell ? igCell.v : 0}`);
  
  console.log('  Feb 2026 (Sales Qty = IL):');
  const ilCell = ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IL')})];
  console.log(`    IL: ${ilCell ? ilCell.v : 0}`);
  
  console.log('  Mar 2026 (Sales Qty = IQ):');
  const iqCell = ws[XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col('IQ')})];
  console.log(`    IQ: ${iqCell ? iqCell.v : 0}`);
}

console.log('\n\nColumn structure summary:');
console.log('Each month block structure:');
console.log('  Col 1: Sales incl VAT');
console.log('  Col 2: Sales Quantity');
console.log('  Col 3: Gross Profit');
console.log('  Col 4: GP Ratio (%)');
console.log('  Col 5: GP (%)');
console.log('\nSo for 2026:');
console.log('  Jan 2026: IE(month), IF(VAT), IG(Qty), IH(GP), II(Ratio), IJ(%)');
console.log('  Feb 2026: IJ(month), IK(VAT), IL(Qty), IM(GP), IN(Ratio), IO(%)');
console.log('  Mar 2026: IP(month), IQ(VAT), IR(Qty), IS(GP), IT(Ratio), IU(%)');
