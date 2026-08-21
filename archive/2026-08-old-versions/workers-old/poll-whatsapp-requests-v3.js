/**
 * Poll WhatsApp Requests from Cloudflare Worker - VERSION 3 (Unified Report Engine)
 * 
 * CHANGES IN V3:
 * - Uses unified report-engine.js with LINZ API integration
 * - Automatic data fetching from LINZ, council, and OneRoof
 * - Generates professional reports with real property data
 * - Same auto-deploy workflow (GitHub → Cloudflare Pages)
 * 
 * This script:
 * 1. Calls the Cloudflare Worker /poll endpoint
 * 2. Fetches pending LIM/Due Diligence requests
 * 3. Processes each request using unified report engine
 * 4. Auto-commits and pushes to GitHub (triggers automatic Cloudflare deployment)
 * 5. Sends WhatsApp message with link to view report
 * 
 * Run every 3 minutes via cron job
 */

const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');
const { exec } = require('child_process');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const WORKSPACE_ROOT = 'C:\\Users\\gstim\\.openclaw\\workspace';
const WEB_REPORTS_DIR = path.join(WORKSPACE_ROOT, 'aidriven-website', 'reports');
const WEB_PDF_DIR = path.join(WEB_REPORTS_DIR, 'pdf');

// Import unified report engine (NEW - includes LINZ integration)
const { generatePropertyReport } = require('../automation/whatsapp-property-report/report-engine');

