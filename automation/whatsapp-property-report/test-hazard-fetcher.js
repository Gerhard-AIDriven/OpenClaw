#!/usr/bin/env node

/**
 * Test script for Hazard Fetcher
 * Tests Cyclone Gabrielle layer (working) + HBRC layers (pending)
 */

const { fetchHazardData } = require('./hazard-fetcher');

async function runTests() {
  console.log('🧪 Testing Hazard Fetcher\n');
  console.log('=' .repeat(60));
  
  // Test coordinates (Napier urban area)
  const testLocations = [
    { name: 'Napier Center', lat: -39.4928, lon: 176.9120 },
    { name: 'Napier South', lat: -39.5100, lon: 176.9000 },
    { name: 'Marewa', lat: -39.4800, lon: 176.8900 }
  ];
  
  for (const location of testLocations) {
    console.log(`\n📍 Testing: ${location.name} (${location.lat}, ${location.lon})\n`);
    
    try {
      const result = await fetchHazardData(location, { timeout: 20000 });
      
      console.log('\n✅ Hazard Assessment:');
      console.log('  Overall Risk:', result.overallAssessment.riskRating);
      console.log('  Summary:', result.overallAssessment.summary);
      
      console.log('\n  Hazards:');
      
      if (result.hazards.cycloneGabrielle) {
        console.log('    • Cyclone Gabrielle:', 
          result.hazards.cycloneGabrielle.affected ? '⚠️ AFFECTED' : '✓ Not affected');
        console.log('      ', result.hazards.cycloneGabrielle.description);
      }
      
      if (result.hazards.liquefaction?.status) {
        console.log('    • Liquefaction:', result.hazards.liquefaction.status);
      }
      
      if (result.hazards.flood?.status) {
        console.log('    • Flood Hazard:', result.hazards.flood.status);
      }
      
      if (result.hazards.coastal?.status) {
        console.log('    • Coastal Hazard:', result.hazards.coastal.status);
      }
      
      console.log('\n  Data Sources:');
      console.log('    - LINZ Layer 112668:', result.dataSources.linzDataService);
      console.log('    - HBRC ArcGIS:', result.dataSources.hbrArcGisPortal);
      
      console.log('\n' + '-'.repeat(60));
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('\n' + '-'.repeat(60));
    }
  }
  
  console.log('\n🎉 Tests complete!\n');
  console.log('📝 Note: HBRC layers show "pending" until Gerhard provides layer IDs.');
  console.log('   See HBRC-RESEARCH-GUIDE.md for discovery instructions.\n');
}

// Run tests
runTests().catch(console.error);
