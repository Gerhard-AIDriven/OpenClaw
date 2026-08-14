/**
 * Poll WhatsApp Requests from Cloudflare Worker - VERSION 2 (with PDF + Web Hosting)
 * 
 * This script:
 * 1. Calls the Cloudflare Worker /poll endpoint
 * 2. Fetches pending LIM/Due Diligence requests
 * 3. Processes each request (generates HTML + PDF report)
 * 4. Deploys reports to aidriven.biz/reports/
 * 5. Sends WhatsApp message with link to view report
 * 
 * Run every 3 minutes via cron job
 */

const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const WORKSPACE_ROOT = 'C:\\Users\\gstim\\.openclaw\\workspace';
const DUE_DILIGENCE_DIR = path.join(WORKSPACE_ROOT, 'due-diligence-mvp');
const LOCAL_REPORTS_DIR = path.join(DUE_DILIGENCE_DIR, 'reports');
const WEB_REPORTS_DIR = path.join(WORKSPACE_ROOT, 'aidriven-site', 'reports');
const WEB_PDF_DIR = path.join(WEB_REPORTS_DIR, 'pdf');

// Ensure directories exist
[LOCAL_REPORTS_DIR, WEB_REPORTS_DIR, WEB_PDF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

/**
 * Generate professional HTML report
 */
function generateHtmlReport(address, orderId, timestamp) {
  const reportDate = new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Due Diligence Report - ${address}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; }
        .report-card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; }
        
        /* Header */
        .header { text-align: center; border-bottom: 3px solid #007A4D; padding-bottom: 30px; margin-bottom: 30px; }
        .logo-section { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px; }
        .logo-placeholder { width: 60px; height: 60px; background: linear-gradient(135deg, #007A4D 50%, #FFB81C 50%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; }
        h1 { color: #007A4D; margin: 10px 0; font-size: 2rem; }
        .tagline { color: #666; font-style: italic; font-size: 1.1rem; }
        .report-meta { margin-top: 20px; color: #888; font-size: 0.9rem; }
        
        /* Download Button */
        .action-bar { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid #FFB81C; }
        .btn-download { display: inline-block; background: #007A4D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,122,77,0.3); }
        .btn-download:hover { background: #005a3a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,122,77,0.4); }
        .btn-download::before { content: '📥 '; }
        
        /* Sections */
        .section { margin: 30px 0; padding: 25px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FFB81C; }
        .section h2 { color: #007A4D; margin-bottom: 15px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px; }
        
        /* Property Info Grid */
        .property-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px; }
        .info-item { padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .info-label { font-size: 0.85rem; color: #666; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 1.1rem; font-weight: bold; color: #2D2D2D; }
        
        /* Status Badge */
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
        .status-ok { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        
        /* Lists */
        ul { margin-left: 20px; }
        li { margin: 8px 0; color: #444; }
        
        /* Disclaimer */
        .disclaimer { background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 4px solid #FFB81C; }
        .disclaimer strong { display: block; margin-bottom: 8px; color: #856404; }
        .disclaimer p { color: #856404; font-size: 0.9rem; }
        
        /* Footer */
        .footer { text-align: center; margin-top: 40px; padding-top: 25px; border-top: 2px solid #eee; color: #666; font-size: 0.9rem; }
        .footer strong { color: #007A4D; font-size: 1.1rem; }
        .footer a { color: #007A4D; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        
        /* Print styles */
        @media print {
            .action-bar { display: none; }
            body { background: white; }
            .report-card { box-shadow: none; }
        }
        
        /* Mobile */
        @media (max-width: 600px) {
            .container { padding: 10px; }
            .report-card { padding: 25px; }
            h1 { font-size: 1.5rem; }
            .property-info { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="report-card">
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    <div class="logo-placeholder">🧠</div>
                    <h1>AI Driven</h1>
                </div>
                <p class="tagline">Practical AI for real businesses</p>
                <div class="report-meta">
                    <p>Generated: ${reportDate}</p>
                    <p>Report ID: ${orderId}</p>
                </div>
            </div>

            <!-- Download PDF Button -->
            <div class="action-bar">
                <a href="./pdf/${path.basename(orderId)}_${timestamp.replace(/:/g, '-')}.pdf" class="btn-download" download>
                    Download PDF Report
                </a>
                <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">Click to download a printable PDF version of this report</p>
            </div>

            <!-- Property Details -->
            <div class="section">
                <h2>📍 Property Details</h2>
                <div class="property-info">
                    <div class="info-item">
                        <div class="info-label">Address</div>
                        <div class="info-value">${address}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Report ID</div>
                        <div class="info-value">${orderId}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Report Type</div>
                        <div class="info-value">Tier 1 Due Diligence</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value"><span class="status-badge status-ok">✓ Complete</span></div>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div class="section">
                <h2>📊 Executive Summary</h2>
                <p>This automated due diligence report has been generated for the property at <strong>${address}</strong>.</p>
                <p style="margin-top: 10px;"><strong>Report Contents:</strong></p>
                <ul>
                    <li>Property identification and address verification</li>
                    <li>Automated report generation via WhatsApp Business API</li>
                    <li>Professional formatting with AI Driven branding</li>
                    <li>PDF download capability for offline review</li>
                </ul>
            </div>

            <!-- What's Included -->
            <div class="section">
                <h2>✅ Current Capabilities</h2>
                <ul>
                    <li><strong>Instant Delivery:</strong> Reports delivered via WhatsApp within minutes</li>
                    <li><strong>Professional Format:</strong> Clean, branded HTML + PDF reports</li>
                    <li><strong>Mobile Optimized:</strong> View on any device, anytime</li>
                    <li><strong>Automated Processing:</strong> No manual intervention required</li>
                </ul>
            </div>

            <!-- Coming Soon -->
            <div class="section">
                <h2>🔜 Data Integration Roadmap</h2>
                <p>Full integration with the following data sources is in progress:</p>
                <ul>
                    <li><strong>LINZ Title Data:</strong> Legal description, ownership, easements, covenants</li>
                    <li><strong>Natural Hazards:</strong> Flood risk, erosion, coastal inundation, liquefaction</li>
                    <li><strong>Council Records:</strong> Capital value, rates, building consents, code compliance</li>
                    <li><strong>Environmental:</strong> Contamination history, nearby industrial activities</li>
                </ul>
            </div>

            <!-- Disclaimer -->
            <div class="disclaimer">
                <strong>⚠️ Important Disclaimer:</strong>
                <p>This report is an MVP demonstration and should not be relied upon for property investment decisions. Full due diligence reports with complete data integration from LINZ, local councils, and environmental databases will be available soon. Always consult with qualified professionals (lawyers, builders, surveyors) before making property purchases.</p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p><strong>AI Driven</strong> | Practical AI for real businesses</p>
                <p>Website: <a href="https://aidriven.biz" target="_blank">aidriven.biz</a></p>
                <p>WhatsApp: +27 79 944 8564</p>
                <p style="margin-top: 15px; font-size: 0.8rem; color: #999;">© 2026 AI Driven. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send WhatsApp message via Worker's /send endpoint
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

Questions? Reply to this message anytime.`;
          
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
