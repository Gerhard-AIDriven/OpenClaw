const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws butchery.xls');

// Read the Excel file
const workbook = XLSX.readFile(xlsFile);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Get raw data with headers
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// The structure should be:
// Row 0: Empty header row with date columns
// Row 1: Header row with "Product Code", "Product Description", "Department", "< Sales Quantity", "GP Ratio (%)", then pairs of "Sales Quantity", "GP Ratio (%)" for each month
// Row 2+: Data rows

console.log('Total rows:', data.length);
console.log('Columns:', data[0].length);
console.log('\nFirst header row (dates):');
console.log(data[0].slice(0, 20));
console.log('\nSecond header row (metrics):');
console.log(data[1].slice(0, 20));

// Now process the actual data
const results = [];

for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
  const row = data[rowIdx];
  
  const productCode = row[0];
  const productDesc = row[1];
  const department = row[2];
  const totalSalesQuantity = parseFloat(row[3]) || 0;
  const totalGP = parseFloat(row[4]) || 0;

  if (!productCode || totalSalesQuantity === 0) continue;

  // Monthly data starts at column 5 (alternating Qty, GP, Qty, GP, ...)
  const monthlyData = [];
  
  // Get month names from header row 0
  for (let col = 5; col < row.length - 1; col += 2) {
    const monthName = data[0][col]; // Date from first header row
    const qty = parseFloat(row[col]) || 0;
    const gp = parseFloat(row[col + 1]) || 0;
    
    if (monthName && monthName.match(/\d{2}\/\d{2}\/\d{2}/)) {
      monthlyData.push({
        month: monthName,
        quantity: qty,
        gpRatio: gp
      });
    }
  }

  if (monthlyData.length < 12) continue;

  // Calculate linear regression trends
  const n = monthlyData.length;
  
  // Quantity trend
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].quantity;
    sumXY += i * monthlyData[i].quantity;
    sumX2 += i * i;
  }
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgQty = sumY / n;
  
  // GP trend
  sumX = 0; sumY = 0; sumXY = 0; sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].gpRatio;
    sumXY += i * monthlyData[i].gpRatio;
    sumX2 += i * i;
  }
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgGP = sumY / n;

  // Flag products with BOTH upward trends
  if (qtySlope > 0 && gpSlope > 0) {
    const firstQty = monthlyData[0].quantity;
    const lastQty = monthlyData[n - 1].quantity;
    const firstGP = monthlyData[0].gpRatio;
    const lastGP = monthlyData[n - 1].gpRatio;
    
    results.push({
      code: productCode,
      description: productDesc,
      totalSales: totalSalesQuantity,
      avgQty: avgQty.toFixed(1),
      avgGP: avgGP.toFixed(2),
      qtySlope: qtySlope.toFixed(3),
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

// Sort by total sales (highest first)
results.sort((a, b) => b.totalSales - a.totalSales);

// Print summary
console.log('\n\n' + '═'.repeat(150));
console.log('🎯 BUTCHERY PRODUCTS: UPWARD TRENDS IN BOTH SALES QUANTITY & GP RATIO');
console.log('═'.repeat(150));
console.log(`\nFound: ${results.length} products with positive trends in quantity AND margin\n`);

results.slice(0, 20).forEach((r, idx) => {
  console.log(`\n${(idx + 1).toString().padStart(2)}. [${r.code}] ${r.description}`);
  console.log(`    Total Sales Volume: ${r.totalSales.toLocaleString()} units`);
  console.log(`    Qty Trend: +${r.qtySlope} units/month | ${r.firstQty} → ${r.lastQty} (+${r.qtyChangePct}%)`);
  console.log(`    GP Trend:  +${r.gpSlope}%/month | ${r.firstGP}% → ${r.lastGP}% (+${r.gpChangePoints} pts)`);
  console.log(`    Monthly avg: ${r.avgQty} units @ ${r.avgGP}% margin`);
});

// Save results
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis.json');
fs.writeFileSync(outputFile, JSON.stringify({
  found: results.length,
  timestamp: new Date().toISOString(),
  products: results.slice(0, 50)  // Top 50
}, null, 2));

console.log('\n' + '═'.repeat(150));
console.log(`✓ Analysis saved: ${outputFile}`);
