#!/usr/bin/env node

/**
 * Test LINZ Property Titles API directly
 * Based on: https://data.linz.govt.nz/layer/51571-nz-parcels/
 */

const axios = require('axios');

async function testLinZTitles() {
  const coords = { lat: -39.5006452, lon: 176.9039752 }; // 31 Douglas McLean Ave
  
  console.log('\n🔍 TESTING LINZ PROPERTY TITLES LAYER');
  console.log('='.repeat(70));
  console.log(`Location: ${coords.lat}, ${coords.lon}`);
  
  try {
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    
    // Try querying the NZ Parcels layer (layer-51571) with bbox
    console.log('\nStep 1: Querying NZ Parcels layer (51571)...');
    const delta = 0.001; // ~100m box
    const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta}`;
    
    const parcelsUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '5'
    });
    
    console.log('URL:', parcelsUrl.substring(0, 150) + '...');
    
    const parcelsResponse = await axios.get(parcelsUrl, { timeout: 15000 });
    
    if (!parcelsResponse.data || !parcelsResponse.data.features || parcelsResponse.data.features.length === 0) {
      console.log('❌ No parcels found in bbox');
      return;
    }
    
    console.log(`✅ Found ${parcelsResponse.data.features.length} parcel(s):\n`);
    
    parcelsResponse.data.features.forEach((feature, idx) => {
      const props = feature.properties;
      console.log(`Parcel ${idx + 1}:`);
      console.log(`  ID: ${props.id}`);
      console.log(`  Appellation: ${props.appellation || 'N/A'}`);
      console.log(`  Status: ${props.status || 'N/A'}`);
      console.log(`  Titles field: ${props.titles || 'NULL'}`);
      console.log(`  Survey Area: ${props.survey_area || 'N/A'} m²`);
      console.log('');
      
      // Check if titles field has data
      if (props.titles) {
        console.log('  ✅ TITLES FOUND:', props.titles);
        
        // Try to extract title number
        const titleMatch = props.titles.match(/[A-Z]{2,3}\d{1,}\/\d+/i);
        if (titleMatch) {
          console.log('  Extracted Title Number:', titleMatch[0]);
        }
      } else {
        console.log('  ⚠️ No titles in parcel data');
      }
      console.log('---');
    });
    
    // If no titles found, try querying title estate layer directly
    console.log('\nStep 2: Checking Title Estate layer (52068)...');
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
    
    if (titleResponse.data && titleResponse.data.features && titleResponse.data.features.length > 0) {
      console.log(`✅ Found ${titleResponse.data.features.length} title record(s):\n`);
      
      titleResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Title ${idx + 1}:`);
        console.log(`  Title Number: ${props.ttl_title_no || 'N/A'}`);
        console.log(`  Type: ${props.type || 'N/A'}`);
        console.log(`  Status: ${props.status || 'N/A'}`);
        console.log(`  Land District: ${props.land_district || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No title records found in bbox');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response?.status) {
      console.log('HTTP Status:', error.response.status);
    }
    if (error.code === 'ETIMEDOUT') {
      console.log('⏱️ Connection timed out - LINZ server may be slow or unreachable');
    }
  }
}

testLinZTitles();
