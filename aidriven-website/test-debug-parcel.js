#!/usr/bin/env node

const axios = require('axios');

async function debugParcel() {
  console.log('\n🔍 DEBUGGING PARCEL SELECTION\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Your exact screenshot coordinates
  const targetLat = -39.50068107;
  const targetLon = 176.9039117;
  
  console.log(`Target coordinates: ${targetLat}, ${targetLon}`);
  console.log('Expected: The property you\'re looking at in LINZ Maps\n');
  
  // Query with VERY tight bbox (20m)
  const delta = 0.0002; // ~20 meters
  const bbox = `${targetLon - delta},${targetLat - delta},${targetLon + delta},${targetLat + delta},EPSG:4326`;
  
  console.log(`Querying with TIGHT bbox (${delta} degrees ≈ 20m)...\n`);
  
  try {
    const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '20'
    });
    
    const response = await axios.get(url, { timeout: 15000 });
    
    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.log('❌ No parcels found in 20m radius');
      console.log('Trying slightly larger bbox (50m)...\n');
      
      // Try 50m
      const delta2 = 0.0005;
      const bbox2 = `${targetLon - delta2},${targetLat - delta2},${targetLon + delta2},${targetLat + delta2},EPSG:4326`;
      
      const url2 = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'data.linz.govt.nz:layer-51571',
        outputFormat: 'application/json',
        bbox: bbox2,
        count: '20'
      });
      
      const resp2 = await axios.get(url2, { timeout: 15000 });
      
      if (resp2.data && resp2.data.features && resp2.data.features.length > 0) {
        console.log(`✅ Found ${resp2.data.features.length} parcels in 50m radius:\n`);
        
        resp2.data.features.forEach((f, idx) => {
          const props = f.properties;
          const appName = props.appellation || 'N/A';
          const title = props.titles || 'NO TITLE';
          const area = props.survey_area || props.calc_area || 'N/A';
          
          console.log(`${idx + 1}. ${appName}`);
          console.log(`   Title: ${title}`);
          console.log(`   Area: ${area} m²`);
          console.log(`   Status: ${props.status || 'N/A'}`);
          console.log('');
        });
      }
      
      return;
    }
    
    console.log(`✅ Found ${response.data.features.length} parcels in 20m radius:\n`);
    
    response.data.features.forEach((f, idx) => {
      const props = f.properties;
      console.log(`${idx + 1}. ${props.appellation || 'N/A'}`);
      console.log(`   Title: ${props.titles || 'NO TITLE'}`);
      console.log(`   Area: ${props.survey_area || props.calc_area || 'N/A'} m²`);
      console.log(`   Status: ${props.status || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugParcel();
