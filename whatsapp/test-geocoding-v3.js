/**
 * Test Geocoding V3 - Balanced approach (speed + accuracy)
 */

const { getLINZData } = require('./linz-api-v3.js');

async function runTests() {
  console.log('🧪 Testing Geocoding V3 - Balanced Approach\n');
  console.log('=' .repeat(70));
  
  const testAddresses = [
    {
      address: '33 Nelson Crescent, Napier South, Napier, 4110',
      description: 'Your actual submission (should match EXACT or GOOD)'
    },
    {
      address: '70 Marine Parade, Napier South, Napier, 4110',
      description: 'Known good address (should match EXACT)'
    },
    {
      address: '31 Douglas Mclean Avenue, Marewa, Napier, 4110',
      description: 'Problem address - will show if we flag appropriately'
    },
    {
      address: '18 Ferguson Avenue, Napier South, Napier, 4110',
      description: 'Another known Napier address'
    }
  ];
  
  let autoCount = 0;
  let manualCount = 0;
  
  for (const test of testAddresses) {
    console.log(`\n📍 TEST: ${test.description}`);
    console.log(`   Address: ${test.address}\n`);
    
    try {
      const result = await getLINZData(test.address);
      
      if (result.requiresManual) {
        manualCount++;
        console.log('❌ FLAGGED FOR MANUAL PROCESSING');
        console.log(`   Reason: ${result.reason}`);
        if (result.topSuggestions) {
          console.log('   Suggestions:');
          result.topSuggestions.forEach(s => console.log(`      - ${s}`));
        }
      } else if (result.success) {
        autoCount++;
        console.log('✅ AUTO-PROCESSED');
        console.log(`   Matched: ${result.address}`);
        console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
        console.log(`   Quality: ${result.matchQuality} (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
        
        if (result.warning) {
          console.log(`   ⚠️  WARNING: ${result.warning}`);
        }
      } else {
        console.log('❌ FAILED');
        console.log(`   Error: ${result.error || result.reason}`);
      }
      
    } catch (error) {
      console.log('💥 EXCEPTION');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('-'.repeat(70));
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Auto-processed: ${autoCount}/${testAddresses.length}`);
  console.log(`   Manual flagged: ${manualCount}/${testAddresses.length}`);
  console.log(`   Auto-rate: ${((autoCount / testAddresses.length) * 100).toFixed(0)}%`);
  console.log('\n💡 Target: >80% auto-processing rate for viable business model');
}

runTests().catch(console.error);
