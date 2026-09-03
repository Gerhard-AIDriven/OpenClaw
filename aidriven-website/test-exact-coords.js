#!/usr/bin/env node

const axios = require('axios');

async function testExactCoords() {
  console.log('\n🎯 TESTING EXACT COORDINATES\n');
  console.log('Lat: -39.50066347');
  console.log('Lon: 176.9039345\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const lat = -39.50066347;
  const lon = 176.9039345;
  
  // Try different bbox sizes
  const tests = [
    { name: 'TIGHT (50m)', delta: 0.0005 },
    { name: 'MEDIUM (100m)', delta: 0.001 },
    { name: 'LARGE (200m)', delta: 0.002 },
  ];
  
  for (const test of tests) {
    console.log(`\n${test.name} bbox:`);
    console.log('=' .repeat(60));
    
    const delta = test.delta;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lon + delta},EPSG:4326`;
    
    try {
      const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'data.linz.govt.nz:layer-51571',
        outputFormat: 'application/json',
        bbox: bbox,
        count: '10'
      });
      
      const response = await axios.get(url, { timeout: 15000 });
      
      if (response.data && response.data.features && response.data.features.length > 0) {
        console.log(`✅ Found ${response.data.features.length} parcel(s):\n`);
        
        response.data.features.forEach((f, idx) => {
          const props = f.properties;
          const appName = props.appellation || 'N/A';
          const title = props.titles || 'NO TITLE';
          const area = props.survey_area || 'N/A';
          
          console.log(`${idx + 1}. ${appName}`);
          console.log(`   Title: ${title}`);
          console.log(`   Area: ${area} m²`);
          console.log(`   Status: ${props.status || 'N/A'}`);
          
          // Check for our target
          if (appName === 'Lot 88 DP 8162' || title.includes('HBE2/765')) {
            console.log(`   ⭐⭐⭐ THIS IS THE ONE! ⭐⭐⭐`);
          }
          console.log('');
        });
      } else {
        console.log('❌ No parcels found');
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message.substring(0, 80));
    }
  }
}

testExactCoords();
