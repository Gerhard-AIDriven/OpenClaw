#!/usr/bin/env node

/**
 * Test: Fetch titles using Napier land district filter
 */

const axios = require('axios');

async function testNapierTitles() {
  console.log('\n🔍 TESTING TITLE FETCH BY LAND DISTRICT');
  console.log('='.repeat(80));
  
  try {
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    
    // Query Title Estate with land_district filter
    console.log('\nQuerying Title Estate (Hawkes Bay district)...');
    const titleUrl = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:table-52068',
      outputFormat: 'application/json',
      CQL_FILTER: "land_district = 'Hawkes Bay'",
      count: '10'
    });
    
    const titleResponse = await axios.get(titleUrl, { timeout: 15000 });
    
    if (!titleResponse.data || !titleResponse.data.features || titleResponse.data.features.length === 0) {
      console.log('⚠️ No titles found in Hawkes Bay');
    } else {
      console.log(`✓ Found ${titleResponse.data.features.length} title(s):\n`);
      
      titleResponse.data.features.forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`Title ${idx + 1}:`);
        console.log(`  Title Number: ${props.ttl_title_no || 'N/A'}`);
        console.log(`  Tenure Type: ${props.type || 'N/A'}`);
        console.log(`  Status: ${props.status || 'N/A'}`);
        console.log(`  Land District: ${props.land_district || 'N/A'}`);
        console.log(`  Edition: ${props.edition_no || 'N/A'}`);
        console.log('');
      });
      
      console.log('='.repeat(80));
      console.log('✅ SUCCESS! Titles ARE accessible via land_district filter');
      console.log('\nTo get titles for a specific property:');
      console.log('1. Get parcel\'s land_district from parcel data');
      console.log('2. Filter titles by that district');
      console.log('3. Cross-reference with parcel ID or appellation');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response?.data) {
      const errStr = error.response.data.toString();
      console.log('Details:', errStr.substring(0, 300));
    }
  }
}

testNapierTitles();
