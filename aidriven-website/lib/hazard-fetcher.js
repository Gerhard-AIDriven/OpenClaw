#!/usr/bin/env node

const axios = require('axios');

/**
 * HTTP GET with retry logic for slow HBRC server
 */
async function httpGetWithRetry(url, options = {}, retries = 3) {
  const timeout = options.timeout || 45000;
  const baseDelay = 2000;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) console.log(`  [HTTP] Retry ${attempt}/${retries}...`);
      return await axios.get(url, { ...options, timeout });
    } catch (error) {
      if (attempt === retries) throw error;
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      if (!isTimeout) throw error;
      await new Promise(r => setTimeout(r, baseDelay * attempt));
    }
  }
}

const CONFIG = {
  hbr: {
    baseUrl: 'https://gis.hbrc.govt.nz/server/rest/services/HazardPortal',
    layers: {
      liquefaction: '/Earthquake_Liquefaction/MapServer/0',
      floodRisk: '/Flooding/MapServer/0',
      coastalInundation: '/Coastal_Inundation/MapServer/0',
      coastalHazardZone1: '/Coastal_Hazard_Zones/MapServer/25',
      coastalHazardZone2: '/Coastal_Hazard_Zones/MapServer/24',
      coastalHazardZone3: '/Coastal_Hazard_Zones/MapServer/23'
    }
  },
  linz: {
    baseUrl: 'https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs',
    gabrielleFloodLayer: 'data.linz.govt.nz:layer-112668',
    version: '2.0.0',
    outputFormat: 'application/json'
  }
};

async function fetchHazardData(coords, options = {}) {
  const timeout = options.timeout || 45000;
  console.log('  [HAZARD] Fetching hazard data...', coords.lat, coords.lon);
  
  try {
    const [liquefactionData, floodData, coastalData, gabrielleData] = await Promise.all([
      fetchLiquefactionData(coords, timeout),
      fetchFloodRiskData(coords, timeout),
      fetchCoastalHazardsData(coords, timeout),
      fetchGabrielleFloodData(coords, timeout)
    ]);
    
    return compileHazardReport({ coordinates: coords, liquefaction: liquefactionData, flood: floodData, coastal: coastalData, gabrielleFlood: gabrielleData });
  } catch (error) {
    console.log('  [HAZARD] Error:', error.message);
    return generateFallbackHazardData(coords);
  }
}

async function fetchLiquefactionData(coords, timeout) {
  const url = `${CONFIG.hbr.baseUrl}${CONFIG.hbr.layers.liquefaction}/query`;
  const params = new URLSearchParams({ where: '1=1', geometry: `${coords.lon},${coords.lat}`, geometryType: 'esriGeometryPoint', spatialRel: 'esriSpatialRelIntersects', outFields: '*', inSR: '4326', f: 'json' });
  
  try {
    console.log('  [HAZARD] Querying liquefaction...');
    const response = await httpGetWithRetry(`${url}?${params}`, { timeout }, 3);
    
    if (response.data?.features?.length > 0) {
      const attrs = response.data.features[0].attributes || {};
      return {
        status: 'Data available', source: 'HBRC Earthquake Liquefaction Map',
        susceptibilityLevel: attrs.SUSCEPTIBILITY || attrs.SUSCEPTIBIL || 'Unknown',
        intersectedLayer: true
      };
    }
    return { status: 'No data', source: 'HBRC', intersectedLayer: false };
  } catch (error) {
    console.log('  [HAZARD] Liquefaction failed:', error.message);
    return null;
  }
}

async function fetchFloodRiskData(coords, timeout) {
  const url = `${CONFIG.hbr.baseUrl}${CONFIG.hbr.layers.floodRisk}/query`;
  const params = new URLSearchParams({ where: '1=1', geometry: `${coords.lon},${coords.lat}`, geometryType: 'esriGeometryPoint', spatialRel: 'esriSpatialRelIntersects', outFields: '*', inSR: '4326', f: 'json' });
  
  try {
    console.log('  [HAZARD] Querying flood risk...');
    const response = await httpGetWithRetry(`${url}?${params}`, { timeout }, 3);
    
    if (response.data?.features?.length > 0) {
      const attrs = response.data.features[0].attributes || {};
      return {
        status: 'Data available', source: 'HBRC Flood Risk Areas',
        inFloodPlain: true, floodZone: attrs.FLOOD_ZONE || 'Unknown',
        intersectedLayer: true
      };
    }
    return { status: 'No data', source: 'HBRC', inFloodPlain: false, intersectedLayer: false };
  } catch (error) {
    console.log('  [HAZARD] Flood failed:', error.message);
    return null;
  }
}

