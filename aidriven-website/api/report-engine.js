#!/usr/bin/env node

/**
 * AI Driven - Property Due Diligence Report Engine
 * 
 * Generates Standard Tier reports ($149) combining:
 * - LINZ parcel & title data
 * - Cyclone Gabrielle flood assessment
 * - Napier Council rates breakdown
 * - Manual HBRC hazard verification links
 * 
 * Input: { address, coords, rid }
 * Output: Complete JSON report + HTML for PDF generation
 */

const axios = require('axios');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import fetchers from lib folder
const { fetchHazardData } = require('../lib/hazard-fetcher');
const { fetchLinZData } = require('../lib/linz-fetcher');

/**
 * Generate Standard Tier Property Report
 * @param {Object} input - Report request
 * @param {string} input.address - Property address
 * @param {Object} input.coords - Coordinates {lat, lon}
 * @param {string} input.rid - Napier Council RID (optional)
 * @returns {Promise<Object>} Complete report object
 */
async function generateStandardReport(input) {
  console.log('\n' + '='.repeat(80));
  console.log('AI DRIVEN - STANDARD PROPERTY REPORT');
  console.log('='.repeat(80));
  console.log(`Address: ${input.address}`);
  console.log(`Coordinates: ${input.coords.lat}, ${input.coords.lon}`);
  console.log(`RID: ${input.rid || 'Not provided'}`);
  console.log('='.repeat(80) + '\n');
  
  const report = {
    reportId: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    tier: 'STANDARD',
    price: 'NZD $149',
    property: {
      address: input.address,
      coordinates: input.coords,
      rid: input.rid
    },
    dataSources: {},
    sections: {}
  };
  
  // === 1. LINZ PARCEL & TITLE DATA ===
  console.log('\n[1/4] Fetching LINZ parcel data...');
  try {
    const linzData = await fetchLinZData(input.address, { 
      coords: input.coords,
      timeout: 20000 
    });
    report.sections.parcel = linzData;
    report.dataSources.linz = {
      status: 'Success',
      layers: ['Parcels', 'Title Estate', 'Title-Parcel Association'],
      fetchedAt: new Date().toISOString()
    };
    console.log('✅ LINZ data retrieved');
  } catch (error) {
    console.log('❌ LINZ fetch failed:', error.message);
    report.sections.parcel = { error: error.message };
    report.dataSources.linz = { status: 'Failed', error: error.message };
  }
  
  // === 2. HAZARD ASSESSMENT (LINZ Gabrielle + HBRC links) ===
  console.log('\n[2/4] Fetching hazard data...');
  try {
    const hazardData = await fetchHazardData(input.coords);
    report.sections.hazards = hazardData;
    report.dataSources.hazards = {
      linzGabrielle: 'Layer 112668',
      hbrManual: 'https://gis.hbrc.govt.nz/hazards/',
      fetchedAt: new Date().toISOString()
    };
    console.log('✅ Hazard data retrieved');
  } catch (error) {
    console.log('❌ Hazard fetch failed:', error.message);
    report.sections.hazards = { error: error.message };
    report.dataSources.hazards = { status: 'Failed', error: error.message };
  }
  
  // === 3. NAPIER COUNCIL RATES (Python scraper) ===
  console.log('\n[3/4] Extracting rates data...');
  if (input.rid) {
    try {
      const scriptPath = path.join(__dirname, '..', '..', 'due-diligence-mvp', 'napier_rates_extractor.py');
      const result = execSync(`python "${scriptPath}"`, {
        cwd: path.join(__dirname, '..', '..', 'due-diligence-mvp'),
        encoding: 'utf8',
        timeout: 60000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });
      
      // Read the generated JSON
      const jsonPath = path.join(__dirname, '..', '..', 'due-diligence-mvp', `napier_${input.rid}_rates.json`);
      if (fs.existsSync(jsonPath)) {
        const ratesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        report.sections.rates = ratesData;
        report.dataSources.rates = {
          source: 'Napier City Council',
          rid: input.rid,
          status: ratesData.success ? 'Success' : 'Partial',
          fetchedAt: new Date().toISOString()
        };
        console.log('✅ Rates data extracted');
      } else {
        throw new Error('Rates JSON file not generated');
      }
    } catch (error) {
      console.log('❌ Rates extraction failed:', error.message);
      report.sections.rates = { error: error.message, success: false };
      report.dataSources.rates = { status: 'Failed', error: error.message };
    }
  } else {
    console.log('⚠️ No RID provided - skipping rates extraction');
    report.sections.rates = { note: 'RID not provided - rates data unavailable' };
    report.dataSources.rates = { status: 'Skipped', reason: 'No RID' };
  }
  
  // === 4. HBRC MANUAL VERIFICATION LINKS ===
  console.log('\n[4/4] Generating HBRC verification links...');
  report.sections.hbrVerification = {
    status: 'Manual Verification Required',
    note: 'HBRC API access pending approval. Use the links below to manually verify hazards.',
    links: {
      hazardsMap: `https://hbmaps.hbrc.govt.nz/?lat=${input.coords.lat}&lon=${input.coords.lon}`,
      liquefaction: `https://hbmaps.hbrc.govt.nz/?layer=Earthquake_Liquefaction&lat=${input.coords.lat}&lon=${input.coords.lon}`,
      flooding: `https://hbmaps.hbrc.govt.nz/?layer=Flooding&lat=${input.coords.lat}&lon=${input.coords.lon}`,
      coastalInundation: `https://hbmaps.hbrc.govt.nz/?layer=Coastal_Inundation&lat=${input.coords.lat}&lon=${input.coords.lon}`,
      tsunami: `https://hbmaps.hbrc.govt.nz/?layer=Tsunami&lat=${input.coords.lat}&lon=${input.coords.lon}`
    },
    instructions: [
      'Click any link above to open HBRC Hazards Map',
      'The map will center on your property coordinates',
      'Toggle hazard layers to see if property is affected',
      'Screenshot or note findings for your records'
    ]
  };
  console.log('✅ HBRC verification links generated');
  
  // === COMPILE FINAL REPORT ===
  console.log('\n' + '='.repeat(80));
  console.log('REPORT GENERATION COMPLETE');
  console.log('='.repeat(80));
  
  return report;
}

