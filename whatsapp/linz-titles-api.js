/**
 * LINZ Titles API Integration - Vector Query Version
 * 
 * Fetches property title information using LINZ Data Service Vector Query API
 * This is the same API we use for addresses, but querying the titles layer
 * 
 * API Key: b2e35aafd4e848e9b0265f1caf575255 (Gerhard's key)
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const LINZ_VECTOR_URL = 'https://data.linz.govt.nz/services/query/v1/vector.json';
const TITLES_LAYER = '51306'; // NZ Cadastre Titles layer

/**
 * Get title data by coordinates using vector query
 * Searches for titles near this location
 */
async function getTitleByCoordinates(latitude, longitude) {
  try {
    console.log('🏛️  Fetching LINZ Title Data...');
    console.log(`   Coords: ${latitude}, ${longitude}`);
    
    // Query titles layer with point search
    const url = `${LINZ_VECTOR_URL}?key=${LINZ_API_KEY}&layer=${TITLES_LAYER}&x=${longitude}&y=${latitude}&max_results=10&radius=50&geometry=false&with_field_names=true`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://data.linz.govt.nz/',
        'Origin': 'https://data.linz.govt.nz'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINZ API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    const features = data.vectorQuery?.layers?.[TITLES_LAYER]?.features || [];
    
    console.log(`📊 Found ${features.length} potential titles`);
    
    if (features.length === 0) {
      console.log('⚠️  No titles found at this location');
      return null;
    }
    
    // Extract title data from first feature
    const props = features[0].properties;
    
    console.log(`✅ Found title: ${props.title_number || props.title_reference || 'Unknown'}`);
    
    return {
      titleNumber: props.title_number || props.title_reference || null,
      legalDescription: props.legal_description || null,
      area: props.area_ha ? `${parseFloat(props.area_ha).toFixed(4)} ha` : null,
      ownership: props.owner_names || null,
      easements: [], // Would need separate query to easements layer
      parcels: [],   // Would need separate query to parcels layer
      raw: props
    };
    
  } catch (error) {
    console.error(`❌ LINZ Titles fetch failed: ${error.message}`);
    return null;
  }
}

/**
 * Alternative: Search by title number if known
 */
async function getTitleByNumber(titleNumber) {
  try {
    console.log(`🔍 Searching for title: ${titleNumber}`);
    
    // Search from Napier center with text filter
    const napierCenter = { x: 176.9200, y: -39.4900 };
    const url = `${LINZ_VECTOR_URL}?key=${LINZ_API_KEY}&layer=${TITLES_LAYER}&x=${napierCenter.x}&y=${napierCenter.y}&max_results=100&radius=50000&geometry=false&with_field_names=true`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const features = data.vectorQuery?.layers?.[TITLES_LAYER]?.features || [];
    
    // Filter by title number
    const match = features.find(f => {
      const num = f.properties.title_number || f.properties.title_reference;
      return num === titleNumber;
    });
    
    if (!match) {
      console.log(`⚠️  Title ${titleNumber} not found`);
      return null;
    }
    
    const props = match.properties;
    
    return {
      titleNumber: props.title_number,
      legalDescription: props.legal_description,
      area: props.area_ha ? `${parseFloat(props.area_ha).toFixed(4)} ha` : null,
      ownership: props.owner_names,
      easements: [],
      parcels: [],
      raw: props
    };
    
  } catch (error) {
    console.error(`❌ Title search failed: ${error.message}`);
    return null;
  }
}

/**
 * Main entry point
 */
async function getLINZTitleData(latitude, longitude, titleNumber = null) {
  // Try coordinates first
  let titleData = await getTitleByCoordinates(latitude, longitude);
  
  // If that failed but we have a title number, try direct search
  if (!titleData && titleNumber) {
    titleData = await getTitleByNumber(titleNumber);
  }
  
  return titleData;
}

module.exports = { 
  getTitleByCoordinates, 
  getTitleByNumber, 
  getLINZTitleData
};
