#!/usr/bin/env node

/**
 * AI Driven - LINZ WFS Property Data Fetcher
 * 
 * Uses LINZ Data Service WFS (Web Feature Service) API to fetch:
 * - Property parcel data (legal description, area, boundaries)
 * - Title estate data (ownership, tenure type)
 * - Title-parcel associations
 * 
 * Authentication: Path parameter format
 * Endpoint: https://data.linz.govt.nz/services;key=YOUR_KEY/wfs
 * 
 * Key Layers:
 * - layer-51571: NZ Parcels (cadastre boundaries, legal descriptions)
 * - table-52068: Landonline Title Estate (ownership data)
 * - table-51569: Title-Parcel Association (links titles to parcels)
 * 
 * Usage: const { fetchLinZData } = require('./linz-fetcher');
 */

const axios = require('axios');
const xml2js = require('xml2js');

const CONFIG = {
  linz: {
    // WFS endpoint with path parameter authentication
    baseUrl: 'https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs',
    
    // Key layers for property data
    layers: {
      parcels: 'data.linz.govt.nz:layer-51571',        // NZ Parcels (boundaries, legal desc)
      titleEstate: 'data.linz.govt.nz:table-52068',    // Title ownership data
      titleParcelAssoc: 'data.linz.govt.nz:table-51569' // Links titles to parcels
    },
    
    // Output format (JSON supported!)
    outputFormat: 'application/json',
    
    // WFS version
    version: '2.0.0'
  },
  
  // Napier bounding box (for spatial queries)
  napierBBox: {
    minLon: 176.85,
    minLat: -39.55,
    maxLon: 177.00,
    maxLat: -39.40
  }
};

/**
 * Fetch LINZ property data using WFS API
 * 
 * @param {string} address - Full street address (e.g., "123 Station Street, Napier")
 * @param {Object} options - Optional parameters
 * @param {number} options.timeout - Request timeout in ms (default: 15000)
 * @returns {Promise<Object|null>} LINZ property data or null on failure
 */
async function fetchLinZData(address, options = {}) {
  const timeout = options.timeout || 15000;
  
  console.log('  [LINZ WFS] Fetching property data...');
  console.log(`  [LINZ WFS] Address: ${address}`);
  
  try {
    // Step 1: Geocode address to get approximate coordinates
    // (For now, we'll use a simple approach - in production, use a geocoding service)
    const coords = await geocodeAddress(address);
    
    if (!coords) {
      console.log('  [LINZ WFS] ⚠️ Could not geocode address - using Napier center');
      coords = { lat: -39.4928, lon: 176.9120 }; // Napier center
    }
    
    console.log(`  [LINZ WFS] Coords: ${coords.lat}, ${coords.lon}`);
    
    // Step 2: Create small bounding box around coordinates (~100m radius)
    const bbox = createBoundingBox(coords.lon, coords.lat, 0.005); // ~500m box
    
    // Step 3: Fetch parcel data for this location
    console.log('  [LINZ WFS] Fetching parcel data...');
    const parcelData = await fetchParcelData(bbox, timeout);
    
    if (!parcelData || !parcelData.features || parcelData.features.length === 0) {
      console.log('  [LINZ WFS] ⚠️ No parcels found in area');
      return generateFallbackData(address);
    }
    
    // Step 4: Get the first/primary parcel (in production, filter by address match)
    const primaryParcel = parcelData.features[0];
    console.log(`  [LINZ WFS] ✓ Found parcel: ${primaryParcel.properties.appellation || 'N/A'}`);
    
    // Step 5: Extract title references from parcel
    const titleRefs = extractTitleReferences(primaryParcel);
    
    // Step 6: Fetch title estate data if we have title references
    let titleData = null;
    if (titleRefs.length > 0) {
      console.log(`  [LINZ WFS] Fetching title data for: ${titleRefs.join(', ')}`);
      titleData = await fetchTitleEstateData(titleRefs, timeout);
    }
    
    // Step 7: Compile final result
    const result = compilePropertyData(primaryParcel, titleData, address);
    
    console.log(`  [LINZ WFS] ✅ Success: ${result.legalDescription || 'Parcel data retrieved'}`);
    return result;
    
  } catch (error) {
    console.log('  [LINZ WFS] ❌ Error:', error.message);
    console.log('  [LINZ WFS] → Using fallback data');
    return generateFallbackData(address);
  }
}

/**
 * Simple address geocoding (placeholder - replace with real geocoding service)
 * For now, returns Napier center or extracts rough coords from address
 */
async function geocodeAddress(address) {
  // TODO: Implement proper geocoding with OpenStreetMap Nominatim or similar
  // For now, return Napier center as default
  
  // Simple heuristic: if address contains "Napier", return Napier center
  if (address.toLowerCase().includes('napier')) {
    return { lat: -39.4928, lon: 176.9120 };
  }
  
  // TODO: Add more cities/towns
  return null;
}

/**
 * Create bounding box from center point
 * @param {number} lon - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} delta - Degrees in each direction (~0.005 = ~500m)
 * @returns {string} BBOX string for WFS request
 */
function createBoundingBox(lon, lat, delta = 0.005) {
  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;
  
  return `${minLon},${minLat},${maxLon},${maxLat},EPSG:4326`;
}

