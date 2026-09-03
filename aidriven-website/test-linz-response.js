#!/usr/bin/env node

/**
 * Debug: Inspect actual LINZ WFS response structure
 */

const axios = require('axios');

async function testLinZResponse() {
  const testAddress = "123 Station Street, Napier";
  
  console.log('\n🔍 INSPECTING LINZ WFS RESPONSE');
  console.log('='.repeat(80));
  console.log(`Address: ${testAddress}\n`);
  
  try {
    // Geocode first
    console.log('Step 1: Geocoding...');
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testAddress)}&limit=1`;
    const geocodeResponse = await axios.get(geocodeUrl, {
      headers: { 'User-Agent': 'AI-Driven-Property-Reports/1.0' }
    });
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('❌ Geocoding failed');
      return;
    }
    
    const coords = {
      lat: parseFloat(geocodeResponse.data[0].lat),
      lon: parseFloat(geocodeResponse.data[0].lon)
    };
    console.log(`✓ Coords: ${coords.lat}, ${coords.lon}\n`);
    
    // Create bounding box
    const delta = 0.005;
    const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta},EPSG:4326`;
    
    // Fetch parcel data
    console.log('Step 2: Fetching LINZ parcel data...');
    const linzKey = 'b2e35aafd4e848e9b0265f1caf575255';
    const url = `https://data.linz.govt.nz/services;key=${linzKey}/wfs?` + new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'data.linz.govt.nz:layer-51571',
      outputFormat: 'application/json',
      bbox: bbox,
      count: '1'
    });
    
    console.log(`URL: ${url.substring(0, 150)}...\n`);
    
    const response = await axios.get(url, { timeout: 15000 });
    
    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.log('❌ No parcels found');
      return;
    }
    
    const parcel = response.data.features[0];
    console.log('✅ Parcel found!\n');
    console.log('FULL PARCEL PROPERTIES:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(parcel.properties, null, 2));
    console.log('='.repeat(80));
    
    // Check for title-related fields
    console.log('\n🔎 SEARCHING FOR TITLE FIELDS:');
    const titleFields = Object.keys(parcel.properties).filter(k => 
      k.toLowerCase().includes('title') || k.toLowerCase().includes('estate')
    );
    
    if (titleFields.length > 0) {
      console.log('Found title-related fields:', titleFields);
      titleFields.forEach(field => {
        console.log(`  ${field}: ${parcel.properties[field]}`);
      });
    } else {
      console.log('⚠️ No title-related fields found in parcel properties');
    }
    
    // Check for 'titles' field specifically
    if (parcel.properties.titles) {
      console.log(`\n✓ 'titles' field EXISTS: "${parcel.properties.titles}"`);
      
      // Try to extract with regex
      const matches = parcel.properties.titles.match(/[A-Z]{1,3}\d{2,}\/\d+/gi);
      if (matches) {
        console.log('✓ Regex extracted:', matches);
      } else {
        console.log('⚠️ Regex found no matches - format may differ');
      }
    } else {
      console.log('\n❌ No \'titles\' field in parcel properties');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testLinZResponse();
