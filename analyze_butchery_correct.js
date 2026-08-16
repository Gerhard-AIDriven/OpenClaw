const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws butchery.xls');

// Read the Excel file
const workbook = XLSX.readFile(xlsFile);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Get raw data
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Reading: SPAR Sigma System - Department 2 (Butchery)');
console.log('Period: 1 March 2022 to 1 April 2026');
console.log('Data Points: Sales incl VAT, Sales Quantity, Gross Profit, GP%, GP Ratio%\n');

// The structure:
// Row 0: Empty header with dates
// Row 1: Header with "Product Code", "Product Description", "Department", metrics, then monthly columns
// Row 2+: Data rows

console.log(`Total rows: ${data.length}`);
console.log(`Total columns: ${data[0].length}\n`);

// Identify the structure
console.log('Header Row 1 (first 20 columns):');
console.log(data[1].slice(0, 20));

// Find where monthly data starts and identify the pattern
const monthlyColumns = [];
for (let col = 0; col < data[0].length; col++) {
  const dateStr = data[0][col];
  if (dateStr && dateStr.match(/\d{2}\/\d{2}\/\d{2}/)) {
    monthlyColumns.push(col);
  }
}

console.log(`\nFound ${monthlyColumns.length} month columns starting at column ${monthlyColumns[0]}`);
console.log('First 5 month dates:', monthlyColumns.slice(0, 5).map(col => data[0][col]));

// Now process the data
const results = [];

for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
  const row = data[rowIdx];
  
  const productCode = row[0];
  const productDesc = row[1];
  const department = row[2];

  if (!productCode || department !== 2) continue;

  // For each month, we need: Sales Qty and GP%
  // The pattern repeats for each month: 5 columns per month (Sales incl VAT, Sales Qty, GP, GP%, GP Ratio%)
  
  const monthlyData = [];
  
  for (let monthIdx = 0; monthIdx < monthlyColumns.length; monthIdx++) {
    const baseCol = monthlyColumns[monthIdx];
    
    // Pattern per month (5 data columns):
    // baseCol:     Sales incl VAT
    // baseCol+1:   Sales Quantity
    // baseCol+2:   Gross Profit
    // baseCol+3:   GP %
    // baseCol+4:   GP Ratio %
    
    const salesIncVAT = parseFloat(row[baseCol]) || 0;
    const salesQty = parseFloat(row[baseCol + 1]) || 0;
    const grossProfit = parseFloat(row[baseCol + 2]) || 0;
    const gpPercent = parseFloat(row[baseCol + 3]) || 0;
    const gpRatio = parseFloat(row[baseCol + 4]) || 0;
    
    const monthDate = data[0][baseCol];
    
    monthlyData.push({
      month: monthDate,
      salesIncVAT: salesIncVAT,
      salesQty: salesQty,
      grossProfit: grossProfit,
      gpPercent: gpPercent,
      gpRatio: gpRatio
    });
  }

  if (monthlyData.length < 24) continue; // Need at least 24 months

  // Calculate linear regression trends for Sales Quantity and GP %
  const n = monthlyData.length;
  
  // Sales Quantity trend
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].salesQty;
    sumXY += i * monthlyData[i].salesQty;
    sumX2 += i * i;
  }
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgQty = sumY / n;
  
  // GP % trend
  sumX = 0; sumY = 0; sumXY = 0; sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].gpPercent;
    sumXY += i * monthlyData[i].gpPercent;
    sumX2 += i * i;
  }
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgGP = sumY / n;

  // Flag products with BOTH upward trends
  if (qtySlope > 0 && gpSlope > 0) {
    const firstQty = monthlyData[0].salesQty;
    const lastQty = monthlyData[n - 1].salesQty;
    const firstGP = monthlyData[0].gpPercent;
    const lastGP = monthlyData[n - 1].gpPercent;
    const totalSalesQty = monthlyData.reduce((sum, m) => sum + m.salesQty, 0);
    const totalSalesVal = monthlyData.reduce((sum, m) => sum + m.salesIncVAT, 0);
    const totalGP = monthlyData.reduce((sum, m) => sum + m.grossProfit, 0);
    
    results.push({
      code: productCode,
      description: productDesc.trim(),
      totalSalesQty: totalSalesQty,
      totalSalesVal: totalSalesVal,
      totalGP: totalGP,
      avgQty: avgQty.toFixed(2),
      avgGP: avgGP.toFixed(2),
      qtySlope: qtySlope.toFixed(4),
      gpSlope: gpSlope.toFixed(4),
      months: n,
      firstQty: firstQty.toFixed(1),
      lastQty: lastQty.toFixed(1),
      qtyChangePct: (firstQty > 0 ? ((lastQty - firstQty) / firstQty * 100) : 0).toFixed(1),
      firstGP: firstGP.toFixed(2),
      lastGP: lastGP.toFixed(2),
      gpChangePoints: (lastGP - firstGP).toFixed(2),
    });
  }
}

