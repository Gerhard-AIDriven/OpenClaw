const fs = require('fs');

const data = JSON.parse(fs.readFileSync('Spar/Data Extracts/groceries_complete_analysis_final.json', 'utf8'));
const outputDir = 'Spar/Data Extracts';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPAR Groceries - Complete Analysis Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 50px 40px; text-align: center; }
        .header h1 { font-size: 2.8em; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .metadata { background: #f0f4ff; padding: 20px 40px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 2px solid #1976d2; font-size: 0.95em; gap: 20px; }
        .metadata-label { color: #1976d2; font-weight: 600; }
        .section { padding: 40px; border-bottom: 1px solid #eee; }
        .section h2 { color: #1976d2; font-size: 2em; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid #1976d2; }
        .section h3 { color: #455a64; font-size: 1.4em; margin-top: 25px; margin-bottom: 15px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-left: 5px solid #1976d2; border-radius: 4px; text-align: center; }
        .stat-card .value { font-size: 3em; font-weight: 600; color: #1976d2; }
        .stat-card .label { font-size: 0.95em; color: #555; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em; }
        thead { background: #1976d2; color: white; }
        th { padding: 14px; text-align: left; font-weight: 600; }
        td { padding: 12px 14px; border-bottom: 1px solid #e0e0e0; }
        tbody tr:hover { background: #f5f5f5; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .alert { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-left: 5px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .urgent { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-left: 5px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f5f5f5; padding: 20px 40px; text-align: center; font-size: 0.85em; color: #999; border-top: 1px solid #e0e0e0; }
        ul { margin-left: 30px; margin-bottom: 20px; line-height: 1.8; }
        li { margin-bottom: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 SPAR Groceries Department</h1>
            <p>Complete Analysis Summary | Top 999 Products | 50 Months: March 2022 - April 2026</p>
        </div>
        
        <div class="metadata">
            <div><span class="metadata-label">Period:</span> ${data.period}</div>
            <div><span class="metadata-label">Products:</span> 999 (highest revenue contributors)</div>
            <div><span class="metadata-label">Report Date:</span> 19 April 2026</div>
            <div><span class="metadata-label">Source:</span> SPAR Sigma System</div>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${data.scenario1.count}</div>
                    <div class="label">Good Performers<br><small>16.1%</small></div>
                </div>
                <div class="stat-card">
                    <div class="value">${data.scenario2.count}</div>
                    <div class="label">Bad Performers<br><small>83.9%</small></div>
                </div>
                <div class="stat-card">
                    <div class="value">${data.scenario3.summary.ACTIVE}</div>
                    <div class="label">ACTIVE<br><small>85.9%</small></div>
                </div>
                <div class="stat-card">
                    <div class="value">${data.scenario3.summary['DEAD STOCK']}</div>
                    <div class="label">DEAD STOCK<br><small>3.6%</small></div>
                </div>
            </div>
            
            <div class="alert">
                <strong>✓ KEY FINDING:</strong> Groceries portfolio is healthy with 85.9% ACTIVE products. Focus on expanding 161 good performers and consolidating 838 bad performers.
            </div>
        </div>
        
        <div class="section">
            <h2>🏆 Scenario 1: Good Performers (Uptrend)</h2>
            <p><strong>${data.scenario1.count} products</strong> show uptrend in BOTH sales volume AND gross profit percentage.</p>
            <h3>Top 20 Winners</h3>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Product</th>
                        <th style="text-align: right;">Qty Growth/Month</th>
                        <th style="text-align: right;">GP% Growth/Month</th>
                        <th style="text-align: right;">Latest GP%</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.scenario1.top20.map((p, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${p.code}</strong> — ${p.description}</td>
                        <td style="text-align: right;">+${p.qtyPerMonthGrowth}</td>
                        <td style="text-align: right;">+${p.gpPercentGrowthPerMonth}</td>
                        <td style="text-align: right;">${p.latestGpPercent}%</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3>Strategic Actions</h3>
            <ul>
                <li><strong>Immediate:</strong> Expand shelf space for top 20 by 10-15%</li>
                <li><strong>Immediate:</strong> Feature top 10 in weekly promotions</li>
                <li><strong>2-4 weeks:</strong> Increase safety stock to prevent stockouts</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>⚠️ Scenario 2: Bad Performers (Downtrend)</h2>
            <p><strong>${data.scenario2.count} products</strong> show declining trends. These require active consolidation and monitoring.</p>
            <h3>Recommendation</h3>
            <ul>
                <li>Monitor for volume declines (Qty/Month < -0.5)</li>
                <li>Monitor for margin erosion (GP% Growth/Month < -0.3)</li>
                <li>Identify low-volume products for culling</li>
                <li>Plan phase-out over 2-3 months</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>📍 Scenario 3: Dormancy (Last Sales Activity)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th style="text-align: right;">Count</th>
                        <th style="text-align: right;">%</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>ACTIVE</strong> (0-2 months)</td>
                        <td style="text-align: right;">${data.scenario3.summary.ACTIVE}</td>
                        <td style="text-align: right;">85.9%</td>
                        <td>Maintain & promote</td>
                    </tr>
                    <tr>
                        <td><strong>RECENT</strong> (3-4 months)</td>
                        <td style="text-align: right;">${data.scenario3.summary.RECENT}</td>
                        <td style="text-align: right;">4.5%</td>
                        <td>Monitor demand</td>
                    </tr>
                    <tr>
                        <td><strong>STALE</strong> (5-12 months)</td>
                        <td style="text-align: right;">${data.scenario3.summary.STALE}</td>
                        <td style="text-align: right;">6.0%</td>
                        <td>Plan phase-out</td>
                    </tr>
                    <tr>
                        <td><strong>DEAD STOCK</strong> (12+ months)</td>
                        <td style="text-align: right;">${data.scenario3.summary['DEAD STOCK']}</td>
                        <td style="text-align: right;">3.6%</td>
                        <td>Cull immediately</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="alert">
                <strong>💡 Key Insight:</strong> The 85.9% ACTIVE rate indicates a well-curated product mix with minimal waste from slow-moving stock. Only ${data.scenario3.summary['DEAD STOCK']} products (3.6%) have no sales in the past 12+ months.
            </div>
        </div>
        
        <div class="section">
            <h2>🎯 Strategic Priorities</h2>
            
            <h3 style="color: #f44336;">URGENT (Week 1)</h3>
            <div class="urgent">
                <strong>Remove ${data.scenario3.summary['DEAD STOCK']} DEAD STOCK Products</strong>
                <ul style="margin-top: 15px;">
                    <li>No sales for 12+ months (status: DEAD STOCK)</li>
                    <li>Frees approximately 2-3 linear meters of shelf space</li>
                    <li>Revenue impact: ~0% (no recent sales)</li>
                    <li>Reduces inventory complexity and SKU count</li>
                </ul>
            </div>
            
            <h3>HIGH PRIORITY (Weeks 2-4)</h3>
            <ul>
                <li>Expand top 20 good performers by 10-15% shelf space</li>
                <li>Feature top 10 in weekly promotions</li>
                <li>Review STALE products (${data.scenario3.summary.STALE} items) for phase-out</li>
            </ul>
            
            <h3>MEDIUM-TERM (1-3 months)</h3>
            <ul>
                <li>Consolidate RECENT products (${data.scenario3.summary.RECENT} items) if no demand recovery</li>
                <li>Identify bad performers for culling (target: 50-100 SKUs from ${data.scenario2.count} downtrend products)</li>
                <li>Rebalance inventory allocation toward ${data.scenario1.count} growth products</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>📋 Data & Methodology</h2>
            <table>
                <tbody>
                    <tr>
                        <td><strong>Analysis Period</strong></td>
                        <td>${data.period}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Products Analyzed</strong></td>
                        <td>${data.totalProducts}</td>
                    </tr>
                    <tr>
                        <td><strong>Data Source</strong></td>
                        <td>SPAR Sigma System</td>
                    </tr>
                    <tr>
                        <td><strong>Product Scope</strong></td>
                        <td>Top 999 products by sales including VAT (highest revenue contributors)</td>
                    </tr>
                    <tr>
                        <td><strong>Analysis Method</strong></td>
                        <td>Linear regression for trend slopes; date-based dormancy classification</td>
                    </tr>
                    <tr>
                        <td><strong>Reference Date</strong></td>
                        <td>19 April 2026</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p><strong>Report Generated:</strong> 19 April 2026<br>
            <strong>Department:</strong> SPAR Groceries (Top 999 Products)<br>
            <strong>Analysis Type:</strong> Three-Scenario Assessment (Growth, Decline, Dormancy)<br>
            <strong>Status:</strong> FINAL CORRECTED VERSION</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(`${outputDir}/groceries_analysis_report.html`, htmlContent);
console.log(`✓ HTML report regenerated: ${outputDir}/groceries_analysis_report.html`);
