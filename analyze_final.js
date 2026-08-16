const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFile = path.join(__dirname, 'Spar', 'Data Extracts', 'gws_butchery.csv');
const csvContent = fs.readFileSync(csvFile, 'utf8');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Skip first two header rows (indices 0,1) - data starts at 2
const data = records.slice(2);

const results = [];

data.forEach(row => {
  const productCode = row[''];
  const productDesc = row['Totals'];
  const totalSales = parseFloat(row[' ']?.replace(/\s/g, '')) || 0;

  if (!productCode || !productDesc || totalSales === 0) return;

  // Monthly data: date columns contain qty, and next column with empty header contains GP%
  // Pattern: Date(Qty), empty(GP%), Date(Qty), empty(GP%), ...
  
  const colKeys = Object.keys(row);
  const monthlyData = [];
  
  // Process date columns only
  for (let i = 0; i < colKeys.length; i++) {
    const key = colKeys[i];
    
    // Date column found
    if (key.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const qty = parseFloat(row[key]?.replace(/\s/g, '')) || 0;
      
      // GP is in the next column (which typically has empty header or is a space)
      const nextKey = colKeys[i + 1];
      const gp = parseFloat(row[nextKey]?.replace(/\s/g, '')) || 0;
      
      monthlyData.push({
        month: key,
        quantity: qty,
        gpRatio: gp
      });
    }
  }

  if (monthlyData.length < 12) return;

  // Calculate trend using linear regression
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

  // Only flag positive slopes in BOTH metrics
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
      avgQty: avgQty.toFixed(1),
      avgGP: avgGP.toFixed(2),
      qtySlope: qtySlope.toFixed(3),
      gpSlope: gpSlope.toFixed(4),
      months: n,
      firstQty: firstQty.toFixed(1),
      lastQty: lastQty.toFixed(1),
      qtyChangePct: qtyPctChange.toFixed(1),
      firstGP: firstGP.toFixed(2),
      lastGP: lastGP.toFixed(2),
      gpChangePts: (lastGP - firstGP).toFixed(2),
    });
  }
});

// Sort by total sales (highest first)
results.sort((a, b) => b.totalSales - a.totalSales);

// Print results
console.log('╔' + '═'.repeat(148) + '╗');
console.log('║ 🎯 BUTCHERY PRODUCTS: UPWARD TRENDS IN BOTH SALES QUANTITY & GP RATIO' + ' '.repeat(80) + '║');
console.log('╚' + '═'.repeat(148) + '╝');
console.log(`\n✓ Found: ${results.length} products with positive trends in quantity AND margin\n`);

if (results.length > 0) {
  // Detailed view
  results.slice(0, 10).forEach((r, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. [${r.code}] ${r.description}`);
    console.log(`    Total Sales: ${r.totalSales.toLocaleString().padStart(10)} units`);
    console.log(`    Qty Trend:  +${r.qtySlope}/mo  (${r.firstQty} → ${r.lastQty}, +${r.qtyChangePct}%)`);
    console.log(`    GP Trend:   +${r.gpSlope}%/mo  (${r.firstGP}% → ${r.lastGP}%, +${r.gpChangePts} pts)`);
    console.log(`    Monthly avg qty: ${r.avgQty} | avg GP: ${r.avgGP}%\n`);
  });

  // Summary table
  console.log('╔' + '═'.repeat(148) + '╗');
  console.log('║ RANKED BY TOTAL SALES VOLUME' + ' '.repeat(119) + '║');
  console.log('╠' + '═'.repeat(148) + '╣');
  console.log('║ # │ Code   │ Product Name                      │ Total Sales │ Qty↑/mo │ GP%↑/mo │ Qty% │ GP pts │ Monthly Avg Qty │ Avg GP' + ' '.repeat(38) + '║');
  console.log('╠' + '═'.repeat(148) + '╣');
  
  results.slice(0, 15).forEach((r, idx) => {
    const desc = (r.code + ' ' + r.description).substring(0, 31).padEnd(31);
    const line = `║ ${(idx + 1).toString().padStart(2)} │ ${r.code} │ ${desc} │ ${r.totalSales.toFixed(0).padStart(11)} │ ${r.qtySlope.padStart(7)} │ ${r.gpSlope.padStart(7)} │ ${r.qtyChangePct.padStart(4)} │ ${r.gpChangePts.padStart(6)} │ ${r.avgQty.padStart(14)} │ ${r.avgGP.padStart(6)} %` + ' '.repeat(41) + '║';
    console.log(line);
  });
  console.log('╚' + '═'.repeat(148) + '╝\n');
} else {
  console.log('ℹ️  No products found with upward trends in BOTH quantity and GP%.');
  console.log('   This suggests a trade-off: products either grow volume OR margin, but rarely both.');
}

// Save to file
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis.json');
fs.writeFileSync(outputFile, JSON.stringify({
  found: results.length,
  timestamp: new Date().toISOString(),
  products: results
}, null, 2));
console.log(`✓ Full analysis saved to: ${outputFile}\n`);
