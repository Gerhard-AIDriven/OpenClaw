const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 SPAR Sigma - Chicken Department - Dormancy Analysis (Scenario 3)\n');

const inputFile = 'Spar/Data Extracts/gws chicken.xls';
const outputJsonFile = 'Spar/Data Extracts/chicken_product_status.json';
const outputHtmlFile = 'Spar/Data Extracts/chicken_product_status_report.html';

console.log(`Input File: ${inputFile}`);
console.log(`Reference Date: 18 April 2026`);
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
      salesQtyCol: c + 1
    });
  }
}

console.log(`Found ${monthLocations.length} months of data\n`);

const products = [];

// Extract product data
for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) continue;
  
  // Find LAST month with sales > 0
  let lastMonth = null;
  let lastSalesQty = 0;
  
  // Scan left-to-right to find truly last month
  for (let i = 0; i < monthLocations.length; i++) {
    const cellRef = XLSX.utils.encode_cell({r, c: monthLocations[i].salesQtyCol});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    if (typeof val === 'string') val = parseFloat(val.replace(/\s/g, ''));
    val = parseFloat(val) || 0;
    
    if (val > 0) {
      lastMonth = monthLocations[i].month;
      lastSalesQty = val;
    }
  }
  
  // Convert to readable format with D/MM/YY parsing
  let lastMonthReadable = 'No sales recorded';
  let status = 'DEAD STOCK';
  let monthsAgo = 999;
  
  if (lastMonth) {
    const parts = lastMonth.split('/');
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    
    const fullYear = 2000 + y;
    const date = new Date(fullYear, m - 1, d);
    lastMonthReadable = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    const refDate = new Date('2026-04-18');
    const diffTime = refDate - date;
    monthsAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    if (monthsAgo <= 2) {
      status = 'ACTIVE';
    } else if (monthsAgo <= 4) {
      status = 'RECENT';
    } else if (monthsAgo <= 12) {
      status = 'STALE';
    } else {
      status = 'DEAD STOCK';
    }
  }
  
  products.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    lastMonth: lastMonth,
    lastMonthReadable: lastMonthReadable,
    lastSalesQty: lastSalesQty,
    status: status,
    monthsAgo: monthsAgo
  });
}

// Sort by status
const statusOrder = { 'ACTIVE': 0, 'RECENT': 1, 'STALE': 2, 'DEAD STOCK': 3 };
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? parseInt(a.code) - parseInt(b.code) : cmp;
});

const summary = {
  ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
  RECENT: products.filter(p => p.status === 'RECENT').length,
  STALE: products.filter(p => p.status === 'STALE').length,
  'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length
};

console.log(`Total products: ${products.length}\n`);
console.log('Status Summary:');
console.log(`  ACTIVE (0-2 months):     ${summary.ACTIVE} (${(summary.ACTIVE/products.length*100).toFixed(1)}%)`);
console.log(`  RECENT (3-4 months):     ${summary.RECENT} (${(summary.RECENT/products.length*100).toFixed(1)}%)`);
console.log(`  STALE (5-12 months):     ${summary.STALE} (${(summary.STALE/products.length*100).toFixed(1)}%)`);
console.log(`  DEAD STOCK (12+ months): ${summary['DEAD STOCK']} (${(summary['DEAD STOCK']/products.length*100).toFixed(1)}%)\n`);

// Save JSON
const jsonOutput = {
  timestamp: new Date().toISOString(),
  totalProducts: products.length,
  dataSource: 'SPAR Sigma System - Department: Chicken',
  period: '1 March 2022 - 1 April 2026',
  reportDate: '18 April 2026',
  fileName: inputFile,
  dateFormat: 'D/MM/YY (e.g., 01/02/26 = 1st February 2026)',
  monthsDetected: monthLocations.length,
  statusSummary: summary,
  products: products
};

fs.writeFileSync(outputJsonFile, JSON.stringify(jsonOutput, null, 2));
console.log(`JSON saved: ${outputJsonFile}`);

// Generate HTML
let activeHtml = products.filter(p => p.status === 'ACTIVE').map(p =>
  '<tr class="active-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td>' + p.lastMonthReadable + '</td><td>' + p.monthsAgo + '</td><td style="text-align: right;">' + p.lastSalesQty.toFixed(2) + '</td></tr>'
).join('');
if (summary.ACTIVE === 0) activeHtml = '<tr><td colspan="5" style="text-align: center; color: #999;">No ACTIVE products</td></tr>';

let recentHtml = products.filter(p => p.status === 'RECENT').map(p =>
  '<tr class="recent-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td>' + p.lastMonthReadable + '</td><td>' + p.monthsAgo + '</td><td style="text-align: right;">' + p.lastSalesQty.toFixed(2) + '</td></tr>'
).join('');
if (summary.RECENT === 0) recentHtml = '<tr><td colspan="5" style="text-align: center; color: #999;">No RECENT products</td></tr>';

let staleHtml = products.filter(p => p.status === 'STALE').map(p =>
  '<tr class="stale-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td>' + p.lastMonthReadable + '</td><td>' + p.monthsAgo + '</td><td style="text-align: right;">' + p.lastSalesQty.toFixed(2) + '</td></tr>'
).join('');
if (summary.STALE === 0) staleHtml = '<tr><td colspan="5" style="text-align: center; color: #999;">No STALE products</td></tr>';

