#!/usr/bin/env node

const { fetchLinZData } = require('./lib/linz-fetcher');

async function testWithCoords() {
  console.log('\n🧪 TESTING WITH USER COORDINATES\n');
  
  const address = '31 Douglas McLean Avenue, Napier';
  const coords = {
    lat: -39.50066347,
    lon: 176.9039345
  };
  
  console.log(`Address: ${address}`);
  console.log(`Coords: ${coords.lat}, ${coords.lon}\n`);
  
  try {
    // Mock the geocoding to return our exact coords
    const result = await fetchLinZData(address, { 
      timeout: 20000,
      overrideCoords: coords  // Pass override if supported
    });
    
    console.log('\n✅ LINZ DATA RETRIEVED:\n');
    console.log('Legal Description:', result.legalDescription);
    console.log('Title Number:', result.titleNumber);
    console.log('Land Area:', result.landArea);
    console.log('Status:', result.status);
    console.log('Source:', result.source);
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

testWithCoords();
