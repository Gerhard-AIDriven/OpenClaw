const fetch = require('node-fetch');

const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

(async () => {
  console.log('🔍 Checking Queue Status...\n');
  
  // Poll the queue to see what's in there
  const pollResponse = await fetch(`${WORKER_URL}/poll?token=aidriven_poll_secret_2026_xK9mP`);
  const pollResult = await pollResponse.json();
  
  console.log('Poll Response:', JSON.stringify(pollResult, null, 2));
  console.log();
  
  if (pollResult.success && pollResult.requests.length > 0) {
    console.log(`📋 Found ${pollResult.requests.length} automated request(s) in queue:\n`);
    
    pollResult.requests.forEach((req, i) => {
      console.log(`${i + 1}. ID: ${req.id}`);
      console.log(`   Address: ${req.address}`);
      console.log(`   Customer: ${req.customer.name} (${req.customer.email})`);
      console.log(`   Package: ${req.package}`);
      console.log(`   Manual: ${req.requiresManualProcessing}`);
      console.log(`   Submitted: ${req.submittedAt}`);
      console.log();
    });
    
    console.log('✅ Queue has items ready for processing!');
    console.log('\nNext step: Trigger OpenClaw cron job or call /generate-report for each item');
  } else {
    console.log('❌ Queue is empty or poll failed');
  }
})();