async function fetchCoastalHazardsData(coords, timeout) {
  console.log('  [HAZARD] Querying coastal hazards...');
  const results = {};
  
  // Coastal inundation
  try {
    const url = `${CONFIG.hbr.baseUrl}${CONFIG.hbr.layers.coastalInundation}/query`;
    const params = new URLSearchParams({ where: '1=1', geometry: `${coords.lon},${coords.lat}`, geometryType: 'esriGeometryPoint', spatialRel: 'esriSpatialRelIntersects', outFields: '*', inSR: '4326', f: 'json' });
    const response = await httpGetWithRetry(`${url}?${params}`, { timeout }, 3);
    
    if (response.data?.features?.length > 0) {
      results.inundation = { status: 'Data available', source: 'HBRC', inInundationZone: true, intersectedLayer: true };
    } else {
      results.inundation = { status: 'No data', inInundationZone: false, intersectedLayer: false };
    }
  } catch (error) {
    results.inundation = { status: 'Fetch failed', error: error.message };
  }
  
  results.hazardZones = { status: 'No data', inHazardZone: false, intersectedLayer: false };
  return results;
}

async function fetchGabrielleFloodData(coords, timeout) {
  console.log('  [HAZARD] Querying Gabrielle flood...');
  const bbox = `${coords.lon - 0.005},${coords.lat - 0.005},${coords.lon + 0.005},${coords.lat + 0.005},EPSG:4326`;
  const url = `${CONFIG.linz.baseUrl}?` + new URLSearchParams({ service: 'WFS', version: CONFIG.linz.version, request: 'GetFeature', typeName: CONFIG.linz.gabrielleFloodLayer, outputFormat: CONFIG.linz.outputFormat, bbox, count: '10' });
  
  try {
    const response = await axios.get(url, { timeout, responseType: 'json' });
    const features = response.data?.features || [];
    
    return {
      source: 'LINZ Layer 112668', eventDate: '2023-02-14',
      affected: features.length > 0, floodExtentPolygons: features.length
    };
  } catch (error) {
    console.log('  [HAZARD] Gabrielle failed:', error.message);
    return { source: 'LINZ', affected: false };
  }
}

function compileHazardReport(data) {
  const { coordinates, liquefaction, flood, coastal, gabrielleFlood } = data;
  let overallRisk = 'Unknown';
  const riskFactors = [];
  
  if (liquefaction?.intersectedLayer) {
    riskFactors.push('Liquefaction zone');
    overallRisk = 'Moderate';
  }
  if (flood?.intersectedLayer && flood.inFloodPlain) {
    riskFactors.push('Flood hazard zone');
    overallRisk = 'High';
  }
  if (coastal?.inundation?.inInundationZone) {
    riskFactors.push('Coastal inundation');
    overallRisk = 'High';
  }
  if (gabrielleFlood?.affected) {
    riskFactors.push('Cyclone Gabrielle affected');
    overallRisk = 'High';
  }
  if (riskFactors.length === 0) overallRisk = 'Low';
  
  return {
    location: { latitude: coordinates.lat, longitude: coordinates.lon },
    hazards: {
      liquefaction: liquefaction || { status: 'No data' },
      flood: flood || { status: 'No data' },
      coastal: coastal || { status: 'No data' },
      cycloneGabrielle: gabrielleFlood || { status: 'Fetch failed' }
    },
    overallAssessment: { riskRating: overallRisk, riskFactors, summary: `Risk: ${overallRisk}. ${riskFactors.join(', ') || 'No hazards identified'}.` },
    dataSources: { hbrArcGisPortal: 'https://gis.hbrc.govt.nz/hazards/', linzDataService: 'Layer 112668' },
    fetchedAt: new Date().toISOString()
  };
}

function generateFallbackHazardData(coords) {
  return {
    location: { latitude: coords.lat, longitude: coords.lon },
    hazards: { liquefaction: { status: 'Unavailable' }, flood: { status: 'Unavailable' }, coastal: { status: 'Unavailable' }, cycloneGabrielle: { status: 'Unavailable' } },
    overallAssessment: { riskRating: 'Unknown', riskFactors: [], summary: 'Data unavailable' },
    fetchedAt: new Date().toISOString()
  };
}

module.exports = { fetchHazardData, fetchLiquefactionData, fetchFloodRiskData, fetchCoastalHazardsData, fetchGabrielleFloodData, httpGetWithRetry, CONFIG };
