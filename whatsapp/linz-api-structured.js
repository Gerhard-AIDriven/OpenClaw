/**
 * LINZ Data Service - WFS API Integration
 * 
 * Uses proper WFS GetFeature requests with CQL filters for exact address matching
 * Supports both free-form addresses and structured data from new form fields
 * 
 * Base URL: https://data.linz.govt.nz/services;key={api_key}/wfs
 * Layer: 123113 (NZ Addresses)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_WFS_URL = `https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`;
const ADDRESSES_LAYER = 'layer-123113';

/**
 * Geocode using structured data (from new form fields)
 * This bypasses parsing and uses exact field values
 */
async function geocodeWithStructuredData(structured) {
  const { houseNumber, streetName, streetType, suburb, city, postcode } = structured;
  
  console.log(`   Using structured data: number="${houseNumber}", street="${streetName}", type="${streetType}", suburb="${suburb}"`);
  
  // Build CQL filter using structured fields
  // LINZ stores: full_road_name='Douglas McLean' (may or may not include street type)
  const capStreetName = streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capSuburb = suburb ? suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
  const capCity = city ? city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
  
  // Try matching on full_road_name (with and without street type)
  let cqlFilter = `address_number='${houseNumber}'+AND+(full_road_name='${encodeURIComponent(capStreetName)}'`;
  
  if (streetType) {
    const streetWithType = `${capStreetName} ${streetType}`;
    cqlFilter += `+OR+full_road_name='${encodeURIComponent(streetWithType)}'`;
  }
  cqlFilter += `)`;
  
  // Add suburb/city filter
  if (capSuburb || capCity) {
    cqlFilter += `+AND+(`;
    const suburbFilters = [];
    if (capSuburb) suburbFilters.push(`suburb_locality='${encodeURIComponent(capSuburb)}'`);
    if (capCity) suburbFilters.push(`town_city='${encodeURIComponent(capCity)}'`);
    cqlFilter += suburbFilters.join('+OR+');
    cqlFilter += `)`;
  }
  
  console.log(`🏛️  WFS Query: ${cqlFilter.substring(0, 150)}...`);
  
  const features = await queryWFS(cqlFilter);
  console.log(`📊 Found ${features.length} matching addresses`);
  
  if (features.length === 0) {
    return {
      success: false,
      requiresManual: true,
      reason: `Address "${houseNumber} ${capStreetName}${streetType ? ' ' + streetType : ''}" not found in LINZ database.`,
      address: [houseNumber, capStreetName, streetType, suburb, city].filter(p=>p).join(', '),
      suggestions: []
    };
  }
  
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
}

/**
 * Parse address into components for structured matching (legacy free-form addresses)
 */
function parseAddress(address) {
  const normalized = address.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
  const parts = normalized.split(' ');
  
  const streetNumber = parts[0];
  
  const streetTypes = ['street', 'st', 'avenue', 'ave', 'road', 'rd', 'drive', 'dr', 'lane', 'ln', 'crescent', 'cres', 'place', 'pl', 'court', 'crt', 'parade', 'pde'];
  let streetNameEndIndex = parts.length;
  let streetTypeIndex = -1;
  for (let i = 1; i < parts.length; i++) {
    if (streetTypes.includes(parts[i])) {
      streetNameEndIndex = i;
      streetTypeIndex = i;
      break;
    }
  }
  const streetName = parts.slice(1, streetNameEndIndex).join(' ');
  
  const suburbStartIndex = streetTypeIndex >= 0 ? streetTypeIndex + 1 : streetNameEndIndex;
  
  const cityNames = ['napier', 'hastings', 'taupo', 'gisborne'];
  let suburbEndIndex = parts.length;
  
  for (let i = suburbStartIndex; i < parts.length; i++) {
    if (/^\d{4}$/.test(parts[i])) {
      suburbEndIndex = i;
      break;
    }
    if (cityNames.includes(parts[i]) && i + 1 < parts.length) {
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
 * Build CQL filter for WFS query (legacy free-form addresses)
 */
function buildCQLFilter(components) {
  const { streetNumber, streetName, suburb } = components;
  
  const capStreetName = streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capSuburb = suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  let filter = `address_number='${streetNumber}'+AND+full_road_name='${encodeURIComponent(capStreetName)}'`;
  
  if (suburb) {
    filter += `+AND+(suburb_locality='${encodeURIComponent(capSuburb)}'+OR+town_city='${encodeURIComponent(capSuburb)}')`;
  }
  
  return filter;
}

/**
 * Query LINZ WFS API with CQL filter
 */
async function queryWFS(cqlFilter) {
  const url = `${LINZ_WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${ADDRESSES_LAYER}&srsName=EPSG:4326&outputFormat=application/json&cql_filter=${cqlFilter}&maxFeatures=10`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`LINZ WFS API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.features || [];
}

/**
 * Geocode address using LINZ WFS API
 */
async function geocodeAddress(address, structuredData = null) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    if (structuredData && structuredData.houseNumber && structuredData.streetName) {
      return await geocodeWithStructuredData(structuredData);
    }
    
    const components = parseAddress(address);
    console.log(`   Parsed: number="${components.streetNumber}", street="${components.streetName}", suburb="${components.suburb}"`);
    
    let cqlFilter = buildCQLFilter(components);
    let features = await queryWFS(cqlFilter);
    
    console.log(`📊 Found ${features.length} matching addresses`);
    
    if (features.length === 0 && components.suburb) {
      console.log(`   Trying without suburb filter...`);
      cqlFilter = `address_number='${components.streetNumber}'+AND+full_road_name='${encodeURIComponent(components.streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      features = await queryWFS(cqlFilter);
      console.log(`📊 Found ${features.length} matching addresses (no suburb)`);
    }
    
    if (features.length === 0) {
      console.log(`   Trying street name only...`);
      cqlFilter = `full_road_name='${encodeURIComponent(components.streetName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      if (components.suburb) {
        cqlFilter += `+AND+suburb_locality='${encodeURIComponent(components.suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}'`;
      }
      const fallbackFeatures = await queryWFS(cqlFilter);
      
      if (fallbackFeatures.length > 0) {
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
async function getLINZData(address, structuredData = null) {
  try {
    console.log('🏛️  Fetching LINZ Data...');
    
    const geoResult = await geocodeAddress(address, structuredData);
    
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

module.exports = { geocodeAddress, getLINZData, geocodeWithStructuredData };
