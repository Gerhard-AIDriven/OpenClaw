const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Groceries Department - Bad Performers Analysis (Scenario 2)\n');

const inputFile = 'Spar/Data Extracts/gws groceries.xls';
const outputJsonFile = 'Spar/Data Extracts/groceries_cull_candidates.json';
const outputHtmlFile = 'Spar/Data Extracts/groceries_cull_candidates_report.html';

console.log(`Input File: ${inputFile}`);
console.log(`Analysis Period: 1 March 2022 - 1 April 2026 (50 months detected)\n`);

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
  
  allProducts.push({
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
    gpChangePoints: (lastGp - firstGp).toFixed(2),
    qtySlope_num: qtySlope,
    gpSlope_num: gpSlope,
    totalSalesQty_num: totalQty
  });
}

// Identify BAD PERFORMERS (Qty slope <= 0 OR GP slope <= 0)
const badProducts = allProducts.filter(p => 
  parseFloat(p.qtySlope) <= 0 || parseFloat(p.gpSlope) <= 0
);

console.log(`Total products analyzed: ${allProducts.length}`);
console.log(`Bad performers identified: ${badProducts.length}\n`);

// Classify into tiers
const tier1 = badProducts.filter(p => 
  parseFloat(p.qtySlope) < -0.5 || parseFloat(p.gpSlope) < -0.3
).slice(0, 20);

const tier2 = badProducts.filter(p => 
  (parseFloat(p.qtySlope) <= 0 || parseFloat(p.gpSlope) <= 0) &&
  !(parseFloat(p.qtySlope) < -0.5 || parseFloat(p.gpSlope) < -0.3) &&
  parseFloat(p.totalSalesQty) >= 500
).slice(0, 30);

const tier3 = badProducts.filter(p => 
  parseFloat(p.totalSalesQty) < 500 &&
  !(parseFloat(p.qtySlope) < -0.5 || parseFloat(p.gpSlope) < -0.3)
).slice(0, 20);

console.log('Tier 1 (Critical): ' + tier1.length);
console.log('Tier 2 (Review): ' + tier2.length);
console.log('Tier 3 (Monitor): ' + tier3.length);

// Sort by cull priority
badProducts.sort((a, b) => {
  const scoreA = Math.abs(parseFloat(a.qtySlope)) + Math.abs(parseFloat(a.gpSlope));
  const scoreB = Math.abs(parseFloat(b.qtySlope)) + Math.abs(parseFloat(b.gpSlope));
  return scoreB - scoreA;
});

// Save JSON
const jsonOutput = {
  found: badProducts.length,
  timestamp: new Date().toISOString(),
  analysisType: 'Bad Performers (Downtrend Analysis)',
  period: '1 March 2022 to 1 April 2026',
  dataSource: 'SPAR Sigma System - Department: Groceries',
  tier1Count: tier1.length,
  tier2Count: tier2.length,
  tier3Count: tier3.length,
  tiers: {
    tier1: tier1,
    tier2: tier2,
    tier3: tier3
  },
  products: badProducts
};

fs.writeFileSync(outputJsonFile, JSON.stringify(jsonOutput, null, 2));
console.log(`\nJSON saved: ${outputJsonFile}`);

// Generate HTML
let tier1Html = tier1.map(p => 
  '<tr class="tier1-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td style="text-align: right;">' + parseInt(p.totalSalesQty) + '</td><td style="text-align: right;"><strong>' + p.qtySlope + '</strong></td><td style="text-align: right;"><strong>' + p.gpSlope + '</strong></td></tr>'
).join('');
if (tier1.length === 0) tier1Html = '<tr><td colspan="5" style="text-align: center; color: #999;">No Tier 1 products identified</td></tr>';

let tier2Html = tier2.slice(0, 15).map(p =>
  '<tr class="tier2-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td style="text-align: right;">' + parseInt(p.totalSalesQty) + '</td><td style="text-align: right;">' + p.qtySlope + '</td><td style="text-align: right;">' + p.gpSlope + '</td></tr>'
).join('');
if (tier2.length === 0) tier2Html = '<tr><td colspan="5" style="text-align: center; color: #999;">No Tier 2 products identified</td></tr>';

let tier3Html = tier3.slice(0, 15).map(p =>
  '<tr class="tier3-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td style="text-align: right;">' + parseInt(p.totalSalesQty) + '</td><td style="text-align: right;">' + p.qtySlope + '</td><td style="text-align: right;">' + p.gpSlope + '</td></tr>'
).join('');
if (tier3.length === 0) tier3Html = '<tr><td colspan="5" style="text-align: center; color: #999;">No Tier 3 products identified</td></tr>';

