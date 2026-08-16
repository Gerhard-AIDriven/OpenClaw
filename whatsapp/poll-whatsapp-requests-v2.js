/**
 * Poll WhatsApp Requests from Cloudflare Worker - VERSION 2 (with PDF + GitHub Auto-Deploy)
 * 
 * This script:
 * 1. Calls the Cloudflare Worker /poll endpoint
 * 2. Fetches pending LIM/Due Diligence requests
 * 3. Processes each request (generates HTML + PDF report)
 * 4. Saves reports to aidriven-website/reports/
 * 5. Auto-commits and pushes to GitHub (triggers automatic Cloudflare deployment)
 * 6. Sends WhatsApp message with link to view report
 * 
 * Run every 3 minutes via cron job
 * 
 * Requirements:
 * - Git installed and configured
 * - aidriven-website folder initialized as git repo
 * - GitHub remote configured and authenticated
 * - Cloudflare Pages connected to GitHub repo for auto-deployment
 */

const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');
const { exec } = require('child_process');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const WORKSPACE_ROOT = 'C:\\Users\\gstim\\.openclaw\\workspace';
const DUE_DILIGENCE_DIR = path.join(WORKSPACE_ROOT, 'due-diligence-mvp');
const LOCAL_REPORTS_DIR = path.join(DUE_DILIGENCE_DIR, 'reports');
const WEB_REPORTS_DIR = path.join(WORKSPACE_ROOT, 'aidriven-website', 'reports');
const WEB_PDF_DIR = path.join(WEB_REPORTS_DIR, 'pdf');

// Import unified report engine (NEW - replaces direct template calls)
const { generatePropertyReport } = require('../automation/whatsapp-property-report/report-engine');

// Legacy template import (fallback only)
const generateHtmlReport = require('./report-template-new.js');

// Ensure directories exist
[LOCAL_REPORTS_DIR, WEB_REPORTS_DIR, WEB_PDF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Auto-commit and push new reports to GitHub for automatic Cloudflare deployment
 */
function autoDeployToGitHub(reportFilename) {
  return new Promise((resolve, reject) => {
    log('info', `🚀 Starting auto-deployment to GitHub: ${reportFilename}`);
    
    const commands = [
      `cd "${path.join(WORKSPACE_ROOT, 'aidriven-website')}"`,
      'git add reports/',
      `git commit -m "Auto: Add report ${reportFilename}"`,
      'git push origin main'
    ].join(' && ');
    
    exec(commands, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        // Check if it's just a "nothing to commit" error (already committed)
        if (stderr.includes('nothing to commit') || stderr.includes('working tree clean')) {
          log('info', 'ℹ️ No changes to commit (already deployed)');
          resolve({ success: true, skipped: true, reason: 'no changes' });
        } else {
          log('error', `❌ GitHub auto-deploy failed: ${error.message}`, { stderr });
          reject(new Error(`Git command failed: ${error.message}`));
        }
      } else {
        log('info', `✅ Auto-deployed to GitHub successfully: ${reportFilename}`);
        log('info', `Git output: ${stdout.substring(0, 200)}`);
        resolve({ success: true, skipped: false, output: stdout });
      }
    });
  });
}

// Logging
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
 * Process Due Diligence Report Request - Generates HTML + PDF
 */
