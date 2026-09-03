#!/usr/bin/env node

/**
 * Test: Fetch title data using spatial query
 */

const axios = require('axios');

async function testSpatialTitleFetch() {
  const coords = { lat: -39.4933895, lon: 176.9135659 };
  
  console.log('\n🔍 TESTING SPATIAL TITLE FETCH');
  console.log('='.repeat(80));
  
  try {
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    
    // Create small bounding box around coordinates
    const delta = 0.002; // ~200m
    const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta},EPSG:4326`;
    
    // Query Title-Parcel Association layer with BBOX
    console.log('\nQuerying Title-Parcel Associations (spatial)...');
    const assocUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:table-51569',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '5'
    });
    
    const assocResponse = await axios.get(assocUrl, { timeout: 15000 });
    
    if (!assocResponse.data || !assocResponse.data.features || assocResponse.data.features.length === 0) {
      console.log('⚠️ No title associations found in area');
    } else {
      console.log(`✓ Found ${assocResponse.data.features.length} association(s):\n`);
      
      assocResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Association ${idx + 1}:`);
        Object.keys(props).forEach(key => {
          if (props[key] !== null) {
            console.log(`  ${key}: ${props[key]}`);
          }
        });
        console.log('');
      });
    }
    
    // Also try fetching Title Estate directly with spatial query
    console.log('\nQuerying Title Estate layer (spatial)...');
    const titleUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:table-52068',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '5'
    });
    
    const titleResponse = await axios.get(titleUrl, { timeout: 15000 });
    
    if (!titleResponse.data || !titleResponse.data.features || titleResponse.data.features.length === 0) {
      console.log('⚠️ No title estate records found in area');
    } else {
      console.log(`✓ Found ${titleResponse.data.features.length} title record(s):\n`);
      
      titleResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Title ${idx + 1}:`);
        // Print all non-null properties
        Object.keys(props).forEach(key => {
          if (props[key] !== null && key !== 'geometry') {
            console.log(`  ${key}: ${props[key]}`);
          }
        });
        console.log('');
      });
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response?.status) {
      console.log('HTTP Status:', error.response.status);
      if (error.response.data) {
        console.log('Error details:', JSON.stringify(error.response.data, null, 2).substring(0, 500));
      }
    }
  }
}

testSpatialTitleFetch();
