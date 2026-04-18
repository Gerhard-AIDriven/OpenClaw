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

  // Extract monthly data - alternating Quantity and GP Ratio columns
  const monthlyData = [];
  
  // Get all column keys, filter for monthly data
  Object.keys(row).forEach((key, idx) => {
    if (key.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const quantityValue = parseFloat(row[key]) || 0;
      // GP Ratio is in the next column (odd-indexed in monthly pairs)
      const nextKey = Object.keys(row)[idx + 1];
      const gpValue = parseFloat(row[nextKey]) || 0;
      
      monthlyData.push({
        month: key,
        quantity: quantityValue,
        gpRatio: gpValue
      });
    }
  });

  if (monthlyData.length < 2) return;

  // Calculate trends: compare first 12 months to last 12 months
  const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
  const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));

  const avgQtyFirst = firstHalf.reduce((sum, m) => sum + m.quantity, 0) / firstHalf.length;
  const avgQtySecond = secondHalf.reduce((sum, m) => sum + m.quantity, 0) / secondHalf.length;
  const avgGPFirst = firstHalf.reduce((sum, m) => sum + m.gpRatio, 0) / firstHalf.length;
  const avgGPSecond = secondHalf.reduce((sum, m) => sum + m.gpRatio, 0) / secondHalf.length;

  const qtyTrend = avgQtySecond - avgQtyFirst;
  const gpTrend = avgGPSecond - avgGPFirst;

  // Flag items with upward trend in BOTH quantity AND GP ratio
  if (qtyTrend > 0 && gpTrend > 0) {
    results.push({
      code: productCode,
      description: productDesc,
      totalSales: totalSales,
      qtyTrendUp: qtyTrend.toFixed(2),
      gpTrendUp: gpTrend.toFixed(2),
      avgQtyFirst: avgQtyFirst.toFixed(2),
      avgQtySecond: avgQtySecond.toFixed(2),
      avgGPFirst: avgGPFirst.toFixed(2),
      avgGPSecond: avgGPSecond.toFixed(2),
    });
  }
});

// Sort by total sales (highest first)
results.sort((a, b) => b.totalSales - a.totalSales);

// Print results
console.log('='.repeat(120));
console.log('PRODUCTS WITH UPWARD TRENDS IN BOTH SALES QUANTITY & GP RATIO');
console.log('='.repeat(120));
console.log(`\nFound: ${results.length} products\n`);

results.forEach((r, idx) => {
  console.log(`${idx + 1}. ${r.code} - ${r.description}`);
  console.log(`   Total Sales Volume: ${r.totalSales.toLocaleString()}`);
  console.log(`   Qty Trend: +${r.qtyTrendUp} (${r.avgQtyFirst} → ${r.avgQtySecond})`);
  console.log(`   GP Trend: +${r.gpTrendUp}% (${r.avgGPFirst}% → ${r.avgGPSecond}%)`);
  console.log('');
});

// Summary
console.log('='.repeat(120));
console.log('SUMMARY (ranked by total sales volume)');
console.log('='.repeat(120));
console.log(`Code\t\tDescription\t\t\t\tTotal Sales\tQty↑\tGP%↑`);
console.log('-'.repeat(120));
results.forEach(r => {
  console.log(`${r.code}\t\t${r.description.padEnd(30)}\t${r.totalSales.toFixed(0)}\t\t${r.qtyTrendUp}\t${r.gpTrendUp}`);
});

// Save to file
const outputFile = path.join(__dirname, 'Spar', 'Data Extracts', 'butchery_uptrend_analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`\n✓ Analysis saved to: ${outputFile}`);
