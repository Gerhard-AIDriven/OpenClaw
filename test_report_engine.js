const { generateStandardReport, generateReportHTML } = require('./aidriven-website/api/report-engine');
const fs = require('fs');
const path = require('path');

async function runTest() {
  const input = {
    address: '31 Douglas McLean Avenue',
    coords: { lat: -39.5006452, lon: 176.9039752 },
    rid: '12345'
  };

  console.log('🚀 Starting End-to-End Test for 31 Douglas McLean Avenue...');

  try {
    // 1. Generate the JSON report
    const report = await generateStandardReport(input);
    
    // 2. Save JSON report
    const jsonPath = 'C:\\Users\\gstim\\.openclaw\\workspace\\test_reports\\test_31_douglas_mclean.json';
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON report saved to ${jsonPath}`);

    // 3. Generate HTML report
    const html = generateReportHTML(report);
    
    // 4. Save HTML report
    const htmlPath = 'C:\\Users\\gstim\\.openclaw\\workspace\\test_reports\\test_31_douglas_mclean.html';
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ HTML report saved to ${htmlPath}`);

    console.log('\n--- TEST SUMMARY ---');
    console.log('Tsunami Risk:', report.sections.hazards.hazards.tsunami.status);
    console.log('Coastal Risk:', report.sections.hazards.hazards.coastal.arcCoastal?.status || 'No data');
    console.log('Overall Assessment:', report.sections.hazards.overallAssessment.riskRating);
    console.log('Risk Summary:', report.sections.hazards.overallAssessment.summary);
    console.log('-------------------\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
