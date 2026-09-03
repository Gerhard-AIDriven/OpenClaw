/**
 * Test Rates Integration
 * Verifies that poll-automated-reports-v2.js can successfully call the Python scraper
 */

const { execSync } = require('child_process');
const path = require('path');

const testAddress = "31 Douglas McLean avenue";
const scriptPath = path.join(__dirname, '..', 'napier_rates_scraper.py');

console.log('🧪 Testing Rates Integration...\n');
console.log(`Address: ${testAddress}`);
console.log(`Script: ${scriptPath}\n`);

try {
  console.log('⏳ Running Python scraper...');
  const startTime = Date.now();
  
  const output = execSync(`python "${scriptPath}" "${testAddress}"`, {
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 10 * 1024 * 1024
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Scraper completed in ${duration}ms\n`);
  
  // Parse JSON
  const ratesJson = JSON.parse(output.trim());
  
  console.log('📊 Extracted Data:');
  console.log('----------------');
  console.log(`Property: ${ratesJson.property.address}`);
  console.log(`RID: ${ratesJson.rid}`);
  console.log(`Valuation Number: ${ratesJson.property.valuation_number}`);
  console.log(`Record of Title: ${ratesJson.property.record_of_title}`);
  console.log(`Area: ${ratesJson.property.area_ha} ha`);
  console.log('');
  console.log('Valuation Details:');
  console.log(`  Capital Value: $${ratesJson.council_rates.capital_value_current?.toLocaleString()}`);
  console.log(`  Land Value: $${ratesJson.council_rates.land_value_current?.toLocaleString()}`);
  console.log(`  Improvements: $${ratesJson.council_rates.improvements_current?.toLocaleString()}`);
  console.log(`  Valuation Date: ${ratesJson.council_rates.valuation_date_current}`);
  console.log('');
  console.log('Rates Summary:');
  console.log(`  Total Rates Levied: $${ratesJson.council_rates.total_rates_levied?.toLocaleString()}`);
  console.log(`  Rates Last Year: $${ratesJson.council_rates.rates_last_year?.toLocaleString()}`);
  console.log(`  Number of Charges: ${ratesJson.council_rates.charges?.length || 0}`);
  console.log('');
  
  // Transform to report engine format (as done in poll-automated-reports-v2.js)
  const ratesData = {
    capitalValue: ratesJson.council_rates.capital_value_current,
    landValue: ratesJson.council_rates.land_value_current,
    improvementsValue: ratesJson.council_rates.improvements_current,
    valuationDate: ratesJson.council_rates.valuation_date_current,
    totalRates: ratesJson.council_rates.charges 
      ? ratesJson.council_rates.charges.reduce((sum, charge) => sum + (charge.total || 0), 0)
      : null,
    myPropertyData: ratesJson
  };
  
  console.log('📋 Transformed for Report Engine:');
  console.log('----------------');
  console.log(`capitalValue: $${ratesData.capitalValue?.toLocaleString()}`);
  console.log(`landValue: $${ratesData.landValue?.toLocaleString()}`);
  console.log(`improvementsValue: $${ratesData.improvementsValue?.toLocaleString()}`);
  console.log(`valuationDate: ${ratesData.valuationDate}`);
  console.log(`totalRates: $${ratesData.totalRates?.toLocaleString()}`);
  console.log(`myPropertyData: [object with ${Object.keys(ratesData.myPropertyData).length} keys]`);
  console.log('\n✅ Integration test PASSED!\n');
  
} catch (error) {
  console.error('❌ Integration test FAILED!');
  console.error(`Error: ${error.message}`);
  if (error.stderr) {
    console.error(`Stderr: ${error.stderr}`);
  }
  process.exit(1);
}
