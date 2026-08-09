/**
 * Test WhatsApp Business API Connection
 * Uses temporary credentials from .env
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
const MY_PHONE_NUMBER = env.MY_PHONE_NUMBER || '+27714610886';

// Meta Cloud API endpoint
const API_URL = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

async function testAPI() {
  console.log('🧪 Testing WhatsApp Business API...\n');
  console.log(`Phone Number ID: ${PHONE_NUMBER_ID}`);
  console.log(`Sending test message to: ${MY_PHONE_NUMBER}\n`);

  // Test payload - send a message to your number
  const payload = {
    messaging_product: 'whatsapp',
    to: MY_PHONE_NUMBER.replace(/\D/g, ''), // Remove all non-digits
    type: 'text',
    text: {
      body: '🤖 AIdriven.biz LIM Bot Test\n\nThis is a test message from the WhatsApp Business API. If you receive this, the integration is working!'
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! API connection working.');
      console.log('\nResponse:', JSON.stringify(result, null, 2));
      console.log('\n📱 Check your WhatsApp - you should receive a test message!');
    } else {
      console.log('❌ API request failed.');
      console.log('\nStatus:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
      
      // Helpful hints based on error
      if (result.error?.code === 131030) {
        console.log('\n💡 Hint: Add your phone number to the recipient list in Meta Developer Dashboard.');
      }
    }
  } catch (error) {
    console.log('❌ Request failed with error:');
    console.error(error.message);
  }
}

testAPI();
