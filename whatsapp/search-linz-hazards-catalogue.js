/**
 * Search LINZ Catalogue for ALL Hazards-Related Layers
 * 
 * Systematically find layer IDs for:
 * - Liquefaction hazard
 * - Flood hazard (all types)
 * - Coastal erosion
 * - Active faults
 * - Tsunami zones
 * - Landslide/rockfall
 */

async function searchHazardsCatalogue() {
  console.log('🔍 Searching LINZ Catalogue for Hazards Layers\n');
  console.log('='.repeat(80));
  
  const searchTerms = [
    'liquefaction',
    'flood',
    'coastal erosion',
    'active fault',
    'tsunami',
    'landslide',
    'hazard'
  ];
  
  const foundLayers = [];
  
  for (const term of searchTerms) {
    console.log(`\n📊 Searching: "${term}"`);
    
    // Try multiple search endpoints
    const searchUrls = [
      `https://data.linz.govt.nz/services/catalogue/v1/layers?q=${term}&limit=20`,
      `https://data.linz.govt.nz/services/catalogue/v1/layers/search?q=${term}&limit=20`
    ];
    
    for (const url of searchUrls) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        
        // Check different response formats
        const results = data.layers || data.results || [];
        
        if (results.length > 0) {
          console.log(`   ✅ Found ${results.length} layer(s)`);
          
          results.forEach(layer => {
            const layerInfo = {
              id: layer.id || layer.layer_id,
              title: layer.title || layer.name,
              description: layer.description?.substring(0, 100) || '',
              category: layer.category || ''
            };
            
            foundLayers.push(layerInfo);
            
            console.log(`      • ID: ${layerInfo.id}`);
            console.log(`        Title: ${layerInfo.title}`);
            console.log(`        Category: ${layerInfo.category}`);
          });
          
          break; // Found results, no need to try second URL
        }
        
      } catch (error) {
        // Continue to next URL
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📋 SUMMARY: Found ${foundLayers.length} hazards-related layer(s)\n`);
  
  // Group by category
  const grouped = {};
  foundLayers.forEach(layer => {
    const category = layer.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(layer);
  });
  
  Object.keys(grouped).forEach(category => {
    console.log(`${category}:`);
    grouped[category].forEach(layer => {
      console.log(`  • ${layer.id}: ${layer.title}`);
    });
    console.log('');
  });
  
  console.log('💡 Next Steps:');
  console.log('  1. Test each layer ID with vector query API');
  console.log('  2. Verify data quality and coverage');
  console.log('  3. Integrate working layers into hazards module');
}

searchHazardsCatalogue();