let deadHtml = products.filter(p => p.status === 'DEAD STOCK').map(p =>
  '<tr class="dead-row"><td><span class="code">' + p.code + '</span></td><td>' + p.description + '</td><td>' + p.lastMonthReadable + '</td><td>' + p.monthsAgo + '</td><td style="text-align: right;">' + p.lastSalesQty.toFixed(2) + '</td></tr>'
).join('');
if (summary['DEAD STOCK'] === 0) deadHtml = '<tr><td colspan="5" style="text-align: center; color: #999;">No DEAD STOCK products</td></tr>';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPAR Chicken - Product Status Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #00a86b 0%, #008650 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 2.2em; margin-bottom: 8px; }
        .metadata { background: #f9f9f9; padding: 15px 30px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; font-size: 0.9em; gap: 20px; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .section h2 { color: #00a86b; font-size: 1.6em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #00a86b; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-left: 4px solid #00a86b; border-radius: 4px; }
        .stat-card .value { font-size: 2.5em; font-weight: bold; color: #00a86b; }
        .stat-card .label { font-size: 0.95em; color: #666; margin-top: 8px; }
        .stat-card .sub { font-size: 0.8em; color: #999; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85em; }
        thead { background: #00a86b; color: white; }
        th { padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f1f8f4; }
        .code { font-family: monospace; font-weight: 600; color: #00a86b; }
        .active-row { background: #e8f5e9; }
        .recent-row { background: #fff3e0; }
        .stale-row { background: #ffe0b2; }
        .dead-row { background: #ffebee; }
        .footer { background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 0.85em; color: #999; }
        .alert { background: #c8e6c9; border-left: 4px solid #00a86b; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert strong { color: #008650; }
        .table-label { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Chicken Department - Product Status Analysis</h1>
            <p>Last Month with Sales Activity — Dormancy-Based Classification</p>
        </div>
        
        <div class="metadata">
            <div><strong>Report Date:</strong> 18 April 2026</div>
            <div><strong>Analysis Period:</strong> 1 March 2022 – 1 April 2026 (49 months)</div>
            <div><strong>Data Source:</strong> SPAR Sigma System</div>
            <div><strong>Department:</strong> Chicken</div>
            <div><strong>Total Products:</strong> ${products.length}</div>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${summary.ACTIVE}</div>
                    <div class="label">ACTIVE</div>
                    <div class="sub">${(summary.ACTIVE/products.length*100).toFixed(1)}% (0-2 months)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${summary.RECENT}</div>
                    <div class="label">RECENT</div>
                    <div class="sub">${(summary.RECENT/products.length*100).toFixed(1)}% (3-4 months)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${summary.STALE}</div>
                    <div class="label">STALE</div>
                    <div class="sub">${(summary.STALE/products.length*100).toFixed(1)}% (5-12 months)</div>
                </div>
                <div class="stat-card">
                    <div class="value">${summary['DEAD STOCK']}</div>
                    <div class="label">DEAD STOCK</div>
                    <div class="sub">${(summary['DEAD STOCK']/products.length*100).toFixed(1)}% (12+ months)</div>
                </div>
            </div>
            
            <div class="alert">
                <strong>✓ Analysis Complete:</strong> ${summary['DEAD STOCK']} products show no sales in 12+ months (cull candidates). ${summary.STALE} products are stale (5-12 months, monitor closely).
            </div>
        </div>
        
        <div class="section">
            <h2>✓ ACTIVE Products (${summary.ACTIVE} items, 0-2 months old)</h2>
            <p class="table-label">Current activity - maintain stock and promote</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 45%;">Product Description</th>
                        <th style="width: 130px;">Last Sales Month</th>
                        <th style="width: 90px;">Months Ago</th>
                        <th style="width: 90px; text-align: right;">Last Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeHtml}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>⚠️ RECENT Products (${summary.RECENT} items, 3-4 months old)</h2>
            <p class="table-label">Minimal recent activity - review demand, monitor closely</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 45%;">Product Description</th>
                        <th style="width: 130px;">Last Sales Month</th>
                        <th style="width: 90px;">Months Ago</th>
                        <th style="width: 90px; text-align: right;">Last Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentHtml}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>⚠️⚠️ STALE Products (${summary.STALE} items, 5-12 months old)</h2>
            <p class="table-label">Dormant - monitor closely, plan phase-out if no recovery</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 45%;">Product Description</th>
                        <th style="width: 130px;">Last Sales Month</th>
                        <th style="width: 90px;">Months Ago</th>
                        <th style="width: 90px; text-align: right;">Last Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${staleHtml}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>✕ DEAD STOCK Products (${summary['DEAD STOCK']} items, 12+ months old)</h2>
            <p class="table-label">CULL CANDIDATES - no sales since mid-2024 or earlier</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Code</th>
                        <th style="width: 45%;">Product Description</th>
                        <th style="width: 130px;">Last Sales Month</th>
                        <th style="width: 90px;">Months Ago</th>
                        <th style="width: 90px; text-align: right;">Last Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${deadHtml}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>💡 Recommendations</h2>
            <ul>
                <li><strong>ACTIVE:</strong> Maintain current stock levels, feature in promotions</li>
                <li><strong>RECENT:</strong> Review customer demand, consider restocking</li>
                <li><strong>STALE:</strong> Monitor for 6 months, plan phase-out if no recovery</li>
                <li><strong>DEAD STOCK:</strong> Cull immediately - free shelf space and reduce complexity</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Report Generated: 18 April 2026 | SPAR Chicken Department | Product Status Analysis (Scenario 3)</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(outputHtmlFile, htmlContent);
console.log(`HTML report: ${outputHtmlFile}`);

console.log(`\nAnalysis complete!`);
