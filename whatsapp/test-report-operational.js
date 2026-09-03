/**
 * Report Generation Test Script
 * 
 * Tests the end-to-end flow: 
 * LINZ Geocoding -> Report Generation -> File Save
 */

const linz = require('./whatsapp/linz-api.js');
const engine = require('./whatsapp/report-engine-v2.js');

async function runTest(address) {
  console.log(`🚀 Starting full operational test for: ${address}`);
  
  try {
    // 1. Get real LINZ data using the correct structured matching procedure
    // We simulate the structured data extraction from a form
    const structured = {
      houseNumber: address.split(' ')[0],
      streetName: address.split(' ').slice(1).join(' ').replace(' Avenue', '').replace(' Road', '').replace(' Street', ''),
      streetType: address.includes('Avenue') ? 'Avenue' : address.includes('Road') ? 'Road' : address.includes('Street') ? 'Street' : '',
      suburb: '', 
      city: 'Napier',
      postcode: ''
    };

    const linzDataResult = await linz.geocodeWithStructuredData(structured);

    if (!linzDataResult.success) {
      throw new Error(`LINZ data fetch failed: ${linzDataResult.reason}`);
    }

    console.log(`✅ LINZ Data Found: ${linzDataResult.address} (${linzDataResult.latitude}, ${linzDataResult.longitude})`);

    // 2. Construct the full data payload for the report engine
    const reportData = {
      address: linzDataResult.address,
      requestId: `TEST-${Date.now()}`,
      customer: 'Test Customer',
      packageType: 'Premium',
      linzData: {
        latitude: linzDataResult.latitude,
        longitude: linzDataResult.longitude,
        legalDescription: 'Lot 1 DP 123456',
        landArea: '600sqm',
        zoning: 'Residential',
        propertyType: 'House',
        ownerName: 'Private Owner',
        ownershipType: 'Fee Simple',
        registrationDate: '1990-01-01',
        easements: [
          { type: 'Right of Way', description: 'Access via adjacent property' },
          { type: 'Drainage', description: 'Stormwater easement on eastern boundary' }
        ]
      },
      hazardsData: [
        { icon: '⚠️', type: 'Flood', level: 'Low', description: 'Minimal risk' },
        { icon: '🛡️', type: 'Liquefaction', level: 'Low', description: 'Low susceptibility' }
      ],
      ratesData: {
        annualRates: 'NZD 2,500',
        lastPayment: '2026-05-01'
      }
    };

    // 3. Generate the HTML report
    const html = engine.generateHTMLReport(reportData);
    
    // 4. Save the report
    const filePath = engine.saveHTMLReport(html, reportData.requestId);
    
    console.log(`\n🎉 SUCCESS!`);
    console.log(`Report generated: ${filePath}`);
    console.log(`Check this file in your browser to verify the map rendering.`);

  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
const targetAddress = process.argv[2] || '28 Logan Avenue';
runTest(targetAddress);
