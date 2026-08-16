/**
 * Check WhatsApp Business API Account Status
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const PHONE_NUMBER_ID = env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = env.WHATSAPP_ACCESS_TOKEN;

// Check phone number status
const API_URL = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}`;

async function checkStatus() {
  console.log('📞 Checking WhatsApp Business API status...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Account Status:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check specific fields
      console.log('\n📋 Key Information:');
      if (result.phone_number) {
        console.log(`   Phone Number: ${result.phone_number}`);
      }
      if (result.name_status) {
        console.log(`   Name Status: ${result.name_status}`);
      }
      if (result.code_verification_status) {
        console.log(`   Verification Status: ${result.code_verification_status}`);
      }
      if (result.messaging_limit_tier) {
        console.log(`   Messaging Limit Tier: ${result.messaging_limit_tier}`);
      }
      if (result.quality_rating) {
        console.log(`   Quality Rating: ${result.quality_rating}`);
      }
    } else {
      console.log('❌ Failed to retrieve account info.');
      console.log('\nStatus:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed with error:');
    console.error(error.message);
  }
}

checkStatus();
