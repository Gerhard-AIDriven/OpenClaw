/**
 * Test Worker Email Sending
 * Simulates a form submission to verify confirmation emails are sent
 */

const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';
const TEST_REQUEST = {
  requestId: `test_${Date.now()}`,
  customer: 'gstimie@gmail.com',
  address: '70 Marine Parade, Napier South, Napier, 4110',
  package: 'basic',
  addons: {},
  requiresManualProcessing: false,
  notes: 'Test submission - checking if confirmation email is sent'
};

async function testWorkerEmail() {
  console.log('🧪 Testing Worker email sending...\n');
  console.log(`Worker URL: ${WORKER_URL}`);
  console.log(`Test Request ID: ${TEST_REQUEST.requestId}`);
  console.log(`Customer Email: ${TEST_REQUEST.customer}\n`);
  
  try {
    const response = await fetch(`${WORKER_URL}/queue-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_REQUEST)
    });
    
    const result = await response.json();
    
    console.log('📊 Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Request ID: ${result.requestId}`);
    console.log(`Message: ${result.message || 'N/A'}\n`);
    
    if (result.success) {
      console.log('✅ Worker accepted the request!');
      console.log('💡 Check gstimie@gmail.com for confirmation email within 1-2 minutes.');
      console.log('\nIf no email arrives:');
      console.log('1. Check spam/junk folder');
      console.log('2. Verify Mailgun credentials in Cloudflare Worker settings');
      console.log('3. Check Cloudflare Worker logs for email sending errors');
    } else {
      console.log('❌ Worker rejected the request:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWorkerEmail();
