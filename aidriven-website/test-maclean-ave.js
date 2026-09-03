#!/usr/bin/env node

const axios = require('axios');

async function testMacLeanAve() {
  const testAddress = "31 Douglas MacLean Avenue, Napier";
  
  console.log('\n🧪 TESTING 31 Douglas MacLean Avenue');
  console.log('='.repeat(60));
  
  try {
    // Geocode first
    console.log('Step 1: Geocoding...');
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testAddress)}&limit=1`;
    const geocodeResponse = await axios.get(geocodeUrl, {
      headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
    });
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('❌ Geocoding failed');
      return;
    }
    
    const coords = {
      lat: parseFloat(geocodeResponse.data[0].lat),
      lon: parseFloat(geocodeResponse.data[0].lon)
    };
    console.log(`✓ Geocoded: ${coords.lat}, ${coords.lon}\n`);
    
    // Call report API
    console.log('Step 2: Generating STANDARD report...');
    const reportResponse = await axios.post('http://localhost:3000/api/generate-report', {
      address: testAddress,
      lat: coords.lat,
      lon: coords.lon,
      rid: null
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log('Report ID:', reportResponse.data.reportId);
    console.log('Tier:', reportResponse.data.tier);
    console.log('Price:', reportResponse.data.price);
    console.log('\nParcel Data:');
    console.log('  Legal Desc:', reportResponse.data.summary.legalDescription || 'N/A');
    console.log('  Land Area:', reportResponse.data.summary.landArea || 'N/A');
    console.log('  Title Num:', reportResponse.data.summary.titleNumber || 'N/A');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMacLeanAve();
