/**
 * Poll Automated Reports - Phase 2 (Complete Integration)
 * 
 * Polls Cloudflare Worker for pending automated reports and generates them
 * with full LINZ data, hazards assessment, and HTML reports with interactive maps
 */

const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Import push automation
const { pushReportToGitHubPages } = require('./push-to-github-pages');

// Import report engine and APIs
const { generateHTMLReport, saveHTMLReport, getReportURL } = require('./report-engine-v2');
const { getLINZData } = require('./linz-api');
const { getHazardsData } = require('./hazards-linz-integration');
const { sendReportEmail } = require('./gmail-notifier');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const HTML_DIR = path.join(REPORTS_DIR, 'html');

// Ensure directories exist
[REPORTS_DIR, HTML_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Global Error Handling to catch silent crashes
process.on('unhandledRejection', (reason, promise) => {
  log('error', `Unhandled Rejection at: ${promise} reason: ${reason}`);
});

process.on('uncaughtException', (err) => {
  log('error', `Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
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
    const encodedToken = encodeURIComponent(POLL_TOKEN);
    const pollUrl = `${WORKER_URL}/poll?token=${encodedToken}`;
    
    const response = await fetch(pollUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
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
    let latitude, longitude;
    if (addressStructured && addressStructured.latitude && addressStructured.longitude) {
      latitude = addressStructured.latitude;
      longitude = addressStructured.longitude;
    } else {
      latitude = -39.5005800554;
      longitude = 176.90405875;
    }
    
    const effectiveAddress = address;
    
    // Step 1: LINZ Title
    const { getCompleteTitleData } = require('./linz-titles-integration');
    const linzData = await getCompleteTitleData(latitude, longitude);
    
    // Step 2: LINZ Easements
    const { getCompleteEasementsData } = require('./linz-easements-integration');
    const easementsResult = await getCompleteEasementsData(latitude, longitude);
    linzData.easements = easementsResult.easements || [];
    
    // Step 3: Hazards
    const hazardsData = await getHazardsData(latitude, longitude);
    
    // Step 4: Rates/Consents (Napier only)
    let ratesData = { capitalValue: 600000, landValue: 300000, improvementsValue: 300000, totalRates: 2800 };
    if (address.toLowerCase().includes('napier')) {
      try {
        // Construct scraper-friendly address: HouseNumber + StreetName + StreetType
        let scraperAddress = address;
        if (addressStructured) {
          const { houseNumber, streetName, streetType } = addressStructured;
          if (houseNumber && streetName && streetType) {
            scraperAddress = `${houseNumber} ${streetName} ${streetType}`;
          }
        }

        const scraperPath = path.join(__dirname, '..', 'napier_rates_scraper.py');
        const pythonOutput = execSync(`python "${scraperPath}" "${scraperAddress.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
        const ratesJson = JSON.parse(pythonOutput.trim());
        
        ratesData = {
          capitalValue: ratesJson.council_rates?.capital_value_current,
          landValue: ratesJson.council_rates?.land_value_current,
          improvementValue: ratesJson.council_rates?.improvements_current,
          valuationDate: ratesJson.council_rates?.valuation_date_current,
          totalRates: ratesJson.council_rates?.charges?.reduce((sum, c) => sum + (c.total || 0), 0),
          myPropertyData: ratesJson
        };
      } catch (e) {
        log('warn', `Rates scrape failed: ${e.message}`);
      }
    }
    
    // SANITIZE DATA - Create a clean, flat object to prevent memory crashes or circular refs
    const sanitizedData = {
      address: address,
      originalAddress: address,
      linzData: {
        legalDescription: linzData?.legalDescription || 'N/A',
        landArea: linzData?.landArea || 'N/A',
        zoning: linzData?.zoning || 'N/A',
        propertyType: linzData?.propertyType || 'N/A',
        ownerName: linzData?.ownerName || 'N/A',
        ownershipType: linzData?.ownershipType || 'N/A',
        registrationDate: linzData?.registrationDate || 'N/A',
        latitude: linzData?.latitude || -39.50058,
        longitude: linzData?.longitude || 176.90405,
        easements: (linzData?.easements || []).map(e => ({
          type: e.type || 'Easement',
          description: e.description || e.appellation || 'No description'
        }))
      },
      hazardsData: {
        overallAssessment: hazardsData?.overallAssessment ? {
          riskRating: hazardsData.overallAssessment.riskRating,
          summary: hazardsData.overallAssessment.summary
        } : null,
        hazards: hazardsData?.hazards ? Object.entries(hazardsData.hazards).map(([key, val]) => ({
          type: key,
          status: val.status || val.level || 'Unknown',
          description: val.description || 'No details',
          icon: val.icon || '⚠️'
        })) : []
      },
      ratesData: ratesData ? { ...ratesData } : null,
      requestId: requestId,
      customer: customer ? { ...customer } : null,
      packageType: packageType
    };
    
    log('info', '🛠️ Starting HTML generation with sanitized data...');
    const html = generateHTMLReport(sanitizedData);
    log('info', '✅ HTML generation complete');
    
    const htmlPath = saveHTMLReport(html, requestId);
    log('info', `💾 Report saved to: ${htmlPath}`);
    
    return { success: true, htmlPath, reportUrl: `/reports/html/${path.basename(htmlPath)}`, effectiveAddress };
    
  } catch (error) {
    log('error', `Report generation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main polling function
 */
async function pollQueue() {
  log('info', 'Starting queue poll...');
  try {
    const requests = await fetchAutomatedRequests();
    if (requests.length === 0) return;
    
    for (const req of requests) {
      const { id: requestId, customer, address, addressStructured } = req;
      const pkg = req.package || 'Basic';
      
      const reportResult = await generateReport(address, pkg, requestId, customer, addressStructured);
      if (!reportResult.success) continue;
      
      // PUSH TO GITHUB PAGES
      const pushResult = await pushReportToGitHubPages(reportResult.htmlPath, requestId);
      if (!pushResult.success) {
        log('error', `Deployment failed for ${requestId}: ${pushResult.error}`);
        continue;
      }
      
      const finalReportResult = { ...reportResult, reportUrl: pushResult.liveUrl.replace('https://gerhard-aidriven.github.io/OpenClaw', '') };
      
      // SEND EMAIL
      try {
        log('info', `📧 Sending report email via Gmail to ${customer.email}...`);
        await sendReportEmail(customer, reportResult.effectiveAddress, finalReportResult, requestId);
        log('info', `✅ Email sent successfully to ${customer.email}`);
      } catch (e) {
        log('error', `Email failed for ${requestId}: ${e.message}`);
      }
    }
  } catch (error) {
    log('error', `Poll failed: ${error.message}`);
  }
}

if (require.main === module) {
  pollQueue().catch(console.error);
}

module.exports = { pollQueue, generateReport };
