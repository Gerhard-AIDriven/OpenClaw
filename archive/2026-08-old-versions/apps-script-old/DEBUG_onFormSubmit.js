/**
 * AI Driven - DEBUG VERSION
 * Logs all column values to identify the mapping issue
 * 
 * Install this temporarily to see what's in each column
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  const row = e.values;
  
  // LOG EVERYTHING for debugging
  console.log('=== COLUMN DEBUG START ===');
  console.log('Total columns:', row.length);
  
  for (let i = 0; i < row.length; i++) {
    console.log(`Column ${String.fromCharCode(65 + i)} (row[${i}]): "${row[i]}"`);
  }
  
  console.log('=== COLUMN DEBUG END ===');
  
  // Now use the correct indexes based on what we see in the logs
  const email = row[1];               // Column B
  const streetAddress = row[2];       // Column C
  const suburb = row[3];              // Column D
  const city = row[4];                // Column E
  const postcode = row[5];            // Column F
  const propertyType = row[6];        // Column G
  const customerIntent = row[7];      // Column H
  const packageSelection = row[8];    // Column I
  const addons = row[9];              // Column J
  const name = row[10];               // Column K
  const phone = row[11];              // Column L
  const disclaimer = row[12];         // Column M
  const stayInformed = row[13];       // Column N
  const manualProcessingFlag = row[14]; // Column O
  
  console.log('📍 Mapped values:');
  console.log('  Name:', name);
  console.log('  Email:', email);
  console.log('  Phone:', phone);
  console.log('  Package:', packageSelection);
  console.log('  Addons:', addons);
  console.log('  Manual Flag:', manualProcessingFlag);
  
  const address = [streetAddress, suburb, city, postcode].filter(part => part && part.trim()).join(', ');
  const requiresManual = manualProcessingFlag && manualProcessingFlag.toString().toUpperCase().trim() === 'YES';
  
  console.log('  Address:', address);
  console.log('  Requires Manual:', requiresManual);

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
    requiresManualProcessing: requiresManual,
    notes: 'DEBUG: Check logs for column mapping'
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(WORKER_URL + '/queue-manual', options);
    console.log('✅ Worker response:', response.getResponseCode(), response.getContentText());
  } catch (error) {
    console.error('❌ Error:', error.toString());
  }
}
