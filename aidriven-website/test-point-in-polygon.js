#!/usr/bin/env node

const axios = require('axios');

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
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

/**
 * Calculate centroid of a polygon
 */
function getCentroid(polygon) {
  let sumLat = 0, sumLon = 0, count = 0;
  
  polygon.forEach(ring => {
    if (Array.isArray(ring[0])) {
      // Nested rings (MultiPolygon)
      ring.forEach(coord => {
        if (coord.length >= 2) {
          sumLat += coord[1];
          sumLon += coord[0];
          count++;
        }
      });
    } else {
      // Single ring
      if (ring.length >= 2) {
        sumLat += ring[1];
        sumLon += ring[0];
        count++;
      }
    }
  });
  
  return count > 0 ? [sumLat / count, sumLon / count] : null;
}

async function testPointInPolygon() {
  console.log('\n🎯 FINDING PARCEL CONTAINING THE PIN\n');
  
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
    
    console.log(`Target: ${targetLat}, ${targetLon}\n`);
    const response = await axios.get(url, { timeout: 15000 });
    
    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.log('❌ No parcels found');
      return;
    }
    
    console.log(`Checking ${response.data.features.length} parcels...\n`);
    
    let containingParcel = null;
    const parcelsWithDistance = [];
    
    response.data.features.forEach(f => {
      const props = f.properties;
      const appName = props.appellation || 'N/A';
      const title = props.titles || 'NO TITLE';
      
      if (!f.geometry || !f.geometry.coordinates) {
        return;
      }
      
      // Get exterior ring (first ring of first polygon)
      let exteriorRing;
      if (f.geometry.type === 'MultiPolygon') {
        exteriorRing = f.geometry.coordinates[0][0];
      } else if (f.geometry.type === 'Polygon') {
        exteriorRing = f.geometry.coordinates[0];
      }
      
      if (!exteriorRing) return;
      
      // Convert to [lat, lon] format for our functions
      const polygon = exteriorRing.map(coord => [coord[1], coord[0]]);
      
      // Check if point is inside this polygon
      const inside = isPointInPolygon(targetPoint, polygon);
      
      if (inside) {
        console.log(`✅ PIN IS INSIDE: ${appName}`);
        console.log(`   Title: ${title}`);
        console.log(`   Area: ${props.survey_area || props.calc_area || 'N/A'} m²`);
        console.log(`   Status: ${props.status || 'N/A'}\n`);
        containingParcel = { feature: f, appellation: appName, title, area: props.survey_area || props.calc_area };
      }
      
      // Also calculate distance to centroid for ranking
      const centroid = getCentroid([exteriorRing]);
      if (centroid) {
        const dist = Math.sqrt(
          Math.pow((centroid[0] - targetLat) * 111000, 2) +
          Math.pow((centroid[1] - targetLon) * 111000 * Math.cos(targetLat * Math.PI / 180), 2)
        );
        parcelsWithDistance.push({
          appellation: appName,
          title,
          distance: dist,
          inside
        });
      }
    });
    
    if (!containingParcel) {
      console.log('⚠️ Pin not inside any parcel polygon');
      console.log('Finding closest parcel by centroid...\n');
      
      parcelsWithDistance.sort((a, b) => a.distance - b.distance);
      
      console.log('CLOSEST PARCELS:');
      parcelsWithDistance.slice(0, 5).forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.appellation} - ${p.title} (${p.distance.toFixed(1)}m)`);
      });
    } else {
      console.log('\n🎯 SUCCESS! Found the exact parcel containing the pin.');
      console.log(`\nThis should be: Lot 88 DP 8162 / HBE2/765`);
      console.log(`Actual result: ${containingParcel.appellation} / ${containingParcel.title}`);
      
      if (containingParcel.appellation === 'Lot 88 DP 8162' && containingParcel.title === 'HBE2/765') {
        console.log('\n✅✅✅ PERFECT MATCH! ✅✅✅');
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testPointInPolygon();
