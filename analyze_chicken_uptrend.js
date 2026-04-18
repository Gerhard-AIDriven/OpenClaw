const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Chicken Department - Good Performers Analysis (Scenario 1)\n');

const inputFile = 'Spar/Data Extracts/gws chicken.xls';
const outputJsonFile = 'Spar/Data Extracts/chicken_uptrend_analysis.json';
const outputHtmlFile = 'Spar/Data Extracts/chicken_uptrend_analysis_report.html';

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
      qtyCol: c + 1,     // Sales Qty
      gpPercentCol: c + 4 // GP%
    });
  }
}

console.log(`Found ${monthLocations.length} months of data\n`);

// Extract all products with their monthly values
const products = [];

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
  
  // Calculate linear regression slopes for Qty and GP%
  const n = monthlyData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  let sumY2 = 0, sumX2Y = 0;
  
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
  
  // Check if product meets UPTREND criteria (both slopes > 0)
  if (qtySlope > 0 && gpSlope > 0) {
    products.push({
      code: code.toString().trim(),
      description: desc.toString().trim(),
      totalSalesQty: totalQty,
      avgQty: (totalQty / n).toFixed(2),
      qtySlope: qtySlope.toFixed(4),
      gpSlope: gpSlope.toFixed(4),
      months: n,
      firstQty: firstQty.toFixed(3),
      lastQty: lastQty.toFixed(3),
      qtyChangePct: firstQty > 0 ? (((lastQty - firstQty) / firstQty) * 100).toFixed(1) : '0.0',
      firstGp: firstGp.toFixed(2),
      lastGp: lastGp.toFixed(2),
      gpChangePoints: (lastGp - firstGp).toFixed(2)
    });
  }
}

// Sort by combined strength: products with highest scores
products.sort((a, b) => {
  const scoreA = parseFloat(a.qtySlope) + parseFloat(a.gpSlope);
  const scoreB = parseFloat(b.qtySlope) + parseFloat(b.gpSlope);
  return scoreB - scoreA;
});

console.log(`✓ Found ${products.length} products with UPTREND (Qty ↑ AND GP% ↑)\n`);

// Identify top performers
const topByQtySlope = [...products].sort((a, b) => parseFloat(b.qtySlope) - parseFloat(a.qtySlope)).slice(0, 5);
const topByGpSlope = [...products].sort((a, b) => parseFloat(b.gpSlope) - parseFloat(a.gpSlope)).slice(0, 5);
const topByVolume = [...products].sort((a, b) => b.totalSalesQty - a.totalSalesQty).slice(0, 5);

console.log('--- Top 5 by Volume Growth (Qty Slope) ---');
topByQtySlope.forEach((p, i) => {
  console.log(`${i+1}. ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | Slope: ${p.qtySlope} units/mo`);
});

console.log('\n--- Top 5 by Margin Improvement (GP% Slope) ---');
topByGpSlope.forEach((p, i) => {
  console.log(`${i+1}. ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | Slope: ${p.gpSlope} pts/mo`);
});

console.log('\n--- Top 5 by Total Sales Volume ---');
topByVolume.forEach((p, i) => {
  console.log(`${i+1}. ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | Total: ${parseInt(p.totalSalesQty)} units`);
});

// Save JSON
const jsonOutput = {
  found: products.length,
  timestamp: new Date().toISOString(),
  analysisType: 'Sales Quantity AND GP% Uptrend Analysis',
  period: '1 March 2022 to 1 April 2026',
  dataSource: 'SPAR Sigma System - Department: Chicken',
  products: products
};

fs.writeFileSync(outputJsonFile, JSON.stringify(jsonOutput, null, 2));
console.log(`\n✓ JSON saved: ${outputJsonFile}`);

// Create HTML report
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPAR Chicken - Good Performers Analysis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b35 0%, #d84315 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 2.2em; margin-bottom: 8px; }
        .metadata { background: #f9f9f9; padding: 15px 30px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; font-size: 0.9em; gap: 20px; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .section h2 { color: #ff6b35; font-size: 1.6em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ff6b35; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #ffe0d5 0%, #ffccb3 100%); padding: 20px; border-left: 4px solid #ff6b35; border-radius: 4px; }
        .stat-card .value { font-size: 2.5em; font-weight: bold; color: #ff6b35; }
        .stat-card .label { font-size: 0.9em; color: #666; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85em; }
        thead { background: #ff6b35; color: white; }
        th { padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #fff5f0; }
        .code { font-family: monospace; font-weight: 600; color: #ff6b35; }
        .footer { background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 0.85em; color: #999; }
        .alert { background: #fff3e0; border-left: 4px solid #ff6b35; padding: 15px; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍗 Chicken Department - Good Performers</h1>
            <p>Products with Upward Trends in Sales Volume AND Profitability</p>
        </div>
        
        <div class="metadata">
            <div><strong>Report Date:</strong> 18 April 2026</div>
            <div><strong>Analysis Period:</strong> 1 March 2022 – 1 April 2026</div>
            <div><strong>Data Source:</strong> SPAR Sigma System</div>
            <div><strong>Department:</strong> Chicken</div>
            <div><strong>Good Performers Found:</strong> ${products.length}</div>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${products.length}</div>
                    <div class="label">Good Performers (Uptrend)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${topByVolume[0]?.code || 'N/A'}</div>
                    <div class="label">Top by Volume</div>
                </div>
                <div class="stat-card">
                    <div class="value">${topByGpSlope[0]?.gpSlope || 'N/A'}</div>
                    <div class="label">Highest GP% Improvement</div>
                </div>
            </div>
            
            <div class="alert">
                <strong>✓ Analysis Complete:</strong> Identified ${products.length} chicken products showing positive trends in BOTH sales volume AND profitability margins. These are expansion candidates.
            </div>
        </div>
        
        <div class="section">
            <h2>🏆 Top 20 Good Performers (by Combined Strength)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 40%;">Product Description</th>
                        <th style="width: 100px;">Total Sales</th>
                        <th style="width: 110px;">Qty Slope</th>
                        <th style="width: 110px;">GP% Slope</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.slice(0, 20).map(p => `
                    <tr>
                        <td><span class="code">${p.code}</span></td>
                        <td>${p.description}</td>
                        <td style="text-align: right;">${parseInt(p.totalSalesQty)}</td>
                        <td style="text-align: right;"><strong>+${p.qtySlope}</strong> units/mo</td>
                        <td style="text-align: right;"><strong>+${p.gpSlope}</strong> pts/mo</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>💡 Strategic Recommendations</h2>
            <h3>For Top Performers:</h3>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li><strong>EXPAND:</strong> Increase shelf space and stock depth for top volume movers</li>
                <li><strong>PROMOTE:</strong> Feature in promotions, bundles, and marketing campaigns</li>
                <li><strong>REPLICATE:</strong> Create variations or pack sizes based on successful formats</li>
                <li><strong>FREQUENCY:</strong> Restock more frequently to prevent stockouts</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Report Generated: 18 April 2026 | SPAR Chicken Department | Good Performers Analysis</p>
            <p style="margin-top: 10px; color: #ccc;">Data source: SPAR Sigma System, Department: Chicken, Period: March 2022 – April 2026</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(outputHtmlFile, htmlContent);
console.log(`✓ HTML report: ${outputHtmlFile}`);

console.log(`\n✓ Analysis complete!`);
