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
 * @param {Object} options.coords - Pre-geocoded coordinates {lat, lon} to use instead of geocoding
 * @returns {Promise<Object|null>} LINZ property data or null on failure
 */
async function fetchLinZData(address, options = {}) {
  const timeout = options.timeout || 15000;
  
  console.log('  [LINZ WFS] Fetching property data...');
  console.log(`  [LINZ WFS] Address: ${address}`);
  
  try {
    // Step 1: Use provided coords or geocode address
    let coords;
    if (options.coords && options.coords.lat && options.coords.lon) {
      coords = options.coords;
      console.log(`  [LINZ WFS] ✓ Using provided coords: ${coords.lat}, ${coords.lon}`);
    } else {
      coords = await geocodeAddress(address);
      
      if (!coords) {
        console.log('  [LINZ WFS] ⚠️ Could not geocode - using Napier center');
        coords = { lat: -39.4928, lon: 176.9120 };
      } else {
        console.log(`  [LINZ WFS] ✓ Geocoded: ${coords.lat}, ${coords.lon}`);
      }
    }
    
    // Step 2: Create tight bounding box around coordinates (~50m radius)
    // Using EPSG:4326 suffix is REQUIRED for LINZ WFS
    const bbox = createBoundingBox(coords.lon, coords.lat, 0.0005); // 0.0005 degrees ≈ 55m box
    console.log(`  [LINZ WFS] BBOX: ${bbox}`);
    
    // Step 3: Fetch parcel data for this location
    console.log('  [LINZ WFS] Fetching parcel data...');
    const parcelData = await fetchParcelData(bbox, timeout);
    
    if (!parcelData || !parcelData.features || parcelData.features.length === 0) {
      console.log('  [LINZ WFS] ⚠️ No parcels found in area');
      return generateFallbackData(address);
    }
    
    // Step 4: Find the best matching parcel
    // Strategy: 1) Check if pin is inside any parcel (point-in-polygon)
    //           2) If not, use closest by centroid
    console.log('  [LINZ WFS] Selecting best matching parcel...');
    const primaryParcel = selectBestParcel(parcelData.features, coords);
    
    if (!primaryParcel) {
      console.log('  [LINZ WFS] ⚠️ Could not identify relevant parcel');
      return generateFallbackData(address);
    }
    
    console.log(`  [LINZ WFS] ✓ Selected: ${primaryParcel.properties.appellation || 'N/A'}`);
    
    // Step 5: Extract title references from parcel
    const titleRefs = extractTitleReferences(primaryParcel);
    
    // Step 6: Extract title number from parcel data
    // Note: Title estate layer (52068) doesn't support bbox queries, so we use title from parcel
    let titleNumber = 'N/A';
    let titleData = null;
    
    if (titleRefs.length > 0) {
      titleNumber = titleRefs[0];
      console.log(`  [LINZ WFS] ✓ Title number: ${titleNumber}`);
    } else {
      console.log('  [LINZ WFS] ℹ️ No title references on parcel');
    }
    
    // Step 7: Compile final result with title number
    const result = compilePropertyData(primaryParcel, titleData, address, titleNumber);
    
    console.log(`  [LINZ WFS] ✅ Success: ${result.legalDescription || 'Parcel data retrieved'}`);
    return result;
    
  } catch (error) {
    console.log('  [LINZ WFS] ❌ Error:', error.message);
    console.log('  [LINZ WFS] → Using fallback data');
    return generateFallbackData(address);
  }
}

/**
 * Simple address geocoding using OpenStreetMap Nominatim API
 * @param {string} address - Full address string (e.g., "123 Station Street, Napier")
 * @returns {Promise<{lat: number, lon: number}|null>} Coordinates or null
 */
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    console.log(`  [GEOCODE] Querying: ${address}`);
    
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': 'AI-Driven-Property-Reports/1.0',
        'Accept-Language': 'en'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`  [GEOCODE] ✓ Found: ${result.display_name.substring(0, 60)}...`);
      console.log(`  [GEOCODE] Coords: ${result.lat}, ${result.lon}`);
      
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
    }
    
    console.log('  [GEOCODE] ⚠️ No results found');
    return null;
    
  } catch (error) {
    console.log('  [GEOCODE] ❌ Error:', error.message);
    return null;
  }
}

/**
 * Create bounding box from center point
 * @param {number} lon - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} delta - Degrees in each direction (0.01 ≈ 1km)
 * @returns {string} BBOX string for WFS request with EPSG:4326
 */
function createBoundingBox(lon, lat, delta = 0.01) {
  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;
  
  // IMPORTANT: Must include EPSG:4326 suffix for LINZ WFS
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
    count: '100' // Get enough parcels to ensure we capture the target
  });
  
  console.log(`  [LINZ WFS] Request: ${url.substring(0, 120)}...`);
  
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
    // Format examples: "HBC3/166", "NA123/45", "HB2/765"
    if (typeof titlesStr === 'string' && titlesStr.trim()) {
      // Match LINZ title format: 2-3 letters + numbers + slash + numbers
      const matches = titlesStr.match(/[A-Z]{2,3}\d{1,}\/\d+/gi);
      if (matches) {
        titles.push(...matches.map(t => t.toUpperCase()));
      } else {
        // Try simpler pattern if first doesn't match
        const simpleMatch = titlesStr.match(/[A-Z0-9\/]+/i);
        if (simpleMatch) {
          titles.push(simpleMatch[0].toUpperCase());
        }
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(titles)];
}

