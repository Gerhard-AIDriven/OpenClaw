#!/usr/bin/env node

const { fetchLinZData } = require('./lib/linz-fetcher');

async function testDirect() {
  console.log('\n🧪 Testing LINZ fetch directly...\n');
  
  try {
    const result = await fetchLinZData('31 Douglas McLean Avenue, Napier', { timeout: 20000 });
    
    console.log('\n✅ Result:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testDirect();
