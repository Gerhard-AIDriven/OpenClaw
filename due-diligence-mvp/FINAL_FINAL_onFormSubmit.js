/**
 * AI Driven - Google Form to Cloudflare Worker Integration
 * FINAL BULLETPROOF VERSION - Calculates manual processing in Apps Script
 * 
 * KEY FIX: Don't read from Column R formula (it hasn't calculated yet when trigger fires).
 * Instead, calculate it ourselves using the same logic as the sheet formula.
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  const row = e.values;
  
  console.log('📊 Total columns:', row.length);

  // Fixed known columns
  const email = row[1];               // Column B
  const streetAddress = row[2];       // Column C
  const suburb = row[3];              // Column D
  const city = row[4];                // Column E
  const postcode = row[5];            // Column F
  const packageSelection = row[10];   // Column K
  const addons = row[11];             // Column L
  const name = row[12];               // Column M
  const phone = row[14];              // Column O

  // === CALCULATE MANUAL PROCESSING OURSELVES ===
  // Don't rely on Column R formula (it hasn't calculated yet when trigger fires!)
  // Use the same logic as the sheet formula: YES if addons contains "rates" or "council"
  let requiresManual = false;
  
  if (addons && addons.toString().trim() !== '') {
    const addonsLower = addons.toString().toLowerCase();
    requiresManual = addonsLower.includes('rates') || addonsLower.includes('council');
  }
  
  console.log('🔧 Addons field:', addons || '(empty)');
  console.log('   Requires Manual Processing:', requiresManual);

  // Construct full address
  const address = [streetAddress, suburb, city, postcode].filter(part => part && part.trim()).join(', ');

  console.log('📋 Summary:');
  console.log('  Name:', name || 'N/A');
  console.log('  Email:', email || 'N/A');
  console.log('  Phone:', phone || 'N/A');
  console.log('  Address:', address);
  console.log('  Package:', packageSelection || 'basic');
  console.log('  Requires Manual:', requiresManual);

  // Prepare payload - ALWAYS send boolean true/false, never undefined
  const payload = {
    requestId: 'form_' + Date.now(),
    source: 'google-form',
    customer: {
      name: name || 'N/A',
      email: email || 'N/A',
      phone: phone || 'N/A'
    },
    address: address || 'Address not provided',
    package: packageSelection || 'basic',
    addons: {
      ratesInfo: addons && addons.toString().toLowerCase().includes('rates'),
      councilFees: addons && addons.toString().toLowerCase().includes('council')
    },
    requiresManualProcessing: requiresManual, // Always boolean!
    notes: 'Manual processing calculated in Apps Script (Column R formula runs after trigger)'
  };

  console.log('📤 Payload to Worker:', JSON.stringify(payload, null, 2));

  // Send to Worker
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(WORKER_URL + '/queue-manual', options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('✅ Worker response:', responseCode, responseText);
    
    if (responseCode !== 200) {
      throw new Error(`Worker returned ${responseCode}: ${responseText}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.toString());
    
    try {
      MailApp.sendEmail({
        to: 'gerhard@aidriven.biz',
        subject: '🚨 Form Integration Error',
        body: `Error: ${error.toString()}\n\nCheck Apps Script logs.`
      });
    } catch (e) {}
  }
}
