/**
 * Fetch Napier City Council WMS GetCapabilities
 * 
 * This returns XML describing ALL available layers
 * We'll parse it to find hazards-related layers
 */

async function fetchWMSCapabilities() {
  console.log('🔍 Fetching Napier WMS Capabilities\n');
  
  const url = 'https://data.napier.govt.nz/geo/wms?service=WMS&request=GetCapabilities';
  
  console.log('URL:', url);
  console.log('\n' + '='.repeat(80) + '\n');
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('❌ Failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error:', errorText.substring(0, 500));
      return;
    }
    
    const xml = await response.text();
    
    console.log('✅ Successfully fetched WMS Capabilities');
    console.log(`Response size: ${xml.length} characters\n`);
    
    // Parse layer names from XML
    // Look for <Layer> elements with <Name> children
    const layerRegex = /<Layer[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Title>([^<]+)<\/Title>/g;
    
    const layers = [];
    let match;
    
    while ((match = layerRegex.exec(xml)) !== null) {
      const name = match[1];
      const title = match[2];
      
      // Filter for hazards-related layers
      const hazardsKeywords = [
        'hazard', 'flood', 'liquefaction', 'erosion', 
        'fault', 'tsunami', 'landslide', 'risk',
        'LINZ', 'Easement', 'Rates', 'Property'
      ];
      
      const isRelevant = hazardsKeywords.some(keyword => 
        name.toLowerCase().includes(keyword) || 
        title.toLowerCase().includes(keyword)
      );
      
      if (isRelevant) {
        layers.push({ name, title });
        console.log(`📊 ${name}`);
        console.log(`   ${title}\n`);
      }
    }
    
    console.log('='.repeat(80));
    console.log(`\n📋 Found ${layers.length} relevant layer(s)`);
    
    if (layers.length > 0) {
      console.log('\n💡 These layers can be queried via:');
      console.log('   - WMS: GetMap requests (for images)');
      console.log('   - WFS: GetFeature requests (for vector data)');
      console.log('\n🔗 WFS endpoint likely at:');
      console.log('   https://data.napier.govt.nz/geo/wfs');
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
    console.error(error.stack);
  }
}

fetchWMSCapabilities();
