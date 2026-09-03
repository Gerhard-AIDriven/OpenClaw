#!/usr/bin/env node

const { fetchLinZData } = require('./lib/linz-fetcher');

async function testDebug() {
  console.log('\n🔍 DEBUGGING PARCEL SELECTION IN PRODUCTION CODE\n');
  
  const address = 'Douglas McLean Avenue, Napier';
  const coords = {
    lat: -39.50068107,
    lon: 176.9039117
  };
  
  try {
    const result = await fetchLinZData(address, { coords, timeout: 20000 });
    
    console.log('\n✅ RESULT:');
    console.log('Legal:', result.legalDescription);
    console.log('Title:', result.titleNumber);
    console.log('Area:', result.landArea);
    console.log('Source:', result.source);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDebug();
