#!/usr/bin/env node

/**
 * AI Driven - LINZ Property Title Data Fetcher
 * Updated to use LINZ Data Service API with proper error handling
 * 
 * Usage: const { fetchLinZData } = require('./linz-fetcher');
 */

const CONFIG = {
  linz: {
    baseUrl: 'https://data.linz.govt.nz/services/api/v1/'
  }
};

/**
 * Fetch LINZ title data via API
 * Note: LINZ API requires exact address matching. If property not found,
 * returns null and caller should use demo data.
 * 
 * @param {string} address - Full street address (e.g., "123 Smith Street, Marewa, Napier")
 * @param {string} apiKey - LINZ API key
 * @returns {Promise<Object|null>} LINZ data object or null if not found
 */
async function fetchLinZData(address, apiKey) {
  console.log('  [LINZ] Fetching title data...');
  
  try {
    // Parse address to get street address
    const addressParts = address.split(',');
    const streetAddress = addressParts[0].trim();
    
    // Try multiple query formats
    const queries = [
      // Format 1: Just street address
      `${CONFIG.linz.baseUrl}titles.json?key=${apiKey}&address=${encodeURIComponent(streetAddress)}&limit=5`,
      
      // Format 2: Using search endpoint
      `${CONFIG.linz.baseUrl}search/titles.json?key=${apiKey}&q=${encodeURIComponent(streetAddress)}&limit=5`,
      
      // Format 3: Direct titles query without .json extension
      `${CONFIG.linz.baseUrl}titles?key=${apiKey}&address=${encodeURIComponent(streetAddress)}&limit=5`
    ];
    
    for (const url of queries) {
      try {
        console.log(`  [LINZ] Trying: ${url.substring(0, 100)}...`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'X-LINZ-API-Key': apiKey
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.titles && data.titles.length > 0) {
            const title = data.titles[0];
            
            const linzData = {
              titleNumber: title.title_number || 'N/A',
              owners: title.owner_names || 'N/A',
              landArea: title.land_area ? `${title.land_area} m²` : 'N/A',
              legalDescription: title.legal_description || 'N/A',
              easements: title.easements || 'None identified'
            };
            
            console.log(`  [LINZ] ✅ Found via API: ${linzData.titleNumber}`);
            console.log(`  [LINZ] ✅ Owners: ${linzData.owners}`);
            console.log(`  [LINZ] ✅ Area: ${linzData.landArea}`);
            
            return linzData;
          }
        }
      } catch (queryError) {
        console.log(`  [LINZ] Query failed, trying next format...`);
        continue;
      }
    }
    
    // All queries failed
    console.log('  [LINZ] ⚠️ No title found via any API endpoint.');
    console.log('  [LINZ] → Will use high-quality demo data');
    return null;
    
  } catch (error) {
    console.error(`  [LINZ] ❌ Error: ${error.message}`);
    console.log('  [LINZ] → Will use demo data');
    return null;
  }
}

/**
 * Parse address into components
 * @param {string} fullAddress - Full address string
 * @returns {Object} Parsed address components
 */
function parseAddress(fullAddress) {
  const parts = fullAddress.split(',').map(p => p.trim());
  
  return {
    street: parts[0] || '',
    suburb: parts[1] || '',
    city: parts[2] || 'Napier', // Default to Napier
    postcode: parts[3] || '',
    full: fullAddress
  };
}

module.exports = { fetchLinZData, parseAddress, CONFIG };
