#!/usr/bin/env node

const axios = require('axios');

async function findLot88Bbox() {
  console.log('\n🔍 FINDING THE RIGHT BBOX FOR LOT 88\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  
  // Try progressively larger bboxes centered on our target
  const targetLat = -39.50068107;
  const targetLon = 176.9039117;
  
  const sizes = [0.0005, 0.001, 0.002, 0.003, 0.004, 0.005];
  
  for (const delta of sizes) {
    const bbox = `${targetLon - delta},${targetLat - delta},${targetLon + delta},${targetLat + delta},EPSG:4326`;
    
    try {
      const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'data.linz.govt.nz:layer-51571',
        outputFormat: 'application/json',
        bbox: bbox,
        count: '50'
      });
      
      const response = await axios.get(url, { timeout: 15000 });
      
      const lot88 = response.data.features.find(f => 
        f.properties.appellation === 'Lot 88 DP 8162'
      );
      
      const found = lot88 ? '✅ FOUND' : '❌ not found';
      console.log(`delta=${delta} (${(delta * 111).toFixed(0)}km): ${response.data.features.length} parcels - ${found}`);
      
      if (lot88) {
        console.log(`   Title: ${lot88.properties.titles}`);
        console.log(`   Area: ${lot88.properties.survey_area} m²`);
        break; // Found it, stop searching
      }
      
    } catch (error) {
      console.log(`delta=${delta}: ERROR - ${error.message}`);
    }
  }
}

findLot88Bbox();
