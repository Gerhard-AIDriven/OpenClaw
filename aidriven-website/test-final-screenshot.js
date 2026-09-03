#!/usr/bin/env node

const axios = require('axios');

async function testFinal() {
  console.log('\n📄 GENERATING REPORT WITH SCREENSHOT COORDINATES\n');
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate-report', {
      address: 'Douglas McLean Avenue, Napier',  // Generic since coords are primary
      lat: -39.50068107,  // From your screenshot
      lon: 176.9039117
    }, { timeout: 60000 });
    
    console.log('✅ REPORT GENERATED!\n');
    console.log('=' .repeat(70));
    console.log(`Report ID: ${response.data.reportId}`);
    console.log(`Tier: ${response.data.tier}`);
    console.log(`Price: ${response.data.price}`);
    console.log('');
    console.log(`📄 View at: http://localhost:3000/reports/${response.data.reportId}/report.html`);
    
    // Also show the JSON summary
    const fs = require('fs').promises;
    const path = require('path');
    const jsonPath = path.join(__dirname, 'reports', response.data.reportId, 'report.json');
    const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    
    console.log('\n📊 Parcel Data Retrieved:');
    console.log(`   Legal: ${jsonData.sections.parcel.legalDescription}`);
    console.log(`   Title: ${jsonData.sections.parcel.titleNumber}`);
    console.log(`   Area: ${jsonData.sections.parcel.landArea}`);
    console.log(`   Source: ${jsonData.sections.parcel.source}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testFinal();
