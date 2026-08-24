/**
 * Fetch and examine WMS Capabilities structure
 */

async function fetchAndExamine() {
  console.log('🔍 Fetching WMS Capabilities\n');
  
  const url = 'https://data.napier.govt.nz/geo/wms?service=WMS&request=GetCapabilities';
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('❌ Failed:', response.status);
      return;
    }
    
    const xml = await response.text();
    
    console.log('✅ Fetched successfully');
    console.log(`Size: ${xml.length} chars\n`);
    
    // Show first 2000 chars to understand structure
    console.log('📄 First 2000 characters:\n');
    console.log(xml.substring(0, 2000));
    
    console.log('\n\n...\n\n');
    
    // Search for Layer tags
    const layerCount = (xml.match(/<Layer/g) || []).length;
    console.log(`📊 Found ${layerCount} <Layer> elements in total\n`);
    
    // Extract all layer names using simpler regex
    const nameMatches = xml.match(/<Name>[^<]+<\/Name>/g) || [];
    console.log(`📋 Found ${nameMatches.length} <Name> elements\n`);
    
    if (nameMatches.length > 0 && nameMatches.length <= 50) {
      console.log('All layer names:');
      nameMatches.forEach((m, i) => {
        const name = m.replace(/<\/?Name>/g, '');
        console.log(`  ${i + 1}. ${name}`);
      });
    } else if (nameMatches.length > 50) {
      console.log('First 20 layer names:');
      nameMatches.slice(0, 20).forEach((m, i) => {
        const name = m.replace(/<\/?Name>/g, '');
        console.log(`  ${i + 1}. ${name}`);
      });
      console.log(`  ... and ${nameMatches.length - 20} more`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fetchAndExamine();
