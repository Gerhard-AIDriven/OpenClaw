#!/usr/bin/env node

/**
 * Test script for LINZ WFS fetcher
 * Tests real property addresses in Napier
 */

const { fetchLinZData } = require('./linz-fetcher');

async function runTests() {
  console.log('🧪 Testing LINZ WFS Fetcher\n');
  console.log('=' .repeat(60));
  
  // Test addresses (real Napier locations)
  const testAddresses = [
    '123 Station Street, Napier',
    '45 Tennyson Street, Napier',
    '78 Emerson Street, Napier'
  ];
  
  for (const address of testAddresses) {
    console.log(`\n📍 Testing: ${address}\n`);
    
    try {
      const result = await fetchLinZData(address, { timeout: 20000 });
      
      console.log('\n✅ Result:');
      console.log('  Legal Description:', result.legalDescription);
      console.log('  Land Area:', result.landArea);
      console.log('  Owners:', result.owners);
      console.log('  Tenure:', result.tenureType);
      console.log('  Title Number:', result.titleNumber);
      console.log('  Land District:', result.landDistrict);
      console.log('  Status:', result.status);
      console.log('  Source:', result.source);
      
      if (result.note) {
        console.log('  Note:', result.note);
      }
      
      console.log('\n' + '-'.repeat(60));
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('\n' + '-'.repeat(60));
    }
  }
  
  console.log('\n🎉 Tests complete!\n');
}

// Run tests
runTests().catch(console.error);
