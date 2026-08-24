/**
 * Poll Automated Reports - Phase 2 (Complete Integration)
 * 
 * Polls Cloudflare Worker for pending automated reports and generates them
 * with full LINZ data, hazards assessment, and HTML reports with interactive maps
 */

const path = require('path');
const fs = require('fs');

// Import push automation
const { pushReport } = require('./push-to-github');

// Import report engine and APIs
const { generateHTMLReport, saveHTMLReport, getReportURL } = require('./report-engine-v2');
const { getLINZData } = require('./linz-api');
const { getHazardsData } = require('./hazards-linz-integration'); // Updated to LINZ integration

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const REPORTS_DIR = path.join(__dirname, '..', 'aidriven-website', 'reports');
const HTML_DIR = path.join(REPORTS_DIR, 'html');

// Ensure directories exist
[REPORTS_DIR, HTML_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

/**
 * Logging helper
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Fetch automated requests from Worker
 */
async function fetchAutomatedRequests() {
  try {
    // URL-encode the token (Worker expects encoded tokens)
    const encodedToken = encodeURIComponent(POLL_TOKEN);
    const pollUrl = `${WORKER_URL}/poll?token=${encodedToken}`;
    
    const response = await fetch(pollUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}: ${result.error || result.message}`);
    }
    
    log('info', `Fetched ${result.count} requests from queue`);
    return result.requests || [];
    
  } catch (error) {
    log('error', `Failed to fetch requests: ${error.message}`);
    throw error;
  }
}

/**
 * Generate complete report with LINZ + Hazards data
 */
async function generateReport(address, packageType, requestId, customer, addressStructured = null) {
  log('info', `📊 Generating report for: ${address}`);
  
  try {
    // Step 1: Fetch LINZ geocoding data (pass structured data for better matching)
    console.log(`   Step 1/4: Fetching LINZ geocoding...`);
    const linzGeoData = await getLINZData(address, addressStructured);
    await sleep(500);
    
    // Verify we have coordinates
    if (!linzGeoData.latitude || !linzGeoData.longitude) {
      throw new Error(`LINZ geocoding failed - no coordinates. Address: ${address}, Structured: ${JSON.stringify(addressStructured)}`);
    }
    
    // Use corrected address from fuzzy match if available
    const effectiveAddress = linzGeoData.address || address;
    if (linzGeoData.matchQuality === 'FUZZY') {
      console.log(`   ℹ️  Address corrected: "${address}" → "${effectiveAddress}" (edit distance: ${linzGeoData.editDistance})`);
    }
    console.log(`   ✅ LINZ coords: [${linzGeoData.latitude}, ${linzGeoData.longitude}]`);
    
    // Initialize linzData with geocoding only (title data will come from scraper)
    const linzData = {
      ...linzGeoData,
      titleNumber: null,
      legalDescription: null,
      area: null,
      ownership: null,
      easements: [],
      parcels: []
    };
    
    // Step 2: Fetch Hazards data
    console.log(`   Step 2/4: Fetching hazards data...`);
    const hazardsData = await getHazardsData(linzGeoData.latitude, linzGeoData.longitude);
    await sleep(500);
    
    // Step 3: Fetch Title Data from LINZ API + Council Rates from Scraper
    let titleData = null;
    let ratesData = null;
    
    try {
      console.log(`   Step 3/4: Fetching title data (LINZ) and rates data (Council)...`);
      
      // 3a. Get Title Data from LINZ API (NATIONWIDE COVERAGE)
      const { getCompleteTitleData } = require('./linz-titles-integration');
      titleData = await getCompleteTitleData(linzGeoData.latitude, linzGeoData.longitude);
      
      if (titleData) {
        console.log(`   ✅ LINZ Title retrieved: ${titleData.titleNumber}`);
      } else {
        console.log(`   ℹ️  No LINZ title found at this location`);
      }
      
      // 3b. Get Council Rates Data from Scraper (Napier only, for valuations/rates)
      try {
        const { execSync } = require('child_process');
        const scriptPath = require('path').join(__dirname, '..', 'napier_rates_scraper.py');
        
        // Extract just the street address for the scraper (remove suburb/city/postcode)
        let scraperAddress = address;
        if (addressStructured && addressStructured.houseNumber && addressStructured.streetName) {
          scraperAddress = `${addressStructured.houseNumber} ${addressStructured.streetName}${addressStructured.streetType ? ' ' + addressStructured.streetType : ''}`;
          console.log(`   🏠 Using simplified address for scraper: "${scraperAddress}"`);
        }
        
        const pythonOutput = execSync(`python "${scriptPath}" "${scraperAddress.replace(/"/g, '\\"')}"`, {
          encoding: 'utf8',
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        });
        
        const ratesJson = JSON.parse(pythonOutput.trim());
        
        ratesData = {
          capitalValue: ratesJson.council_rates?.capital_value_current,
          landValue: ratesJson.council_rates?.land_value_current,
          improvementsValue: ratesJson.council_rates?.improvements_current,
          valuationDate: ratesJson.council_rates?.valuation_date_current,
          generalRates: null,
          targetedRates: null,
          totalRates: null,
          myPropertyData: ratesJson
        };
        
        if (ratesJson.council_rates?.charges) {
          const totalCharges = ratesJson.council_rates.charges.reduce((sum, charge) => sum + (charge.total || 0), 0);
          ratesData.totalRates = totalCharges > 0 ? totalCharges : null;
        }
        
        console.log(`   ✅ Rates data fetched: CV $${ratesData.capitalValue?.toLocaleString() || 'N/A'}`);
      } catch (scraperError) {
        console.log(`   ⚠️  Council rates unavailable: ${scraperError.message}`);
        console.log(`   ℹ️  Property may be outside Napier City Council jurisdiction`);
      }
      
      // Merge LINZ title data into linzData object
      if (titleData) {
        console.log(`   📋 Merging LINZ title data...`);
        linzData.titleNumber = titleData.titleNumber || null;
        linzData.legalDescription = titleData.legalDescription || null;
        linzData.area = titleData.area || null;
        linzData.ownershipType = titleData.ownershipType || null;
        linzData.landDistrict = titleData.landDistrict || null;
        linzData.numberOfOwners = titleData.numberOfOwners || 0;
        
        // Note: Easements not yet implemented in LINZ integration
        // Would require additional query to LINZ easements layer
        if (titleData.easements && titleData.easements.length > 0) {
          linzData.easements = titleData.easements;
          console.log(`   ✅ Found ${linzData.easements.length} easement(s)`);
        }
      }
      
    } catch (ratesError) {
      console.log(`   ⚠️  Rates/title data unavailable: ${ratesError.message}`);
      console.log(`   ℹ️  Property may be outside Napier City Council jurisdiction`);
      // Continue without rates data - title section will show "unavailable"
    }
    
    // Final step: Generate HTML report
    console.log(`   📄 Generating HTML report...`);
    const reportData = {
      address: effectiveAddress,
      originalAddress: effectiveAddress !== address ? address : undefined,
      linzData,
      hazardsData,
      ratesData,
      requestId,
      customer,
      packageType: packageType || 'Basic',  // Use the function parameter with fallback
    };
    
    console.log(`   📋 Report data keys: ${Object.keys(reportData).join(', ')}, packageType=${reportData.packageType}`);
    const html = generateHTMLReport(reportData);
    const htmlPath = saveHTMLReport(html, requestId);
    const reportUrl = getReportURL(requestId);
    
    log('info', `✅ Report generated: ${htmlPath}`);
    
    return {
      success: true,
      htmlPath,
      reportUrl,
      effectiveAddress,
      linzData,
      hazardsData
    };
    
  } catch (error) {
    log('error', `Report generation failed: ${error.message}\nStack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send final report email with HTML report link
 */
async function sendReportEmail(customer, address, reportResult, requestId) {
  const MAILGUN_DOMAIN = 'mg.aidriven.biz';
  const MAILGUN_API_KEY = '46490b2301ebf73fa76a2d5c29b60930-6648d8d0-96b41ae8';
  const FROM_EMAIL = `gerhard@${MAILGUN_DOMAIN}`;
  
  const reportUrl = `https://aidriven.biz${reportResult.reportUrl}`;
  
  const subject = 'Your Property Due Diligence Report is Ready!';
  
  // HTML email updated to match aidriven.biz branding
  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #f0f0f0; background: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #111111; border: 1px solid rgba(247,147,30,0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #f7931e, #8b2fc9); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px; color: #f0f0f0; }
    .property-box { background: #1a1a1a; padding: 20px; border-left: 4px solid #f7931e; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .button { display: inline-block; padding: 14px 28px; background: #f7931e; color: #000000 !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; transition: all 0.2s; }
    .button-secondary { background: transparent; color: #f7931e !important; border: 2px solid #f7931e; }
    .footer { background: #0a0a0a; color: #888; padding: 20px; text-align: center; font-size: 13px; border-top: 1px solid rgba(247,147,30,0.1); }
    .highlight { color: #f7931e; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 36px;">🏠</h1>
      <h1 style="margin: 0; font-size: 24px;">Your Report is Ready!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">AI Driven Property Due Diligence</p>
    </div>
    
    <div class="content">
      <p>Hi ${customer.name || 'there'},</p>
      
      <p>Great news! Your property due diligence report is ready for viewing.</p>
      
      <div class="property-box">
        <span class="highlight">📍 Property:</span> ${address}${reportResult.originalAddress ? `<br><span style="font-size:12px;color:#888;">(Corrected from: ${reportResult.originalAddress})</span>` : ''}<br>
        <span class="highlight">📦 Package:</span> ${customer.package || 'Basic'}<br>
        <span class="highlight">📅 Report Date:</span> ${new Date().toLocaleDateString('en-NZ')}
      </div>
      
      <p>Your report includes a full LINZ data analysis, interactive maps, and a natural hazards assessment.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reportUrl}" class="button">📄 View Online Report</a>
        <br>
        <a href="${reportUrl}/download.pdf" class="button button-secondary">📥 Download PDF</a>
      </div>
      
      <p style="font-size: 13px; color: #888; font-style: italic; margin-top: 20px;">
        ⚠️ Important: This is an INFORMATIONAL REPORT only, NOT a legal LIM. 
        Do not use for final settlement decisions without professional advice.
      </p>
      
      <p>Questions? Just reply to this email!</p>
      
      <p>Cheers,<br>
      <strong style="color: #f7931e;">The AI Driven Team</strong><br>
      🌐 <a href="https://aidriven.biz" style="color: #8b2fc9; text-decoration: none;">aidriven.biz</a></p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">AI Driven | Practical AI for real businesses</p>
      <p style="margin: 10px 0 0 0; opacity: 0.6; font-size: 11px;">Report ID: ${requestId}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Hi ${customer.name || 'there'},

Great news! Your property due diligence report is ready.

📍 Property: ${address}
📦 Package: ${customer.package || 'basic'}

📄 View Report Online: ${reportUrl}

Your report includes:
✓ LINZ title information
✓ Natural hazards assessment
✓ Property details summary

⚠️ IMPORTANT: This is an INFORMATIONAL REPORT only, NOT a legal LIM. 

Questions? Reply to this email!

AI Driven Team
🌐 aidriven.biz
  `.trim();

  try {
    const formData = new URLSearchParams();
    formData.append('from', `Gerhard (AI Driven) <${FROM_EMAIL}>`);
    formData.append('to', customer.email);
    formData.append('subject', subject);
    formData.append('text', textBody);
    formData.append('html', htmlBody);
    
    const credentials = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
    
    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    log('info', `✅ Final report email sent to ${customer.email}: ${result.id}`);
    
    return { success: true, id: result.id };
    
  } catch (error) {
    log('error', `Failed to send report email: ${error.message}`);
    throw error;
  }
}

/**
 * Mark request as completed
 */
async function markAsCompleted(requestId) {
  try {
    const completeUrl = `${WORKER_URL}/complete?token=${POLL_TOKEN}&id=${requestId}`;
    
    const response = await fetch(completeUrl, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }
    
    log('info', `✅ Marked ${requestId} as completed`);
    return true;
    
  } catch (error) {
    log('error', `Failed to mark as completed: ${error.message}`);
    return false;
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  log('info', '🚀 Starting automated report poll...');
  
  try {
    // Fetch pending automated requests
    const requests = await fetchAutomatedRequests();
    
    if (requests.length === 0) {
      log('info', '✅ No pending automated requests');
      return;
    }
    
    log('info', `📋 Processing ${requests.length} automated request(s)...`);
    
    // Process each request
    for (const req of requests) {
      const { id: requestId, customer, address, addressStructured } = req;
      const pkg = req.package || 'Basic';  // Default to Basic if not specified
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Processing: ${requestId}`);
      console.log(`Address: ${address}`);
      if (addressStructured) {
        console.log(`Structured: ${addressStructured.houseNumber} ${addressStructured.streetName} ${addressStructured.streetType}, ${addressStructured.suburb}`);
      }
      console.log(`Customer: ${customer.name} (${customer.email})`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Generate report with structured data for better LINZ matching
      // Generate report
      const reportResult = await generateReport(address, pkg || 'Basic', requestId, customer, addressStructured);
      
      if (!reportResult.success) {
        log('error', `Skipping ${requestId} due to report generation failure`);
        continue;
      }
      
      // Push to GitHub and VERIFY deployment
      log('info', `🚀 Pushing report to GitHub for deployment...`);
      const pushResult = await pushReport(reportResult.htmlPath, requestId);
      
      if (!pushResult.success) {
        log('error', `❌ GitHub push FAILED for ${requestId}. ABORTING email send.`);
        log('error', `   Report generated but NOT accessible online. Manual intervention required.`);
        // DO NOT send email - report is not accessible
        // Mark as failed so we can retry
        await markAsProcessing(requestId); // Reset status for retry
        continue; // Skip to next request
      }
      
      // Update report URL with live GitHub URL
      const finalReportResult = { ...reportResult, reportUrl: pushResult.liveUrl.replace('https://aidriven.biz', '') };
      
      // Use corrected address for email if fuzzy match was used
      const emailAddress = reportResult.effectiveAddress || address;
      
      // Send final email with LIVE URL
      try {
        await sendReportEmail(customer, emailAddress, finalReportResult, requestId);
        
        // Mark as completed
        await markAsCompleted(requestId);
        
        log('info', `✅ Successfully processed ${requestId}`);
        
      } catch (emailError) {
        log('error', `Failed to send email for ${requestId}: ${emailError.message}`);
        // Don't mark as completed - will retry next poll
      }
      
      // Small delay between requests
      await sleep(1000);
    }
    
    log('info', '✅ Automated report poll complete');
    
  } catch (error) {
    log('error', `Poll failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main
main();

