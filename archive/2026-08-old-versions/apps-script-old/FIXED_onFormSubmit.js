/**
 * AI Driven - Google Form to Cloudflare Worker Integration
 * FIXED VERSION - Read manual processing flag from sheet formula
 * 
 * Copy this entire function and replace your existing onFormSubmit() in:
 * Google Sheet → Extensions → Apps Script
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  // Get form data from Google Sheet row
  const row = e.values;
  
  // Column mapping (0-indexed):
  const timestamp = row[0];           // Column A - Timestamp
  const email = row[1];               // Column B - Applicant Email address
  const streetAddress = row[2];       // Column C - Street Address
  const suburb = row[3];              // Column D - Suburb
  const city = row[4];                // Column E - City/District
  const postcode = row[5];            // Column F - Postcode
  const propertyType = row[6];        // Column G - Property type
  const customerIntent = row[7];      // Column H - "I am..."
  // Columns I-J may exist depending on form structure
  const package = row[8];             // Column I - Report package selection
  const addons = row[9];              // Column J - Add-ons (checkboxes)
  const name = row[10];               // Column K - Full Name
  const phone = row[11];              // Column L - Phone Number
  const disclaimer = row[12];         // Column M - Important Disclaimer
  const stayInformed = row[13];       // Column N - Stay informed
  const manualProcessingFlag = row[14]; // Column O - Manual Processing (YES/NO from formula)

  // ✅ FIX #1: Construct full address from all available parts
  const addressParts = [streetAddress, suburb, city, postcode].filter(part => part && part.trim());
  const address = addressParts.join(', ');
  
  console.log('📍 Constructed address:', address);
  console.log('   Parts:', { streetAddress, suburb, city, postcode });

  // ✅ FIX #2: Use the sheet's calculated YES/NO value instead of parsing addons
  // The Google Sheet formula already correctly determines if manual processing is needed
  const requiresManual = manualProcessingFlag && manualProcessingFlag.toUpperCase() === 'YES';
  
  console.log('🔧 Manual processing flag:', manualProcessingFlag, '→ requiresManual:', requiresManual);

  // Prepare payload for Cloudflare Worker
  const payload = {
    requestId: 'form_' + Date.now(),
    source: 'google-form',
    customer: {
      name: name || 'N/A',
      email: email || 'N/A',
      phone: phone || 'N/A'
    },
    address: address || 'Address not provided',
    package: package || 'basic',
    addons: {
      ratesInfo: addons && addons.toLowerCase().includes('rates'),
      councilFees: addons && addons.toLowerCase().includes('council')
    },
    requiresManualProcessing: requiresManual,
    notes: 'Google Form submission - Manual flag read from sheet formula'
  };

  console.log('📤 Sending to Worker:', JSON.stringify(payload, null, 2));

  // POST to Worker /queue-manual endpoint
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
    console.error('❌ Error sending to Worker:', error.toString());
    
    // Optional: Send alert email to Gerhard
    try {
      MailApp.sendEmail({
        to: 'gerhard@aidriven.biz',
        subject: '🚨 Google Form Integration Error',
        body: `Error sending form submission to Worker:\n\n${error.toString()}\n\nCheck Apps Script logs for details.`
      });
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
  }
}
