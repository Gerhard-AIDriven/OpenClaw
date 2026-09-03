const fetch = require('node-fetch');

const LINZ_API_KEY = 'b2e35a…5255';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;

(async () => {
  // Search for Douglas McLean Avenue specifically
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-123113&srsName=EPSG:4326&outputFormat=application/json&cql_filter=full_road_name+ILIKE+'%25douglas%25mclean%25'+OR+full_road_name+ILIKE+'%25douglas%25mclean%25'&maxFeatures=10`;
  
  console.log('Searching for "Douglas McLean Avenue"...\n');
  
  const response = await fetch(url);
  console.log('Status:', response.status);
  
  if (!response.ok) {
    const text = await response.text();
    console.log('Error:', text.substring(0, 200));
    return;
  }
  
  const data = await response.json();
  const features = data.features || [];
  
  console.log(`Found ${features.length} addresses:\n`);
  
  features.forEach(f => {
    const addr = f.properties.full_address_ascii || f.properties.full_address;
    const road = f.properties.full_road_name || f.properties.road_name;
    const suburb = f.properties.suburb_locality;
    console.log(`✓ ${addr}`);
    console.log(`  Road: "${road}", Suburb: "${suburb}"`);
    console.log(`  Coords: ${f.geometry.coordinates[1].toFixed(6)}, ${f.geometry.coordinates[0].toFixed(6)}\n`);
  });
})();
