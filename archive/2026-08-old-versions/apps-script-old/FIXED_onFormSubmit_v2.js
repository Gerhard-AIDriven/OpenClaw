/**
 * AI Driven - FIXED VERSION v2
 * Tries to find the correct columns by looking for expected values
 */

function onFormSubmit(e) {
  const WORKER_URL = 'https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev';

  const row = e.values;
  
  console.log('=== DEBUG: All Columns ===');
  for (let i = 0; i < row.length; i++) {
    console.log(`Column ${String.fromCharCode(65 + i)} [${i}]: "${row[i]}"`);
  }
  console.log('========================');

  // Fixed columns (these are definitely correct based on logs)
  const email = row[1];               // Column B - Email
  const streetAddress = row[2];       // Column C - Street Address
  const suburb = row[3];              // Column D - Suburb
  const city = row[4];                // Column E - City
  const postcode = row[5];            // Column F - Postcode
  
  // Find the Manual Processing column by looking for "YES" or "NO"
  let manualProcessingFlag = null;
  let manualColIndex = -1;
  
  // Search columns O through S (14-18) for YES/NO
  for (let i = 14; i <= 18 && i < row.length; i++) {
    const val = row[i] ? row[i].toString().trim().toUpperCase() : '';
    if (val === 'YES' || val === 'NO') {
      manualProcessingFlag = row[i];
      manualColIndex = i;
      console.log(`✅ Found Manual Processing in Column ${String.fromCharCode(65 + i)} [${i}]: "${manualProcessingFlag}"`);
      break;
    }
  }
  
  if (!manualProcessingFlag) {
    console.log('⚠️ Manual Processing flag not found! Defaulting to false');
    manualProcessingFlag = 'NO';
  }
  
  // Find the Full Name by looking for a name-like value (not an email, not a package description)
  let name = null;
  for (let i = 10; i <= 14 && i < row.length; i++) {
    const val = row[i] ? row[i].toString().trim() : '';
    // Skip if it looks like a phone number, email, package, or YES/NO
    if (val && 
        !val.includes('@') && 
        !val.startsWith('+') && 
        !val.includes('$') && 
        !val.includes('Report') &&
        val.toUpperCase() !== 'YES' && 
        val.toUpperCase() !== 'NO') {
      name = val;
      console.log(`✅ Found Name in Column ${String.fromCharCode(65 + i)} [${i}]: "${name}"`);
      break;
    }
  }
  
  // Find Phone by looking for + format
  let phone = null;
  for (let i = 10; i <= 16 && i < row.length; i++) {
    const val = row[i] ? row[i].toString().trim() : '';
    if (val && val.startsWith('+')) {
      phone = val;
      console.log(`✅ Found Phone in Column ${String.fromCharCode(65 + i)} [${i}]: "${phone}"`);
      break;
    }
  }
  
  // Find Package by looking for "$" or "Report"
  let packageSelection = null;
  for (let i = 6; i <= 12 && i < row.length; i++) {
    const val = row[i] ? row[i].toString().trim() : '';
    if (val && (val.includes('$') || val.includes('Report'))) {
      packageSelection = val;
      console.log(`✅ Found Package in Column ${String.fromCharCode(65 + i)} [${i}]: "${packageSelection}"`);
      break;
    }
  }
  
  // Find Add-ons by looking for "rates" or "council" or empty string when nothing selected
  let addons = '';
  for (let i = 8; i <= 14 && i < row.length; i++) {
    const val = row[i] || '';
    // Check if this could be the addons column (might be empty or contain checkbox values)
    if (i > 7 && i < 15) {
      // If we haven't found addons yet and this isn't another known field
      if (!addons && val && (val.toLowerCase().includes('rates') || val.toLowerCase().includes('council'))) {
        addons = val;
        console.log(`✅ Found Add-ons in Column ${String.fromCharCode(65 + i)} [${i}]: "${addons}"`);
      }
    }
  }

  const requiresManual = manualProcessingFlag.toString().toUpperCase().trim() === 'YES';
  const address = [streetAddress, suburb, city, postcode].filter(part => part && part.trim()).join(', ');

  console.log('📋 Final mapped values:');
  console.log('  Name:', name || 'N/A');
  console.log('  Email:', email || 'N/A');
  console.log('  Phone:', phone || 'N/A');
  console.log('  Package:', packageSelection || 'basic');
  console.log('  Addons:', addons || '(none)');
  console.log('  Manual Flag:', manualProcessingFlag, '→ Requires Manual:', requiresManual);
  console.log('  Address:', address);

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
    notes: `Auto-detected column mapping - Manual flag from Column ${String.fromCharCode(65 + manualColIndex)}`
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
