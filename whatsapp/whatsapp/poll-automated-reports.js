/**
 * Poll WhatsApp Automated Reports - Phase 2
 * 
 * This script polls the Cloudflare Worker for pending AUTOMATED report requests
 * (from Google Forms with NO add-ons selected - fully automated processing)
 * 
 * Run every 3 minutes via cron job:
 *   node poll-automated-reports.js
 * 
 * What it does:
 * 1. Fetches pending automated requests from Worker KV store
 * 2. For each request: generates report (LINZ + Hazards data)
 * 3. Assembles PDF report
 * 4. Sends final email to customer with PDF attached
 * 5. Marks request as completed
 */

const fs = require('fs');
const path = require('path');

// Import report engine and APIs
const { generateHTMLReport, saveHTMLReport, getReportURL } = require('./report-engine-v2');
const { getLINZData } = require('./linz-api');
const { getHazardsData } = require('./hazards-api');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP'; // Same as your existing worker
const AUTOMATED_QUEUE_FILE = path.join(__dirname, 'automated-queue.json');
const REPORTS_DIR = path.join(__dirname, '..', 'aidriven-website', 'reports', 'pdf');

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
 * Generate Tier 1 Report (LINZ + Hazards)
 */
async function generateReport(address, packageType, requestId, customer) {
  log('info', `📊 Generating report for: ${address}`);
  
  try {
    // Step 1: Fetch LINZ data
    console.log(`   Step 1/3: Fetching LINZ title data...`);
    const linzData = await getLINZData(address);
    await sleep(500); // Rate limiting
    
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
      ratesData: null, // Will be added in next iteration
      requestId,
      customer
    };
    
    const html = generateHTMLReport(reportData);
    const htmlPath = saveHTMLReport(html, requestId);
    
    // Get public URL (will be R2 URL once hosting is set up)
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
 * Send final report email via Mailgun
 */
async function sendReportEmail(customer, address, pdfPath, pdfUrl, requestId) {
  const MAILGUN_DOMAIN = 'mg.aidriven.biz';
  const MAILGUN_API_KEY = '46490b2301ebf73fa76a2d5c29b60930-6648d8d0-96b41ae8';
  const FROM_EMAIL = `gerhard@${MAILGUN_DOMAIN}`;
  
  const subject = 'Your Property Due Diligence Report is Ready!';
  const body = `
Hi ${customer.name || 'there'},

Great news! Your property due diligence report is ready.

📍 Property: ${address}
📦 Package: ${customer.package || 'basic'}

📄 View Report Online: ${pdfUrl}

Your report includes:
✓ LINZ title information
✓ Natural hazards assessment
✓ Property details summary

⚠️ IMPORTANT: This is an INFORMATIONAL REPORT only, NOT a legal LIM. 
Do not use for final settlement decisions without professional advice.

Questions? Reply to this email!

AI Driven Team
🌐 aidriven.biz
  `.trim();

  try {
    // Prepare multipart form data for email with attachment
    const formData = new FormData();
    formData.append('from', `Gerhard (AI Driven) <${FROM_EMAIL}>`);
    formData.append('to', customer.email);
    formData.append('subject', subject);
    formData.append('text', body);
    
    // Attach PDF
    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      formData.append('attachment', blob, `report_${requestId}.pdf`);
    }
    
    const credentials = btoa(`api:${MAILGUN_API_KEY}`);
    
    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials
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
 * Mark request as completed in KV store
 */
async function markAsCompleted(requestId) {
  try {
    // Move from automated queue to completed
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
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      log('info', `Created reports directory: ${REPORTS_DIR}`);
    }
    
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
      const reportResult = await generateReport(address, pkg, requestId);
      
      if (!reportResult.success) {
        log('error', `Skipping ${requestId} due to report generation failure`);
        continue;
      }
      
      // Send final email with PDF
      try {
        await sendReportEmail(customer, address, reportResult.pdfPath, reportResult.pdfUrl, requestId);
        
        // Mark as completed
        await markAsCompleted(requestId);
        
        log('info', `✅ Successfully processed ${requestId}`);
        
      } catch (emailError) {
        log('error', `Failed to send email for ${requestId}: ${emailError.message}`);
        // Don't mark as completed - will retry next poll
      }
      
      // Small delay between requests to avoid rate limits
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
