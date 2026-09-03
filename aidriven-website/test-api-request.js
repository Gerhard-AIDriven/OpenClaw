#!/usr/bin/env node

/**
 * Quick API Test - Test the report generation endpoint
 */

const axios = require('axios');

async function testReportGeneration() {
  const testAddress = "123 Station Street, Napier";
  
  console.log('\n🧪 TESTING REPORT GENERATION API');
  console.log('='.repeat(60));
  console.log(`Address: ${testAddress}`);
  console.log('Endpoint: http://localhost:3000/api/generate-report\n');
  
  try {
    // First, geocode the address
    console.log('Step 1: Geocoding address...');
    const geocodeResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testAddress)}&limit=1`,
      {
        headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
      }
    );
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('❌ Geocoding failed - no results');
      return;
    }
    
    const coords = {
      lat: parseFloat(geocodeResponse.data[0].lat),
      lon: parseFloat(geocodeResponse.data[0].lon)
    };
    
    console.log(`✓ Geocoded: ${coords.lat}, ${coords.lon}\n`);
    
    // Now call the report API
    console.log('Step 2: Calling report generation API...');
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
    console.log('Summary:', JSON.stringify(reportResponse.data.summary, null, 2));
    console.log('View URL:', reportResponse.data.viewUrl);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ ERROR:');
    console.log('='.repeat(60));
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Message:', error.message);
    }
    console.log('='.repeat(60));
  }
}

testReportGeneration();
