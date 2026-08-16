const fs = require('fs');
const path = require('path');

// Configuration from command line or defaults
const jsonPath = process.argv[2] || 'C:/Users/gstim/.openclaw/workspace/properties/P0006/lim_request_confirmation.json';
const startUrl = process.argv[3] || 'https://eservices.napier.govt.nz/online-services/new/lim/step/1';

console.log('=== Napier LIM Browser Automation ===');
console.log(`Loading data from: ${jsonPath}`);
console.log(`Target URL: ${startUrl}`);
console.log('');

// Load JSON data
let data;
try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    data = JSON.parse(rawData);
    console.log('✓ Data loaded successfully');
    console.log(`  Property: ${data.property_details.physical_address.street_number} ${data.property_details.physical_address.street_name}, ${data.property_details.physical_address.suburb}`);
    console.log(`  Applicant: ${data.applicant_details.first_name} ${data.applicant_details.last_name}`);
    console.log(`  Email: ${data.applicant_details.contact_info.email}`);
    console.log(`  Fee: ${data.application_options.fee_amount}`);
    console.log('');
} catch (err) {
    console.error('✗ Error loading JSON:', err.message);
    process.exit(1);
}

console.log('=== Automation Steps (Manual Execution Required) ===');
console.log('');
console.log('STEP 1: Property Selection');
console.log(`  1. Navigate to: ${startUrl}`);
console.log(`  2. Search for: "${data.property_details.physical_address.street_number} ${data.property_details.physical_address.street_name}"`);
console.log('  3. Select matching property from results');
console.log('  4. Click "Start My Application >>"');
console.log('');
console.log('STEP 2: Contact Details');
console.log(`  1. Select: "I am applying as an individual"`);
console.log(`  2. First Name: ${data.applicant_details.first_name}`);
console.log(`  3. Last Name: ${data.applicant_details.last_name}`);
console.log(`  4. Check: "Email" (delivery method)`);
console.log(`  5. Address: ${data.applicant_details.billing_address.street}`);
console.log(`  6. Suburb: ${data.applicant_details.billing_address.suburb}`);
console.log(`  7. City: ${data.applicant_details.billing_address.city}`);
console.log(`  8. Postcode: ${data.applicant_details.billing_address.postcode}`);
console.log(`  9. Country: ${data.applicant_details.billing_address.country}`);
console.log(`  10. Phone: ${data.applicant_details.contact_info.phone}`);
console.log(`  11. Email: ${data.applicant_details.contact_info.email}`);
console.log(`  12. Confirm Email: ${data.applicant_details.contact_info.email}`);
console.log('  13. Click "Continue >>"');
console.log('');
console.log('STEP 3: Options');
console.log(`  1. Select Fee: "${data.application_options.fee_type}"`);
console.log('  2. CHECK Terms & Conditions checkbox');
console.log('  3. Click "Continue >>"');
console.log('');
console.log('STEP 4: Summary');
console.log('  1. Verify all details are correct');
console.log('  2. Click "Continue >>"');
console.log('');
console.log('STEP 5: Payment (STOP HERE)');
console.log('  ⚠️  DO NOT AUTOMATE PAYMENT');
console.log('  - Manual payment required');
console.log('  - Total: $420.00 NZD');
console.log('');
console.log('=== Ready for execution ===');
