#!/usr/bin/env node

const axios = require('axios');

async function testTrace() {
  console.log('\n🔍 TRACING LINZ FETCH\n');
  
  const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
  const coords = { lat: -39.5006452, lon: 176.9039752 };
  
  // Step 1: Get parcels
  console.log('Step 1: Fetching parcels...');
  const delta = 0.01;
  const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta},EPSG:4326`;
  
  const parcelUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'data.linz.govt.nz:layer-51571',
    outputFormat: 'application/json',
    bbox: bbox,
    count: '5'
  });
  
  try {
    const parcelResp = await axios.get(parcelUrl, { timeout: 15000 });
    console.log(`✅ Found ${parcelResp.data.features.length} parcels`);
    
    const parcel = parcelResp.data.features[0];
    console.log(`   Appellation: ${parcel.properties.appellation}`);
    console.log(`   Titles: ${parcel.properties.titles || 'NULL'}`);
    
    if (parcel.properties.titles) {
      const titleMatch = parcel.properties.titles.match(/[A-Z]{2,3}\d{1,}\/\d+/gi);
      if (titleMatch) {
        console.log(`   Extracted Title: ${titleMatch[0]}`);
        
        // Step 2: Try to fetch titles with Napier bbox
        console.log('\nStep 2: Fetching titles in Napier area...');
        const napierBbox = '176.85,-39.55,177.00,-39.40,EPSG:4326';
        
        const titleUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
          service: 'WFS',
          version: '2.0.0',
          request: 'GetFeature',
          typeName: 'data.linz.govt.nz:table-52068',
          outputFormat: 'application/json',
          bbox: napierBbox,
          count: '20'
        });
        
        console.log('Title URL:', titleUrl.substring(0, 150) + '...');
        
        const titleResp = await axios.get(titleUrl, { timeout: 15000 });
        console.log(`✅ Found ${titleResp.data.features.length} titles`);
        
        // Find matching title
        const matchingTitle = titleResp.data.features.find(f => 
          f.properties.ttl_title_no === titleMatch[0]
        );
        
        if (matchingTitle) {
          console.log('\n✅ MATCHING TITLE FOUND:');
          console.log('  Number:', matchingTitle.properties.ttl_title_no);
          console.log('  Type:', matchingTitle.properties.type);
          console.log('  Status:', matchingTitle.properties.status);
        } else {
          console.log('\n⚠️ No matching title found in results');
          console.log('First few titles:');
          titleResp.data.features.slice(0, 3).forEach(f => {
            console.log(`  - ${f.properties.ttl_title_no}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.log('❌ ERROR at step:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('URL that failed:', error.config?.url?.substring(0, 200));
    }
  }
}

testTrace();