/**
 * Fetch title estate data for specific titles using bbox spatial query
 * @param {Array<string>} titleNumbers - Array of title numbers (not used for spatial query)
 * @param {number} timeout - Request timeout
 * @returns {Promise<Object|null>} Title data or null
 */
async function fetchTitleEstateData(titleNumbers, timeout = 15000) {
  // Note: We're using bbox query instead of CQL filter as LINZ WFS doesn't support CQL
  // This returns all titles in the area, caller should match by title number if needed
  
  const url = `${CONFIG.linz.baseUrl}?` + new URLSearchParams({
    service: 'WFS',
    version: CONFIG.linz.version,
    request: 'GetFeature',
    typeName: CONFIG.linz.layers.titleEstate,
    outputFormat: CONFIG.linz.outputFormat,
    bbox: '176.85,-39.55,177.00,-39.40,EPSG:4326', // Napier area bbox
    count: '20'
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
 * Select the best matching parcel from a list
 * Strategy: 1) Find parcel containing the point (point-in-polygon)
 *           2) If none, use closest by centroid
 * @param {Array} parcels - Array of parcel features
 * @param {Object} coords - Target coordinates {lat, lon}
 * @returns {Object|null} Best matching parcel or null
 */
function selectBestParcel(parcels, coords) {
  if (!parcels || parcels.length === 0) return null;
  
  // Helper: Check if point is inside polygon
  function isPointInPolygon(point, polygon) {
    const [lat, lon] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [lati, loni] = polygon[i];
      const [latj, lonj] = polygon[j];
      
      const intersect = ((loni > lon) !== (lonj > lon)) &&
          (lat < (latj - lati) * (lon - loni) / (lonj - loni) + lati);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  }
  
  // Helper: Get centroid of polygon
  function getCentroid(exteriorRing) {
    let sumLat = 0, sumLon = 0, count = 0;
    exteriorRing.forEach(coord => {
      if (coord.length >= 2) {
        sumLat += coord[1];
        sumLon += coord[0];
        count++;
      }
    });
    return count > 0 ? [sumLat / count, sumLon / count] : null;
  }
  
  // Helper: Calculate distance in meters
  function calcDistance(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * 111000;
    const dLon = (lon2 - lon1) * 111000 * Math.cos(lat1 * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }
  
  const targetPoint = [coords.lat, coords.lon];
  let containingParcel = null;
  let closestParcel = null;
  let minDistance = Infinity;
  
  console.log(`  [LINZ WFS] Checking ${parcels.length} parcels for point-in-polygon...`);
  
  parcels.forEach((parcel, idx) => {
    if (!parcel.geometry) {
      return;
    }
    if (!parcel.geometry.coordinates) {
      return;
    }
    
    // Get exterior ring
    let exteriorRing;
    if (parcel.geometry.type === 'MultiPolygon') {
      exteriorRing = parcel.geometry.coordinates[0][0];
    } else if (parcel.geometry.type === 'Polygon') {
      exteriorRing = parcel.geometry.coordinates[0];
    } else {
      return;
    }
    
    const appName = parcel.properties.appellation || 'N/A';
    
    // Convert to [lat, lon] format
    const polygon = exteriorRing.map(coord => [coord[1], coord[0]]);
    
    // Check if point is inside
    if (isPointInPolygon(targetPoint, polygon)) {
      console.log(`  [LINZ WFS] ✓ Pin is INSIDE ${appName}`);
      containingParcel = parcel;
    }
    
    // Calculate distance to centroid
    const centroid = getCentroid(exteriorRing);
    if (centroid) {
      const dist = calcDistance(coords.lat, coords.lon, centroid[0], centroid[1]);
      if (dist < minDistance) {
        minDistance = dist;
        closestParcel = parcel;
      }
    }
  });
  
  // Return containing parcel if found, otherwise closest
  if (containingParcel) {
    console.log(`  [LINZ WFS] ✓ Pin is INSIDE ${containingParcel.properties.appellation || 'parcel'}`);
    return containingParcel;
  }
  
  if (closestParcel) {
    console.log(`  [LINZ WFS] → Using closest parcel (${minDistance.toFixed(0)}m away)`);
    return closestParcel;
  }
  
  // Fallback to first parcel with geometry
  return parcels.find(p => p.geometry) || parcels[0];
}

/**
 * Compile parcel and title data into unified property report
 * @param {Object} parcel - Primary parcel feature
 * @param {Object|null} titleData - Title estate data
 * @param {string} address - Original address
 * @param {string} titleNumber - Extracted title number
 * @returns {Object} Compiled property data
 */
function compilePropertyData(parcel, titleData, address, titleNumber = 'N/A') {
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
    titleNumber: titleNumber,
    
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
