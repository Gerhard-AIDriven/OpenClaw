#!/usr/bin/env node

/**
 * Test different street numbers on Douglas McLean Avenue
 * to see which one corresponds to Lot 88 DP 8162 / HBE2/765
 */

const axios = require('axios');

async function testNumbers() {
  console.log('\n🔍 TESTING DIFFERENT STREET NUMBERS\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Test several street numbers
  const testAddresses = [
    '31 Douglas McLean Avenue, Napier',
    '88 Douglas McLean Avenue, Napier',  // Maybe the lot number matches street number?
    '1 Douglas McLean Avenue, Napier',
  ];
  
  for (const addr of testAddresses) {
    console.log(`\nTesting: ${addr}`);
    console.log('=' .repeat(60));
    
    try {
      // Geocode first
      const geoUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
        q: addr,
        format: 'json',
        limit: '1'
      });
      
      const geoResp = await axios.get(geoUrl, { 
        timeout: 10000,
        headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
      });
      
      if (!geoResp.data || geoResp.data.length === 0) {
        console.log('  ❌ Not found');
        continue;
      }
      
      const result = geoResp.data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      console.log(`  📍 Coords: ${lat}, ${lon}`);
      
      // Query parcels at this location
      const delta = 0.001; // Very tight ~100m
      const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta},EPSG:4326`;
      
      const parcelUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'data.linz.govt.nz:layer-51571',
        outputFormat: 'application/json',
        bbox: bbox,
        count: '5'
      });
      
      const parcelResp = await axios.get(parcelUrl, { timeout: 10000 });
      
      if (parcelResp.data && parcelResp.data.features && parcelResp.data.features.length > 0) {
        console.log(`  ✅ Found ${parcelResp.data.features.length} parcel(s):`);
        parcelResp.data.features.forEach(f => {
          const props = f.properties;
          console.log(`     - ${props.appellation || 'N/A'} | Title: ${props.titles || 'NONE'} | ${props.survey_area || '?'} m²`);
          
          if (props.appellation === 'Lot 88 DP 8162' || props.titles === 'HBE2/765') {
            console.log(`     ⭐⭐⭐ MATCH FOUND! ⭐⭐⭐`);
          }
        });
      } else {
        console.log('  ❌ No parcels found');
      }
      
    } catch (error) {
      console.log('  ❌ Error:', error.message.substring(0, 80));
    }
  }
  
  console.log('\n\n💡 If none matched, the screenshot may have been from a manual search');
  console.log('   on LINZ Maps that used a different addressing system.');
}

testNumbers();
