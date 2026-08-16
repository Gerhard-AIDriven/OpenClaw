#!/usr/bin/env node

/**
 * Test Script for Unified Report Engine
 * Run this to verify LINZ integration and report generation
 * 
 * Usage: node test-engine.js
 */

const { generatePropertyReport } = require('./report-engine');

async function test() {
  console.log('🧪 Testing Unified Report Engine\n');
  console.log('=' .repeat(60));
  
  // Test with a real Napier address (simpler format)
  const testAddress = '42 Marewa Road, Napier';
  
  console.log(`\nTest Address: ${testAddress}`);
  console.log('Package: basic\n');
  
  try {
    const result = await generatePropertyReport({
      address: testAddress,
      package: 'basic',
      customerName: 'Test Customer',
      requestId: 'test-' + Date.now()
    });
    
    if (result.success) {
      console.log('\n✅ TEST PASSED!\n');
      console.log('Report Details:');
      console.log(`  Order ID: ${result.orderId}`);
      console.log(`  Filename: ${result.filename}`);
      console.log(`  URL: ${result.reportUrl}`);
      console.log(`\n🌐 Open in browser: ${result.reportUrl}\n`);
      
      process.exit(0);
    } else {
      console.error('\n❌ TEST FAILED!\n');
      console.error('Error:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH EXCEPTION!\n');
    console.error(error);
    process.exit(1);
  }
}

// Run test
test();
