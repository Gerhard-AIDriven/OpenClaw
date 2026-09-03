const {getLINZData} = require('./linz-api.js');

(async () => {
  console.log('Testing 31 Douglas McLean Avenue with different suburb formats:\n');
  
  const tests = [
    '31 Douglas McLean Avenue, Marewa',
    '31 Douglas McLean Avenue, Napier',
    '31 Douglas McLean Avenue',  // No suburb at all
  ];
  
  for (const addr of tests) {
    console.log(`=== ${addr} ===`);
    try {
      const r = await getLINZData(addr);
      if (r.requiresManual) {
        console.log('❌ MANUAL:', r.reason.substring(0, 80));
      } else {
        console.log('✅ AUTO:', r.address);
        console.log('   Coords:', r.latitude.toFixed(6), r.longitude.toFixed(6));
      }
    } catch (e) {
      console.log('ERROR:', e.message);
    }
    console.log();
  }
})();
