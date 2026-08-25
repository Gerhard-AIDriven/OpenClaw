/**
 * Manual Report Trigger -- For Test Properties
 * Use: node manual-trigger.js "Address"
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Import logic from the poll script
const { generateReport } = require('./poll-automated-reports-v2');
const { pushReportToGitHubPages } = require('./push-to-github-pages');

async function main() {
  const address = process.argv[2];
  if (!address) {
    console.error('Please provide an address: node manual-trigger.js "31 Douglas McLean Avenue, Marewa, Napier"');
    process.exit(1);
  }

  console.log(`🚀 Manually triggering report for: ${address}`);

  const requestId = `manual_${Date.now()}`;
  const customer = { email: 'test@aidriven.biz' };
  
  // For manual triggers, we need to provide a mock "addressStructured" object
  // so the poller's new cleaning logic can work for the Napier scraper.
  const addressStructured = {
    houseNumber: '31',
    streetName: 'Douglas McLean',
    streetType: 'avenue',
    latitude: -39.5005800554,
    longitude: 176.90405875
  };
  
  try {
    // Trigger the generation logic used by the poller, passing structured data
    const result = await generateReport(address, 'Basic', requestId, customer, addressStructured);
    
    if (result.success) {
      console.log(`✅ Report generated locally: ${result.htmlPath}`);
      
      // Push to GitHub Pages
      const pushResult = await pushReportToGitHubPages(result.htmlPath, requestId);
      if (pushResult.success) {
        console.log(`🚀 Deployed successfully!`);
        console.log(`🔗 URL: ${pushResult.liveUrl}`);
      } else {
        console.error(`❌ Deployment failed: ${pushResult.error}`);
      }
    } else {
      console.error(`❌ Generation failed: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Fatal Error:', error);
  }
}

main();