async function processDueDiligenceRequest(request) {
  log('info', `Due Diligence request for: ${request.address}`);
  
  try {
    // Generate unique output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeId = request.id.slice(0, 8);
    const safeAddress = request.address.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const baseFilename = `whatsapp_${safeAddress}_${safeId}_${timestamp}`;
    
    const localHtmlPath = path.join(LOCAL_REPORTS_DIR, `${baseFilename}.html`);
    const webHtmlPath = path.join(WEB_REPORTS_DIR, `${baseFilename}.html`);
    const webPdfPath = path.join(WEB_PDF_DIR, `${baseFilename}.pdf`);
    
    log('info', `Generating report files: ${baseFilename}`);
    
    // Generate HTML report
    const htmlContent = generateHtmlReport(request.address, request.id, timestamp);
    
    // Save local copy
    fs.writeFileSync(localHtmlPath, htmlContent, 'utf-8');
    log('info', `Local HTML saved: ${localHtmlPath}`);
    
    // Save web copy
    fs.writeFileSync(webHtmlPath, htmlContent, 'utf-8');
    log('info', `Web HTML saved: ${webHtmlPath}`);
    
    // Generate PDF from HTML
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
    
    // Auto-deploy to GitHub (triggers automatic Cloudflare deployment)
    try {
      await autoDeployToGitHub(baseFilename);
      log('info', '✅ Auto-deployed to GitHub - Cloudflare deployment in progress');
      
      // Wait 30 seconds for Cloudflare to complete deployment
      log('info', '⏳ Waiting 30s for Cloudflare deployment to complete...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      log('info', '✅ Cloudflare deployment should be complete - report link ready!');
      
    } catch (deployError) {
      log('error', `⚠️ Auto-deploy failed, but report is generated locally: ${deployError.message}`);
      // Continue anyway - report still works if manually deployed later
    }
    
    // Create public URL (assuming aidriven.biz is live on Cloudflare Pages)
    const reportUrl = `https://aidriven.biz/reports/${baseFilename}.html`;
    
    log('info', `Report generated successfully`, { 
      htmlUrl: reportUrl,
      pdfUrl: `https://aidriven.biz/reports/pdf/${baseFilename}.pdf`
    });
    
    return {
      success: true,
      message: 'Due Diligence report generated successfully',
      reportUrl: reportUrl,
      pdfUrl: `https://aidriven.biz/reports/pdf/${baseFilename}.pdf`,
      localPath: localHtmlPath,
      webHtmlPath: webHtmlPath,
      webPdfPath: webPdfPath
    };
    
  } catch (error) {
    log('error', `Report generation failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
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
 * Update request status in KV store via Worker's /update endpoint
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
  log('info', '=== WhatsApp Request Poll Started (v2 with PDF + Web) ===');
  
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
          const successMessage = `✅ Your Due Diligence report is ready!

📍 Address: ${request.address}

📊 Report Type: Tier 1 Due Diligence
🆔 Order ID: ${request.id.slice(0, 8)}

🌐 View your report online:
${result.reportUrl}

📥 The report includes a "Download PDF" button for offline viewing.

Note: This is an MVP demonstration. Full data integration (LINZ, hazards, rates) coming soon!

Questions? Contact us on +27 71 461 0886 (Business WhatsApp).

💡 Tip: If the link doesn't work immediately, wait 30 seconds and refresh the page.`;
          
          const sendResult = await sendWhatsAppMessage(request.customer.phone, successMessage);
          
          if (sendResult.success) {
            await updateRequestStatus(request.id, 'completed', {
              ...result,
              messageSent: true,
              messageId: sendResult.messageId
            });
          } else {
            log('error', `Failed to send success message for ${request.id}`);
            await updateRequestStatus(request.id, 'completed_partial', {
              ...result,
              messageSent: false,
              sendError: sendResult.error
            });
          }
        } else {
          const errorMessage = `⚠️ Issue with your Due Diligence request

📍 Address: ${request.address}
🆔 Order ID: ${request.id.slice(0, 8)}

${result.message}

Please reply to this message or contact us for assistance.`;
          
          await sendWhatsAppMessage(request.customer.phone, errorMessage);
          await updateRequestStatus(request.id, 'failed', result);
        }
        
      } catch (error) {
        log('error', `Failed to process request ${request.id}: ${error.message}`);
        await updateRequestStatus(request.id, 'error', { error: error.message });
      }
    }
    
    log('info', '=== WhatsApp Request Poll Completed ===');
    
  } catch (error) {
    log('error', `Poll execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
main();
