/**
 * Extract ALL layer names from Napier WMS Capabilities
 */

async function extractAllLayers() {
  console.log('🔍 Extracting All Napier WMS Layers\n');
  
  const url = 'https://data.napier.govt.nz/geo/wms?service=WMS&request=GetCapabilities';
  
  try {
    const response = await fetch(url);
    const xml = await response.text();
    
    // Extract all Name elements that look like layer names (not "WMS")
    const nameMatches = xml.match(/<Name>(NCC:[^<]+|[^:<]+:[^<]+)<\/Name>/g) || [];
    
    const layers = new Set();
    
    nameMatches.forEach(m => {
      const name = m.replace(/<\/?Name>/g, '');
      if (name !== 'WMS' && !name.includes('default-style')) {
        layers.add(name);
      }
    });
    
    console.log(`📊 Found ${layers.size} unique layers\n`);
    
    // Convert to array and sort
    const sortedLayers = Array.from(layers).sort();
    
    // Filter for relevant keywords
    const keywords = [
      'HAZARD', 'FLOOD', 'LIQUEFACTION', 'EROSION', 
      'FAULT', 'TSUNAMI', 'LANDSLIDE', 'RISK',
      'EASEMENT', 'RATES', 'PROPERTY', 'TITLE',
      'BUILDING', 'CONSENT'
    ];
    
    console.log('🔍 Searching for hazards/relevant layers...\n');
    
    const relevantLayers = sortedLayers.filter(layer => {
      const upperLayer = layer.toUpperCase();
      return keywords.some(kw => upperLayer.includes(kw));
    });
    
    if (relevantLayers.length > 0) {
      console.log(`✅ Found ${relevantLayers.length} relevant layer(s):\n`);
      
      relevantLayers.forEach((layer, i) => {
        console.log(`${i + 1}. ${layer}`);
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('\n💡 Test these layers with WFS GetFeature requests');
      console.log('   Base URL: https://data.napier.govt.nz/geoserver/wfs');
      
    } else {
      console.log('❌ No layers matched our keywords\n');
      
      // Show first 30 layers anyway
      console.log('📋 First 30 available layers:');
      sortedLayers.slice(0, 30).forEach((layer, i) => {
        console.log(`  ${i + 1}. ${layer}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

extractAllLayers();
