const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Groceries - Dormancy Analysis (SCENARIO 3 - CORRECTED)\n');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const outputDir = 'Spar/Data Extracts';
const referenceDate = new Date('2026-04-19');

console.log(`Input: ${inputFile}`);
console.log(`Reference Date: 2026-04-19\n`);

// Read Excel
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

// Find months: column H (col 7), every 4 columns
const monthLocations = [];
for (let c = 7; c <= range.e.c; c += 4) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const monthHeader = cell ? cell.v?.toString() : '';
  
  if (monthHeader.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: monthHeader,
      qtyCol: c + 1
    });
  }
}

console.log(`Found ${monthLocations.length} months\n`);

// Extract all products with dormancy calculation
const allProducts = [];

for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) continue;
  
  // Find LAST month with sales > 0
  let lastMonth = null;
  let lastQty = 0;
  
  for (let i = 0; i < monthLocations.length; i++) {
    const cellRef = XLSX.utils.encode_cell({r, c: monthLocations[i].qtyCol});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    if (typeof val === 'string') val = parseFloat(val.replace(/\s/g, ''));
    val = parseFloat(val) || 0;
    
    if (val > 0) {
      lastMonth = monthLocations[i].month;
      lastQty = val;
    }
  }
  
  // Calculate dormancy
  let status = 'DEAD STOCK';
  let monthsAgo = 999;
  let lastMonthReadable = 'No sales recorded';
  
  if (lastMonth) {
    const parts = lastMonth.split('/');
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    
    const date = new Date(2000 + y, m - 1, d);
    lastMonthReadable = date.toLocaleDateString('en-US', {year: 'numeric', month: 'long'});
    
    const diffTime = referenceDate - date;
    monthsAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    if (monthsAgo <= 2) {
      status = 'ACTIVE';
    } else if (monthsAgo <= 4) {
      status = 'RECENT';
    } else if (monthsAgo <= 12) {
      status = 'STALE';
    } else {
      status = 'DEAD STOCK';
    }
  }
  
  allProducts.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    lastMonth,
    lastMonthReadable,
    lastQty,
    monthsAgo,
    status
  });
}

// Count by status
const statusCounts = {
  ACTIVE: allProducts.filter(p => p.status === 'ACTIVE').length,
  RECENT: allProducts.filter(p => p.status === 'RECENT').length,
  STALE: allProducts.filter(p => p.status === 'STALE').length,
  'DEAD STOCK': allProducts.filter(p => p.status === 'DEAD STOCK').length
};

console.log(`Total products: ${allProducts.length}\n`);
console.log('Status Distribution:');
console.log(`  ACTIVE (0-2 months):     ${statusCounts.ACTIVE} (${(statusCounts.ACTIVE/allProducts.length*100).toFixed(1)}%)`);
console.log(`  RECENT (3-4 months):     ${statusCounts.RECENT} (${(statusCounts.RECENT/allProducts.length*100).toFixed(1)}%)`);
console.log(`  STALE (5-12 months):     ${statusCounts.STALE} (${(statusCounts.STALE/allProducts.length*100).toFixed(1)}%)`);
console.log(`  DEAD STOCK (12+ months): ${statusCounts['DEAD STOCK']} (${(statusCounts['DEAD STOCK']/allProducts.length*100).toFixed(1)}%)\n`);

// Save JSON
const jsonOutput = {
  timestamp: new Date().toISOString(),
  scenario: 'Scenario 3 - Dormancy Analysis (Corrected)',
  referenceDate: '2026-04-19',
  totalProducts: allProducts.length,
  period: `${monthLocations[0].month} to ${monthLocations[monthLocations.length - 1].month}`,
  statusSummary: statusCounts,
  allProducts: allProducts
};

const outputFile = `${outputDir}/groceries_scenario3_dormancy_corrected.json`;
fs.writeFileSync(outputFile, JSON.stringify(jsonOutput, null, 2));
console.log(`✓ Saved: ${outputFile}`);
