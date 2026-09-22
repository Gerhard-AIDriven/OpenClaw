/**
 * Poll WhatsApp Manual Requests - FOR GERHARD
 * 
 * This script polls the Cloudflare Worker for manual processing requests
 * (from Google Forms with Rates/Council Fees checkboxes selected)
 * 
 * Run this manually when you're ready to process manual requests:
 *   node poll-manual-requests.js
 * 
 * Or set up a cron job to run every 30 minutes during business hours
 */

const fs = require('fs');
const path = require('path');

// Configuration
const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const POLL_TOKEN = 'aidriven_poll_secret_2026_xK9mP'; // Same as your existing worker
const MANUAL_QUEUE_FILE = path.join(__dirname, 'manual-queue.json');

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
 * Fetch manual requests from Worker
 */
async function fetchManualRequests() {
  try {
    // Note: Worker v4 needs a /poll-manual endpoint
    // For now, we'll read from KV directly via Worker
    const pollUrl = `${WORKER_URL}/poll?token=${encodeURIComponent(POLL_TOKEN)}`;
    
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
    
    log('info', `Fetched ${result.count} automated requests (manual requests need separate handling)`);
    return result.requests || [];
    
  } catch (error) {
    log('error', `Failed to fetch requests: ${error.message}`);
    throw error;
  }
}

/**
 * Display manual requests in a readable format
 */
function displayManualQueue(manualRequests) {
  if (manualRequests.length === 0) {
    console.log('\n✅ No pending manual requests!\n');
    return;
  }
  
  console.log(`\n📋 PENDING MANUAL PROCESSING (${manualRequests.length} request(s))\n`);
  console.log('='.repeat(80));
  
  manualRequests.forEach((req, index) => {
    console.log(`\n#${index + 1} - ${req.id}`);
    console.log('-'.repeat(60));
    console.log(`Customer: ${req.customer?.name || 'Unknown'} (${req.customer?.phone || req.customer?.email || 'No contact'})`);
    console.log(`Address:  ${req.address}`);
    console.log(`Package:  ${req.package || 'Basic'}`);
    console.log(`Add-ons:  ${formatAddons(req.addons)}`);
    console.log(`Source:   ${req.source || 'whatsapp'}`);
    console.log(`Created:  ${new Date(req.createdAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}`);
    
    // Action items
    console.log(`\n📝 ACTION ITEMS:`);
    if (req.addons?.ratesInfo) {
      console.log(`   ☐ Retrieve RID from council property viewer`);
      console.log(`   ☐ Fetch rates data using napier_rates_extractor.py or manual lookup`);
    }
    if (req.addons?.councilFees) {
      console.log(`   ☐ Contact council for fees/permits history`);
      console.log(`   ☐ Check online consent portal`);
    }
    
    console.log(`\n🔗 QUICK LINKS:`);
    if (req.address) {
      const encodedAddress = encodeURIComponent(req.address);
      console.log(`   • Napier Maps: https://maps.napier.govt.nz/?search=${encodedAddress}`);
      console.log(`   • LINZ Data: https://data.linz.govt.nz/search/?q=${encodedAddress}`);
    }
    
    console.log('\n' + '='.repeat(80));
  });
  
  console.log('\n💡 TIP: Copy the request ID and address to start processing\n');
}

/**
 * Format add-ons for display
 */
function formatAddons(addons) {
  if (!addons) return 'None';
  
  const items = [];
  if (addons.ratesInfo) items.push('Rates Information ⚠️');
  if (addons.councilFees) items.push('Council Fees ⚠️');
  if (addons.rushDelivery) items.push('Rush Delivery');
  if (addons.comparison) items.push('Property Comparison');
  
  return items.length > 0 ? items.join(', ') : 'None';
}

/**
 * Save queue to local file for reference
 */
function saveQueueToFile(manualRequests) {
  try {
    const output = {
      fetchedAt: new Date().toISOString(),
      count: manualRequests.length,
      requests: manualRequests
    };
    
    fs.writeFileSync(MANUAL_QUEUE_FILE, JSON.stringify(output, null, 2), 'utf8');
    log('info', `Queue saved to ${MANUAL_QUEUE_FILE}`);
  } catch (error) {
    log('error', `Failed to save queue: ${error.message}`);
  }
}

/**
 * Generate email draft for customer acknowledgment
 */
function generateEmailDraft(request) {
  const subject = `Your Property Due Diligence Report - Manual Processing Required`;
  
  const body = `Hi ${request.customer?.name || 'there'},

Thank you for your order for a ${(request.package || 'Basic').charAt(0).toUpperCase() + (request.package || 'Basic').slice(1)} Report for:
${request.address}

I've received your request and note that you've selected:
${request.addons?.ratesInfo ? '☑ Rates Information' : '☐ Rates Information'}
${request.addons?.councilFees ? '☑ Council Fees & Permits' : '☐ Council Fees & Permits'}

These services require manual processing and will be completed within 24-48 hours (rather than the standard automated delivery time).

WHAT HAPPENS NEXT:
1. I'll personally retrieve the rates/council information for this property
2. Your full report will be compiled and quality-checked
3. You'll receive the complete PDF report via email within 48 hours

If you have any questions or need this sooner, please reply to this email or call/text me at 021 XXX XXXX.

Thanks for your patience!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz

⚠️ Reminder: This is an informational report, not a legal LIM.`;

  console.log('\n📧 EMAIL DRAFT FOR CUSTOMER\n');
  console.log('='.repeat(80));
  console.log(`SUBJECT: ${subject}\n`);
  console.log(body);
  console.log('='.repeat(80));
  console.log('\n💡 Copy and paste into Gmail, then replace 021 XXX XXXX with your actual number\n');
}

/**
 * Main execution
 */
async function main() {
  log('info', '=== Manual Requests Poll Started ===');
  
  try {
    // For now, we'll just show what's available
    // In production, Worker v4 would have a /poll-manual endpoint
    
    console.log('\n⚠️  NOTE: Manual request polling requires Worker v4 deployment\n');
    console.log('Until Worker v4 is deployed, use this workflow:\n');
    console.log('1. Check your Google Sheets responses for form submissions');
    console.log('2. Filter rows where Add-ons contains "Rates" or "Council"');
    console.log('3. Process manually following MANUAL-WORKFLOW-RATES-COUNCIL.md');
    console.log('4. Send acknowledgment email (Template 1)');
    console.log('5. Retrieve RID and fetch data');
    console.log('6. Generate report and send delivery email (Template 2)\n');
    
    console.log('📖 Full workflow guide: due-diligence-mvp/MANUAL-WORKFLOW-RATES-COUNCIL.md\n');
    console.log('📧 Email templates: due-diligence-mvp/EMAIL-TEMPLATES-MANUAL.md\n');
    
    // Alternative: Read from local queue file if it exists
    if (fs.existsSync(MANUAL_QUEUE_FILE)) {
      const data = JSON.parse(fs.readFileSync(MANUAL_QUEUE_FILE, 'utf8'));
      log('info', `Found local queue file with ${data.count} request(s) from ${data.fetchedAt}`);
      
      // Show only unprocessed requests (you'd need to track this)
      displayManualQueue(data.requests);
    } else {
      log('info', 'No local queue file found. This is expected if Worker v4 is not yet deployed.');
    }
    
  } catch (error) {
    log('error', `Poll failed: ${error.message}`);
    console.error(error.stack);
  }
  
  log('info', '=== Poll Complete ===\n');
}

// Run
main();
