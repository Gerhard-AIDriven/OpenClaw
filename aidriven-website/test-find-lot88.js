#!/usr/bin/env node

const axios = require('axios');

async function findLot88() {
  console.log('\n🔍 SEARCHING ALL NAPIER FOR "Lot 88 DP 8162"\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Large Napier bbox
  const napierBbox = '176.80,-39.58,177.05,-39.42,EPSG:4326';
  
  try {
    const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: napierBbox,
      count: '500'  // Get lots of results
    });
    
    console.log('Querying large Napier area (may take a moment)...');
    const response = await axios.get(url, { timeout: 30000 });
    
    if (!response.data || !response.data.features) {
      console.log('❌ No data returned');
      return;
    }
    
    console.log(`✅ Retrieved ${response.data.features.length} parcels\n`);
    
    // Search for Lot 88 DP 8162
    const lot88 = response.data.features.find(f => 
      f.properties.appellation === 'Lot 88 DP 8162'
    );
    
    if (lot88) {
      console.log('⭐⭐⭐ FOUND Lot 88 DP 8162! ⭐⭐⭐\n');
      console.log('Full properties:');
      console.log(JSON.stringify(lot88.properties, null, 2));
    } else {
      console.log('❌ Lot 88 DP 8162 NOT FOUND in entire Napier area');
      
      // Check if DP 8162 exists at all
      const dp8162Parcels = response.data.features.filter(f => 
        f.properties.appellation && f.properties.appellation.includes('DP 8162')
      );
      
      if (dp8162Parcels.length > 0) {
        console.log(`\nBut found ${dp8162Parcels.length} other parcels from DP 8162:`);
        dp8162Parcels.forEach(p => {
          console.log(`  - ${p.properties.appellation} | Title: ${p.properties.titles || 'NONE'}`);
        });
      }
      
      // Also search for title HBE2/765
      const hbe2765 = response.data.features.find(f => 
        f.properties.titles && f.properties.titles.includes('HBE2/765')
      );
      
      if (hbe2765) {
        console.log('\n⭐ Found title HBE2/765 on:');
        console.log(`  ${hbe2765.properties.appellation}`);
        console.log(`  Location: approx ${hbe2765.properties.calc_area ? hbe2765.properties.calc_area : '?'} m²`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.log('⏱️ Request timed out - too many parcels?');
    }
  }
}

findLot88();
