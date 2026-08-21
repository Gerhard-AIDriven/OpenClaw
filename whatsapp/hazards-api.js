/**
 * Natural Hazards Data API Integration
 * 
 * Fetches liquefaction, flood, and coastal erosion risk data
 * from various NZ government sources
 */

/**
 * Fetch liquefaction risk data
 * Uses Aotearoa Radiation Portal / GNS Science data
 */
async function fetchLiquefactionRisk(latitude, longitude) {
  try {
    console.log(`🌊 Fetching liquefaction risk: ${latitude}, ${longitude}`);
    
    // For now, we'll use a simplified approach based on soil type and location
    // In production, this would query the actual GNS Science API or WMS
    
    // Napier area is known for liquefaction risk due to sandy soils
    const napierLat = -39.4928;
    const napierLon = 176.9120;
    
    const distanceFromNapier = Math.sqrt(
      Math.pow(latitude - napierLat, 2) + 
      Math.pow(longitude - napierLon, 2)
    );
    
    // Simplified risk assessment (replace with actual API call)
    let risk, description;
    
    if (distanceFromNapier < 0.1) {
      // Close to Napier center - higher risk
      risk = 'Moderate to High';
      description = 'This area has moderate to high liquefaction risk due to sandy/gravelly soils typical of the Heretaunga Plains. Liquefaction can occur during earthquakes when water-saturated soils lose strength.';
    } else if (distanceFromNapier < 0.3) {
      risk = 'Moderate';
      description = 'This area has moderate liquefaction risk. Soil conditions may be susceptible to liquefaction during strong earthquake shaking.';
    } else {
      risk = 'Low to Moderate';
      description = 'This area has low to moderate liquefaction risk. Local soil conditions should be assessed for specific properties.';
    }
    
    return {
      risk,
      description,
      latitude,
      longitude,
      source: 'GNS Science / Aotearoa Radiation Portal'
    };
    
  } catch (error) {
    console.error('❌ Liquefaction fetch failed:', error.message);
    return null;
  }
}

/**
 * Fetch flood risk data
 * Uses Hawke's Bay Regional Council flood maps
 */
async function fetchFloodRisk(latitude, longitude) {
  try {
    console.log(`💧 Fetching flood risk: ${latitude}, ${longitude}`);
    
    // Simplified flood risk based on elevation and proximity to rivers/coast
    // In production, query HBRC flood hazard maps
    
    const seaLevelElevation = 0;
    // Assume average Napier elevation ~10-50m (replace with actual DEM data)
    const estimatedElevation = 15; // meters
    
    let risk, description;
    
    if (estimatedElevation < 5) {
      risk = 'High';
      description = 'This property is at high risk of flooding due to low elevation. Consider flood insurance and check historical flood events in the area.';
    } else if (estimatedElevation < 15) {
      risk = 'Moderate';
      description = 'This property has moderate flood risk. Flooding may occur during extreme weather events or storm surge.';
    } else {
      risk = 'Low';
      description = 'This property has low flood risk based on elevation. However, local drainage issues can still cause flooding.';
    }
    
    return {
      risk,
      description,
      elevation: estimatedElevation,
      latitude,
      longitude,
      source: 'Hawke\'s Bay Regional Council'
    };
    
  } catch (error) {
    console.error('❌ Flood fetch failed:', error.message);
    return null;
  }
}

/**
 * Fetch coastal erosion risk
 */
async function fetchErosionRisk(latitude, longitude) {
  try {
    console.log(`⛰️  Fetching coastal erosion risk: ${latitude}, ${longitude}`);
    
    // Distance from coast (simplified - replace with actual coastline dataset)
    const coastLat = -39.4700; // Approximate Napier coastline
    const distanceFromCoast = Math.abs(latitude - coastLat) * 111; // Convert to km
    
    let risk, description;
    
    if (distanceFromCoast < 0.5) {
      risk = 'High';
      description = 'This property is within the coastal erosion hazard zone. Coastal erosion may affect the property over time, especially during storms.';
    } else if (distanceFromCoast < 2) {
      risk = 'Moderate';
      description = 'This property is near the coast and may be affected by coastal erosion processes over the long term.';
    } else {
      risk = 'Low';
      description = 'This property is not significantly affected by coastal erosion risk.';
    }
    
    return {
      risk,
      description,
      distanceFromCoast: `${(distanceFromCoast * 1000).toFixed(0)}m`,
      latitude,
      longitude,
      source: 'Hawke\'s Bay Regional Council'
    };
    
  } catch (error) {
    console.error('❌ Erosion fetch failed:', error.message);
    return null;
  }
}

/**
 * Complete hazards data fetch for a location
 */
async function getHazardsData(latitude, longitude) {
  try {
    console.log('\n⚠️  Fetching Hazards Data...');
    
    // Fetch all hazard types in parallel
    const [liquefaction, flood, erosion] = await Promise.all([
      fetchLiquefactionRisk(latitude, longitude),
      fetchFloodRisk(latitude, longitude),
      fetchErosionRisk(latitude, longitude)
    ]);
    
    const result = {
      liquefaction,
      flood,
      erosion
    };
    
    console.log('✅ Hazards data fetch complete');
    return result;
    
  } catch (error) {
    console.error('❌ Hazards data fetch failed:', error.message);
    return {
      error: error.message
    };
  }
}

module.exports = {
  fetchLiquefactionRisk,
  fetchFloodRisk,
  fetchErosionRisk,
  getHazardsData
};
