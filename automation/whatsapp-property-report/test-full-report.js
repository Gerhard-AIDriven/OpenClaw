#!/usr/bin/env node

/**
 * AI Driven - Full End-to-End Report Test
 * 
 * Tests complete Standard Tier report generation:
 * 1. LINZ parcel data
 * 2. Hazard assessment (Gabrielle + HBRC links)
 * 3. Napier rates extraction
 * 4. HTML report generation
 */

const { generateStandardReport, generateReportHTML } = require('./report-engine');
const fs = require('fs');
const path = require('path');

// Test property: 18 Ferguson Avenue, Napier
const TEST_PROPERTY = {
  address: '18 Ferguson Avenue, Napier 4110',
  coords: { lat: -39.4928, lon: 176.9120 },
  rid: '138159-107977'  // Known working RID
};

async function runFullTest() {
  console.log('\n' + '🚀'.repeat(40));
  console.log('AI DRIVEN - FULL END-TO-END REPORT TEST');
  console.log('🚀'.repeat(40) + '\n');
  
  try {
    // Generate report
    const report = await generateStandardReport(TEST_PROPERTY);
    
    // Generate HTML
    console.log('\n[FINAL] Generating HTML report...');
    const html = generateReportHTML(report);
    
    // Save JSON report
    const jsonPath = path.join(__dirname, 'sample-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`✅ JSON report saved: ${jsonPath}`);
    
    // Save HTML report
    const htmlPath = path.join(__dirname, 'sample-report.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML report saved: ${htmlPath}`);
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE - REPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Report ID: ${report.reportId}`);
    console.log(`Tier: ${report.tier} (${report.price})`);
    console.log(`Property: ${report.property.address}`);
    console.log(`\nData Sources:`);
    console.log(`  • LINZ Parcel: ${report.dataSources.linz.status}`);
    console.log(`  • Hazards: ${report.dataSources.hazards.linzGabrielle ? '✅ Gabrielle data' : '❌ Failed'} + HBRC manual links`);
    console.log(`  • Rates: ${report.dataSources.rates.status}${report.dataSources.rates.rid ? ` (RID: ${report.dataSources.rates.rid})` : ''}`);
    
    console.log('\n📄 OUTPUT FILES:');
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  HTML: ${htmlPath}`);
    console.log(`\n🌐 To view report: Open ${htmlPath} in browser`);
    console.log('='.repeat(80) + '\n');
    
    return { success: true, report, jsonPath, htmlPath };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run test
runFullTest().then(result => {
  if (result.success) {
    console.log('✅ All tests passed! Ready for WhatsApp/Web integration.\n');
    process.exit(0);
  } else {
    console.log('❌ Test failed. Check errors above.\n');
    process.exit(1);
  }
});
