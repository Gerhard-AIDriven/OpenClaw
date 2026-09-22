/**
 * LINZ Data Service - WFS API Integration
 * 
 * Uses proper WFS GetFeature requests with CQL filters for exact address matching
 * Base URL: https://data.linz.govt.nz/services;key={api_key}/wfs
 * Layer: 123113 (NZ Addresses)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;
const ADDRESSES_LAYER = 'layer-123113';

/**
 * Parse address into components for structured matching
 */
function parseAddress(address) {
  const normalized = address.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
  const parts = normalized.split(' ');
  
  // Extract street number
  const streetNumber = parts[0];
  
  // Extract street name (stop at suburb indicators)
  const streetTypes = ['street', 'st', 'avenue', 'ave', 'road', 'rd', 'drive', 'dr', 'lane', 'ln', 'crescent', 'cres', 'place', 'pl', 'court', 'crt', 'parade', 'pde'];
  let streetNameEndIndex = 1;
  for (let i = 1; i < parts.length; i++) {
    streetNameEndIndex = i + 1;
    if (streetTypes.includes(parts[i])) {
      break;
    }
  }
  const streetName = parts.slice(1, streetNameEndIndex).join(' ');
  
  // Extract suburb (words after street name, before city/postcode)
  // Suburbs can be multi-word: "Napier South", "New Plymouth"
  const cityNames = ['napier', 'hastings', 'taupo', 'gisborne'];
  let suburbEndIndex = parts.length;
  
  for (let i = streetNameEndIndex; i < parts.length; i++) {
    // Stop at postcode (4 digits)
    if (/^\d{4}$/.test(parts[i])) {
      suburbEndIndex = i;
      break;
    }
    // If we hit a city name, check if next word continues the suburb
    // e.g., "napier south" -> include both
    if (cityNames.includes(parts[i]) && i + 1 < parts.length) {
      // Include this city name and any following modifier (south, north, etc.)
      const modifiers = ['south', 'north', 'east', 'west', 'central', 'beach', 'hill', 'park'];
      if (modifiers.includes(parts[i + 1])) {
        suburbEndIndex = i + 2;
      } else {
        suburbEndIndex = i + 1;
      }
      break;
    }
  }
  
  const suburb = parts.slice(streetNameEndIndex, suburbEndIndex).join(' ');
  
  return { streetNumber, streetName, suburb, full: address };
}

/**
 * Build CQL filter for WFS query
 * Format: address_number='33' AND full_road_name='Nelson Crescent' AND suburb_locality='Napier South'
 */
function buildCQLFilter(components) {
  const { streetNumber, streetName, suburb } = components;
  
  // Capitalize properly for LINZ database
  const capStreetName = streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capSuburb = suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  let filter = `address_number='${streetNumber}'`;
  filter += `+AND+full_road_name='${encodeURIComponent(capStreetName)}'`;
  if (suburb) {
    filter += `+AND+suburb_locality='${encodeURIComponent(capSuburb)}'`;
  }
  
  return filter;
}

/**
 * Query LINZ WFS API with CQL filter
 */
async function queryWFS(cqlFilter) {
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${ADDRESSES_LAYER}&srsName=EPSG:4326&outputFormat=application/json&cql_filter=${cqlFilter}`;
  
  console.log(`🏛️  WFS Query: ${url.substring(0, 200)}...`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINZ WFS API error: ${response.status} - ${errorText.substring(0, 100)}`);
  }
  
  const data = await response.json();
  return data.features || [];
}

/**
 * Geocode address using LINZ WFS API
 */
async function geocodeAddress(address) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    const components = parseAddress(address);
    console.log(`   Parsed: number="${components.streetNumber}", street="${components.streetName}", suburb="${components.suburb}"`);
    
    // Try exact match first
    let cqlFilter = buildCQLFilter(components);
    let features = await queryWFS(cqlFilter);
    
    console.log(`📊 Found ${features.length} matching addresses`);
    
    if (features.length === 0 && components.suburb) {
      // Fallback: try without suburb
      console.log(`   Trying without suburb filter...`);
      cqlFilter = `address_number='${components.streetNumber}'+AND+full_road_name='${encodeURIComponent(components.streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      features = await queryWFS(cqlFilter);
      console.log(`📊 Found ${features.length} matching addresses (no suburb)`);
    }
    
    if (features.length === 0) {
      // Final fallback: just street name
      console.log(`   Trying street name only...`);
      cqlFilter = `full_road_name='${encodeURIComponent(components.streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      if (components.suburb) {
        cqlFilter += `+AND+suburb_locality='${encodeURIComponent(components.suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      }
      const fallbackFeatures = await queryWFS(cqlFilter);
      
      if (fallbackFeatures.length > 0) {
        console.log(`   ⚠️  Found ${fallbackFeatures.length} addresses on ${components.streetName} but not number ${components.streetNumber}`);
        return {
          success: false,
          requiresManual: true,
          reason: `Exact address "${address}" not found. ${fallbackFeatures.length} similar addresses exist on ${components.streetName}.`,
          address: address,
          suggestions: fallbackFeatures.slice(0, 3).map(f => f.properties.full_address_ascii || f.properties.full_address)
        };
      }
      
      return {
        success: false,
        requiresManual: true,
        reason: `Address "${address}" not found in LINZ database.`,
        address: address
      };
    }
    
    // Best match is first result
    const match = features[0];
    const coords = match.geometry?.coordinates;
    
    if (!coords) {
      throw new Error('No geometry in response');
    }
    
    console.log(`✅ Matched: ${match.properties.full_address}`);
    
    return {
      success: true,
      requiresManual: false,
      address: match.properties.full_address,
      latitude: parseFloat(coords[1]),
      longitude: parseFloat(coords[0]),
      matchQuality: 'EXACT',
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
async function getLINZData(address) {
  try {
    console.log('🏛️  Fetching LINZ Data...');
    
    const geoResult = await geocodeAddress(address);
    
    if (geoResult.requiresManual) {
      return geoResult;
    }
    
    return {
      success: true,
      requiresManual: false,
      address: geoResult.address,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      matchQuality: geoResult.matchQuality,
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
      requiresManual: true,
      reason: `LINZ data error: ${error.message}`,
      address: address
    };
  }
}

module.exports = { geocodeAddress, getLINZData };
