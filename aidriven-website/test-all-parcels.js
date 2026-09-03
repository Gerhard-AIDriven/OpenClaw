#!/usr/bin/env node

const axios = require('axios');

async function testAllParcels() {
  console.log('\n🔍 CHECKING ALL PARCELS IN AREA\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const coords = { lat: -39.5006452, lon: 176.9039752 }; // 31 Douglas McLean Ave
  
  const delta = 0.01;
  const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta},EPSG:4326`;
  
  const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'data.linz.govt.nz:layer-51571',
    outputFormat: 'application/json',
    bbox: bbox,
    count: '50'
  });
  
  try {
    const response = await axios.get(url, { timeout: 15000 });
    
    console.log(`Found ${response.data.features.length} parcels in area:\n`);
    
    response.data.features.forEach((feature, idx) => {
      const props = feature.properties;
      const title = props.titles || 'NO TITLE';
      const appellation = props.appellation || 'N/A';
      
      // Check if this might be our property
      const isMatch = appellation.toLowerCase().includes('lot') && 
                     (appellation.includes('88') || appellation.includes('DP 8162'));
      
      console.log(`${idx + 1}. ${appellation}`);
      console.log(`   Title: ${title}`);
      console.log(`   Area: ${props.survey_area || 'N/A'} m²`);
      console.log(`   Status: ${props.status || 'N/A'}`);
      if (isMatch) {
        console.log(`   ⭐ POSSIBLE MATCH!`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAllParcels();