/**
 * Fetch parcel data from WFS
 * @param {string} bbox - Bounding box string
 * @param {number} timeout - Request timeout
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
async function fetchParcelData(bbox, timeout = 15000) {
  const url = `${CONFIG.linz.baseUrl}?` + new URLSearchParams({
    service: 'WFS',
    version: CONFIG.linz.version,
    request: 'GetFeature',
    typeName: CONFIG.linz.layers.parcels,
    outputFormat: CONFIG.linz.outputFormat,
    bbox: bbox,
    count: '10' // Limit to 10 parcels
  });
  
  console.log(`  [LINZ WFS] Request: ${url.substring(0, 100)}...`);
  
  const response = await axios.get(url, { timeout });
  
  if (response.data && response.data.type === 'FeatureCollection') {
    return response.data;
  }
  
  throw new Error('Invalid response format from LINZ');
}

/**
 * Extract title references from parcel properties
 * @param {Object} parcel - Parcel feature
 * @returns {Array<string>} Array of title numbers
 */
function extractTitleReferences(parcel) {
  const titles = [];
  
  // Check if parcel has titles property
  if (parcel.properties && parcel.properties.titles) {
    const titlesStr = parcel.properties.titles;
    
    // Parse comma-separated title numbers
    if (typeof titlesStr === 'string') {
      const matches = titlesStr.match(/[A-Z]{1,3}\d{2,}\/\d+/gi);
      if (matches) {
        titles.push(...matches.map(t => t.toUpperCase()));
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(titles)];
}

/**
 * Fetch title estate data for specific titles
 * @param {Array<string>} titleNumbers - Array of title numbers
 * @param {number} timeout - Request timeout
 * @returns {Promise<Object|null>} Title data or null
 */
async function fetchTitleEstateData(titleNumbers, timeout = 15000) {
  if (titleNumbers.length === 0) {
    return null;
  }
  
  // Build CQL filter for title numbers
  // Example: title_number IN ('NA123/45', 'NA678/90')
  const titleList = titleNumbers.map(t => `'${t}'`).join(',');
  const cqlFilter = `ttl_title_no IN (${titleList})`;
  
  const url = `${CONFIG.linz.baseUrl}?` + new URLSearchParams({
    service: 'WFS',
    version: CONFIG.linz.version,
    request: 'GetFeature',
    typeName: CONFIG.linz.layers.titleEstate,
    outputFormat: CONFIG.linz.outputFormat,
    CQL_FILTER: cqlFilter
  });
  
  try {
    const response = await axios.get(url, { timeout });
    
    if (response.data && response.data.type === 'FeatureCollection') {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.log('  [LINZ WFS] ⚠️ Title fetch failed:', error.message);
    return null;
  }
}

/**
 * Compile parcel and title data into unified property report
 * @param {Object} parcel - Primary parcel feature
 * @param {Object|null} titleData - Title estate data
 * @param {string} address - Original address
 * @returns {Object} Compiled property data
 */
function compilePropertyData(parcel, titleData, address) {
  const props = parcel.properties || {};
  
  // Extract ownership info from title data
  let owners = 'Current Registered Owners';
  let tenureType = 'Freehold';
  
  if (titleData && titleData.features && titleData.features.length > 0) {
    const firstTitle = titleData.features[0].properties;
    
    // Map LINZ tenure codes to readable format
    const tenureMap = {
      'FSIM': 'Freehold',
      'CT': 'Certificate of Title',
      'LTA': 'Leasehold',
      'BAL': 'Balance'
    };
    
    tenureType = tenureMap[firstTitle.type] || firstTitle.type || 'Freehold';
    
    // Note: Actual owner names may require additional API calls or be restricted
    // For now, we indicate that ownership data exists
    owners = 'Registered proprietors on title';
  }
  
  return {
    // Legal description
    legalDescription: props.appellation || 'Part Section Napier',
    
    // Land area (prefer survey area, fall back to calculated)
    landArea: props.survey_area ? `${props.survey_area} m²` : 
              props.calc_area ? `${props.calc_area} m²` : 'N/A',
    
    // Ownership
    owners: owners,
    tenureType: tenureType,
    
    // Title information
    titleNumber: extractTitleReferences(parcel)[0] || 'N/A',
    
    // Additional parcel info
    landDistrict: props.land_district || 'Hawkes Bay',
    parcelIntent: props.parcel_intent || 'DCDB',
    status: props.status || 'Current',
    
    // Source attribution
    source: 'LINZ Data Service WFS',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Generate fallback data when WFS fails
 * @param {string} address - Original address
 * @returns {Object} Fallback property data
 */
function generateFallbackData(address) {
  console.log('  [LINZ WFS] → Generating fallback data');
  
  return {
    legalDescription: 'Lot 1 DP XXXXX (Pending verification)',
    landArea: 'N/A',
    owners: 'Current Registered Owners',
    tenureType: 'Freehold',
    titleNumber: 'N/A',
    landDistrict: 'Hawkes Bay',
    status: 'Unverified',
    source: 'Fallback (WFS unavailable)',
    fetchedAt: new Date().toISOString(),
    note: 'Data pending LINZ verification'
  };
}

/**
 * Parse address into components (utility function)
 * @param {string} fullAddress - Full address string
 * @returns {Object} Parsed address components
 */
function parseAddress(fullAddress) {
  const parts = fullAddress.split(',').map(p => p.trim());
  
  return {
    street: parts[0] || '',
    suburb: parts[1] || '',
    city: parts[2] || 'Napier',
    postcode: parts[3] || '',
    full: fullAddress
  };
}

// Export public API
module.exports = { 
  fetchLinZData, 
  parseAddress, 
  CONFIG,
  // Also export lower-level functions for advanced usage
  fetchParcelData,
  fetchTitleEstateData,
  createBoundingBox
};
