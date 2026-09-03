#!/usr/bin/env node

const axios = require('axios');

async function testDirectCompare() {
  console.log('\n🔍 DIRECT COMPARISON TEST\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const bbox = '176.89391170000002,-39.51068107,176.9139117,-39.49068107,EPSG:4326';
  
  const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'data.linz.govt.nz:layer-51571',
    outputFormat: 'application/json',
    bbox: bbox,
    count: '100'
  });
  
  console.log('Using EXACT same URL as linz-fetcher.js...\n');
  
  try {
    const response = await axios.get(url, { timeout: 15000 });
    
    console.log(`Received ${response.data.features.length} parcels\n`);
    
    // Search for Lot 88
    const lot88 = response.data.features.find(f => 
      f.properties.appellation === 'Lot 88 DP 8162'
    );
    
    if (lot88) {
      const idx = response.data.features.findIndex(f => f === lot88);
      console.log(`✅ Lot 88 DP 8162 FOUND at index ${idx}!`);
      console.log(`   Title: ${lot88.properties.titles}`);
    } else {
      console.log('❌ Lot 88 DP 8162 NOT FOUND');
      
      // List first 10 parcel names
      console.log('\nFirst 10 parcels:');
      response.data.features.slice(0, 10).forEach((f, i) => {
        console.log(`  ${i}. ${f.properties.appellation || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDirectCompare();
