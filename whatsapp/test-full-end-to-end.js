/**
 * FULL END-TO-END TEST - New Structured Form
 * 
 * Simulates a complete submission from Google Form → Worker → LINZ → Report → Email
 */

const fetch = require('node-fetch');

const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

// Test data based on row 8 from your sheet
const testSubmission = {
  requestId: 'test_' + Date.now(),
  source: 'google-form',
  customer: {
    name: 'Gerhard Stimie (Test)',
    email: 'gstimie@gmail.com',
    phone: '0824445825'
  },
  // Full address for display
  address: '31 Douglas McLean Avenue, Marewa, Napier, 4110',
  // NEW: Structured fields for exact LINZ matching
  addressStructured: {
    houseNumber: '31',
    streetName: 'Douglas McLean',
    streetType: 'Avenue',
    suburb: 'Marewa',
    city: 'Napier',
    postcode: '4110'
  },
  package: 'basic',
  addons: {
    ratesInfo: false,
    councilFees: false
  },
  requiresManualProcessing: false,
  notes: 'FULL END-TO-END TEST - New structured form fields'
};

console.log('🧪 FULL END-TO-END TEST');
console.log('======================\n');
console.log('📤 Step 1: Submitting to Worker /queue-manual endpoint...\n');
console.log('Payload:', JSON.stringify(testSubmission, null, 2));
console.log();

(async () => {
  try {
    // Step 1: Submit to Worker
    const queueResponse = await fetch(`${WORKER_URL}/queue-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSubmission)
    });
    
    console.log(`📥 Step 1 Response: ${queueResponse.status} ${queueResponse.statusText}`);
    const queueResult = await queueResponse.json();
    console.log('Worker stored in KV:', queueResult.success ? '✅ YES' : '❌ NO');
    console.log();
    
    if (!queueResult.success) {
      throw new Error('Failed to queue: ' + JSON.stringify(queueResult));
    }
    
    // Step 2: Trigger poll to process the queued item
    console.log('⏳ Step 2: Waiting 5 seconds before triggering poll...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🔄 Step 3: Triggering /poll endpoint...\n');
    const pollResponse = await fetch(`${WORKER_URL}/poll?token=aidriven_poll_secret_2026_xK9mP`, {
      method: 'GET'
    });
    
    console.log(`📥 Poll Response: ${pollResponse.status} ${pollResponse.statusText}`);
    const pollResult = await pollResponse.json();
    console.log('Poll result:', JSON.stringify(pollResult, null, 2));
    console.log();
    
    // Step 4: Check if report was generated
    console.log('📊 Step 4: Checking if report generation was triggered...');
    console.log('(Check OpenClaw cron logs for /generate-report call)');
    console.log();
    
    console.log('✅ TEST COMPLETE!');
    console.log('\nNext steps:');
    console.log('1. Check your email (gstimie@gmail.com) for confirmation');
    console.log('2. Check OpenClaw cron job logs for report generation');
    console.log('3. Check email again for final report delivery');
    console.log('\nIf anything fails, check:');
    console.log('- Cloudflare Worker logs: https://dash.cloudflare.com/.../workers/aidriven-whatsapp-webhook/logs');
    console.log('- KV Store: Check if test_* key exists');
    console.log('- OpenClaw cron logs for /generate-report execution');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
})();
