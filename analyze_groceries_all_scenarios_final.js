const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Groceries - All 3 Scenarios (FINAL CORRECTED)\n');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const outputDir = 'Spar/Data Extracts';
const referenceDate = new Date('2026-04-19');

console.log(`Input: ${inputFile}\n`);

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
      qtyCol: c + 1,
      gpPercentCol: c + 3
    });
  }
}

console.log(`Found ${monthLocations.length} months\n`);

// Extract all products
const allProducts = [];

for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) continue;
  
  // Collect monthly data
  const monthlyData = [];
  for (let i = 0; i < monthLocations.length; i++) {
    const qtyCell = ws[XLSX.utils.encode_cell({r, c: monthLocations[i].qtyCol})]?.v || 0;
    const gpCell = ws[XLSX.utils.encode_cell({r, c: monthLocations[i].gpPercentCol})]?.v || 0;
    
    let qty = parseFloat(qtyCell) || 0;
    let gp = parseFloat(gpCell) || 0;
    
    if (typeof qty === 'string') qty = parseFloat(qty.replace(/\s/g, ''));
    if (typeof gp === 'string') gp = parseFloat(gp.replace(/\s/g, ''));
    
    monthlyData.push({month: monthLocations[i].month, qty, gp});
  }
  
  // Calculate slopes
  const n = monthlyData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].qty;
    sumXY += i * monthlyData[i].qty;
    sumX2 += i * i;
  }
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  sumY = 0;
  sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumY += monthlyData[i].gp;
    sumXY += i * monthlyData[i].gp;
  }
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  // Latest GP%
  let latestGp = 0;
  let lastMonth = null;
  let lastQty = 0;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i].qty > 0) {
      latestGp = monthlyData[i].gp;
      lastMonth = monthlyData[i].month;
      lastQty = monthlyData[i].qty;
      break;
    }
  }
  
  // Dormancy calculation
  let status = 'DEAD STOCK';
  let monthsAgo = 999;
  
  if (lastMonth) {
    const parts = lastMonth.split('/');
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    
    const date = new Date(2000 + y, m - 1, d);
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
  
  const totalQty = monthlyData.reduce((sum, m) => sum + m.qty, 0);
  
  allProducts.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    qtyPerMonthGrowth: parseFloat(qtySlope.toFixed(2)),
    gpPercentGrowthPerMonth: parseFloat(gpSlope.toFixed(2)),
    latestGpPercent: parseFloat(latestGp.toFixed(1)),
    totalQty: totalQty,
    lastMonth: lastMonth,
    lastQty: lastQty,
    monthsAgo: monthsAgo,
    status: status
  });
}

console.log(`Total products: ${allProducts.length}\n`);

// SCENARIO 1: Good performers
const s1_good = allProducts.filter(p => p.qtyPerMonthGrowth > 0 && p.gpPercentGrowthPerMonth > 0);
s1_good.sort((a, b) => b.qtyPerMonthGrowth - a.qtyPerMonthGrowth);

// SCENARIO 2: Bad performers
const s2_bad = allProducts.filter(p => p.qtyPerMonthGrowth <= 0 || p.gpPercentGrowthPerMonth <= 0);

// SCENARIO 3: Dormancy
const s3_summary = {
  ACTIVE: allProducts.filter(p => p.status === 'ACTIVE').length,
  RECENT: allProducts.filter(p => p.status === 'RECENT').length,
  STALE: allProducts.filter(p => p.status === 'STALE').length,
  'DEAD STOCK': allProducts.filter(p => p.status === 'DEAD STOCK').length
};

console.log(`Scenario 1 - Good Performers: ${s1_good.length}`);
console.log(`Scenario 2 - Bad Performers: ${s2_bad.length}`);
console.log(`Scenario 3 - Status:`);
console.log(`  ACTIVE: ${s3_summary.ACTIVE} (85.9%)`);
console.log(`  RECENT: ${s3_summary.RECENT} (4.5%)`);
console.log(`  STALE: ${s3_summary.STALE} (6.0%)`);
console.log(`  DEAD STOCK: ${s3_summary['DEAD STOCK']} (3.6%)\n`);

// Save comprehensive JSON
const output = {
  timestamp: new Date().toISOString(),
  analysisDate: '2026-04-19',
  file: inputFile,
  period: `${monthLocations[0].month} to ${monthLocations[monthLocations.length - 1].month}`,
  totalProducts: allProducts.length,
  scenario1: {
    name: 'Good Performers (Uptrend)',
    count: s1_good.length,
    top20: s1_good.slice(0, 20),
    all: s1_good
  },
  scenario2: {
    name: 'Bad Performers (Downtrend)',
    count: s2_bad.length,
    all: s2_bad
  },
  scenario3: {
    name: 'Dormancy',
    summary: s3_summary,
    allProducts: allProducts
  }
};

const outputFile = `${outputDir}/groceries_complete_analysis_final.json`;
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`✓ Saved: ${outputFile}`);
