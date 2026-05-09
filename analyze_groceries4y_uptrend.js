const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Groceries4y Department - Good Performers Analysis (Scenario 1)\n');

const inputFile = 'Spar/Data Extracts/gws groceries4y.xls';
const outputJsonFile = 'Spar/Data Extracts/groceries4y_uptrend_analysis.json';
const outputHtmlFile = 'Spar/Data Extracts/groceries4y_uptrend_analysis_report.html';

console.log(`Input File: ${inputFile}`);
console.log(`Analysis Period: 1 March 2022 - 1 April 2026 (49 months)\n`);

// Read Excel file
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log(`Sheet dimensions: ${range.e.r + 1} rows × ${range.e.c + 1} columns\n`);

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

// Extract all products with their monthly values
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
  
  // Calculate summary metrics
  const totalQty = monthlyData.reduce((sum, m) => sum + m.qty, 0);
  const firstQty = monthlyData[0].qty;
  const lastQty = monthlyData[n - 1].qty;
  const firstGp = monthlyData[0].gp;
  const lastGp = monthlyData[n - 1].gp;
  const avgQty = totalQty / n;
  
  allProducts.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    totalSalesQty: totalQty,
    avgQty: avgQty.toFixed(2),
    qtySlope: qtySlope.toFixed(4),
    gpSlope: gpSlope.toFixed(4),
    months: n,
    firstQty: firstQty.toFixed(3),
    lastQty: lastQty.toFixed(3),
    qtyChangePct: firstQty > 0 ? (((lastQty - firstQty) / firstQty) * 100).toFixed(1) : '0.0',
    firstGp: firstGp.toFixed(2),
    lastGp: lastGp.toFixed(2),
    gpChangePoints: (lastGp - firstGp).toFixed(2),
    qtySlope_num: qtySlope,
    gpSlope_num: gpSlope,
    totalSalesQty_num: totalQty
  });
}

// Identify GOOD PERFORMERS (Qty slope > 0 AND GP slope > 0)
const goodProducts = allProducts.filter(p => 
  parseFloat(p.qtySlope) > 0 && parseFloat(p.gpSlope) > 0
);

console.log(`✓ Total products analyzed: ${allProducts.length}`);
console.log(`✓ Good performers identified: ${goodProducts.length}\n`);

// Sort by growth (Qty slope descending)
goodProducts.sort((a, b) => parseFloat(b.qtySlope) - parseFloat(a.qtySlope));

// Top 20
const top20 = goodProducts.slice(0, 20);

console.log('--- Top 20 Growth Products (by Qty Slope) ---');
top20.forEach((p, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | Qty: ${p.qtySlope}, GP: ${p.gpSlope}`);
});

// Save JSON
const jsonOutput = {
  found: goodProducts.length,
  timestamp: new Date().toISOString(),
  analysisType: 'Good Performers (Uptrend Analysis)',
  period: '1 March 2022 to 1 April 2026',
  dataSource: 'SPAR Sigma System - Department: Groceries4y',
  top20: top20,
  products: goodProducts
};

fs.writeFileSync(outputJsonFile, JSON.stringify(jsonOutput, null, 2));
console.log(`\n✓ JSON saved: ${outputJsonFile}`);

// Create HTML report
let productsHtml = top20.map((p, idx) =>
  '<tr><td>' + (idx + 1) + '</td><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td style="text-align: right;">' + parseInt(p.totalSalesQty) + '</td><td style="text-align: right;">' + p.avgQty + '</td><td style="text-align: right;"><strong>' + p.qtySlope + '</strong></td><td style="text-align: right;"><strong>' + p.gpSlope + '</strong></td></tr>'
).join('');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPAR Groceries4y - Uptrend Analysis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 2.2em; margin-bottom: 8px; }
        .metadata { background: #f9f9f9; padding: 15px 30px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; font-size: 0.9em; gap: 20px; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .section h2 { color: #4caf50; font-size: 1.6em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #4caf50; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-left: 4px solid #4caf50; border-radius: 4px; }
        .stat-card .value { font-size: 2.5em; font-weight: bold; color: #4caf50; }
        .stat-card .label { font-size: 0.95em; color: #666; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85em; }
        thead { background: #4caf50; color: white; }
        th { padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f1f8f4; }
        .code { font-family: monospace; font-weight: 600; color: #4caf50; }
        .footer { background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 0.85em; color: #999; }
        .alert { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert strong { color: #2e7d32; }
        .recommendation { background: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 12px 0; border-radius: 4px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Groceries4y Department - Good Performers (Uptrend Analysis)</h1>
            <p>Products with Growing Sales Volume AND Improving Profitability</p>
        </div>
        
        <div class="metadata">
            <div><strong>Report Date:</strong> 19 April 2026</div>
            <div><strong>Analysis Period:</strong> 1 March 2022 – 1 April 2026 (49 months)</div>
            <div><strong>Data Source:</strong> SPAR Sigma System</div>
            <div><strong>Department:</strong> Groceries4y</div>
            <div><strong>Good Performers Found:</strong> ${goodProducts.length}</div>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${goodProducts.length}</div>
                    <div class="label">Good Performers</div>
                </div>
                <div class="stat-card">
                    <div class="value">${top20.length}</div>
                    <div class="label">Top 20 Listed</div>
                </div>
                <div class="stat-card">
                    <div class="value">${(goodProducts.length / allProducts.length * 100).toFixed(0)}%</div>
                    <div class="label">% of Portfolio</div>
                </div>
            </div>
            
            <div class="alert">
                <strong>✓ Finding:</strong> ${goodProducts.length} groceries4y products show uptrend in both sales volume AND profitability. These are expansion candidates for promotion and increased shelf space.
            </div>
        </div>
        
        <div class="section">
            <h2>🏆 Top 20 Growth Products</h2>
            <p style="margin-bottom: 15px;">Ranked by sales growth rate (Qty Slope). These products deliver the strongest growth momentum.</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">Rank</th>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 40%;">Product Description</th>
                        <th style="width: 90px; text-align: right;">Total Units</th>
                        <th style="width: 100px; text-align: right;">Avg/Month</th>
                        <th style="width: 110px; text-align: right;">Qty Slope</th>
                        <th style="width: 110px; text-align: right;">GP% Slope</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>💡 Strategic Recommendations</h2>
            <h3>Immediate Actions (Next 2-4 weeks):</h3>
            <div class="recommendation">
                <strong>1. Increase Shelf Space:</strong> Top 10 products deserve prime positioning. Add 10-15% more linear meters for best performers.
            </div>
            <div class="recommendation">
                <strong>2. Promotional Focus:</strong> Feature top 5 products in weekly promotions to accelerate growth momentum.
            </div>
            <div class="recommendation">
                <strong>3. Stock Optimization:</strong> Increase safety stock for top 10 — these items are growing and stockouts lose revenue.
            </div>
            
            <h3>Medium-term (1-3 months):</h3>
            <div class="recommendation">
                <strong>4. Cross-Selling:</strong> Bundle top performers with related slower-moving products to boost category performance.
            </div>
            <div class="recommendation">
                <strong>5. Monitor Margin Trends:</strong> Top performers show positive GP% slope, but watch for cost inflation on key items.
            </div>
        </div>
        
        <div class="footer">
            <p>Report Generated: 19 April 2026 | SPAR Groceries4y Department | Good Performers Analysis (Scenario 1)</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(outputHtmlFile, htmlContent);
console.log(`✓ HTML report: ${outputHtmlFile}`);

console.log(`\n✓ Analysis complete!`);
