#!/usr/bin/env node

/**
 * Test: Fetch title data via Title-Parcel Association
 */

const axios = require('axios');

async function testTitleFetch() {
  const coords = { lat: -39.4933895, lon: 176.9135659 };
  
  console.log('\n🔍 TESTING TITLE FETCH VIA ASSOCIATION LAYER');
  console.log('='.repeat(80));
  
  try {
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    
    // Step 1: Get parcel ID first
    console.log('\nStep 1: Fetching parcel...');
    const delta = 0.005;
    const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta},EPSG:4326`;
    
    const parcelUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '1'
    });
    
    const parcelResponse = await axios.get(parcelUrl, { timeout: 15000 });
    
    if (!parcelResponse.data || parcelResponse.data.features.length === 0) {
      console.log('❌ No parcels found');
      return;
    }
    
    const parcel = parcelResponse.data.features[0];
    const parcelId = parcel.properties.id;
    console.log(`✓ Parcel ID: ${parcelId}`);
    console.log(`  Appellation: ${parcel.properties.appellation}`);
    console.log(`  Status: ${parcel.properties.status}`);
    
    // Step 2: Query Title-Parcel Association layer
    console.log('\nStep 2: Fetching Title-Parcel Associations...');
    const assocUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:table-51569',
      outputFormat: 'application/json',
      CQL_FILTER: `parcel_id = ${parcelId}`
    });
    
    console.log(`Querying associations for parcel ${parcelId}...`);
    
    const assocResponse = await axios.get(assocUrl, { timeout: 15000 });
    
    if (!assocResponse.data || !assocResponse.data.features || assocResponse.data.features.length === 0) {
      console.log('⚠️ No title associations found for this parcel');
      console.log('This parcel may be:');
      console.log('  - Historic/superseded (titles moved to new parcels)');
      console.log('  - Part of a larger title (need to query differently)');
      console.log('  - Unsubdivided Maori land (different title system)');
    } else {
      console.log(`✓ Found ${assocResponse.data.features.length} title association(s):\n`);
      
      assocResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Association ${idx + 1}:`);
        console.log(`  Title Number: ${props.title_number || 'N/A'}`);
        console.log(`  Parcel ID: ${props.parcel_id || 'N/A'}`);
        console.log(`  Title Type: ${props.title_type || 'N/A'}`);
        console.log('');
      });
      
      // Step 3: Fetch actual title estate data
      const titleNumbers = assocResponse.data.features
        .map(f => f.properties.title_number)
        .filter(t => t);
      
      if (titleNumbers.length > 0) {
        console.log('Step 3: Fetching Title Estate data...');
        const titleList = titleNumbers.map(t => `'${t}'`).join(',');
        
        const titleUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
          service: 'WFS',
          version: '2.0.0',
          request: 'GetFeature',
          typeName: 'data.linz.govt.nz:table-52068',
          outputFormat: 'application/json',
          CQL_FILTER: `ttl_title_no IN (${titleList})`
        });
        
        const titleResponse = await axios.get(titleUrl, { timeout: 15000 });
        
        if (titleResponse.data && titleResponse.data.features && titleResponse.data.features.length > 0) {
          console.log(`✓ Found ${titleResponse.data.features.length} title record(s):\n`);
          
          titleResponse.data.features.forEach((feature, idx) => {
            const props = feature.properties;
            console.log(`Title ${idx + 1}: ${props.ttl_title_no}`);
            console.log(`  Tenure: ${props.type || 'N/A'}`);
            console.log(`  Edition: ${props.edition_no || 'N/A'}`);
            console.log(`  Status: ${props.status || 'N/A'}`);
            // Note: Owner names may be restricted
            console.log('');
          });
        } else {
          console.log('⚠️ No title estate records found');
        }
      }
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response?.status) {
      console.log('HTTP Status:', error.response.status);
    }
  }
}

testTitleFetch();
