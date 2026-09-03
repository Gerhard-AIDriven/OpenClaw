const fetch = require('node-fetch');

const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

const testSubmission = {
  requestId: 'fresh_test_' + Date.now(),
  source: 'google-form',
  customer: {
    name: 'Gerhard Stimie (Fresh Test)',
    email: 'gstimie@gmail.com',
    phone: '0824445825'
  },
  address: '83 Vigor Brown Street, Napier South, Napier, 4110',
  addressStructured: {
    houseNumber: '83',
    streetName: 'Vigor Brown',
    streetType: 'Street',
    suburb: 'Napier South',
    city: 'Napier',
    postcode: '4110'
  },
  package: 'basic',
  addons: { ratesInfo: false, councilFees: false },
  requiresManualProcessing: false,
  notes: 'FRESH TEST - Debug email delivery'
};

(async () => {
  console.log('🧪 FRESH TEST SUBMISSION\n');
  console.log('Address:', testSubmission.address);
  console.log('Email:', testSubmission.customer.email);
  console.log();
  
  // Step 1: Submit to queue
  console.log('📤 Step 1: Queueing...');
  const queueResp = await fetch(`${WORKER_URL}/queue-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testSubmission)
  });
  
  const queueResult = await queueResp.json();
  console.log('Queue Response:', JSON.stringify(queueResult, null, 2));
  console.log();
  
  if (!queueResult.success) {
    console.log('❌ FAILED TO QUEUE');
    return;
  }
  
  console.log('✅ Queued successfully!');
  console.log('\n⏳ Waiting 3 seconds before polling...\n');
  await new Promise(r => setTimeout(r, 3000));
  
  // Step 2: Poll to get the item
  console.log('🔄 Step 2: Polling queue...');
  const pollResp = await fetch(`${WORKER_URL}/poll?token=aidriven_poll_secret_2026_xK9mP`);
  const pollResult = await pollResp.json();
  
  if (pollResult.success && pollResult.requests.length > 0) {
    console.log(`✅ Found ${pollResult.requests.length} request(s)\n`);
    
    const req = pollResult.requests[0];
    console.log('Request ID:', req.id);
    console.log('Address:', req.address);
    console.log('Customer Email:', req.customer.email);
    console.log();
    
    console.log('📧 EXPECTED EMAILS:');
    console.log('1. Confirmation email (from Worker) - SHOULD ARRIVE NOW');
    console.log('2. Final report (from OpenClaw) - Will arrive after cron processes');
    console.log();
    console.log('🔍 CHECK YOUR INBOX (gstimie@gmail.com):');
    console.log('   - Subject: "🏠 Property Due Diligence Request Received - 83 Vigor Brown..."');
    console.log('   - Also check Spam folder!');
    console.log();
    console.log('Request ID for tracking:', req.id);
    
  } else {
    console.log('❌ Poll returned no requests');
  }
})();
