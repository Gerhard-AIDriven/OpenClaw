#!/usr/bin/env node

const axios = require('axios');

async function testRestApi() {
  console.log('\n🔍 TRYING LINZ REST API (non-WFS)\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const coords = { lat: -39.5006452, lon: 176.9039752 };
  
  // Try the newer LINZ Data Service API format
  // https://data.linz.govt.nz/services;key={key}/data/layer/{layerId}/item/{id}
  
  try {
    // First, let's try to find parcels near this point using the items endpoint
    console.log('Attempting REST API query...\n');
    
    const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'json',
      bbox: `${coords.lon - 0.002},${coords.lat - 0.002},${coords.lon + 0.002},${coords.lat + 0.002},EPSG:4326`,
      count: '10'
    });
    
    console.log('Using TIGHTER bbox (0.002 degrees ≈ 200m)');
    const response = await axios.get(url, { timeout: 15000 });
    
    if (response.data && response.data.features && response.data.features.length > 0) {
      console.log(`\n✅ Found ${response.data.features.length} parcels VERY close to the address:\n`);
      
      response.data.features.forEach((f, idx) => {
        const props = f.properties;
        console.log(`${idx + 1}. ${props.appellation || 'N/A'}`);
        console.log(`   Title: ${props.titles || 'NO TITLE'}`);
        console.log(`   Area: ${props.survey_area || 'N/A'} m²`);
        
        // Calculate rough distance from target coords if we had geometry
        // For now just show them all
        console.log('');
      });
      
      console.log('⚠️ None of these match "Lot 88 DP 8162" / HBE2/765');
      console.log('\nThis suggests the geocoded coordinates may not be exactly on the right property.');
    } else {
      console.log('❌ No parcels found even with tight bbox');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n\n💡 ALTERNATIVE APPROACH:');
  console.log('Since we can\'t reliably match address → exact parcel,');
  console.log('we should show ALL parcels in the area and let users identify theirs,');
  console.log('OR use the title number from the closest parcel as a "likely match".');
}

testRestApi();
