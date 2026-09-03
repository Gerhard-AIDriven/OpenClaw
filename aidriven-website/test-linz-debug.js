#!/usr/bin/env node

const axios = require('axios');

async function testLinZDebug() {
  const coords = { lat: -39.5006452, lon: 176.9039752 };
  
  console.log('\n🔍 DEBUGGING LINZ WFS QUERIES');
  console.log('='.repeat(70));
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Test 1: Very large bbox around Napier
  console.log('\nTest 1: Large bbox around Napier (0.01 degrees ~1km)...');
  const largeBbox = `${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01},EPSG:4326`;
  
  try {
    const url1 = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: largeBbox,
      count: '3'
    });
    
    const r1 = await axios.get(url1, { timeout: 15000 });
    
    if (r1.data && r1.data.features && r1.data.features.length > 0) {
      console.log(`✅ Found ${r1.data.features.length} parcels with large bbox`);
      console.log('First parcel:');
      const p = r1.data.features[0].properties;
      console.log(`  Appellation: ${p.appellation}`);
      console.log(`  Titles: ${p.titles || 'NULL'}`);
      console.log(`  Status: ${p.status}`);
    } else {
      console.log('❌ Still no parcels found');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 2: Try without EPSG:4326 suffix
  console.log('\nTest 2: Bbox without EPSG code...');
  const simpleBbox = `${coords.lon - 0.005},${coords.lat - 0.005},${coords.lon + 0.005},${coords.lat + 0.005}`;
  
  try {
    const url2 = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: simpleBbox,
      count: '3'
    });
    
    const r2 = await axios.get(url2, { timeout: 15000 });
    
    if (r2.data && r2.data.features && r2.data.features.length > 0) {
      console.log(`✅ Found ${r2.data.features.length} parcels`);
      r2.data.features.forEach((f, i) => {
        console.log(`${i+1}. ${f.properties.appellation} - Titles: ${f.properties.titles || 'NULL'}`);
      });
    } else {
      console.log('❌ No parcels');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 3: Query by land district instead of bbox
  console.log('\nTest 3: Query Hawkes Bay parcels (no bbox, just district filter)...');
  
  try {
    const url3 = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      CQL_FILTER: "land_district = 'Hawkes Bay'",
      count: '5'
    });
    
    const r3 = await axios.get(url3, { timeout: 15000 });
    
    if (r3.data && r3.data.features && r3.data.features.length > 0) {
      console.log(`✅ Found ${r3.data.features.length} Hawkes Bay parcels`);
      console.log('Sample:');
      const p = r3.data.features[0].properties;
      console.log(`  Appellation: ${p.appellation}`);
      console.log(`  Titles: ${p.titles || 'NULL'}`);
    } else {
      console.log('❌ No parcels with CQL filter');
    }
  } catch (error) {
    console.log('❌ CQL Error:', error.message);
    console.log('(CQL filtering may not be supported)');
  }
}

testLinZDebug();
