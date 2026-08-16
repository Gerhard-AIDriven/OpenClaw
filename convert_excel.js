const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws butchery.xls');
const outputCSV = path.join(__dirname, 'Spar', 'Data Extracts', 'gws_butchery.csv');

try {
  // Read Excel file
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert directly to CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  // Write CSV
  fs.writeFileSync(outputCSV, csv, 'utf8');
  
  // Get row count
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✓ Converted to CSV: ${outputCSV}`);
  console.log(`✓ Rows: ${data.length}`);
  if (data.length > 0) {
    console.log(`✓ Columns: ${Object.keys(data[0]).join(', ')}`);
  }
} catch (err) {
  console.error(`✗ Error: ${err.message}`);
  process.exit(1);
}
