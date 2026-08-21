/**
 * Poll Automated Reports - Phase 2 (Complete Integration)
 * 
 * Polls Cloudflare Worker for pending automated reports and generates them
 * with full LINZ data, hazards assessment, and HTML reports with interactive maps
 */

const fs = require('fs');
const path = require('path');

// Import report engine and APIs
const { generateHTMLReport, saveHTMLReport, getReportURL } = require('./report-engine-v2');
const { getLINZData } = require('./linz-api');
const { getHazardsData } = require('./hazards-api');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriv…K9mP';
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
    const pollUrl = `${WORKER_URL}/poll?token=${POLL_TOKEN}`;
    
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
async function generateReport(address, packageType, requestId, customer) {
  log('info', `📊 Generating report for: ${address}`);
  
  try {
    // Step 1: Fetch LINZ data
    console.log(`   Step 1/3: Fetching LINZ title data...`);
    const linzData = await getLINZData(address);
    await sleep(500);
    
    // Step 2: Fetch Hazards data
    console.log(`   Step 2/3: Fetching hazards data...`);
    const hazardsData = await getHazardsData(linzData.latitude, linzData.longitude);
    await sleep(500);
    
    // Step 3: Generate HTML report
    console.log(`   Step 3/3: Generating HTML report...`);
    const reportData = {
      address,
      linzData,
      hazardsData,
      ratesData: null, // Will be added when rates integration is ready
      requestId,
      customer
    };
    
    const html = generateHTMLReport(reportData);
    const htmlPath = saveHTMLReport(html, requestId);
    const reportUrl = getReportURL(requestId);
    
    log('info', `✅ Report generated: ${htmlPath}`);
    
    return {
      success: true,
      htmlPath,
      reportUrl,
      linzData,
      hazardsData
    };
    
  } catch (error) {
    log('error', `Report generation failed: ${error.message}`);
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
  
  // HTML email
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #007A4D, #005c3a); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 14px 28px; background: #FFB81C; color: #2D2D2D; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
    .button-secondary { background: white; color: #007A4D; border: 2px solid #007A4D; }
    .footer { background: #2D2D2D; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .property-box { background: white; padding: 20px; border-left: 4px solid #FFB81C; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎩 Your Report is Ready!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">AI Driven Property Due Diligence</p>
    </div>
    
    <div class="content">
      <p>Hi ${customer.name || 'there'},</p>
      
      <p>Great news! Your property due diligence report is ready for viewing.</p>
      
      <div class="property-box">
        <strong>📍 Property:</strong> ${address}<br>
        <strong>📦 Package:</strong> ${customer.package || 'Basic'}<br>
        <strong>📅 Report Date:</strong> ${new Date().toLocaleDateString('en-NZ')}
      </div>
      
      <p><strong>Your report includes:</strong></p>
      <ul>
        <li>✓ Interactive property map with satellite imagery</li>
        <li>✓ LINZ title information and easements</li>
        <li>✓ Natural hazards assessment (liquefaction, flood, erosion)</li>
        <li>✓ Council rates information (if included in package)</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reportUrl}" class="button">📄 View Online Report</a>
        <br>
        <a href="${reportUrl}/download.pdf" class="button button-secondary">📥 Download PDF</a>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        <strong>⚠️ Important:</strong> This is an INFORMATIONAL REPORT only, NOT a legal LIM. 
        Do not use for final settlement decisions without professional advice.
      </p>
      
      <p>Questions? Just reply to this email!</p>
      
      <p>Cheers,<br>
      <strong>The AI Driven Team</strong><br>
      🌐 aidriven.biz</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">AI Driven | Practical AI for real businesses</p>
      <p style="margin: 10px 0 0 0; opacity: 0.7; font-size: 12px;">Report ID: ${requestId}</p>
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
      const { id: requestId, customer, address, package: pkg } = req;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Processing: ${requestId}`);
      console.log(`Address: ${address}`);
      console.log(`Customer: ${customer.name} (${customer.email})`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Generate report
      const reportResult = await generateReport(address, pkg, requestId, customer);
      
      if (!reportResult.success) {
        log('error', `Skipping ${requestId} due to report generation failure`);
        continue;
      }
      
      // Send final email
      try {
        await sendReportEmail(customer, address, reportResult, requestId);
        
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
