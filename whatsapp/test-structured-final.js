const {getLINZData} = require('./linz-api-structured.js');

// Test with structured data from row 8
const structuredData = {
  houseNumber: '31',
  streetName: 'Douglas McLean',
  streetType: 'Avenue',
  suburb: 'Marewa',
  city: 'Napier',
  postcode: '4110'
};

console.log('Testing structured address lookup:\n');
console.log('Structured Data:');
console.log('  House:', structuredData.houseNumber);
console.log('  Street:', structuredData.streetName);
console.log('  Type:', structuredData.streetType);
console.log('  Suburb:', structuredData.suburb);
console.log('  City:', structuredData.city);
console.log('  Postcode:', structuredData.postcode);
console.log();

getLINZData('31 Douglas McLean Avenue, Marewa, Napier, 4110', structuredData)
  .then(r => {
    if (r.requiresManual) {
      console.log('\n❌ MANUAL PROCESSING REQUIRED');
      console.log('Reason:', r.reason);
    } else {
      console.log('\n✅ AUTO-PROCESSED SUCCESSFULLY!');
      console.log('Matched Address:', r.address);
      console.log('Coordinates:', r.latitude.toFixed(6), r.longitude.toFixed(6));
      console.log('Match Quality:', r.matchQuality);
    }
  })
  .catch(e => console.log('ERROR:', e.message));
