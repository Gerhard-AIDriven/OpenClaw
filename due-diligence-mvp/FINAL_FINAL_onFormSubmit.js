/**
 * AI Driven - Google Form to Cloudflare Worker Integration
 * UPDATED FOR STRUCTURED ADDRESS FIELDS (2026-08-22)
 * 
 * New form collects: House Number, Street Name, Street Type, Suburb, City, Postcode
 * This eliminates parsing errors and improves LINZ match rates.
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  const row = e.values;
  
  console.log('📊 Total columns:', row.length);

  // === NEW STRUCTURED FIELDS (Columns D-I) ===
  const email = row[1];               // Column B: Email Address
  const fullName = row[2];            // Column C: Full Name
  const phone = row[3];               // Column D: Phone Number
  const streetName = row[4];          // Column E: Street Name (e.g., "Douglas McLean")
  const streetType = row[5];          // Column F: Street Type (e.g., "Avenue")
  const houseNumber = row[6];         // Column G: House Number (e.g., "31")
  const suburb = row[7];              // Column H: Suburb (e.g., "Marewa")
  const city = row[8];                // Column I: City/District (e.g., "Napier")
  const postcode = row[9];            // Column J: Post code (e.g., "4110")
  
  // === LEGACY/OTHER FIELDS ===
  const propertyType = row[10];       // Column K: Property Type
  const intent = row[11];             // Column L: I am... (selling, investor, etc.)
  const packageSelection = row[13];   // Column N: Select Report Package
  const addons = row[15];             // Column P: Would you like to add any extras?
  const disclaimer = row[17];         // Column R: Important Disclaimer
  const stayInformed = row[18];       // Column S: Stay informed (Optional)
  
  const name = fullName || 'N/A';

  // === CONSTRUCT FULL ADDRESS FOR DISPLAY ===
  // Build address from structured parts
  const streetFull = [houseNumber, streetName, streetType].filter(part => part && part.trim()).join(' ');
  const address = [streetFull, suburb, city, postcode].filter(part => part && part.trim()).join(', ');

  // === CALCULATE MANUAL PROCESSING ===
  let requiresManual = false;
  
  if (addons && addons.toString().trim() !== '') {
    const addonsLower = addons.toString().toLowerCase();
    requiresManual = addonsLower.includes('rates') || addonsLower.includes('council');
  }
  
  console.log('📋 Structured Address Data:');
  console.log('  House Number:', houseNumber || '(empty)');
  console.log('  Street Name:', streetName || '(empty)');
  console.log('  Street Type:', streetType || '(empty)');
  console.log('  Suburb:', suburb || '(empty)');
  console.log('  City:', city || '(empty)');
  console.log('  Postcode:', postcode || '(empty)');
  console.log('  Full Address:', address);
  console.log('  Addons:', addons || '(empty)');
  console.log('  Requires Manual:', requiresManual);

  // Prepare payload with STRUCTURED address data
  const payload = {
    requestId: 'form_' + Date.now(),
    source: 'google-form',
    customer: {
      name: name,
      email: email || 'N/A',
      phone: phone || 'N/A'
    },
    // Send both structured and full address
    address: address || 'Address not provided',
    addressStructured: {
      houseNumber: houseNumber || '',
      streetName: streetName || '',
      streetType: streetType || '',
      suburb: suburb || '',
      city: city || '',
      postcode: postcode || ''
    },
    package: packageSelection || 'basic',
    addons: {
      ratesInfo: addons && addons.toString().toLowerCase().includes('rates'),
      councilFees: addons && addons.toString().toLowerCase().includes('council')
    },
    requiresManualProcessing: requiresManual,
    notes: 'Structured address fields - improved LINZ matching'
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
