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

// Skip first two header rows
const data = records.slice(2);

const results = [];

data.forEach(row => {
  const productCode = row['Product Code'];
  const productDesc = row['Product Description'];
  const totalSales = parseFloat(row['Totals']?.replace(/\s/g, '')) || 0;

  if (!productCode || totalSales === 0) return;

  // Extract monthly data - pattern is: Date header, then pairs of Qty/GP values
  const monthlyData = [];
  const colKeys = Object.keys(row);
  
  // Find date columns (format like '01/03/22')
  for (let i = 0; i < colKeys.length; i++) {
    const key = colKeys[i];
    if (key.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      // Next two columns: Qty and GP (skipping the empty column)
      const qtyIdx = i + 1;
      const gpIdx = i + 3; // skip empty column
      
      const qtyKey = colKeys[qtyIdx];
      const gpKey = colKeys[gpIdx];
      
      const quantityValue = parseFloat(row[qtyKey]?.replace(/\s/g, '')) || 0;
      const gpValue = parseFloat(row[gpKey]?.replace(/\s/g, '')) || 0;
      
      monthlyData.push({
        month: key,
        quantity: quantityValue,
        gpRatio: gpValue
      });
    }
  }

  if (monthlyData.length < 12) return; // Need at least 12 months

  // Calculate linear regression for both metrics
  const n = monthlyData.length;
  
  // Quantity slope
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].quantity;
    sumXY += i * monthlyData[i].quantity;
    sumX2 += i * i;
  }
  const qtySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // GP slope
  sumX = 0; sumY = 0; sumXY = 0; sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += monthlyData[i].gpRatio;
    sumXY += i * monthlyData[i].gpRatio;
    sumX2 += i * i;
  }
  const gpSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Flag if BOTH slopes are positive
  if (qtySlope > 0 && gpSlope > 0) {
    const firstQty = monthlyData[0].quantity;
    const lastQty = monthlyData[n - 1].quantity;
    const firstGP = monthlyData[0].gpRatio;
    const lastGP = monthlyData[n - 1].gpRatio;
    
    const qtyPctChange = firstQty > 0 ? ((lastQty - firstQty) / firstQty * 100) : 0;
    
    results.push({
      code: productCode,
      description: productDesc.trim(),
      totalSales: totalSales,
      qtySlope: qtySlope.toFixed(3),
      gpSlope: gpSlope.toFixed(4),
      months: n,
      firstQty: firstQty.toFixed(1),
      lastQty: lastQty.toFixed(1),
      qtyChange: qtyPctChange.toFixed(1),
      firstGP: firstGP.toFixed(2),
      lastGP: lastGP.toFixed(2),
      gpChange: (lastGP - firstGP).toFixed(2),
    });
  }
});

// Sort by total sales (highest first)
results.sort((a, b) => b.totalSales - a.totalSales);

// Print results
console.log('='.repeat(150));
console.log('🚀 PRODUCTS WITH UPWARD TRENDS IN BOTH SALES QUANTITY & GP RATIO');
console.log('='.repeat(150));
console.log(`\n✓ Found: ${results.length} products\n`);

if (results.length > 0) {
  results.forEach((r, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. [${r.code}] ${r.description}`);
    console.log(`    Total Sales Volume: ${r.totalSales.toLocaleString()}`);
    console.log(`    Qty Trend: +${r.qtySlope} units/month | ${r.firstQty} → ${r.lastQty} (${r.qtyChange}%)`);
    console.log(`    GP Trend:  +${r.gpSlope}%/month | ${r.firstGP}% → ${r.lastGP}% (${r.gpChange}% pts)`);
    console.log('');
  });

  // Summary table
  console.log('='.repeat(150));
  console.log('RANKED BY TOTAL SALES VOLUME');
  console.log('='.repeat(150));
  console.log(`Rank | Code    | Product Name                        | Total Sales | Qty Slope/mo | GP Slope/mo | Qty% Chg | GP% Chg`);
  console.log('-'.repeat(150));
  results.forEach((r, idx) => {
    const desc = r.description.substring(0, 33).padEnd(33);
    console.log(`${(idx + 1).toString().padStart(4)} | ${r.code.padEnd(7)} | ${desc} | ${r.totalSales.toFixed(0).padStart(11)} | ${r.qtySlope.padStart(12)} | ${r.gpSlope.padStart(11)} | ${r.qtyChange.padStart(7)} | ${r.gpChange.padStart(7)}`);
  });
} else {
  console.log('No products found with both upward quantity and GP trends.');
}

// Save to file
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`\n✓ Analysis saved to: ${outputFile}`);
