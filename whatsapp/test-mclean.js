const fetch = require('node-fetch');

const LINZ_API_KEY = 'b2e35a…5255';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;

(async () => {
  // Search for ANY "McLean" street in Hawke's Bay / Napier area
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-123113&srsName=EPSG:4326&outputFormat=application/json&cql_filter=strMatches(full_road_name,'.*[Mm][Cc][Ll][Ee][Aa][Nn].*')&maxFeatures=20`;
  
  console.log('Searching for "McLean" streets...\n');
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error:', text.substring(0, 300));
      return;
    }
    
    const data = await response.json();
    const features = data.features || [];
    
    console.log(`Found ${features.length} addresses with "McLean":\n`);
    
    features.slice(0, 10).forEach(f => {
      const addr = f.properties.full_address_ascii || f.properties.full_address;
      const road = f.properties.full_road_name || f.properties.road_name;
      const suburb = f.properties.suburb_locality;
      console.log(`✓ ${addr}`);
      console.log(`  Road: "${road}", Suburb: "${suburb}"\n`);
    });
  } catch (e) {
    console.log('ERROR:', e.message);
  }
})();