/**
 * Generate HTML report for PDF conversion
 */
function generateReportHTML(report) {
  const { property, sections, dataSources } = report;
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Due Diligence Report - ${property.address}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
    h1 { color: #FFB81C; font-size: 2rem; margin-bottom: 10px; }
    h2 { color: #F7931E; font-size: 1.5rem; margin-top: 30px; border-bottom: 2px solid #F7931E; padding-bottom: 10px; }
    h3 { color: #FFB81C; font-size: 1.2rem; margin-top: 25px; }
    .meta { color: #a0a0a0; font-size: 0.9rem; margin-bottom: 30px; }
    .section { margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px; }
    .data-point { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333; }
    .data-label { color: #b0b0b0; }
    .data-value { color: #f0f0f0; font-weight: 600; }
    .success { color: #4CAF50; }
    .warning { color: #FFC107; }
    .error { color: #F44336; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { text-align: left; padding: 12px; background: rgba(247,147,30,0.1); color: #F7931E; border-bottom: 2px solid #F7931E; }
    td { padding: 12px; border-bottom: 1px solid #333; }
    tr:nth-child(even) { background: rgba(255,255,255,0.02); }
    .link-box { background: rgba(255,184,28,0.1); border: 1px solid #FFB81C; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .link-box a { color: #FFB81C; text-decoration: none; display: block; padding: 8px 0; }
    .link-box a:hover { text-decoration: underline; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; color: #808080; font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏠 Property Due Diligence Report</h1>
    <p class="meta">
      <strong>Report ID:</strong> ${report.reportId}<br>
      <strong>Generated:</strong> ${report.generatedAt}<br>
      <strong>Tier:</strong> ${report.tier} (${report.price})<br>
      <strong>Address:</strong> ${property.address}
    </p>
    
    <!-- PARCEL DATA -->
    <div class="section">
      <h2>📋 Parcel & Title Information</h2>
      ${sections.parcel?.error ? `<p class="error">Error: ${sections.parcel.error}</p>` : `
        <table>
          <tr><th>Field</th><th>Value</th></tr>
          <tr>
            <td>Legal Description</td>
            <td class="data-value">${sections.parcel?.legalDescription || 'N/A'}</td>
          </tr>
          <tr>
            <td>Land Area</td>
            <td class="data-value">${sections.parcel?.landArea || 'N/A'}</td>
          </tr>
          <tr>
            <td>Ownership</td>
            <td class="data-value">${sections.parcel?.owners || 'N/A'}</td>
          </tr>
          <tr>
            <td>Tenure Type</td>
            <td class="data-value">${sections.parcel?.tenureType || 'N/A'}</td>
          </tr>
          <tr>
            <td>Title Number</td>
            <td class="data-value">${sections.parcel?.titleNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td>Land District</td>
            <td class="data-value">${sections.parcel?.landDistrict || 'N/A'}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td class="data-value">${sections.parcel?.status || 'N/A'}</td>
          </tr>
        </table>
      `}
      <p class="meta">Source: LINZ Data Service | Fetched: ${sections.parcel?.fetchedAt || 'N/A'}</p>
    </div>
    
    <!-- PROPERTY LOCATION MAP -->
    <div class="section">
      <h2>📍 Property Location</h2>
      ${property.coordinates ? `
        <div style="text-align: center; margin: 20px 0;">
          <iframe 
            width="100%" 
            height="450" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0"
            style="border-radius: 8px; border: 2px solid #FFB81C;"
            src="https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lon}&hl=en&z=17&output=embed">
          </iframe>
          <p style="margin-top: 15px; color: #a0a0a0; font-size: 0.9rem;">
            📍 ${property.address}<br/>
            Coordinates: ${property.coordinates.lat.toFixed(6)}, ${property.coordinates.lon.toFixed(6)}
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lon}" target="_blank" style="color: #FFB81C; text-decoration: none; margin-right: 20px;">
              🗺️ Open in Google Maps
            </a>
            <a href="https://www.google.com/maps/search/property+boundaries/@${property.coordinates.lat},${property.coordinates.lon},17z" target="_blank" style="color: #FFB81C; text-decoration: none;">
              📐 View Property Boundaries
            </a>
          </div>
        </div>
      ` : '<p class="warning">Location coordinates unavailable</p>'}
    </div>
    
    <!-- HAZARD ASSESSMENT -->
    <div class="section">
      <h2>⚠️ Natural Hazard Assessment</h2>
      ${sections.hazards?.overallAssessment ? `
        <div style="padding: 15px; background: rgba(${sections.hazards.overallAssessment.riskRating === 'High' ? '244,67,54' : '76,175,80'},0.1); border-left: 4px solid ${sections.hazards.overallAssessment.riskRating === 'High' ? '#F44336' : '#4CAF50'}; margin: 20px 0;">
          <strong style="color: ${sections.hazards.overallAssessment.riskRating === 'High' ? '#F44336' : '#4CAF50'}; font-size: 1.2rem;">
            Risk Rating: ${sections.hazards.overallAssessment.riskRating}
          </strong>
          <p style="margin: 10px 0 0 0; color: #e0e0e0;">${sections.hazards.overallAssessment.summary}</p>
        </div>
        
        <h3>Cyclone Gabrielle Impact</h3>
        <div class="data-point">
          <span class="data-label">Affected:</span>
          <span class="data-value ${sections.hazards.hazards.cycloneGabrielle?.affected ? 'error' : 'success'}">
            ${sections.hazards.hazards.cycloneGabrielle?.affected ? 'YES - Property in flood extent area' : 'NO - Not affected'}
          </span>
        </div>
        ${sections.hazards.hazards.cycloneGabrielle?.floodExtentPolygons ? `
        <div class="data-point">
          <span class="data-label">Flood Polygons Nearby:</span>
          <span class="data-value">${sections.hazards.hazards.cycloneGabrielle.floodExtentPolygons}</span>
        </div>
        ` : ''}
      ` : '<p class="error">Hazard data unavailable</p>'}
    </div>
    
    <!-- RATES DATA -->
    <div class="section">
      <h2>💰 Council Rates Information</h2>
      ${sections.rates?.success ? `
        <table>
          <tr><th>Valuation</th><th>Amount (NZD)</th></tr>
          <tr>
            <td>Capital Value (CV)</td>
            <td class="data-value">$${sections.rates.data.capital_value?.toLocaleString() || 'N/A'}</td>
          </tr>
          <tr>
            <td>Land Value</td>
            <td class="data-value">$${sections.rates.data.land_value?.toLocaleString() || 'N/A'}</td>
          </tr>
          <tr>
            <td>Improvements Value</td>
            <td class="data-value">$${sections.rates.data.improvements_value?.toLocaleString() || 'N/A'}</td>
          </tr>
          <tr style="background: rgba(247,147,30,0.1);">
            <td style="font-weight: 600; color: #F7931E;">Annual Rates Total</td>
            <td style="font-weight: 600; color: #F7931E;">$${sections.rates.data.annual_rates?.toLocaleString() || 'N/A'}</td>
          </tr>
        </table>
        <p class="meta">Rates represent ${sections.rates.data.rates_as_percent_cv || 0}% of capital value | Source: Napier City Council | RID: ${sections.rates.rid}</p>
      ` : '<p class="warning">Rates data unavailable - RID not provided or extraction failed</p>'}
    </div>
    
    <!-- HBRC MANUAL VERIFICATION -->
    <div class="section">
      <h2>🗺️ HBRC Hazard Verification (Manual)</h2>
      <div class="link-box">
        <p style="margin-top: 0; color: #FFB81C; font-weight: 600;">⚠️ HBRC API Access Pending Approval</p>
        <p style="margin-bottom: 20px;">Click the links below to manually verify hazards on the HBRC Hazards Map:</p>
        <a href="${sections.hbrVerification?.links.hazardsMap}" target="_blank">🗺️ Open HBRC Hazards Map (All Layers)</a>
        <a href="${sections.hbrVerification?.links.liquefaction}" target="_blank">🌍 Liquefaction Hazard Map</a>
        <a href="${sections.hbrVerification?.links.flooding}" target="_blank">💧 Flood Risk Map</a>
        <a href="${sections.hbrVerification?.links.coastalInundation}" target="_blank">🌊 Coastal Inundation Map</a>
        <a href="${sections.hbrVerification?.links.tsunami}" target="_blank">🌊 Tsunami Evacuation Zone</a>
      </div>
      <p class="meta">Instructions: Click any link → Map centers on your property → Toggle layers to check hazards → Screenshot findings</p>
    </div>
    
    <!-- DATA SOURCES -->
    <div class="section">
      <h2>📊 Data Sources</h2>
      <table>
        <tr><th>Source</th><th>Status</th><th>Details</th></tr>
        <tr>
          <td>LINZ Data Service</td>
          <td class="${dataSources.linz?.status === 'Success' ? 'success' : 'error'}">${dataSources.linz?.status}</td>
          <td>${dataSources.linz?.layers ? dataSources.linz.layers.join(', ') : dataSources.linz?.error || 'N/A'}</td>
        </tr>
        <tr>
          <td>LINZ Cyclone Gabrielle</td>
          <td class="success">Success</td>
          <td>Layer 112668 - Satellite radar flood extent</td>
        </tr>
        <tr>
          <td>Napier City Council</td>
          <td class="${dataSources.rates?.status === 'Success' ? 'success' : 'warning'}">${dataSources.rates?.status}</td>
          <td>${dataSources.rates?.rid ? `RID: ${dataSources.rates.rid}` : dataSources.rates?.reason || 'N/A'}</td>
        </tr>
        <tr>
          <td>HBRC Hazards</td>
          <td class="warning">Manual Verification</td>
          <td>API access pending - use verification links above</td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <p><strong>AI Driven</strong> | Practical AI for Real Businesses</p>
      <p>Report generated: ${report.generatedAt} | ${report.reportId}</p>
      <p style="font-size: 0.75rem; color: #606060;">
        Disclaimer: This report is for informational purposes only. Verify all information with official sources before making property decisions.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

module.exports = {
  generateStandardReport,
  generateReportHTML
};
