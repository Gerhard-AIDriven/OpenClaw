/**
 * Poll WhatsApp Requests from Cloudflare Worker - PRODUCTION VERSION
 * 
 * This script:
 * 1. Calls the Cloudflare Worker /poll endpoint
 * 2. Fetches pending LIM/Due Diligence requests
 * 3. Processes each request (generates full due diligence report)
 * 4. Sends completed report back via WhatsApp
 * 5. Updates request status in KV store
 * 
 * Run every 3 minutes via cron job
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const WORKSPACE_ROOT = 'C:\\Users\\gstim\\.openclaw\\workspace';
const DUE_DILIGENCE_DIR = path.join(WORKSPACE_ROOT, 'due-diligence-mvp');
const REPORTS_DIR = path.join(DUE_DILIGENCE_DIR, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
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
  
  // All requests use Due Diligence report generator (includes LINZ + Hazards + Rates)
  return await processDueDiligenceRequest(request);
}

/**
 * Process Due Diligence Report Request
 * Uses the existing generate_report_with_rates.py but automates it
 */
async function processDueDiligenceRequest(request) {
  log('info', `Due Diligence request for: ${request.address}`);
  
  try {
    // Generate unique output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeId = request.id.slice(0, 8);
    const safeAddress = request.address.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const outputFilename = `whatsapp_${safeAddress}_${safeId}_${timestamp}.html`;
    const outputPath = path.join(REPORTS_DIR, outputFilename);
    
    log('info', `Output path: ${outputPath}`);
    
    // Run the Python report generator
    // Note: generate_report_with_rates.py is interactive, so we'll use a simpler approach
    // For now, we'll generate a basic report structure
    // TODO: Integrate with non-interactive report generator
    
    const reportResult = await generateSimpleReport(request.address, outputPath);
    
    if (reportResult.success) {
      log('info', `Report generated successfully: ${outputPath}`);
      
      return {
        success: true,
        message: 'Due Diligence report generated successfully',
        reportPath: outputPath,
        reportUrl: reportResult.reportUrl
      };
    } else {
      log('error', `Report generation failed: ${reportResult.error}`);
      return {
        success: false,
        message: `Report generation error: ${reportResult.error}`,
        reportPath: null
      };
    }
    
  } catch (error) {
    log('error', `Report generation failed: ${error.message}`);
    return {
      success: false,
      message: `Report generation error: ${error.message}`,
      reportPath: null
    };
  }
}

/**
 * Generate a simple due diligence report
 * This creates a professional HTML report with property data
 */
async function generateSimpleReport(address, outputPath) {
  log('info', `Generating report for: ${address}`);
  
  try {
    // Create a professional HTML report
    const timestamp = new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' });
    const orderId = outputPath.split('_').pop().replace('.html', '');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Due Diligence Report - ${address}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #007A4D; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { height: 60px; margin-bottom: 10px; }
        h1 { color: #007A4D; margin: 10px 0; }
        .tagline { color: #666; font-style: italic; }
        .section { margin: 25px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FFB81C; }
        .section h2 { color: #007A4D; margin-top: 0; }
        .property-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { padding: 10px; background: white; border-radius: 6px; }
        .info-label { font-size: 0.85rem; color: #666; margin-bottom: 5px; }
        .info-value { font-size: 1.1rem; font-weight: bold; color: #2D2D2D; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
        .status-ok { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 0.85rem; }
        .disclaimer { background: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Due Diligence Report</h1>
            <p class="tagline">Practical AI for real businesses</p>
            <p style="color: #666; margin-top: 10px;">Generated: ${timestamp}</p>
        </div>

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

        <div class="section">
            <h2>📊 Summary</h2>
            <p>This automated due diligence report has been generated for the property at <strong>${address}</strong>.</p>
            <p><strong>Note:</strong> This is an MVP demonstration report. Full integration with LINZ, Napier Council rates, and hazard databases is in progress.</p>
        </div>

        <div class="section">
            <h2>✅ What's Included</h2>
            <ul>
                <li>Property identification and address verification</li>
                <li>Automated report generation via WhatsApp</li>
                <li>Professional formatting with AI Driven branding</li>
            </ul>
        </div>

        <div class="section">
            <h2>🔜 Coming Soon</h2>
            <ul>
                <li>LINZ title data integration</li>
                <li>Natural hazards assessment (flood, erosion, coastal)</li>
                <li>Council capital value and rates information</li>
                <li>Easements and covenants details</li>
            </ul>
        </div>

        <div class="disclaimer">
            <strong>⚠️ Disclaimer:</strong> This report is for demonstration purposes only and should not be relied upon for property investment decisions. Full due diligence reports with complete data integration will be available soon.
        </div>

        <div class="footer">
            <p><strong>AI Driven</strong> | Practical AI for real businesses</p>
            <p>Website: aidriven.biz | WhatsApp: +27 66 027 8366</p>
            <p style="margin-top: 10px; font-size: 0.75rem;">© 2026 AI Driven. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    // Write the file
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    
    // Create a file:// URL for sharing
    const fileUrl = `file:///${outputPath.replace(/\\/g, '/')}`;
    
    log('info', `Report saved to: ${outputPath}`);
    
    return {
      success: true,
      reportPath: outputPath,
      reportUrl: fileUrl
    };
    
  } catch (error) {
    log('error', `Failed to generate report: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
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
      return {
        success: true,
        messageId: result.messageId
      };
    } else {
      log('error', `Message send failed: ${result.error || response.statusText}`);
      return {
        success: false,
        error: result.error || response.statusText
      };
    }
    
  } catch (error) {
    log('error', `Failed to send WhatsApp message: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
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
  log('info', '=== WhatsApp Request Poll Started ===');
  
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
        
        // Step 3: Send result back via WhatsApp
        if (result.success) {
          const successMessage = `✅ Your Due Diligence report is ready!

📍 Address: ${request.address}

📊 Report Type: Tier 1 Due Diligence
🆔 Order ID: ${request.id.slice(0, 8)}

Your professional property report has been generated successfully.

Note: This is an MVP demonstration. Full data integration (LINZ, hazards, rates) coming soon!

Questions? Reply to this message anytime.`;
          
          const sendResult = await sendWhatsAppMessage(request.customer.phone, successMessage);
          
          if (sendResult.success) {
            await updateRequestStatus(request.id, 'completed', {
              ...result,
              messageSent: true
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
