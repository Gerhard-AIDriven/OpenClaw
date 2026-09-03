#!/usr/bin/env node

/**
 * Test HBRC + LINZ Hazard Fetcher
 * Tests all hazard layers with real Napier coordinates
 */

const { fetchHazardData } = require('./hazard-fetcher');

// Test locations
const testLocations = [
  {
    name: 'Napier Center (Flood Zone)',
    coords: { lat: -39.4928, lon: 176.9120 }
  },
  {
    name: 'Marewa (Liquefaction Risk)',
    coords: { lat: -39.5050, lon: 176.8950 }
  },
  {
    name: 'Napier South (Coastal)',
    coords: { lat: -39.5100, lon: 176.9200 }
  },
  {
    name: 'Taradale (Low Risk)',
    coords: { lat: -39.5200, lon: 176.8700 }
  }
];

async function runTests() {
  console.log('='.repeat(70));
  console.log('HBRC + LINZ Hazard Fetcher - Integration Tests');
  console.log('='.repeat(70));
  console.log();
  
  for (const location of testLocations) {
    console.log(`\n📍 Testing: ${location.name}`);
    console.log(`   Coordinates: ${location.coords.lat}, ${location.coords.lon}`);
    console.log('-'.repeat(70));
    
    try {
      const result = await fetchHazardData(location.coords);
      
      console.log('\n📊 RESULTS:');
      console.log(`   Overall Risk: ${result.overallAssessment.riskRating}`);
      
      if (result.riskFactors.length > 0) {
        console.log('   Risk Factors:');
        result.riskFactors.forEach(factor => {
          console.log(`     • ${factor}`);
        });
      } else {
        console.log('   Risk Factors: None identified');
      }
      
      console.log('\n   Hazard Details:');
      
      // Liquefaction
      const liq = result.hazards.liquefaction;
      if (liq.intersectedLayer) {
        console.log(`     ✓ Liquefaction: ${liq.susceptibilityLevel || liq.hazardClass}`);
      } else {
        console.log(`     ○ Liquefaction: Not in mapped zone`);
      }
      
      // Flood
      const flood = result.hazards.flood;
      if (flood.intersectedLayer && flood.inFloodPlain) {
        console.log(`     ✓ Flood Risk: ${flood.floodZone || 'In flood plain'}`);
      } else {
        console.log(`     ○ Flood Risk: Not in mapped zone`);
      }
      
      // Coastal
      const coastal = result.hazards.coastal;
      if (coastal.inundation?.inInundationZone) {
        console.log(`     ✓ Coastal Inundation: ${coastal.inundation.inundationDepth}`);
      }
      if (coastal.hazardZones?.inHazardZone) {
        console.log(`     ✓ Coastal Hazards: ${coastal.hazardZones.zones?.length || 1} zone(s)`);
      }
      if (!coastal.inundation?.inInundationZone && !coastal.hazardZones?.inHazardZone) {
        console.log(`     ○ Coastal: Not in mapped zones`);
      }
      
      // Gabrielle
      const gabrielle = result.hazards.cycloneGabrielle;
      if (gabrielle.affected) {
        console.log(`     ✓ Cyclone Gabrielle: AFFECTED`);
      } else {
        console.log(`     ○ Cyclone Gabrielle: Not affected`);
      }
      
      console.log('\n   Summary:');
      console.log(`   "${result.overallAssessment.summary}"`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log('='.repeat(70));
  console.log('✅ Tests complete!');
  console.log('='.repeat(70));
}

runTests().catch(console.error);
