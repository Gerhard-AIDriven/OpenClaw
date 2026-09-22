/**
 * LINZ Titles API Integration
 * Uses the official LINZ vector query endpoint to retrieve property title data
 * 
 * Endpoint format:
 * https://data.linz.govt.nz/services/query/v1/vector.json?key=API_KEY&layer=50804&x={LON}&y={LAT}&max_results=3&radius=10000&geometry=true&with_field_names=true
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';
const TITLES_LAYER_ID = '50804'; // NZ Property Titles

/**
 * Query LINZ Titles API by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters (default: 10000)
 * @returns {Promise<Object>} Title data or null if not found
 */
async function getLINZTitlesByCoordinates(lat, lon, radius = 10000) {
  const url = `https://data.linz.govt.nz/services/query/v1/vector.json?key=${LINZ_API_KEY}&layer=${TITLES_LAYER_ID}&x=${lon}&y=${lat}&max_results=3&radius=${radius}&geometry=true&with_field_names=true`;
  
  console.log('🏛️  Querying LINZ Titles API...');
  console.log('   URL:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LINZ API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we got results
    if (!data.vectorQuery?.layers?.['50804']?.features || 
        data.vectorQuery.layers['50804'].features.length === 0) {
      console.log('ℹ️  No titles found at this location');
      return null;
    }
    
    const features = data.vectorQuery.layers['50804'].features;
    console.log(`✅ Found ${features.length} title(s)`);
    
    // Return the closest title (first one with distance: 0)
    const primaryTitle = features.find(f => f.distance === 0) || features[0];
    
    return parseTitleData(primaryTitle);
    
  } catch (error) {
    console.error('❌ LINZ Titles API failed:', error.message);
    return null;
  }
}

/**
 * Parse LINZ title feature into standardized format
 * @param {Object} feature - LINZ feature object
 * @returns {Object} Standardized title data
 */
function parseTitleData(feature) {
  const props = feature.properties;
  
  console.log('📋 Title Data Retrieved:');
  console.log('   Title Number:', props.title_no);
  console.log('   Type:', props.type);
  console.log('   Land District:', props.land_district);
  console.log('   Estate:', props.estate_description);
  
  return {
    titleNumber: props.title_no || 'Unknown',
    legalDescription: extractLegalDescription(props.estate_description),
    area: extractArea(props.estate_description),
    ownershipType: props.type || 'Unknown',
    landDistrict: props.land_district || '',
    issueDate: props.issue_date ? props.issue_date.split(' ')[0] : '',
    guaranteeStatus: props.guarantee_status || '',
    numberOfOwners: props.number_owners || 0,
    status: props.status || '',
    // Geometry for map display (optional)
    geometry: feature.geometry || null
  };
}

/**
 * Extract legal description from estate description
 * Example: "Fee Simple, 1/1, Part Lot 2 Deposited Plan 6187, 1,315 m2" → "Part Lot 2 DP 6187"
 */
function extractLegalDescription(estateDesc) {
  if (!estateDesc) return '';
  
  // Try to extract Lot/DP information
  const lotMatch = estateDesc.match(/(?:Lot|Part Lot)\s+\d+\s+(?:Deposited Plan|DP)\s+\d+/i);
  if (lotMatch) {
    return lotMatch[0].replace(/Deposited Plan/gi, 'DP');
  }
  
  // Fallback to full description
  return estateDesc;
}

/**
 * Extract area from estate description
 * Example: "Fee Simple, 1/1, Part Lot 2 Deposited Plan 6187, 1,315 m2" → "0.1315 ha"
 */
function extractArea(estateDesc) {
  if (!estateDesc) return '';
  
  // Look for area in m2
  const m2Match = estateDesc.match(/([\d,]+)\s*m2/i);
  if (m2Match) {
    const m2 = parseFloat(m2Match[1].replace(',', ''));
    const hectares = (m2 / 10000).toFixed(4);
    return `${hectares} ha`;
  }
  
  // Look for area in hectares
  const haMatch = estateDesc.match(/([\d.]+)\s*ha/i);
  if (haMatch) {
    return `${haMatch[1]} ha`;
  }
  
  return '';
}

/**
 * Get complete title data including easements (future enhancement)
 * For now, returns basic title info - easements would require additional API calls
 */
async function getCompleteTitleData(lat, lon) {
  const titleData = await getLINZTitlesByCoordinates(lat, lon);
  
  if (!titleData) {
    return null;
  }
  
  // Note: Easements require a separate query to layer 50808 (NZ Easements)
  // This can be added as a future enhancement
  titleData.easements = []; // Placeholder - implement when needed
  
  return titleData;
}

// Export for use in poll-automated-reports-v2.js
module.exports = {
  getLINZTitlesByCoordinates,
  getCompleteTitleData,
  parseTitleData
};

// Test if run directly
if (require.main === module) {
  // Test with 31 Douglas McLean Avenue coordinates
  const LAT = -39.5005800554;
  const LON = 176.90405875;
  
  console.log('🧪 Testing LINZ Titles API Integration');
  console.log('Coordinates:', LAT, LON);
  console.log('='.repeat(80));
  
  getCompleteTitleData(LAT, LON).then(data => {
    if (data) {
      console.log('\n✅ SUCCESS! Title Data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ No title data found');
    }
  });
}
