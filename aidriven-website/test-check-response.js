#!/usr/bin/env node

const axios = require('axios');

async function checkResponse() {
  try {
    const response = await axios.post('http://localhost:3000/api/generate-report', {
      address: '31 Douglas McLean Avenue, Napier',
      lat: -39.50066347,
      lon: 176.9039345
    }, { timeout: 60000 });
    
    console.log('\n📊 FULL RESPONSE STRUCTURE:\n');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkResponse();
