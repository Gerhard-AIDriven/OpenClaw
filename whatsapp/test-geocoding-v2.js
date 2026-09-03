/**
 * Test Geocoding V2 - Validates improved address matching
 */

const { getLINZData } = require('./linz-api-v2.js');

async function runTests() {
  console.log('🧪 Testing Improved Geocoding Logic\n');
  console.log('=' .repeat(60));
  
  const testAddresses = [
    {
      address: '33 Nelson Crescent, Napier South, Napier, 4110',
      description: 'Your actual submission (should match with high confidence)'
    },
    {
      address: '70 Marine Parade, Napier South, Napier, 4110',
      description: 'Known good address (exact match expected)'
    },
    {
      address: '31 Douglas Mclean Avenue, Marewa, Napier, 4110',
      description: 'Problem address from last night (likely low confidence)'
    },
    {
      address: '999 Fake Street, Nowhere, Napier',
      description: 'Fake address (should be rejected for manual processing)'
    }
  ];
  
  for (const test of testAddresses) {
    console.log(`\n📍 TEST: ${test.description}`);
    console.log(`   Address: ${test.address}\n`);
    
    try {
      const result = await getLINZData(test.address);
      
      if (result.requiresManual) {
        console.log('❌ FLAGGED FOR MANUAL PROCESSING');
        console.log(`   Reason: ${result.reason}`);
        if (result.bestMatch) {
          console.log(`   Best match attempted: "${result.bestMatch}"`);
          console.log(`   Confidence: ${result.confidence?.toFixed(2) || 'N/A'}`);
        }
      } else if (result.success) {
        console.log('✅ GEOCODING SUCCESSFUL');
        console.log(`   Matched Address: ${result.address}`);
        console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
        console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
        console.log(`   Match Type: ${result.matchType}`);
        
        // Warn if confidence is medium or lower
        if (result.confidence < 0.9) {
          console.log('⚠️  WARNING: Moderate confidence - verify coordinates manually');
        }
      } else {
        console.log('❌ GEOCODING FAILED');
        console.log(`   Error: ${result.error || result.reason}`);
      }
      
    } catch (error) {
      console.log('💥 EXCEPTION THROWN');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('-'.repeat(60));
  }
  
  console.log('\n📊 Test Summary:');
  console.log('   - Addresses with confidence ≥ 0.9: ✅ Safe to use');
  console.log('   - Addresses with confidence 0.7-0.9: ⚠️  Review recommended');
  console.log('   - Addresses with confidence < 0.7: ❌ Flag for manual processing');
  console.log('\n💡 Next step: If tests look good, replace linz-api.js with linz-api-v2.js');
}

runTests().catch(console.error);
