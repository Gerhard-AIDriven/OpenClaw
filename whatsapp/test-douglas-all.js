const {geocodeAddress} = require('./linz-api-wfs.js');

// Temporarily modify to search nationwide (no suburb filter)
(async () => {
  console.log('Searching for "39 Douglas McLean Avenue" nationwide...\n');
  
  // Manually build a query without suburb
  const fetch = require('node-fetch');
  const LINZ_API_KEY = 'b2e35a…5255';
  const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;
  
  // Try exact match on road name only
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-123113&srsName=EPSG:4326&outputFormat=application/json&cql_filter=full_road_name='Douglas+McLean+Avenue'&maxFeatures=10`;
  
  console.log('Query:', url.substring(0, 150), '...\n');
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      console.log('HTTP Error:', response.status);
      console.log('Response:', text.substring(0, 300));
      return;
    }
    
    const data = JSON.parse(text);
    const features = data.features || [];
    
    console.log(`Found ${features.length} addresses on "Douglas McLean Avenue":\n`);
    
    features.forEach(f => {
      const addr = f.properties.full_address_ascii || f.properties.full_address;
      const road = f.properties.full_road_name;
      const suburb = f.properties.suburb_locality;
      const city = f.properties.city || f.properties.town;
      console.log(`✓ ${addr}`);
      console.log(`  Road: "${road}", Suburb: "${suburb}", City: ${city || 'N/A'}`);
      console.log(`  Coords: ${f.geometry.coordinates[1].toFixed(6)}, ${f.geometry.coordinates[0].toFixed(6)}\n`);
    });
    
  } catch (e) {
    console.log('ERROR:', e.message);
  }
})();
