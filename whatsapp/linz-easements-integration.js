/**
 * LINZ Easements Integration
 * 
 * Queries LINZ for official easements data:
 * - Layer 50782: NZ Non-Primary Parcels (easements, covenants, esplanade strips)
 * - Layer 51570: NZ Linear Parcels (centreline easements)
 * 
 * Returns comprehensive easements list with types, areas, and impact assessments
 */

const LINZ_API_KEY = 'b2e35aafd4e848e9b0265f1caf575255';

/**
 * Query LINZ vector API for easements at coordinates
 */
async function queryLINZEasements(latitude, longitude, layerId, radius = 5000) {
  try {
    const url = `https://data.linz.govt.nz/services/query/v1/vector.json?key=${LINZ_API_KEY}&layer=${layerId}&x=${longitude}&y=${latitude}&max_results=20&radius=${radius}&geometry=false&with_field_names=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`⚠️ LINZ query failed for layer ${layerId}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    const layerData = data.vectorQuery?.layers?.[layerId];
    const features = layerData?.features || [];
    
    if (features.length === 0) {
      return [];
    }
    
    // Parse features into standardized format
    const easements = features.map(f => {
      const props = f.properties;
      return {
        appellation: props.appellation || 'Unknown',
        description: props.description || props.parcel_intent || 'No detailed description available',
        type: props.parcel_intent || 'Easement',
        area: props.calc_area ? `${props.calc_area} m²` : 'N/A',
        areaValue: props.calc_area || null,
        district: props.land_district || '',
        titles: props.titles || null,
        affectedSurveys: props.affected_surveys || null,
        topologyType: props.topology_type || ''
      };
    });
    
    return easements;
    
  } catch (error) {
    console.error(`❌ Error querying LINZ layer ${layerId}:`, error.message);
    return null;
  }
}

/**
 * Get complete easements data from both LINZ layers
 */
async function getCompleteEasementsData(latitude, longitude) {
  try {
    console.log('\n Fetching LINZ Easements Data...');
    
    // Query both layers in parallel
    const [nonPrimaryParcels, linearParcels] = await Promise.all([
      queryLINZEasements(latitude, longitude, '50782', 5000),
      queryLINZEasements(latitude, longitude, '51570', 5000)
    ]);
    
    // Combine results
    const allEasements = [];
    
    if (nonPrimaryParcels && nonPrimaryParcels.length > 0) {
      console.log(`   ✅ Layer 50782: Found ${nonPrimaryParcels.length} easement(s)`);
      allEasements.push(...nonPrimaryParcels);
    }
    
    if (linearParcels && linearParcels.length > 0) {
      console.log(`   ✅ Layer 51570: Found ${linearParcels.length} easement(s)`);
      allEasements.push(...linearParcels);
    }
    
    if (allEasements.length === 0) {
      console.log('   ℹ️  No easements registered on this property');
      return {
        easements: [],
        count: 0,
        source: 'LINZ Data Service',
        summary: 'No easements registered'
      };
    }
    
    // Remove duplicates (same appellation)
    const uniqueEasements = allEasements.filter((e, index, self) =>
      index === self.findIndex(e2 => e2.appellation === e.appellation)
    );
    
    console.log(`   📊 Total unique easements: ${uniqueEasements.length}`);
    
    // Generate summary
    const summary = generateEasementsSummary(uniqueEasements);
    
    return {
      easements: uniqueEasements,
      count: uniqueEasements.length,
      source: 'LINZ Data Service',
      summary: summary,
      hasSignificantEasements: uniqueEasements.some(e => e.areaValue > 50 || e.type !== 'Easement')
    };
    
  } catch (error) {
    console.error('❌ Easements fetch failed:', error.message);
    return {
      error: error.message,
      easements: [],
      count: 0
    };
  }
}

/**
 * Generate plain-English summary of easements impact
 */
function generateEasementsSummary(easements) {
  if (easements.length === 0) {
    return 'No easements registered on this property. This is favorable as there are no third-party rights affecting the land.';
  }
  
  const totalArea = easements.reduce((sum, e) => sum + (e.areaValue || 0), 0);
  
  let summary = `${easements.length} easement(s) registered on this property. `;
  
  if (totalArea > 0) {
    summary += `Total area affected: approximately ${totalArea} m². `;
  }
  
  // Check for significant easements
  const largeEasements = easements.filter(e => (e.areaValue || 0) > 100);
  if (largeEasements.length > 0) {
    summary += `⚠️ ${largeEasements.length} large easement(s) (>100m²) may significantly affect property use. `;
  }
  
  // Add recommendations
  summary += 'Review easement types and locations carefully. Common impacts include: building restrictions, access rights for neighbors or utilities, and limitations on fencing or landscaping.';
  
  return summary;
}

/**
 * Classify easement type and provide plain-English explanation
 */
function classifyEasement(easement) {
  const appellation = easement.appellation.toLowerCase();
  
  // Try to determine type from appellation
  if (appellation.includes('right of way') || appellation.includes('row')) {
    return {
      category: 'Access',
      description: 'Right of way easement allows others to pass through the property (pedestrian or vehicle access).',
      impact: 'May limit where you can build fences, structures, or landscaping along the access path.'
    };
  }
  
  if (appellation.includes('drainage') || appellation.includes('stormwater')) {
    return {
      category: 'Utilities',
      description: 'Drainage easement allows water to flow across or under the property.',
      impact: 'Cannot build over drainage infrastructure. May require maintenance access.'
    };
  }
  
  if (appellation.includes('power') || appellation.includes('electricity')) {
    return {
      category: 'Utilities',
      description: 'Power easement allows electricity lines across the property.',
      impact: 'Building restrictions apply near power lines. Utility company has access rights.'
    };
  }
  
  if (appellation.includes('water') || appellation.includes('supply')) {
    return {
      category: 'Utilities',
      description: 'Water supply easement allows water pipes across the property.',
      impact: 'Cannot interfere with water infrastructure. Access required for maintenance.'
    };
  }
  
  if (appellation.includes('sewer') || appellation.includes('wastewater')) {
    return {
      category: 'Utilities',
      description: 'Sewer/wastewater easement allows sewage pipes across the property.',
      impact: 'Building restrictions apply. Critical infrastructure - cannot be removed or blocked.'
    };
  }
  
  if (appellation.includes('esplanade') || appellation.includes('reserve')) {
    return {
      category: 'Public Access',
      description: 'Esplanade reserve provides public access (often near coast or rivers).',
      impact: 'Public has right to access this area. Cannot fence off or restrict access.'
    };
  }
  
  if (appellation.includes('covenant')) {
    return {
      category: 'Restriction',
      description: 'Covenant places restrictions on land use (e.g., building materials, height limits).',
      impact: 'Must comply with covenant terms. May limit development options.'
    };
  }
  
  // Default
  return {
    category: 'General',
    description: `Registered easement: ${easement.appellation}`,
    impact: 'Review legal documentation for specific rights and restrictions.'
  };
}

module.exports = {
  queryLINZEasements,
  getCompleteEasementsData,
  generateEasementsSummary,
  classifyEasement
};
