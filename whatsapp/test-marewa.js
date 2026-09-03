const fetch = require('node-fetch');

const LINZ_API_KEY = 'b2e35a…5255';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;

(async () => {
  // Search for ANY address in Marewa suburb
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-123113&srsName=EPSG:4326&outputFormat=application/json&cql_filter=suburb_locality=Marewa&maxFeatures=30`;
  
  console.log('Searching for addresses in Marewa...\n');
  
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
    
    console.log(`Found ${features.length} addresses in Marewa:\n`);
    
    // Group by street name
    const streets = {};
    features.forEach(f => {
      const road = f.properties.full_road_name || f.properties.road_name;
      if (!streets[road]) streets[road] = [];
      streets[road].push(f.properties.address_number);
    });
    
    console.log('Streets in Marewa:');
    Object.keys(streets).sort().forEach(street => {
      const count = streets[street].length;
      console.log(`  - ${street} (${count} addresses)`);
    });
    
  } catch (e) {
    console.log('ERROR:', e.message);
  }
})();
