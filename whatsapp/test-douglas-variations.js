const fetch = require('node-fetch');

const LINZ_API_KEY = '***';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;

(async () => {
  console.log('Searching for ALL Douglas streets in NZ (first 50 results):\n');
  
  // Search for any road with "Douglas" - no suburb filter
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-123113&srsName=EPSG:4326&outputFormat=application/json&cql_filter=full_road_name+ILIKE+'%25douglas%25'&maxFeatures=50`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const features = data.features || [];
    
    console.log(`Found ${features.length} addresses with "Douglas" in road name\n`);
    
    // Extract unique road names
    const roadNames = new Set();
    features.forEach(f => {
      const road = f.properties.full_road_name || f.properties.road_name;
      if (road) roadNames.add(road);
    });
    
    console.log('Unique "Douglas" road names in LINZ:');
    Array.from(roadNames).sort().forEach(road => {
      console.log(`  - ${road}`);
    });
    
  } catch (e) {
    console.log('ERROR:', e.message);
    console.log('Response may be HTML error page');
  }
})();
