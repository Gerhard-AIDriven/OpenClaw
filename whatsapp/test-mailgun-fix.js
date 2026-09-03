const fetch = require('node-fetch');

const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

// Test submission that should trigger confirmation email
const testSub = {
  requestId: 'mailgun_test_' + Date.now(),
  source: 'google-form',
  customer: {
    name: 'Mailgun Test',
    email: 'gstimie@gmail.com',
    phone: '0824445825'
  },
  address: '73 Vigor Brown Street, Napier South, Napier, 4110',
  addressStructured: {
    houseNumber: '73',
    streetName: 'Vigor Brown',
    streetType: 'Street',
    suburb: 'Napier South',
    city: 'Napier',
    postcode: '4110'
  },
  package: 'basic',
  addons: { ratesInfo: false, councilFees: false },
  requiresManualProcessing: false,
  notes: 'MAILGUN FIX TEST - Check if confirmation email arrives'
};

(async () => {
  console.log('🧪 MAILGUN FIX TEST\n');
  console.log('Submitting to Worker...\n');
  
  const resp = await fetch(`${WORKER_URL}/queue-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testSub)
  });
  
  const result = await resp.json();
  
  console.log('Worker Response:', JSON.stringify(result, null, 2));
  console.log();
  
  if (result.customerEmailSent === true) {
    console.log('✅ Worker CLAIMS it sent the email');
    console.log('\n📧 CHECK YOUR INBOX NOW (gstimie@gmail.com):');
    console.log('   Subject: "🏠 Property Due Diligence Request Received - 73 Vigor Brown..."');
    console.log('   Check Spam folder too!');
    console.log('\nIf NO email arrived = Mailgun still broken (wrong code deployed)');
  } else {
    console.log('❌ Worker did NOT send email');
  }
  
  console.log('\nRequest ID:', result.requestId);
})();
