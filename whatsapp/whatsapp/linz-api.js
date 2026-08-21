/**
 * LINZ Data Service API Integration
 * 
 * Fetches property title information, easements, and parcel data
 * from the official LINZ Data Service (data.linz.govt.nz)
 */

const LINZ_API_KEY = 'YOUR_LINZ_API_KEY'; // Get from https://www.linz.govt.nz/data/linz-data-service/guide/accessing-data/web-services/api-keys
const LINZ_BASE_URL = 'https://data.linz.govt.nz/services;key=' + LINZ_API_KEY;

/**
 * Geocode address to get coordinates
 * Uses LINZ Addresses service
 */
async function geocodeAddress(address) {
  try {
    console.log(`🔍 Geocoding address: ${address}`);
    
    // LINZ Addresses API
    const url = `${LINZ_BASE_URL}/query/v1/addresses.json?address=${encodeURIComponent(address)}&limit=5`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No matching addresses found');
    }
    
    const bestMatch = data.features[0];
    
    return {
      latitude: bestMatch.geometry.coordinates[1],
      longitude: bestMatch.geometry.coordinates[0],
      fullAddress: bestMatch.properties.address_text,
      confidence: bestMatch.properties.confidence
    };
    
  } catch (error) {
    console.error('❌ Geocoding failed:', error.message);
    throw error;
  }
}

/**
 * Fetch title information by coordinates (reverse lookup)
 */
async function fetchTitleByLocation(latitude, longitude) {
  try {
    console.log(`📍 Fetching titles near: ${latitude}, ${longitude}`);
    
    // LINZ Titles API with spatial filter
    const url = `${LINZ_BASE_URL}/query/v1/titles.json?within=POINT(${longitude} ${latitude})&distance=100&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log('⚠️  No titles found at this location');
      return null;
    }
    
    // Return the first (closest) title
    const title = data.features[0].properties;
    
    return {
      titleNumber: title.title_number,
      legalDescription: title.legal_description,
      area: title.area_ha ? `${title.area_ha} ha` : 'N/A',
      ownership: title.ownership_type || 'Freehold',
      latitude: latitude,
      longitude: longitude
    };
    
  } catch (error) {
    console.error('❌ Title fetch failed:', error.message);
    return null;
  }
}

/**
 * Fetch easements for a specific title
 */
async function fetchEasements(titleNumber) {
  try {
    console.log(`⛓️  Fetching easements for title: ${titleNumber}`);
    
    // LINZ Easements API
    const url = `${LINZ_BASE_URL}/query/v1/easements.json?title_number=${titleNumber}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log('✅ No easements found');
      return [];
    }
    
    const easements = data.features.map(feature => ({
      type: feature.properties.easement_type || 'Easement',
      description: feature.properties.description || 'No description available',
      area: feature.properties.area_ha,
      registeredDate: feature.properties.registration_date
    }));
    
    console.log(`✅ Found ${easements.length} easement(s)`);
    return easements;
    
  } catch (error) {
    console.error('❌ Easements fetch failed:', error.message);
    return [];
  }
}

/**
 * Fetch parcel information
 */
async function fetchParcels(latitude, longitude) {
  try {
    console.log(`📦 Fetching parcels near: ${latitude}, ${longitude}`);
    
    // LINZ Parcels API
    const url = `${LINZ_BASE_URL}/query/v1/parcels.json?within=POINT(${longitude} ${latitude})&distance=50&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const parcel = data.features[0].properties;
    
    return {
      parcelId: parcel.parcel_id,
      parcelType: parcel.parcel_type,
      area: parcel.area_ha,
      appellation: parcel.appellation
    };
    
  } catch (error) {
    console.error('❌ Parcels fetch failed:', error.message);
    return null;
  }
}

/**
 * Complete LINZ data fetch for an address
 */
async function getLINZData(address) {
  try {
    console.log('\n🏛️  Fetching LINZ Data...');
    
    // Step 1: Geocode address
    const location = await geocodeAddress(address);
    console.log(`   📍 Location: ${location.latitude}, ${location.longitude}`);
    
    // Step 2: Fetch title information
    const titleData = await fetchTitleByLocation(location.latitude, location.longitude);
    
    if (!titleData) {
      console.log('⚠️  No title data available');
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.fullAddress
      };
    }
    
    // Step 3: Fetch easements
    const easements = await fetchEasements(titleData.titleNumber);
    
    // Step 4: Fetch parcels
    const parcelData = await fetchParcels(location.latitude, location.longitude);
    
    const result = {
      ...titleData,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.fullAddress,
      easements: easements,
      parcel: parcelData
    };
    
    console.log('✅ LINZ data fetch complete');
    return result;
    
  } catch (error) {
    console.error('❌ LINZ data fetch failed:', error.message);
    // Return minimal data so report can still be generated
    return {
      error: error.message,
      address: address
    };
  }
}

module.exports = {
  geocodeAddress,
  fetchTitleByLocation,
  fetchEasements,
  fetchParcels,
  getLINZData
};
