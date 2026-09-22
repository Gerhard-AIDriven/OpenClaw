/**
 * LINZ Data Service API Integration - VERSION 2
 * 
 * IMPROVEMENTS:
 * - Better address matching with confidence scoring
 * - Fails gracefully when confidence is too low
 * - Flags for manual processing instead of using wrong coordinates
 * - Logs detailed matching info for debugging
 * 
 * API Key: b2e35aafd4e848e9b0265f1caf575255 (Gerhard's key)
 * Layer: 123113 (NZ Addresses)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_VECTOR_URL = 'https://data.linz.govt.nz/services/query/v1/vector.json';
const ADDRESSES_LAYER = '123113'; // NZ Addresses layer

// Confidence thresholds
const CONFIDENCE_EXACT = 1.0;      // Perfect match
const CONFIDENCE_HIGH = 0.9;       // Very confident (street number + name match)
const CONFIDENCE_MEDIUM = 0.7;     // Good match (street name only)
const CONFIDENCE_MINIMUM = 0.5;    // Below this = reject and flag for manual

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple token-based matching
 */
function stringSimilarity(str1, str2) {
  const tokens1 = str1.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  const tokens2 = str2.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const matches = tokens1.filter(t1 => tokens2.some(t2 => t1 === t2)).length;
  const total = Math.max(tokens1.length, tokens2.length);
  
  return matches / total;
}

/**
 * Normalize address for comparison
 */
function normalizeAddress(address) {
  return address
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|crescent|cres)/gi, ' $1')
    .trim();
}

/**
 * Extract street number from address
 */
function extractStreetNumber(address) {
  const match = address.match(/^(\d+[a-z]?(-\d+[a-z]?)?)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Extract street name from address (everything after number)
 */
function extractStreetName(address) {
  const withoutNumber = address.replace(/^\d+[a-z]?(-\d+[a-z]?)?\s*/i, '').toLowerCase();
  return withoutNumber.split(',')[0].trim();
}

/**
 * Geocode address to get coordinates with confidence scoring
 */
async function geocodeAddress(address) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    const normalizedTarget = normalizeAddress(address);
    const targetNumber = extractStreetNumber(address);
    const targetStreetName = extractStreetName(address);
    
    console.log(`   Normalized: ${normalizedTarget}`);
    console.log(`   Street Number: ${targetNumber || '(none)'}`);
    console.log(`   Street Name: ${targetStreetName}`);
    
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
      return {
        success: false,
        requiresManual: true,
        reason: 'No addresses found in LINZ database for this area',
        address: address
      };
    }
    
    // Score all features by match quality
    const scoredFeatures = features.map(f => {
      const fullAddress = f.properties.full_address_ascii || f.properties.full_address || '';
      const normalizedFeature = normalizeAddress(fullAddress);
      const featureNumber = extractStreetNumber(fullAddress);
      const featureStreetName = extractStreetName(fullAddress);
      
      // Calculate component scores
      const numberMatch = targetNumber && featureNumber === targetNumber ? 1.0 : 0;
      const streetNameSimilarity = stringSimilarity(targetStreetName, featureStreetName);
      const fullAddressSimilarity = stringSimilarity(normalizedTarget, normalizedFeature);
      
      // Weighted scoring:
      // - Exact full address match = highest confidence
      // - Street number + name match = high confidence
      // - Street name only = medium confidence
      // - No good match = low confidence (reject)
      
      let confidence = 0;
      let matchType = 'no_match';
      
      // Check for exact match first
      if (fullAddressSimilarity >= 0.95) {
        confidence = CONFIDENCE_EXACT;
        matchType = 'exact_full_address';
      } else if (numberMatch === 1.0 && streetNameSimilarity >= 0.9) {
        // Same number and very similar street name
        confidence = CONFIDENCE_HIGH;
        matchType = 'number_and_street';
      } else if (numberMatch === 1.0 && streetNameSimilarity >= 0.7) {
        // Same number, decent street name match
        confidence = CONFIDENCE_MEDIUM;
        matchType = 'number_with_partial_street';
      } else if (streetNameSimilarity >= 0.8 && !targetNumber) {
        // No number provided, but street name matches well
        confidence = CONFIDENCE_MEDIUM;
        matchType = 'street_name_only';
      } else {
        // Poor match
        confidence = Math.max(fullAddressSimilarity, streetNameSimilarity) * 0.5;
        matchType = 'weak_match';
      }
      
      return {
        feature: f,
        confidence,
        matchType,
        fullAddress,
        distance: f.properties.distance_from_query || 0
      };
    });
    
    // Sort by confidence (highest first)
    scoredFeatures.sort((a, b) => b.confidence - a.confidence);
    
    const bestMatch = scoredFeatures[0];
    
    console.log('\n📊 Top 3 matches:');
    scoredFeatures.slice(0, 3).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.fullAddress} (confidence: ${m.confidence.toFixed(2)}, type: ${m.matchType})`);
    });
    
    // Decision: Accept or reject based on confidence
    if (bestMatch.confidence < CONFIDENCE_MINIMUM) {
      console.log(`\n❌ REJECTED: Best match confidence (${bestMatch.confidence.toFixed(2)}) below minimum threshold (${CONFIDENCE_MINIMUM})`);
      return {
        success: false,
        requiresManual: true,
        reason: `Address matching confidence too low (${bestMatch.confidence.toFixed(2)}). Best match: "${bestMatch.fullAddress}"`,
        address: address,
        bestMatch: bestMatch.fullAddress,
        confidence: bestMatch.confidence,
        topMatches: scoredFeatures.slice(0, 3).map(m => m.fullAddress)
      };
    }
    
    console.log(`\n✅ ACCEPTED: ${bestMatch.fullAddress} (confidence: ${bestMatch.confidence.toFixed(2)}, type: ${bestMatch.matchType})`);
    
    return {
      success: true,
      requiresManual: false,
      address: bestMatch.fullAddress,
      latitude: parseFloat(bestMatch.feature.geometry.coordinates[1]),
      longitude: parseFloat(bestMatch.feature.geometry.coordinates[0]),
      confidence: bestMatch.confidence,
      matchType: bestMatch.matchType,
      raw: bestMatch.feature.properties
    };
    
  } catch (error) {
    console.error(`❌ Geocoding failed: ${error.message}`);
    return {
      success: false,
      requiresManual: true,
      reason: `Geocoding error: ${error.message}`,
      address: address
    };
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
    
    if (!geoResult.success) {
      return geoResult; // Already formatted with requiresManual flag
    }
    
    return {
      success: true,
      requiresManual: false,
      address: geoResult.address,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      confidence: geoResult.confidence,
      matchType: geoResult.matchType,
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
      requiresManual: true,
      reason: `LINZ data error: ${error.message}`,
      address: address
    };
  }
}

module.exports = { geocodeAddress, getLINZData, stringSimilarity, normalizeAddress };
