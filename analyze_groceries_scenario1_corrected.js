const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Groceries - Good Performers (Scenario 1)\n');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const outputDir = 'Spar/Data Extracts';
const outputJsonFile = `${outputDir}/groceries_scenario1_good_performers.json`;

console.log(`Input: ${inputFile}\n`);

// Read Excel
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

// Find months starting at column H (col 7), every 4 columns
const monthLocations = [];
for (let c = 7; c <= range.e.c; c += 4) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const monthHeader = cell ? cell.v?.toString() : '';
  
  if (monthHeader.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: monthHeader,
      qtyCol: c + 1,        // Sales Quantity
      gpPercentCol: c + 3   // GP %
    });
  }
}

console.log(`Found ${monthLocations.length} months\n`);

// Extract products
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
  
  // Calculate linear regression slopes
  const n = monthlyData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  // Qty slope
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].qty;
    sumXY += i * monthlyData[i].qty;
    sumX2 += i * i;
  }
  
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  // GP% slope
  sumY = 0;
  sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumY += monthlyData[i].gp;
    sumXY += i * monthlyData[i].gp;
  }
  
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  // Get latest GP% (last month with data)
  let latestGp = 0;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i].gp > 0) {
      latestGp = monthlyData[i].gp;
      break;
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
    avgQty: parseFloat((totalQty / n).toFixed(2))
  });
}

// Filter good performers (Qty > 0 AND GP% > 0)
const goodProducts = allProducts.filter(p => p.qtyPerMonthGrowth > 0 && p.gpPercentGrowthPerMonth > 0);
goodProducts.sort((a, b) => b.qtyPerMonthGrowth - a.qtyPerMonthGrowth);

console.log(`Total products: ${allProducts.length}`);
console.log(`Good performers: ${goodProducts.length}\n`);

const top20 = goodProducts.slice(0, 20);

// Save JSON
const jsonOutput = {
  timestamp: new Date().toISOString(),
  scenario: 'Scenario 1 - Good Performers (Uptrend)',
  totalAnalyzed: allProducts.length,
  foundGoodPerformers: goodProducts.length,
  period: `${monthLocations[0].month} to ${monthLocations[monthLocations.length - 1].month}`,
  top20: top20,
  allProducts: goodProducts
};

fs.writeFileSync(outputJsonFile, JSON.stringify(jsonOutput, null, 2));
console.log(`✓ Saved: ${outputJsonFile}`);