// Sort by total sales qty (highest first)
results.sort((a, b) => b.totalSalesQty - a.totalSalesQty);

// Print results
console.log('\n' + '═'.repeat(160));
console.log('🎯 BUTCHERY PRODUCTS: UPWARD TRENDS IN BOTH SALES QUANTITY & GP %');
console.log('═'.repeat(160));
console.log(`\nFound: ${results.length} products with positive trends in BOTH Sales Quantity AND GP%\n`);

if (results.length > 0) {
  results.slice(0, 25).forEach((r, idx) => {
    console.log(`\n${(idx + 1).toString().padStart(2)}. [${r.code}] ${r.description}`);
    console.log(`    Total Sales Qty: ${r.totalSalesQty.toLocaleString()} units | Total Sales Value: R${r.totalSalesVal.toLocaleString('en-ZA', {minimumFractionDigits: 2})}`);
    console.log(`    Total GP: R${r.totalGP.toLocaleString('en-ZA', {minimumFractionDigits: 2})} | Monthly Avg GP%: ${r.avgGP}%`);
    console.log(`    Qty Trend:  +${r.qtySlope} units/month (${r.firstQty} → ${r.lastQty}, ${r.qtyChangePct}%)`);
    console.log(`    GP% Trend:  +${r.gpSlope}% per month (${r.firstGP}% → ${r.lastGP}%, +${r.gpChangePoints} pts)`);
  });

  // Summary table
  console.log('\n' + '═'.repeat(160));
  console.log('RANKED BY TOTAL SALES QUANTITY');
  console.log('═'.repeat(160));
  console.log(`Rank | Code   | Product Name                        | Total Sales Qty | Qty Slope/mo | GP% Slope/mo | Qty% Chg | GP% Chg`);
  console.log('-'.repeat(160));
  results.slice(0, 20).forEach((r, idx) => {
    const desc = r.description.substring(0, 33).padEnd(33);
    console.log(`${(idx + 1).toString().padStart(4)} | ${r.code.toString().padEnd(6)} | ${desc} | ${r.totalSalesQty.toLocaleString().padStart(14)} | ${r.qtySlope.padStart(12)} | ${r.gpSlope.padStart(12)} | ${r.qtyChangePct.padStart(7)} | ${r.gpChangePoints.padStart(7)}`);
  });
} else {
  console.log('No products found with both upward trends.');
}

// Save to file
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis_revised.json');
fs.writeFileSync(outputFile, JSON.stringify({
  found: results.length,
  timestamp: new Date().toISOString(),
  analysisType: 'Sales Quantity AND GP% Uptrend Analysis',
  period: '1 March 2022 to 1 April 2026',
  dataSource: 'SPAR Sigma System - Department 2 (Butchery)',
  products: results.slice(0, 50)  // Top 50
}, null, 2));

console.log(`\n✓ Analysis saved: ${outputFile}`);
