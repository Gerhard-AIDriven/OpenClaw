#!/usr/bin/env node

const axios = require('axios');

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function findClosest() {
  console.log('\n🎯 FINDING CLOSEST PARCEL TO PIN\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const targetLat = -39.50068107;
  const targetLon = 176.9039117;
  
  // Query with moderate bbox (100m)
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
    
    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.log('❌ No parcels found');
      return;
    }
    
    console.log(`Found ${response.data.features.length} parcels in area\n`);
    
    // Calculate distance for each parcel and find closest
    const parcelsWithDistance = response.data.features.map(f => {
      const props = f.properties;
      
      // Try to get centroid from geometry if available, otherwise use bbox center
      let parcelLat, parcelLon;
      
      if (f.geometry && f.geometry.coordinates) {
        // GeoJSON coordinates: [lon, lat] or [[lon, lat], ...] for polygons
        const coords = f.geometry.coordinates;
        if (Array.isArray(coords[0])) {
          // Polygon - calculate centroid
          let sumLon = 0, sumLat = 0, count = 0;
          coords[0].forEach(point => {
            if (Array.isArray(point) && point.length >= 2) {
              sumLon += point[0];
              sumLat += point[1];
              count++;
            }
          });
          parcelLon = sumLon / count;
          parcelLat = sumLat / count;
        } else {
          // Point
          parcelLon = coords[0];
          parcelLat = coords[1];
        }
      } else {
        // No geometry, skip distance calculation
        parcelLat = targetLat;
        parcelLon = targetLon;
      }
      
      const distance = calculateDistance(targetLat, targetLon, parcelLat, parcelLon);
      
      return {
        feature: f,
        distance: distance,
        appellation: props.appellation || 'N/A',
        titles: props.titles || 'NO TITLE',
        area: props.survey_area || props.calc_area || 'N/A'
      };
    });
    
    // Sort by distance
    parcelsWithDistance.sort((a, b) => a.distance - b.distance);
    
    console.log('Parcels sorted by distance from pin:\n');
    console.log('DISTANCE | Legal Desc                    | Title                          | Area');
    console.log('-'.repeat(90));
    
    parcelsWithDistance.forEach((p, idx) => {
      const distStr = p.distance < 1000 
        ? `${p.distance.toFixed(1)}m`.padStart(8)
        : `${(p.distance/1000).toFixed(2)}km`.padStart(8);
      
      const appName = p.appellation.substring(0, 30).padEnd(30);
      const title = p.titles.substring(0, 30).padEnd(30);
      const area = `${p.area} m²`.padStart(10);
      
      console.log(`${distStr} | ${appName} | ${title} | ${area}`);
      
      if (idx === 0) {
        console.log('           ⭐ CLOSEST - THIS IS THE ONE!');
      }
    });
    
    console.log('\n✅ CLOSEST PARCEL:');
    const closest = parcelsWithDistance[0];
    console.log(`   Legal: ${closest.appellation}`);
    console.log(`   Title: ${closest.titles}`);
    console.log(`   Distance: ${closest.distance.toFixed(1)}m from pin`);
    console.log(`   Area: ${closest.area} m²`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

findClosest();