// Ensure directories exist
[WEB_REPORTS_DIR, WEB_PDF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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
 * Poll Worker for pending requests
 */
async function pollPendingRequests() {
  const pollUrl = `${WORKER_URL}/poll?token=${encodeURIComponent(POLL_TOKEN)}`;
  
  log('info', `Polling Worker: ${pollUrl}`);
  
  try {
    const response = await fetch(pollUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      log('error', `Poll failed with status ${response.status}`, result);
      return [];
    }
    
    log('info', `Poll successful - ${result.count} request(s) found`, result);
    return result.requests || [];
    
  } catch (error) {
    log('error', `Poll request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Process a single request
 */
async function processRequest(request) {
  log('info', `Processing request ${request.id}`, {
    type: request.requestType,
    address: request.address,
    customer: request.customer
  });
  
  return await processDueDiligenceRequest(request);
}

/**
 * Process Due Diligence Report Request - Uses Unified Report Engine
 */
async function processDueDiligenceRequest(request) {
  log('info', `Due Diligence request for: ${request.address}`);
  
  try {
    // Use the unified report engine (includes LINZ data fetching)
    log('info', '🚀 Using unified report engine with LINZ integration...');
    
    const reportResult = await generatePropertyReport({
      address: request.address,
      package: request.package || 'basic',
      customerName: request.customer?.name || 'Customer',
      requestId: request.id
    });
    
    if (!reportResult.success) {
      throw new Error(reportResult.error || 'Report generation failed');
    }
    
    // Generate PDF from HTML (for download option)
    const htmlContent = fs.readFileSync(
      path.join(WEB_REPORTS_DIR, reportResult.filename), 
      'utf-8'
    );
    
    const pdfFilename = reportResult.filename.replace('.html', '.pdf');
    const webPdfPath = path.join(WEB_PDF_DIR, pdfFilename);
    
    log('info', `Generating PDF...`);
    const file = { content: htmlContent };
    const options = { 
      format: 'A4',
      quality: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    fs.writeFileSync(webPdfPath, pdfBuffer);
    log('info', `Web PDF saved: ${webPdfPath}`);
    
    log('info', `Report generated successfully`, { 
      orderId: reportResult.orderId,
      htmlUrl: reportResult.reportUrl,
      pdfUrl: `https://aidriven.biz/reports/pdf/${pdfFilename}`
    });
    
    return {
      success: true,
      orderId: reportResult.orderId,
      reportUrl: reportResult.reportUrl,
      pdfUrl: `https://aidriven.biz/reports/pdf/${pdfFilename}`,
      filename: reportResult.filename
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
 * Send WhatsApp message via Worker
 */
async function sendWhatsAppMessage(phoneNumber, messageText) {
  log('info', `Sending WhatsApp message to ${phoneNumber}`);
  log('info', `Message content: ${messageText.substring(0, 100)}...`);
  
  try {
    const sendUrl = `${WORKER_URL}/send`;
    
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLL_TOKEN}`
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: messageText
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('info', `Message sent successfully`, { messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } else {
      log('error', `Message send failed: ${result.error || response.statusText}`);
      return { success: false, error: result.error || response.statusText };
    }
    
  } catch (error) {
    log('error', `Failed to send WhatsApp message: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Update request status in KV store
 */
async function updateRequestStatus(requestId, status, result) {
  log('info', `Updating request ${requestId} status to ${status}`, result);
  
  try {
    const updateUrl = `${WORKER_URL}/update`;
    
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLL_TOKEN}`
      },
      body: JSON.stringify({
        requestId: requestId,
        status: status,
        result: result
      })
    });
    
    const updateResult = await response.json();
    
    if (response.ok && updateResult.success) {
      log('info', `Status updated successfully: ${requestId} -> ${status}`);
      return { success: true };
    } else {
      log('error', `Status update failed: ${updateResult.error || response.statusText}`);
      return { success: false };
    }
    
  } catch (error) {
    log('error', `Failed to update status: ${error.message}`);
    return { success: false };
  }
}

/**
 * Main execution
 */
async function main() {
  log('info', '=== WhatsApp Request Poll Started (v3 - Unified Engine) ===');
  
  try {
    // Step 1: Poll for pending requests
    const requests = await pollPendingRequests();
    
    if (requests.length === 0) {
      log('info', 'No pending requests - exiting');
      return;
    }
    
    log('info', `Processing ${requests.length} request(s)`);
    
    // Step 2: Process each request
    for (const request of requests) {
      try {
        const result = await processRequest(request);
        
        // Step 3: Send result back via WhatsApp with report link
        if (result.success) {
          const successMessage = `✅ Your Property Due Diligence Report is ready!

📍 Address: ${request.address}

📊 Package: ${request.package || 'Basic'}
🆔 Order ID: ${result.orderId || request.id.slice(0, 8)}

🌐 View your report online:
${result.reportUrl}

📥 The report includes:
• LINZ title information
• Council hazard maps
• Property valuation estimates
• Risk assessment summary

💳 Payment:
Contact us on +27 71 461 0886 (Business WhatsApp) to arrange payment and receive your final report.

Questions? Reply to this message or call us during business hours.

Thank you for choosing AI Driven! 🏠`;
          
          const sendResult = await sendWhatsAppMessage(request.customer.phone, successMessage);
          
          if (sendResult.success) {
            await updateRequestStatus(request.id, 'completed', {
              ...result,
              messageSent: true,
              messageId: sendResult.messageId
            });
            log('info', `✅ Request ${request.id} completed successfully`);
          } else {
            log('error', `Failed to send success message for ${request.id}`);
            await updateRequestStatus(request.id, 'completed_partial', {
              ...result,
              messageSent: false,
              sendError: sendResult.error
            });
          }
        } else {
          // Report generation failed
          const errorMessage = `⚠️ We encountered an issue generating your report for:

📍 ${request.address}

Our team has been notified and will contact you shortly to resolve this.

Please contact us on +27 71 461 0886 if you need immediate assistance.

Sorry for the inconvenience! 🙏`;
          
          await sendWhatsAppMessage(request.customer.phone, errorMessage);
          await updateRequestStatus(request.id, 'failed', {
            error: result.error
          });
          
          log('error', `❌ Request ${request.id} failed: ${result.error}`);
        }
        
      } catch (error) {
        log('error', `Unexpected error processing request ${request.id}: ${error.message}`);
        await updateRequestStatus(request.id, 'error', {
          error: error.message
        });
      }
    }
    
    log('info', '=== Poll Complete ===\n');
    
  } catch (error) {
    log('error', `Poll execution failed: ${error.message}`);
    log('error', error.stack);
  }
}

// Run
main();
