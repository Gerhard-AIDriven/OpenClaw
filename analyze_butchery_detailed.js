const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws_butchery.csv');
const csvContent = fs.readFileSync(csvFile, 'utf8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Skip header row
const data = records.slice(2);

const results = [];

data.forEach(row => {
  const productCode = row['Product Code'];
  const productDesc = row['Product Description'];
  const totalSales = parseFloat(row['Totals']) || 0;

  if (!productCode || totalSales === 0) return;

  // Extract monthly data - column pattern alternates Qty, GP%, Qty, GP%, etc.
  const monthlyData = [];
  const monthlyOrder = [];
  
  // Build list of all columns with their indices
  const colKeys = Object.keys(row);
  
  // Find date columns (format DD/MM/YY)
  let monthIdx = 0;
  for (let i = 0; i < colKeys.length; i++) {
    const key = colKeys[i];
    if (key.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const quantityValue = parseFloat(row[key]) || 0;
      // GP Ratio is in the next position
      const nextIdx = i + 1;
      const gpValue = parseFloat(row[colKeys[nextIdx]]) || 0;
      
      monthlyData.push({
        month: key,
        quantity: quantityValue,
        gpRatio: gpValue
      });
      monthIdx++;
      
      if (monthIdx > 48) break; // Cap at ~4 years
    }
  }

  if (monthlyData.length < 6) return; // Need at least 6 months of data

  // Calculate linear regression for both metrics
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
  
  // GP Trend
  sumX = 0; sumY = 0; sumXY = 0; sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].gpRatio;
    sumXY += i * monthlyData[i].gpRatio;
    sumX2 += i * i;
  }
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Flag if BOTH slopes are positive (upward trend)
  if (qtySlope > 0 && gpSlope > 0) {
    const firstQty = monthlyData[0].quantity;
    const lastQty = monthlyData[n - 1].quantity;
    const firstGP = monthlyData[0].gpRatio;
    const lastGP = monthlyData[n - 1].gpRatio;
    
    results.push({
      code: productCode,
      description: productDesc,
      totalSales: totalSales,
      qtySlope: qtySlope.toFixed(3),
      gpSlope: gpSlope.toFixed(4),
      months: n,
      firstQty: firstQty.toFixed(1),
      lastQty: lastQty.toFixed(1),
      qtyChange: ((lastQty - firstQty) / (firstQty || 1) * 100).toFixed(1),
      firstGP: firstGP.toFixed(2),
      lastGP: lastGP.toFixed(2),
      gpChange: (lastGP - firstGP).toFixed(2),
    });
  }
});

// Sort by total sales (highest first)
results.sort((a, b) => b.totalSales - a.totalSales);

// Print results
console.log('='.repeat(140));
console.log('PRODUCTS WITH UPWARD TRENDS IN BOTH SALES QUANTITY & GP RATIO (Linear Regression Analysis)');
console.log('='.repeat(140));
console.log(`\nFound: ${results.length} products with positive slopes in both metrics\n`);

results.forEach((r, idx) => {
  console.log(`\n${idx + 1}. [${r.code}] ${r.description}`);
  console.log(`   Total Sales Volume: ${r.totalSales.toLocaleString()}`);
  console.log(`   Data Points: ${r.months} months`);
  console.log(`   Qty Trend: Slope +${r.qtySlope} units/month | ${r.firstQty} → ${r.lastQty} (${r.qtyChange}% change)`);
  console.log(`   GP Trend: Slope +${r.gpSlope}%/month | ${r.firstGP}% → ${r.lastGP}% (${r.gpChange}% change)`);
});

// Summary table
if (results.length > 0) {
  console.log('\n' + '='.repeat(140));
  console.log('SUMMARY TABLE (Ranked by Total Sales Volume)');
  console.log('='.repeat(140));
  console.log(`Rank | Code    | Description                    | Total Sales | Qty Slope | GP Slope | Months | Qty% Chg | GP% Chg`);
  console.log('-'.repeat(140));
  results.slice(0, 20).forEach((r, idx) => {
    const desc = r.description.substring(0, 28).padEnd(28);
    console.log(`${(idx + 1).toString().padStart(4)} | ${r.code.padEnd(7)} | ${desc} | ${r.totalSales.toFixed(0).padStart(11)} | ${r.qtySlope.padStart(9)} | ${r.gpSlope.padStart(8)} | ${r.months.toString().padStart(6)} | ${r.qtyChange.padStart(7)} | ${r.gpChange.padStart(7)}`);
  });
}

// Save to file
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`\n✓ Analysis saved to: ${outputFile}`);
