#!/usr/bin/env node

const axios = require('axios');

async function testSearchByStreet() {
  console.log('\n🔍 SEARCHING FOR DOUGLAS MCLEAN AVENUE PARCELS\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Try querying all of Napier with CQL filter for street name
  // Note: This might not work if CQL isn't supported, but let's try
  
  const napierBbox = '176.85,-39.55,177.00,-39.40,EPSG:4326';
  
  const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'data.linz.govt.nz:layer-51571',
    outputFormat: 'application/json',
    bbox: napierBbox,
    count: '200'
  });
  
  try {
    const response = await axios.get(url, { timeout: 20000 });
    
    console.log(`Found ${response.data.features.length} parcels in Napier area\n`);
    
    // Filter for Douglas McLean Avenue properties
    const mcLeanParcels = response.data.features.filter(f => {
      const addr = f.properties.address || '';
      const appName = f.properties.appellation || '';
      return addr.toLowerCase().includes('mclean') || 
             addr.toLowerCase().includes('maclean');
    });
    
    if (mcLeanParcels.length > 0) {
      console.log(`✅ Found ${mcLeanParcels.length} parcels on Douglas McLean Avenue:\n`);
      
      mcLeanParcels.forEach((f, idx) => {
        const props = f.properties;
        console.log(`${idx + 1}. ${props.appellation}`);
        console.log(`   Title: ${props.titles || 'NO TITLE'}`);
        console.log(`   Address: ${props.address || 'N/A'}`);
        console.log(`   Area: ${props.survey_area || 'N/A'} m²`);
        console.log('');
      });
    } else {
      console.log('⚠️ No parcels found with "McLean" in address field');
      console.log('The parcel layer may not include street addresses');
    }
    
    // Also look for Lot 88 DP 8162 specifically
    const lot88 = response.data.features.find(f => 
      f.properties.appellation === 'Lot 88 DP 8162'
    );
    
    if (lot88) {
      console.log('\n⭐ FOUND Lot 88 DP 8162!');
      console.log('Title:', lot88.properties.titles);
      console.log('Address:', lot88.properties.address);
    } else {
      console.log('\n❌ Lot 88 DP 8162 not found in this query');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSearchByStreet();
