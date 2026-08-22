/**
 * LINZ Data Service API Integration
 * 
 * Fetches property address geocoding from LINZ Addresses layer
 * using Vector Query API
 * 
 * API Key: b2e35aafd4e848e9b0265f1caf575255 (Gerhard's key)
 * Layer: 123113 (NZ Addresses)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_VECTOR_URL = 'https://data.linz.govt.nz/services/query/v1/vector.json';
const ADDRESSES_LAYER = '123113'; // NZ Addresses layer

/**
 * Geocode address to get coordinates
 * Uses LINZ Addresses vector query API with multi-point search
 */
async function geocodeAddress(address) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    // Normalize target address for matching
    const targetLower = address.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
    const streetPart = targetLower.split(' ')[0]; // house number
    const roadPart = targetLower.split(' ').slice(1, 4).join(' '); // road name
    
    // Search from Napier center with wide radius
    const napierCenter = { x: 176.9200, y: -39.4900 };
    const url = `${LINZ_VECTOR_URL}?key=${LINZ_API_KEY}&layer=${ADDRESSES_LAYER}&x=${napierCenter.x}&y=${napierCenter.y}&max_results=100&radius=15000&geometry=true&with_field_names=true`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'Referer': 'https://data.linz.govt.nz/',
        'Origin': 'https://data.linz.govt.nz'
      }
    });
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    const features = data.vectorQuery?.layers?.[ADDRESSES_LAYER]?.features || [];
    
    console.log(`📊 Found ${features.length} addresses in search area`);
    
    if (features.length === 0) {
      throw new Error('No addresses found in search area');
    }
    
    // Strategy 1: Exact match on full address
    let match = features.find(f => {
      const addr = (f.properties.full_address_ascii || '').toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
      return addr === targetLower;
    });
    
    // Strategy 2: Match on street number + road name
    if (!match) {
      match = features.find(f => {
        const addr = (f.properties.full_address_ascii || '').toLowerCase();
        return addr.includes(streetPart) && addr.includes(roadPart);
      });
    }
    
    // Strategy 3: Match on road name only (return closest)
    if (!match) {
      match = features.find(f => {
        const addr = (f.properties.full_address_ascii || '').toLowerCase();
        return addr.includes(roadPart);
      });
    }
    
    // Strategy 4: Return first feature as fallback
    if (!match && features.length > 0) {
      match = features[0];
      console.log(`⚠️ Using first available address: ${match.properties.full_address}`);
    }
    
    if (!match) {
      throw new Error('No matching addresses found');
    }
    
    console.log(`✅ Matched: ${match.properties.full_address}`);
    
    return {
      success: true,
      address: match.properties.full_address,
      latitude: parseFloat(match.geometry.coordinates[1]),
      longitude: parseFloat(match.geometry.coordinates[0]),
      raw: match.properties
    };
    
  } catch (error) {
    console.error(`❌ Geocoding failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get LINZ data for an address
 * Main entry point - geocodes address and returns all available data
 */
async function getLINZData(address) {
  try {
    console.log('🏛️  Fetching LINZ Data...');
    
    const geoResult = await geocodeAddress(address);
    
    return {
      success: true,
      address: geoResult.address,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      titleNumber: null, // Would need titles layer
      legalDescription: null,
      area: null,
      ownership: null,
      easements: [],
      parcels: [],
      raw: geoResult.raw
    };
    
  } catch (error) {
    console.error(`❌ LINZ data fetch failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      address: address
    };
  }
}

module.exports = { geocodeAddress, getLINZData };
