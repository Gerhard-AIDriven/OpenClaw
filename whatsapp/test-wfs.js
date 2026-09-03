const {getLINZData} = require('./linz-api-wfs.js');

(async () => {
  const tests = [
    '33 Nelson Crescent, Napier South, Napier',
    '70 Marine Parade, Napier South, Napier', 
    '31 Douglas Mclean Avenue, Marewa, Napier'
  ];
  
  console.log('Testing WFS API:\n');
  
  for (const addr of tests) {
    try {
      const r = await getLINZData(addr);
      const status = r.requiresManual ? '❌ MANUAL' : '✅ AUTO';
      const details = r.requiresManual 
        ? r.reason.substring(0, 60) 
        : `Coords: ${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)}`;
      
      console.log(`${status} ${addr.split(',')[0]}`);
      console.log(`   ${details}\n`);
    } catch(e) {
      console.log(`❌ ERROR ${addr.split(',')[0]}: ${e.message}\n`);
    }
  }
})();
