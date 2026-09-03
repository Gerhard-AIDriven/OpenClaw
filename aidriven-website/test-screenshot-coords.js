#!/usr/bin/env node

const axios = require('axios');

async function testScreenshotCoords() {
  console.log('\n🎯 TESTING EXACT SCREENSHOT COORDINATES\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // From your LINZ Maps screenshot (WGS84 LatLong)
  const lat = -39.50068107;
  const lon = 176.9039117;
  
  console.log(`Testing WGS84 coordinates from screenshot:`);
  console.log(`Lat: ${lat}`);
  console.log(`Lon: ${lon}\n`);
  
  // Very tight bbox (50m)
  const delta = 0.0005;
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
    
    console.log('Querying with tight 50m bbox...\n');
    const response = await axios.get(url, { timeout: 15000 });
    
    if (response.data && response.data.features && response.data.features.length > 0) {
      console.log(`✅ Found ${response.data.features.length} parcel(s):\n`);
      
      response.data.features.forEach((f, idx) => {
        const props = f.properties;
        console.log(`${idx + 1}. ${props.appellation || 'N/A'}`);
        console.log(`   Title: ${props.titles || 'NO TITLE'}`);
        console.log(`   Area: ${props.survey_area || 'N/A'} m²`);
        console.log(`   Status: ${props.status || 'N/A'}`);
        
        // Check for HBE2/765 or Lot 88 DP 8162
        if (props.titles === 'HBE2/765' || props.appellation === 'Lot 88 DP 8162') {
          console.log(`   ⭐⭐⭐ THIS IS THE TARGET! ⭐⭐⭐`);
        }
        console.log('');
      });
      
    } else {
      console.log('❌ No parcels found');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testScreenshotCoords();
