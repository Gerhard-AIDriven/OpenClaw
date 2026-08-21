/**
 * AI Driven - Google Form to Cloudflare Worker Integration
 * FINAL FIXED VERSION - Correct column mapping based on actual form structure
 * 
 * Copy this entire function and replace your existing onFormSubmit() in:
 * Google Sheet → Extensions → Apps Script
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  // Get form data from Google Sheet row
  const row = e.values;
  
  // === CORRECT COLUMN MAPPING (verified 2026-08-21) ===
  console.log('📊 Total columns in row:', row.length);
  
  const timestamp = row[0];           // Column A - Timestamp
  const email = row[1];               // Column B - Email Address
  const streetAddress = row[2];       // Column C - Street Address
  const suburb = row[3];              // Column D - Suburb
  const city = row[4];                // Column E - City/District
  const postcode = row[5];            // Column F - Post code
  const propertyType = row[6];        // Column G - Property Type
  const customerIntent = row[7];      // Column H - "I am..."
  // Columns I-J (row[8]-row[9]) appear to be empty/separator columns
  const packageSelection = row[10];   // Column K - Select Report Package
  const addons = row[11];             // Column L - Add-ons (checkboxes)
  const name = row[12];               // Column M - Full Name
  const applicantEmail = row[13];     // Column N - Applicant Email (duplicate, ignore)
  const phone = row[14];              // Column O - Phone Number
  const disclaimer = row[15];         // Column P - Important Disclaimer
  const stayInformed = row[16];       // Column Q - Stay informed (Optional)
  
  // Manual Processing could be in Column R (row[17]) OR might not exist yet
  const manualProcessingFlag = row.length > 17 ? row[17] : 'NO';
  
  console.log('🔍 Checking for Manual Processing flag...');
  console.log('   row.length:', row.length);
  console.log('   row[17]:', row[17]);
  console.log('   Using flag:', manualProcessingFlag);

  // Construct full address from all available parts
  const addressParts = [streetAddress, suburb, city, postcode].filter(part => part && part.trim());
  const address = addressParts.join(', ');
  
  console.log('📍 Constructed address:', address);
  console.log('   Parts:', { streetAddress, suburb, city, postcode });

  // Use the sheet's calculated YES/NO value from Column R
  // If column doesn't exist or is empty, default to NO (no manual processing)
  let requiresManual = false;
  if (manualProcessingFlag) {
    requiresManual = manualProcessingFlag.toString().toUpperCase().trim() === 'YES';
  }
  
  console.log('🔧 Manual processing result:', requiresManual);
  
  console.log('🔧 Manual processing flag (Column R):', manualProcessingFlag, '→ requiresManual:', requiresManual);

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
    package: packageSelection || 'basic',
    addons: {
      ratesInfo: addons && addons.toString().toLowerCase().includes('rates'),
      councilFees: addons && addons.toString().toLowerCase().includes('council')
    },
    requiresManualProcessing: requiresManual === true, // Ensure boolean, not undefined
    notes: 'Google Form submission - Manual flag read from Column R (row[17])'
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
    
    // Send alert email to Gerhard
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
