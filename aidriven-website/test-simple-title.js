#!/usr/bin/env node

/**
 * Test: Simple title query without filters
 */

const axios = require('axios');

async function testSimpleTitleQuery() {
  console.log('\n🔍 TESTING SIMPLE TITLE QUERY (no filters)');
  console.log('='.repeat(80));
  
  try {
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    
    // Query Title Estate with minimal params
    console.log('\nQuerying Title Estate layer (first 5 records)...');
    const titleUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:table-52068',
      outputFormat: 'application/json',
      count: '5'
    });
    
    console.log('URL:', titleUrl);
    
    const titleResponse = await axios.get(titleUrl, { timeout: 15000 });
    
    if (!titleResponse.data || !titleResponse.data.features || titleResponse.data.features.length === 0) {
      console.log('⚠️ No titles returned');
    } else {
      console.log(`✓ Found ${titleResponse.data.features.length} title(s):\n`);
      
      titleResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Title ${idx + 1}:`);
        Object.keys(props).forEach(key => {
          if (props[key] !== null) {
            console.log(`  ${key}: ${props[key]}`);
          }
        });
        console.log('');
      });
      
      console.log('='.repeat(80));
      console.log('✅ Title data is accessible!');
      console.log('\nAvailable fields include:');
      const firstProps = titleResponse.data.features[0].properties;
      console.log(Object.keys(firstProps).join(', '));
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response?.status) {
      console.log('HTTP Status:', error.response.status);
    }
  }
}

testSimpleTitleQuery();
