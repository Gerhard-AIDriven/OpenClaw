#!/usr/bin/env node

const axios = require('axios');

async function testMcLeanAve() {
  const testAddress = "31 Douglas McLean Avenue, Napier";
  
  console.log('\n🧪 TESTING 31 Douglas McLean Avenue (CORRECT SPELLING)');
  console.log('='.repeat(70));
  
  try {
    // Geocode first
    console.log('Step 1: Geocoding...');
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testAddress)}&limit=1`;
    const geocodeResponse = await axios.get(geocodeUrl, {
      headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
    });
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('❌ Geocoding failed - no results found');
      console.log('Trying alternative search...');
      
      // Try without street number
      const altUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent('Douglas McLean Avenue, Napier')}&limit=1`;
      const altResponse = await axios.get(altUrl, {
        headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
      });
      
      if (altResponse.data && altResponse.data.length > 0) {
        console.log('✓ Found street (without number):', altResponse.data[0].display_name);
      } else {
        console.log('❌ Street not found either');
        return;
      }
      return;
    }
    
    const coords = {
      lat: parseFloat(geocodeResponse.data[0].lat),
      lon: parseFloat(geocodeResponse.data[0].lon)
    };
    console.log(`✅ Geocoded successfully!`);
    console.log(`   Address: ${geocodeResponse.data[0].display_name}`);
    console.log(`   Coordinates: ${coords.lat}, ${coords.lon}\n`);
    
    // Call report API
    console.log('Step 2: Generating STANDARD report...');
    const reportResponse = await axios.post('http://localhost:3000/api/generate-report', {
      address: testAddress,
      lat: coords.lat,
      lon: coords.lon,
      rid: null
    });
    
    console.log('\n✅ REPORT GENERATED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('Report ID:', reportResponse.data.reportId);
    console.log('Tier:', reportResponse.data.tier);
    console.log('Price:', reportResponse.data.price);
    console.log('\n📋 Parcel Data from LINZ:');
    console.log('  Legal Description:', reportResponse.data.summary.legalDescription || 'N/A');
    console.log('  Land Area:', reportResponse.data.summary.landArea || 'N/A');
    console.log('  Title Number:', reportResponse.data.summary.titleNumber || 'N/A');
    console.log('\n⚠️ Hazard Assessment:');
    console.log('  Risk Rating:', reportResponse.data.summary.riskRating || 'N/A');
    console.log('  Gabrielle Affected:', reportResponse.data.summary.gabrielleAffected ? 'YES' : 'NO');
    console.log('='.repeat(70));
    console.log('\n📄 View report at:');
    console.log(`http://localhost:3000/reports/${reportResponse.data.reportId}/report.html`);
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMcLeanAve();