const tier2More = tier2.length > 15 ? '<p style="text-align: center; color: #999; margin-top: 10px;">... and ' + (tier2.length - 15) + ' more in Tier 2</p>' : '';
const tier3More = tier3.length > 15 ? '<p style="text-align: center; color: #999; margin-top: 10px;">... and ' + (tier3.length - 15) + ' more in Tier 3</p>' : '';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPAR Groceries - Cull Candidates Analysis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 2.2em; margin-bottom: 8px; }
        .metadata { background: #f9f9f9; padding: 15px 30px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; font-size: 0.9em; gap: 20px; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .section h2 { color: #d32f2f; font-size: 1.6em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #d32f2f; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 20px; border-left: 4px solid #d32f2f; border-radius: 4px; }
        .stat-card .value { font-size: 2.5em; font-weight: bold; color: #d32f2f; }
        .stat-card .label { font-size: 0.95em; color: #666; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85em; }
        thead { background: #d32f2f; color: white; }
        th { padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #fff5f5; }
        .code { font-family: monospace; font-weight: 600; color: #d32f2f; }
        .tier1-row { background: #ffebee; }
        .tier2-row { background: #fff3e0; }
        .tier3-row { background: #f1f8f4; }
        .footer { background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 0.85em; color: #999; }
        .alert { background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert strong { color: #b71c1c; }
        .recommendation { background: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 12px 0; border-radius: 4px; }
        ul, ol { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗑️ Groceries Department - Bad Performers (Cull Candidates)</h1>
            <p>Products with Declining Trends in Sales Volume OR Profitability</p>
        </div>
        
        <div class="metadata">
            <div><strong>Report Date:</strong> 19 April 2026</div>
            <div><strong>Analysis Period:</strong> 1 March 2022 – 1 April 2026 (50 months)</div>
            <div><strong>Data Source:</strong> SPAR Sigma System</div>
            <div><strong>Department:</strong> Groceries</div>
            <div><strong>Bad Performers Found:</strong> ${badProducts.length}</div>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${badProducts.length}</div>
                    <div class="label">Bad Performers</div>
                </div>
                <div class="stat-card">
                    <div class="value">${tier1.length}</div>
                    <div class="label">Tier 1 (Critical)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${tier2.length}</div>
                    <div class="label">Tier 2 (Review)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${tier3.length}</div>
                    <div class="label">Tier 3 (Monitor)</div>
                </div>
            </div>
            
            <div class="alert">
                <strong>⚠️ Finding:</strong> ${badProducts.length} groceries products show declining trends in sales volume and/or profitability. These are candidates for culling, consolidation, or close monitoring.
            </div>
        </div>
        
        <div class="section">
            <h2>🔴 Tier 1: CRITICAL (Cull Immediately)</h2>
            <p style="margin-bottom: 15px;">Products with severe declines in both volume and/or margin. Recommend immediate removal.</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 40%;">Product Description</th>
                        <th style="width: 90px; text-align: right;">Total Units</th>
                        <th style="width: 110px; text-align: right;">Qty Slope</th>
                        <th style="width: 110px; text-align: right;">GP% Slope</th>
                    </tr>
                </thead>
                <tbody>
                    ${tier1Html}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>🟡 Tier 2: REVIEW (Consolidate/Phase Out within 6-8 weeks)</h2>
            <p style="margin-bottom: 15px;">Products with moderate declines. Monitor for 6 weeks; if no improvement, cull.</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 40%;">Product Description</th>
                        <th style="width: 90px; text-align: right;">Total Units</th>
                        <th style="width: 110px; text-align: right;">Qty Slope</th>
                        <th style="width: 110px; text-align: right;">GP% Slope</th>
                    </tr>
                </thead>
                <tbody>
                    ${tier2Html}
                </tbody>
            </table>
            ${tier2More}
        </div>
        
        <div class="section">
            <h2>⚠️ Tier 3: MONITOR (Low-volume underperformers)</h2>
            <p style="margin-bottom: 15px;">Products with minimal sales and declining trends. Opportunity cost of shelf space too high.</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 40%;">Product Description</th>
                        <th style="width: 90px; text-align: right;">Total Units</th>
                        <th style="width: 110px; text-align: right;">Qty Slope</th>
                        <th style="width: 110px; text-align: right;">GP% Slope</th>
                    </tr>
                </thead>
                <tbody>
                    ${tier3Html}
                </tbody>
            </table>
            ${tier3More}
        </div>
        
        <div class="footer">
            <p>Report Generated: 19 April 2026 | SPAR Groceries Department | Bad Performers Analysis (Scenario 2)</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(outputHtmlFile, htmlContent);
console.log(`HTML report: ${outputHtmlFile}`);

console.log(`\nAnalysis complete!`);
