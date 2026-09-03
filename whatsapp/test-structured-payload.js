// Simulate the Apps Script payload with structured address data
// Based on row 8 from the Google Sheet

const payload = {
  requestId: 'form_' + Date.now(),
  source: 'google-form',
  customer: {
    name: 'Gerhard Stimie',
    email: 'gstimie@gmail.com',
    phone: '0824445825'
  },
  // Full address for display
  address: '31 Douglas McLean Avenue, Marewa, Napier, 4110',
  // Structured fields for LINZ matching
  addressStructured: {
    houseNumber: '31',
    streetName: 'Douglas McLean',
    streetType: 'Avenue',
    suburb: 'Marewa',
    city: 'Napier',
    postcode: '4110'
  },
  package: 'basic',
  addons: {
    ratesInfo: false,
    councilFees: false
  },
  requiresManualProcessing: false,
  notes: 'Structured address fields - improved LINZ matching'
};

console.log('📤 Test Payload to Worker:');
console.log(JSON.stringify(payload, null, 2));

// Simulate what the Worker will do
console.log('\n=== Worker Processing ===');

const { address, addressStructured } = payload;

let linzAddress = address;
if (addressStructured && addressStructured.houseNumber && addressStructured.streetName) {
  const streetFull = [addressStructured.houseNumber, addressStructured.streetName, addressStructured.streetType].filter(p => p).join(' ');
  const parts = [streetFull, addressStructured.suburb, addressStructured.city, addressStructured.postcode].filter(p => p);
  linzAddress = parts.join(', ');
  console.log('🏗️  Built LINZ address from structured:', linzAddress);
}

console.log('\n✅ Final address sent to LINZ API:', linzAddress);

// Now test if LINZ can find it
console.log('\n=== Testing LINZ Lookup ===');

const {getLINZData} = require('./linz-api.js');

getLINZData(linzAddress).then(r => {
  if (r.requiresManual) {
    console.log('❌ MANUAL:', r.reason);
  } else {
    console.log('✅ AUTO:', r.address);
    console.log('   Coords:', r.latitude.toFixed(6), r.longitude.toFixed(6));
  }
}).catch(e => console.log('ERROR:', e.message));
