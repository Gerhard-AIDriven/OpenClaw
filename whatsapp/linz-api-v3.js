/**
 * LINZ Data Service API Integration - FIXED VERSION
 * 
 * Fetches property address geocoding from LINZ Addresses layer using Vector Query API
 * IMPROVED: Proper house number + street matching, no dangerous fallbacks
 * 
 * API Key: b2e35aafd4e848e9b0265f1caf575255 (Gerhard's key)
 * Layer: 123113 (NZ Addresses)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_VECTOR_URL = 'https://data.linz.govt.nz/services/query/v1/vector.json';
const ADDRESSES_LAYER = '123113';

/**
 * Geocode address - FIXED version with proper house number matching
 */
async function geocodeAddress(address, addressStructured = null) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    // Parse house number and street name
    let houseNumber = null;
    let streetName = null;
    
    if (addressStructured && addressStructured.houseNumber && addressStructured.streetName) {
      houseNumber = addressStructured.houseNumber.trim();
      streetName = [addressStructured.streetName, addressStructured.streetType, addressStructured.suburb]
        .filter(p => p).join(' ').trim();
      console.log(`   Using structured: "${houseNumber} ${streetName}"`);
    } else {
      const parts = address.split(/[,\s]+/).filter(Boolean);
      houseNumber = parts[0];
      streetName = parts.slice(1).join(' ');
    }
    
    const targetLower = address.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
    
    // Search from Napier center
    const napierCenter = { x: 176.9200, y: -39.4900 };
    const url = `${LINZ_VECTOR_URL}?key=${LINZ_API_KEY}&layer=${ADDRESSES_LAYER}&x=${napierCenter.x}&y=${napierCenter.y}&max_results=200&radius=15000&geometry=true&with_field_names=true`;
    
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
    console.log(`📊 Found ${features.length} addresses`);
    
    if (features.length === 0) {
      throw new Error('No addresses found');
    }
    
    // Strategy 1: Exact match on full address
    let match = features.find(f => {
      const addr = (f.properties.full_address_ascii || '').toLowerCase()
        .replace(/,/g, '').replace(/\s+/g, ' ').trim();
      return addr === targetLower;
    });
    
    // Strategy 2: Match house number + street contains (MOST IMPORTANT)
    if (!match) {
      match = features.find(f => {
        const addr = (f.properties.full_address_ascii || '').toLowerCase();
        const num = f.properties.address_number || f.properties.house_number || '';
        return num === houseNumber && addr.includes(streetName);
      });
      if (match) console.log(`   ✅ Matched by house number + street`);
    }
    
    // Strategy 3: Street name contains (any house number)
    if (!match) {
      match = features.find(f => {
        const addr = (f.properties.full_address_ascii || '').toLowerCase();
        return addr.includes(streetName);
      });
      if (match) console.log(`   ⚠️ Matched by street only`);
    }
    
    // NO automatic fallback - throw error if no match
    if (!match) {
      console.log(`❌ No match found. First 5 results:`);
      features.slice(0, 5).forEach(f => {
        console.log(`   - ${f.properties.full_address_ascii || f.properties.full_address}`);
      });
      throw new Error(`Address not found: ${address}`);
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
 */
async function getLINZData(address, addressStructured = null) {
  try {
    console.log('🏛️  Fetching LINZ Data...');
    const geoResult = await geocodeAddress(address, addressStructured);
    
    return {
      success: true,
      address: geoResult.address,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      titleNumber: null,
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
