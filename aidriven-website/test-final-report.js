#!/usr/bin/env node

const axios = require('axios');

async function generateFinalReport() {
  console.log('\n📄 GENERATING FINAL REPORT\n');
  console.log('Address: 31 Douglas McLean Avenue, Napier');
  console.log('Coordinates: -39.50066347, 176.9039345 (USER PROVIDED)\n');
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate-report', {
      address: '31 Douglas McLean Avenue, Napier',
      lat: -39.50066347,
      lon: 176.9039345
    }, { timeout: 60000 });
    
    console.log('✅ REPORT GENERATED!\n');
    console.log('=' .repeat(70));
    console.log(`Report ID: ${response.data.reportId}`);
    console.log(`Tier: ${response.data.tier}`);
    console.log(`Price: ${response.data.price}`);
    console.log('');
    console.log('Parcel Data:');
    console.log(`  Legal: ${response.data.parcel.legalDescription}`);
    console.log(`  Title: ${response.data.parcel.titleNumber}`);
    console.log(`  Area: ${response.data.parcel.landArea}`);
    console.log(`  District: ${response.data.parcel.landDistrict}`);
    console.log('');
    console.log('Hazards:');
    console.log(`  Risk: ${response.data.hazards.overallAssessment.riskRating}`);
    console.log(`  Gabrielle: ${response.data.hazards.cycloneGabrielle.affected ? 'YES ⚠️' : 'NO ✅'}`);
    console.log('');
    console.log(`📄 View at: http://localhost:3000/reports/${response.data.reportId}/report.html`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

generateFinalReport();
