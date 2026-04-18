const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws_butchery.csv');
const csvContent = fs.readFileSync(csvFile, 'utf8');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Check first product (index 2, after headers)
const firstProduct = records[2];
console.log('First product:', firstProduct['Product Code'], firstProduct['Product Description']);
console.log('Total Sales:', firstProduct['Totals']);

// List all column names
const colKeys = Object.keys(firstProduct);
console.log(`\nTotal columns: ${colKeys.length}`);
console.log('\nFirst 30 column names:');
colKeys.slice(0, 30).forEach((key, idx) => {
  console.log(`  ${idx}: "${key}"`);
});

// Find date columns
console.log('\nDate columns found:');
colKeys.forEach((key, idx) => {
  if (key.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
    console.log(`  Col ${idx}: "${key}"`);
    // Print next 3 values
    console.log(`    Next cols: "${colKeys[idx+1]}", "${colKeys[idx+2]}", "${colKeys[idx+3]}"`);
    console.log(`    Values: ${firstProduct[key]} | ${firstProduct[colKeys[idx+1]]} | ${firstProduct[colKeys[idx+2]]} | ${firstProduct[colKeys[idx+3]]}`);
  }
});
