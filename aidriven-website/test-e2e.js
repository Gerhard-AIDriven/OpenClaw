/**
 * END-TO-END TEST SCRIPT
 * Tests both WhatsApp and Web interfaces for property due diligence reports
 * 
 * Run: node test-e2e.js
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_ADDRESS = '18 Ferguson Avenue, Napier';
const TEST_COORDS = { lat: -39.4928, lon: 176.9120 };

console.log('🧪 END-TO-END TEST SUITE');
console.log('=' .repeat(60));
console.log(`Test Address: ${TEST_ADDRESS}`);
console.log(`Coordinates: ${TEST_COORDS.lat}, ${TEST_COORDS.lon}`);
console.log('=' .repeat(60));
console.log('');

// Test 1: Direct Report Generation API
async function testDirectReportGeneration() {
    console.log('📋 TEST 1: Direct Report Generation API');
    console.log('-'.repeat(60));
    
    try {
        const response = await axios.post(`${BASE_URL}/api/generate-report`, {
            address: TEST_ADDRESS,
            coordinates: TEST_COORDS,
            tier: 'basic'
        }, {
            timeout: 60000 // 60 second timeout
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Report ID:', response.data.reportId);
        console.log('✅ Generated files:', response.data.files);
        
        // Verify files exist
        for (const file of response.data.files) {
            const filePath = path.join(__dirname, 'reports', file);
            try {
                await fs.access(filePath);
                console.log(`   ✓ File exists: ${file}`);
            } catch (err) {
                console.log(`   ⚠ File missing: ${file}`);
            }
        }
        
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('');
        return false;
    }
}

// Test 2: WhatsApp Webhook Simulation
async function testWhatsAppWebhook() {
    console.log('💬 TEST 2: WhatsApp Webhook Interface');
    console.log('-'.repeat(60));
    
    // Simulate Meta WhatsApp callback
    const whatsappPayload = {
        object: 'whatsapp_business_account',
        entry: [{
            id: 'WHATSAPP_PHONE_NUMBER_ID',
            changes: [{
                value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                        display_phone_number: '+27660278366',
                        phone_number_id: '1200711009799782'
                    },
                    messages: [{
                        from: '27123456789',
                        id: 'wamid.test123',
                        timestamp: '1723806000',
                        text: {
                            body: 'Please generate a report for 18 Ferguson Avenue, Napier'
                        },
                        type: 'text'
                    }]
                },
                field: 'messages'
            }]
        }]
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/api/whatsapp-webhook`, whatsappPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Hub-Signature-256': 'sha256=testsignature' // In production, this would be verified
            },
            timeout: 60000
        });
        
        console.log('✅ Webhook received:', response.status);
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
        console.log('');
        return false;
    }
}

// Test 3: Web Form Submission
async function testWebForm() {
    console.log('🌐 TEST 3: Web Form Interface');
    console.log('-'.repeat(60));
    
    const formData = {
        address: TEST_ADDRESS,
        coordinates: TEST_COORDS,
        tier: 'basic',
        email: 'test@example.com',
        name: 'Test User'
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/api/generate-report`, formData, {
            timeout: 60000
        });
        
        console.log('✅ Form submitted:', response.status);
        console.log('✅ Report ID:', response.data.reportId);
        console.log('✅ Files generated:', response.data.files);
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
        console.log('');
        return false;
    }
}

// Test 4: Verify LINZ Integration
async function testLINZIntegration() {
    console.log('🗺️ TEST 4: LINZ Data Integration');
    console.log('-'.repeat(60));
    
    try {
        const linzFetcher = require('./lib/linz-fetcher');
        const result = await linzFetcher.fetchParcelData(TEST_COORDS.lat, TEST_COORDS.lon);
        
        if (result && result.parcel) {
            console.log('✅ LINZ API working');
            console.log('   Parcel:', result.parcel.parcelIntent || 'N/A');
            console.log('   Area:', result.parcel.area ? `${result.parcel.area} m²` : 'N/A');
            console.log('');
            return true;
        } else {
            console.log('⚠️ No parcel data returned');
            console.log('');
            return false;
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('');
        return false;
    }
}

// Test 5: Verify Hazard Detection
async function testHazardIntegration() {
    console.log('🌊 TEST 5: Hazard Detection (Gabrielle Flood)');
    console.log('-'.repeat(60));
    
    try {
        const hazardFetcher = require('./lib/hazard-fetcher');
        const result = await hazardFetcher.checkHazards(TEST_COORDS.lat, TEST_COORDS.lon);
        
        console.log('✅ Hazard check completed');
        if (result.gabrielleFlood) {
            console.log('   Gabrielle Flood Zone:', result.gabrielleFlood.inFloodZone ? 'YES ⚠️' : 'NO ✅');
        }
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('');
        return false;
    }
}

// Main test runner
async function runTests() {
    const results = {
        linz: false,
        hazards: false,
        direct: false,
        whatsapp: false,
        webform: false
    };
    
    console.log('Starting tests...\n');
    
    // Test integrations first
    results.linz = await testLINZIntegration();
    results.hazards = await testHazardIntegration();
    
    // Test APIs
    results.direct = await testDirectReportGeneration();
    results.whatsapp = await testWhatsAppWebhook();
    results.webform = await testWebForm();
    
    // Summary
    console.log('=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`LINZ Integration:      ${results.linz ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Hazard Detection:      ${results.hazards ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Direct API:            ${results.direct ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`WhatsApp Webhook:      ${results.whatsapp ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Web Form:              ${results.webform ? '✅ PASS' : '❌ FAIL'}`);
    console.log('=' .repeat(60));
    
    const allPassed = Object.values(results).every(r => r === true);
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED! Ready for deployment!');
    } else {
        console.log('⚠️ Some tests failed. Review errors above.');
    }
    
    process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
