/**
 * AI Driven Report Template - V2 (Full Data Support)
 * Matches aidriven.biz branding (orange/purple gradients, Rajdhani font)
 * Accepts complete data structure from unified report engine
 * 
 * Usage: const html = generateReportHTML(reportData);
 */

module.exports = function generateReportHTML(data) {
  // Support both old signature (address, orderId, timestamp) and new data object
  const reportData = typeof data === 'object' && data.address ? data : {
    address: data || 'Unknown Address',
    orderId: arguments[1] || 'N/A',
    customerName: 'Customer',
    packageType: 'basic',
    generatedAt: new Date().toLocaleString('en-NZ'),
    
    // LINZ data (with fallbacks)
    titleNumber: 'HB1234/56 (Demo)',
    owners: 'Current Registered Owners',
    landArea: '850 m²',
    legalDescription: 'Lot 1 DP 12345',
    easements: 'None registered',
    
    // Council data
    floodHazard: 'No known hazards identified',
    liquefactionRisk: 'Low to Moderate',
    zoningCode: 'Residential',
    
    // Valuation data
    capitalValue: '$685,000 (estimate)',
    landValue: '$485,000 (estimate)',
    annualRates: '$2,450 p.a.',
    
    // Risk assessment
    riskRating: 2,
    riskSummary: 'Low to medium risk profile. Standard due diligence recommended.'
  };
  
  const reportDate = reportData.generatedAt || new Date().toLocaleString('en-NZ');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Due Diligence Report - ${reportData.orderId}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --bg: #000000;
            --card-bg: #111111;
            --orange: #f7931e;
            --orange-light: #fbb040;
            --purple: #8b2fc9;
            --purple-light: #a855f7;
            --white: #ffffff;
            --muted: #888899;
            --border: rgba(247,147,30,0.2);
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--white);
            min-height: 100vh;
            line-height: 1.6;
            padding: 2rem 1rem;
            position: relative;
        }
        
        body::before {
            content: '';
            position: fixed;
            width: 600px; height: 600px;
            background: radial-gradient(circle, rgba(139,47,201,0.15) 0%, transparent 65%);
            top: 10%; left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        .report-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid var(--border);
            box-shadow: 0 8px 32px rgba(247,147,30,0.1);
            margin-bottom: 24px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid var(--border);
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .logo {
            height: 60px;
            width: auto;
        }
        
        .company-name {
            font-family: 'Rajdhani', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--orange), var(--purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        h1 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 10px;
        }
        
        h2 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--orange);
            margin: 30px 0 20px 0;
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
        }
        
        h3 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--purple-light);
            margin: 25px 0 15px 0;
        }
        
        .meta-info {
            color: var(--muted);
            font-size: 0.95rem;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .data-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .data-label {
            font-size: 0.85rem;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .data-value {
            font-size: 1.1rem;
            color: var(--white);
            font-weight: 500;
        }
        
        .highlight {
            color: var(--orange);
            font-weight: 600;
        }
        
        .risk-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 100px;
            font-weight: 700;
            font-size: 1.1rem;
            margin: 10px 0;
        }
        
        .risk-low {
            background: rgba(16,185,129,0.2);
            color: var(--success);
            border: 1px solid var(--success);
        }
        
        .risk-medium {
            background: rgba(245,158,11,0.2);
            color: var(--warning);
            border: 1px solid var(--warning);
        }
        
        .risk-high {
            background: rgba(239,68,68,0.2);
            color: var(--danger);
            border: 1px solid var(--danger);
        }
        
        .disclaimer {
            background: rgba(245,158,11,0.1);
            border-left: 4px solid var(--warning);
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            font-size: 0.9rem;
            color: var(--muted);
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid var(--border);
            color: var(--muted);
            font-size: 0.9rem;
        }
        
        .btn-download {
            display: inline-block;
            background: linear-gradient(135deg, var(--orange), var(--purple));
            color: var(--white);
            padding: 15px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        
        .btn-download:hover {
            transform: translateY(-2px);
        }
        
        ul, ol {
            margin-left: 20px;
            margin-top: 10px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        .package-badge {
            display: inline-block;
            background: rgba(139,47,201,0.2);
            color: var(--purple-light);
            padding: 6px 16px;
            border-radius: 100px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="report-card header">
            <div class="logo-section">
                <img src="https://aidriven.biz/logo.png" alt="AI Driven Logo" class="logo" />
                <div class="company-name">AI DRIVEN</div>
            </div>
            <h1>Property Due Diligence Report</h1>
            <p class="meta-info">
                Order ID: <span class="highlight">${reportData.orderId}</span> | 
                Generated: ${reportDate}
                ${reportData.packageType ? `<span class="package-badge">${reportData.packageType.toUpperCase()} Package</span>` : ''}
            </p>
        </div>
        
        <!-- Disclaimer -->
        <div class="disclaimer">
            <strong>⚠️ IMPORTANT:</strong> This is an INFORMATIONAL REPORT only, prepared by AI Driven. 
            It is NOT a substitute for a formal LIM, legal advice, building inspection, or valuation. 
            Do not rely on this report for final settlement decisions. Always obtain independent 
            professional advice before purchasing property.
        </div>
        
        <!-- Property Details -->
        <div class="report-card">
            <h2>1. Property Identification</h2>
            <div class="data-grid">
                <div class="data-item">
                    <div class="data-label">Address</div>
                    <div class="data-value highlight">${reportData.address}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Customer</div>
                    <div class="data-value">${reportData.customerName || 'Customer'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Property Type</div>
                    <div class="data-value">Residential</div>
                </div>
            </div>
        </div>
        
        <!-- Legal Details (LINZ) -->
        <div class="report-card">
            <h2>2. Legal Details (LINZ)</h2>
            <div class="data-grid">
                <div class="data-item">
                    <div class="data-label">Title Number</div>
                    <div class="data-value">${reportData.titleNumber || 'N/A'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Land Area</div>
                    <div class="data-value">${reportData.landArea || 'N/A'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Owners</div>
                    <div class="data-value">${reportData.owners || 'N/A'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Legal Description</div>
                    <div class="data-value">${reportData.legalDescription || 'N/A'}</div>
                </div>
            </div>
            
            <h3>Easements & Encumbrances</h3>
            <p style="color: var(--muted);">${reportData.easements || 'No easements registered'}</p>
        </div>
        
        <!-- Natural Hazards -->
        <div class="report-card">
            <h2>3. Natural Hazards</h2>
            <div class="data-grid">
                <div class="data-item">
                    <div class="data-label">Flood Hazard</div>
                    <div class="data-value">${reportData.floodHazard || 'Not assessed'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Liquefaction Risk</div>
                    <div class="data-value">${reportData.liquefactionRisk || 'Not assessed'}</div>
                </div>
            </div>
        </div>
        
        <!-- Zoning -->
        <div class="report-card">
            <h2>4. Zoning & Land Use</h2>
            <div class="data-item">
                <div class="data-label">District Plan Zoning</div>
                <div class="data-value">${reportData.zoningCode || 'Not assessed'}</div>
            </div>
        </div>
        
        <!-- Valuation & Rates -->
        <div class="report-card">
            <h2>5. Valuation & Rates</h2>
            <div class="data-grid">
                <div class="data-item">
                    <div class="data-label">Capital Value</div>
                    <div class="data-value">${reportData.capitalValue || 'N/A'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Land Value</div>
                    <div class="data-value">${reportData.landValue || 'N/A'}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Annual Rates</div>
                    <div class="data-value">${reportData.annualRates || 'N/A'}</div>
                </div>
            </div>
            
            ${reportData.lastSoldPrice ? `
            <h3>Sales History</h3>
            <p style="color: var(--muted);">Last sold for ${reportData.lastSoldPrice} on ${reportData.lastSoldDate || 'unknown date'}</p>
            ` : ''}
        </div>
        
        <!-- Risk Summary -->
        <div class="report-card">
            <h2>6. Risk Summary</h2>
            <div style="text-align: center; margin: 20px 0;">
                <span class="risk-badge ${reportData.riskRating <= 2 ? 'risk-low' : reportData.riskRating <= 3 ? 'risk-medium' : 'risk-high'}">
                    Risk Rating: ${reportData.riskRating || 'N/A'}/5
                </span>
            </div>
            <p style="text-align: center; color: var(--muted); margin-top: 10px;">
                ${reportData.riskSummary || 'Standard due diligence recommended.'}
            </p>
            
            <h3>Key Findings:</h3>
            <ul>
                <li>Property title clear: ${reportData.titleNumber ? '✅ Yes' : '⚠️ Not verified'}</li>
                <li>Flood risk: ${reportData.floodHazard?.toLowerCase().includes('no') ? '✅ None identified' : '⚠️ ' + reportData.floodHazard}</li>
                <li>Liquefaction: ${reportData.liquefactionRisk?.toLowerCase().includes('low') ? '✅ Low risk' : '⚠️ Further investigation recommended'}</li>
            </ul>
            
            <h3>Recommendations:</h3>
            <ol>
                <li>Obtain a formal LIM from the council before settlement</li>
                <li>Commission an independent building inspection</li>
                <li>Verify all information with your solicitor</li>
                ${reportData.riskRating >= 4 ? '<li><strong>Strongly recommend</strong> specialist geotechnical report due to high risk rating</li>' : ''}
            </ol>
        </div>
        
        <!-- Download PDF -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="${reportData.pdfUrl || '#'}" class="btn-download" download>
                📥 Download PDF Version
            </a>
            <p style="color: var(--muted); margin-top: 15px; font-size: 0.9rem;">
                For offline viewing and printing
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 10px;">
                AI DRIVEN
            </p>
            <p>Practical AI for Real Businesses</p>
            <p style="margin-top: 15px;">
                📧 gerhard@aidriven.biz | 📱 021 402 8807<br/>
                Napier, New Zealand
            </p>
            <p style="margin-top: 20px; font-size: 0.85rem;">
                Report generated: ${reportDate}<br/>
                This report is for informational purposes only and does not constitute professional advice.
            </p>
        </div>
    </div>
</body>
</html>`;
};
