#!/usr/bin/env node

const axios = require('axios');

function isPointInPolygon(point, polygon) {
  const [lat, lon] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, loni] = polygon[i];
    const [latj, lonj] = polygon[j];
    
    const intersect = ((loni > lon) !== (lonj > lon)) &&
        (lat < (latj - lati) * (lon - loni) / (lonj - loni) + lati);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

async function testPIP() {
  console.log('\n🔍 TESTING POINT-IN-POLYGON FUNCTION\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const targetLat = -39.50068107;
  const targetLon = 176.9039117;
  const targetPoint = [targetLat, targetLon];
  
  const delta = 0.001;
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
    
    console.log(`Testing ${response.data.features.length} parcels...\n`);
    
    let foundInside = false;
    
    response.data.features.forEach((f, idx) => {
      const appName = f.properties.appellation || 'N/A';
      
      if (!f.geometry || !f.geometry.coordinates) return;
      
      let exteriorRing;
      if (f.geometry.type === 'MultiPolygon') {
        exteriorRing = f.geometry.coordinates[0][0];
      } else if (f.geometry.type === 'Polygon') {
        exteriorRing = f.geometry.coordinates[0];
      } else {
        return;
      }
      
      // Convert to [lat, lon]
      const polygon = exteriorRing.map(coord => [coord[1], coord[0]]);
      
      const inside = isPointInPolygon(targetPoint, polygon);
      
      if (inside) {
        console.log(`✅ INSIDE: ${appName}`);
        console.log(`   Title: ${f.properties.titles || 'NONE'}`);
        console.log(`   Area: ${f.properties.survey_area || 'N/A'} m²`);
        foundInside = true;
        
        if (appName === 'Lot 88 DP 8162') {
          console.log('   ⭐⭐⭐ THIS IS THE TARGET! ⭐⭐⭐\n');
        }
      }
    });
    
    if (!foundInside) {
      console.log('❌ Point is NOT inside ANY parcel');
      console.log('\nThis suggests the point-in-polygon algorithm has a bug.');
      console.log('Let me test with a simple square...');
      
      // Test with a simple square
      const square = [
        [-39.501, 176.903],
        [-39.501, 176.905],
        [-39.500, 176.905],
        [-39.500, 176.903]
      ];
      
      const testPoint = [-39.50068107, 176.9039117];
      const testInside = isPointInPolygon(testPoint, square);
      console.log(`Simple square test: ${testInside ? 'INSIDE ✓' : 'OUTSIDE ✗'}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testPIP();
