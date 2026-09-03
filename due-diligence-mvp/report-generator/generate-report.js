#!/usr/bin/env node

/**
 * AI Driven - Property Due Diligence Report Generator
 * Phase 2: Semi-Automated Basic Report
 * 
 * Usage: node generate-report.js "123 Smith Street, Marewa, Napier"
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  linz: {
    baseUrl: 'https://data.linz.govt.nz/services/api/v1/',
    apiKeyFile: path.join(__dirname, 'config', 'linz-api-key.txt')
  },
  councils: {
    napier: 'https://maps.napier.govt.nz/',
    hastings: 'https://hdcmaps.com/'
  },
  oneroof: 'https://www.oneroof.co.nz/'
};

// Generate unique order ID
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DD-${year}${month}${day}-${random}`;
}

// Read LINZ API key
function getLinZApiKey() {
  try {
    return fs.readFileSync(CONFIG.linz.apiKeyFile, 'utf8').trim();
  } catch (error) {
    console.error('❌ LINZ API key not found!');
    console.error(`Please create file: ${CONFIG.linz.apiKeyFile}`);
    console.error('Get your free key at: https://www.linz.govt.nz/developers\n');
    process.exit(1);
  }
}

// Parse address into components
function parseAddress(fullAddress) {
  // Simple parsing - can be improved later
  const parts = fullAddress.split(',').map(p => p.trim());
  
  return {
    street: parts[0] || '',
    suburb: parts[1] || '',
    city: parts[2] || 'Napier', // Default to Napier
    postcode: parts[3] || '',
    full: fullAddress
  };
}

// Fetch LINZ title data via API
async function fetchLinZData(address, apiKey) {
  console.log('\n[1/6] Fetching LINZ title data...');
  
  try {
    // Parse address to get street number and name
    const addressParts = address.split(',');
    const streetAddress = addressParts[0].trim();
    
    // Extract street number for better search
    const match = streetAddress.match(/^(\d+[a-zA-Z]?)/);
    const streetNumber = match ? match[1] : '';
    
    // Query LINZ property titles endpoint
    // Using the correct v1 API structure
    const url = `${CONFIG.linz.baseUrl}titles?key=${apiKey}&address=${encodeURIComponent(streetAddress)}&limit=5`;
    
    console.log('  → Querying:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('  Response status:', response.status);
      console.log('  Response body:', errorText.substring(0, 200));
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.titles || data.titles.length === 0) {
      console.log('⚠️  No LINZ title found automatically.');
      return null;
    }
    
    // Extract first matching property
    const title = data.titles[0];
    
    const linzData = {
      titleNumber: title.title_number || 'N/A',
      owners: title.owner_names || 'N/A',
      landArea: title.land_area ? `${title.land_area} m²` : 'N/A',
      legalDescription: title.legal_description || 'N/A',
      easements: title.easements || 'None identified'
    };
    
    console.log('  ✅ Title:', linzData.titleNumber);
    console.log('  ✅ Owners:', linzData.owners);
    console.log('  ✅ Area:', linzData.landArea);
    
    return linzData;
    
  } catch (error) {
    console.error('  ❌ Error fetching LINZ data:', error.message);
    console.log('  → Will prompt for manual entry');
    return null;
  }
}

// Scrape council GIS for hazards and zoning
async function scrapeCouncilGIS(address, browser) {
  console.log('\n[2/6] Checking council hazard maps...');
  
  try {
    const page = await browser.newPage();
    
    // Detect council based on city
    const isNapier = address.toLowerCase().includes('napier');
    const gisUrl = isNapier ? CONFIG.councils.napier : CONFIG.councils.hastings;
    
    console.log(`  → Opening ${isNapier ? 'Napier' : 'Hastings'} GIS map...`);
    console.log(`  URL: ${gisUrl}`);
    
    // Try to load with longer timeout
    await page.goto(gisUrl, { 
      waitUntil: 'networkidle0', 
      timeout: 45000 // Increased to 45 seconds
    });
    
    console.log('  ✅ Council GIS loaded successfully');
    
    // Keep browser open for manual inspection
    return {
      needsManualCheck: true,
      gisUrl: gisUrl,
      address: address,
      loaded: true
    };
    
  } catch (error) {
    console.error('  ❌ Error loading council GIS:', error.message);
    console.log('  ⚠️  Council website may be slow or temporarily unavailable');
    console.log('  → You will need to manually check hazards at:');
    console.log(`     ${address.toLowerCase().includes('napier') ? CONFIG.councils.napier : CONFIG.councils.hastings}`);
    
    // Still return data structure for manual entry
    return { 
      needsManualCheck: true,
      loaded: false,
      error: error.message
    };
  }
}

// Prompt user for missing data
async function promptForData(linzData, councilData) {
  console.log('\n[3/6] Manual data entry required');
  console.log('  → Opening OneRoof in browser...\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const prompt = (question) => new Promise(resolve => rl.question(question, resolve));
  
  // Open OneRoof for valuation data
  const oneroofBrowser = await puppeteer.launch({ headless: false });
  const oneroofPage = await oneroofBrowser.newPage();
  await oneroofPage.goto(CONFIG.oneroof, { waitUntil: 'networkidle0' });
  console.log('  ✓ OneRoof opened - please search for the property');
  
  // Collect manual data
  console.log('\n📋 Please enter the following values from OneRoof and council websites:\n');
  
  const manualData = {
    capitalValue: await prompt('Capital Value (e.g., 685000): $ '),
    landValue: await prompt('Land Value (e.g., 485000): $ '),
    annualRates: await prompt('Annual Rates (e.g., 2450): $ '),
    lastSoldPrice: await prompt('Last Sold Price (if known, or press Enter): $ '),
    lastSoldDate: await prompt('Last Sold Date (or press Enter): '),
    
    floodHazard: await prompt('\nFlood Hazard (No/Yes/Partial): '),
    liquefactionRisk: await prompt('Liquefaction Risk (Low/Medium/High): '),
    zoningCode: await prompt('Zoning Code (e.g., R1, MDU, etc.): '),
    
    riskRating: await prompt('\nOverall Risk Rating (1-5, where 5 is highest risk): ')
  };
  
  rl.close();
  await oneroofBrowser.close();
  
  // Merge all data
  return {
    ...linzData,
    ...manualData,
    councilData
  };
}

// Generate HTML report
function generateHTML(data, orderId, address) {
  console.log('\n[4/6] Generating HTML report...');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Due Diligence Report - ${orderId}</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    h1 { color: #007A4D; border-bottom: 3px solid #FFB81C; padding-bottom: 10px; }
    h2 { color: #2D2D2D; margin-top: 30px; }
    .header { background: linear-gradient(135deg, #007A4D, #FFB81C); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { color: white; border: none; margin: 0; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 0.9em; }
    .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .data-item { background: #f8f9fa; padding: 15px; border-radius: 6px; }
    .data-label { font-weight: 600; color: #666; font-size: 0.85em; text-transform: uppercase; }
    .data-value { font-size: 1.1em; color: #2D2D2D; margin-top: 5px; }
    .risk-badge { display: inline-block; padding: 5px 15px; border-radius: 100px; font-weight: bold; font-size: 1.2em; }
    .risk-low { background: #d4edda; color: #155724; }
    .risk-medium { background: #fff3cd; color: #856404; }
    .risk-high { background: #f8d7da; color: #721c24; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 Property Due Diligence Report</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Order ID: ${orderId} | Generated: ${new Date().toLocaleDateString('en-NZ')}</p>
  </div>
  
  <div class="disclaimer">
    <strong>⚠️ IMPORTANT:</strong> This is an INFORMATIONAL REPORT only, prepared by AI Driven. It is NOT a substitute for a formal LIM, legal advice, building inspection, or valuation. Do not rely on this report for final settlement decisions. Always obtain independent professional advice before purchasing property.
  </div>
  
  <h2>1. Property Identification</h2>
  <div class="data-grid">
    <div class="data-item">
      <div class="data-label">Address</div>
      <div class="data-value">${address}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Property Type</div>
      <div class="data-value">Residential</div>
    </div>
  </div>
  
  <h2>2. Legal Details (LINZ)</h2>
  <div class="data-grid">
    <div class="data-item">
      <div class="data-label">Title Number</div>
      <div class="data-value">${data.titleNumber || 'N/A'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Land Area</div>
      <div class="data-value">${data.landArea || 'N/A'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Owners</div>
      <div class="data-value">${data.owners || 'N/A'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Legal Description</div>
      <div class="data-value">${data.legalDescription || 'N/A'}</div>
    </div>
  </div>
  
  <h3>Easements & Encumbrances</h3>
  <p>${data.easements || 'No easements registered'}</p>
  
  <h2>3. Natural Hazards</h2>
  <div class="data-grid">
    <div class="data-item">
      <div class="data-label">Flood Hazard</div>
      <div class="data-value">${data.floodHazard || 'Not assessed'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Liquefaction Risk</div>
      <div class="data-value">${data.liquefactionRisk || 'Not assessed'}</div>
    </div>
  </div>
  
  <h2>4. Zoning & Land Use</h2>
  <div class="data-item">
    <div class="data-label">District Plan Zoning</div>
    <div class="data-value">${data.zoningCode || 'Not assessed'}</div>
  </div>
  
  <h2>5. Valuation & Rates</h2>
  <div class="data-grid">
    <div class="data-item">
      <div class="data-label">Capital Value</div>
      <div class="data-value">$${parseInt(data.capitalValue || 0).toLocaleString()}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Land Value</div>
      <div class="data-value">$${parseInt(data.landValue || 0).toLocaleString()}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Annual Rates</div>
      <div class="data-value">$${parseInt(data.annualRates || 0).toLocaleString()}</div>
    </div>
  </div>
  
  ${data.lastSoldPrice ? `
  <h3>Sales History</h3>
  <p>Last sold for $${parseInt(data.lastSoldPrice).toLocaleString()} on ${data.lastSoldDate || 'unknown date'}</p>
  ` : ''}
  
  <h2>6. Risk Summary</h2>
  <div style="text-align: center; margin: 30px 0;">
    <span class="risk-badge ${data.riskRating <= 2 ? 'risk-low' : data.riskRating <= 3 ? 'risk-medium' : 'risk-high'}">
      Risk Rating: ${data.riskRating}/5 - ${data.riskRating <= 2 ? 'LOW' : data.riskRating <= 3 ? 'MEDIUM' : 'HIGH'}
    </span>
  </div>
  
  <h3>Key Findings:</h3>
  <ul>
    <li>Property title clear: ${data.titleNumber ? '✅ Yes' : '⚠️ Not verified'}</li>
    <li>Flood risk: ${data.floodHazard === 'No' ? '✅ None identified' : '⚠️ ' + data.floodHazard}</li>
    <li>Liquefaction: ${data.liquefactionRisk === 'Low' ? '✅ Low risk' : data.liquefactionRisk === 'Medium' ? '⚠️ Medium risk' : '❌ High risk - further investigation recommended'}</li>
  </ul>
  
  <h3>Recommendations:</h3>
  <ol>
    <li>Obtain a formal LIM from the council before settlement</li>
    <li>Commission an independent building inspection</li>
    <li>Verify all information with your solicitor</li>
    ${data.riskRating >= 4 ? '<li><strong>Strongly recommend</strong> specialist geotechnical report due to high risk rating</li>' : ''}
  </ol>
  
  <div class="footer">
    <p><strong>AI Driven</strong> | Practical AI for Real Businesses</p>
    <p>gerhard@aidriven.biz | 021 402 8807</p>
    <p>Report generated: ${new Date().toLocaleString('en-NZ')}</p>
    <p style="margin-top: 15px; font-size: 0.85em;">This report is for informational purposes only and does not constitute professional advice.</p>
  </div>
</body>
</html>`;

  // Save HTML
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const htmlPath = path.join(outputDir, `${orderId}-basic.html`);
  fs.writeFileSync(htmlPath, html);
  console.log('  ✅ Saved:', htmlPath);
  
  return htmlPath;
}

// Generate PDF from HTML
async function generatePDF(htmlPath, orderId) {
  console.log('\n[5/6] Converting to PDF...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const pdfPath = path.join(__dirname, 'output', `${orderId}-basic.pdf`);
  
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
  });
  
  await browser.close();
  console.log('  ✅ PDF saved:', pdfPath);
  
  return pdfPath;
}

// Main execution
async function main() {
  console.log('\n🚀 AI Driven - Property Due Diligence Report Generator');
  console.log('Phase 2: Semi-Automated Basic Report');
  console.log('=' .repeat(60));
  
  // Get address from command line
  const address = process.argv.slice(2).join(' ');
  if (!address) {
    console.error('\n❌ Usage: node generate-report.js "123 Smith Street, Marewa, Napier"');
    process.exit(1);
  }
  
  console.log('\nProperty:', address);
  
  // Generate order ID
  const orderId = generateOrderId();
  console.log('Order ID:', orderId);
  
  // Get LINZ API key
  const linzApiKey = getLinZApiKey();
  
  // Launch browser for council GIS
  const browser = await puppeteer.launch({ headless: false });
  
  try {
    // Step 1: Fetch LINZ data
    const linzData = await fetchLinZData(address, linzApiKey);
    
    // Step 2: Check council GIS
    const councilData = await scrapeCouncilGIS(address, browser);
    
    // Step 3: Prompt for manual data
    const completeData = await promptForData(linzData, councilData);
    
    // Step 4: Generate HTML
    const htmlPath = generateHTML(completeData, orderId, address);
    
    // Step 5: Generate PDF
    const pdfPath = await generatePDF(htmlPath, orderId);
    
    // Done!
    console.log('\n[6/6] ✅ Report generation complete!\n');
    console.log('📄 PDF ready:', pdfPath);
    console.log('\nNext steps:');
    console.log('  1. Review PDF for accuracy');
    console.log('  2. Email to customer');
    console.log('  3. Update Google Sheet tracking\n');
    
  } catch (error) {
    console.error('\n❌ Error during report generation:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run
main();
