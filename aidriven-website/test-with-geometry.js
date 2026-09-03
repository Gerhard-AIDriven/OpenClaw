#!/usr/bin/env node

const axios = require('axios');

async function testWithGeometry() {
  console.log('\n🔍 QUERYING WITH GEOMETRY OUTPUT\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const targetLat = -39.50068107;
  const targetLon = 176.9039117;
  
  const delta = 0.001;
  const bbox = `${targetLon - delta},${targetLat - delta},${targetLon + delta},${targetLat + delta},EPSG:4326`;
  
  try {
    // Request GeoJSON output which includes geometry
    const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '20'
    });
    
    console.log('Fetching parcels with full geometry...\n');
    const response = await axios.get(url, { timeout: 15000 });
    
    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.log('❌ No parcels found');
      return;
    }
    
    console.log(`Found ${response.data.features.length} parcels\n`);
    
    // Check each feature for geometry
    response.data.features.forEach((f, idx) => {
      const props = f.properties;
      const hasGeom = f.geometry ? 'YES' : 'NO';
      
      console.log(`${idx + 1}. ${props.appellation || 'N/A'} | Title: ${props.titles || 'NONE'} | Geometry: ${hasGeom}`);
      
      if (f.geometry && f.geometry.type) {
        console.log(`   Type: ${f.geometry.type}`);
        if (f.geometry.coordinates && f.geometry.coordinates[0]) {
          const coords = f.geometry.coordinates[0][0]; // First ring, first point
          if (Array.isArray(coords)) {
            console.log(`   First coord: [${coords[0]}, ${coords[1]}]`);
          }
        }
      }
      console.log('');
    });
    
    // Now find Lot 88 DP 8162 specifically
    const lot88 = response.data.features.find(f => 
      f.properties.appellation === 'Lot 88 DP 8162'
    );
    
    if (lot88) {
      console.log('\n⭐ FOUND Lot 88 DP 8162!');
      console.log('Full properties:', JSON.stringify(lot88.properties, null, 2));
      if (lot88.geometry) {
        console.log('\nGeometry type:', lot88.geometry.type);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testWithGeometry();
