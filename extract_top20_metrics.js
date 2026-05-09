const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 Extracting Top 20 Good Performers with Full Metrics\n');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';

// Read Excel file
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

// Find all month columns
const monthLocations = [];
for (let c = 0; c <= range.e.c; c++) {
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

console.log(`Found ${monthLocations.length} months of data\n`);

// Extract all products
const allProducts = [];

for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) continue;
  
  // Collect all monthly qty and GP% values
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
  
  // For Qty slope
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].qty;
    sumXY += i * monthlyData[i].qty;
    sumX2 += i * i;
  }
  
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  // For GP% slope
  sumY = 0;
  sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumY += monthlyData[i].gp;
    sumXY += i * monthlyData[i].gp;
  }
  
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  
  // Get current (last) month metrics
  const lastQty = monthlyData[n - 1].qty;
  const lastGp = monthlyData[n - 1].gp;
  const totalQty = monthlyData.reduce((sum, m) => sum + m.qty, 0);
  
  allProducts.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    qtySlope: qtySlope,
    gpSlope: gpSlope,
    currentGp: lastGp,
    totalQty: totalQty,
    avgQty: (totalQty / n).toFixed(2)
  });
}

// Filter and sort good performers
const goodProducts = allProducts.filter(p => p.qtySlope > 0 && p.gpSlope > 0);
goodProducts.sort((a, b) => b.qtySlope - a.qtySlope);

const top20 = goodProducts.slice(0, 20);

console.log('TOP 20 GOOD PERFORMERS (with Current GP%)');
console.log('===========================================\n');
console.log('Rank | Code | Product | Qty/Mo | GP%/Mo | Current GP%');
console.log('-----|------|---------|--------|--------|------------');

top20.forEach((p, i) => {
  const qtyStr = p.qtySlope.toFixed(2).padEnd(6);
  const gpStr = p.gpSlope.toFixed(2).padEnd(6);
  const currentGpStr = p.currentGp.toFixed(1).padEnd(11);
  console.log(`${(i+1).toString().padStart(4)} | ${p.code.padEnd(6)} | ${p.description.substring(0, 20).padEnd(20)} | ${qtyStr} | ${gpStr} | ${currentGpStr}`);
});

// Save as JSON for later use
const jsonOutput = {
  top20: top20.map((p, i) => ({
    rank: i + 1,
    code: p.code,
    description: p.description,
    qtyPerMonthGrowth: parseFloat(p.qtySlope.toFixed(2)),
    gpPercentGrowth: parseFloat(p.gpSlope.toFixed(2)),
    currentGpPercent: parseFloat(p.currentGp.toFixed(1))
  }))
};

fs.writeFileSync('Spar/Data Extracts/groceries_top20_metrics.json', JSON.stringify(jsonOutput, null, 2));
console.log('\n✓ Saved: Spar/Data Extracts/groceries_top20_metrics.json');
