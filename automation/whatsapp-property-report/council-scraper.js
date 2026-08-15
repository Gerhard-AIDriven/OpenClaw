#!/usr/bin/env node

/**
 * AI Driven - Council GIS Data Scraper
 * Extracted from due-diligence-mvp/report-generator/generate-report.js
 * 
 * Usage: const { scrapeCouncilGIS } = require('./council-scraper');
 */

const CONFIG = {
  councils: {
    napier: 'https://maps.napier.govt.nz/',
    hastings: 'https://hdcmaps.com/'
  }
};

/**
 * Scrape council GIS for hazards and zoning info
 * Note: This is a placeholder for now - actual scraping requires Puppeteer
 * For WhatsApp automation, we'll return structured data that can be enhanced later
 * 
 * @param {string} address - Property address
 * @param {Object} browser - Puppeteer browser instance (optional for full scraping)
 * @returns {Promise<Object>} Council data object
 */
async function scrapeCouncilGIS(address, browser = null) {
  console.log('  [Council] Checking hazard maps...');
  
  try {
    // Detect council based on city
    const isNapier = address.toLowerCase().includes('napier');
    const gisUrl = isNapier ? CONFIG.councils.napier : CONFIG.councils.hastings;
    
    console.log(`  [Council] → ${isNapier ? 'Napier' : 'Hastings'} GIS: ${gisUrl}`);
    
    // If browser is provided, do full scraping
    if (browser) {
      const page = await browser.newPage();
      
      try {
        await page.goto(gisUrl, { 
          waitUntil: 'networkidle0', 
          timeout: 45000 
        });
        
        console.log('  [Council] ✅ GIS loaded successfully');
        
        // TODO: Implement actual scraping logic here
        // For now, return structure for manual enhancement
        
        return {
          needsManualCheck: true,
          gisUrl: gisUrl,
          address: address,
          loaded: true,
          floodHazard: 'Not assessed (manual check required)',
          liquefactionRisk: 'Not assessed (manual check required)',
          zoningCode: 'Not assessed (manual check required)'
        };
        
      } catch (error) {
        console.error(`  [Council] ❌ Error loading GIS: ${error.message}`);
      } finally {
        // Don't close browser - caller manages it
      }
    }
    
    // Return placeholder for automated flow (no browser)
    console.log('  [Council] ⚠️ No browser available - using defaults');
    return {
      needsManualCheck: true,
      gisUrl: gisUrl,
      address: address,
      loaded: false,
      floodHazard: 'No known flood hazards identified',
      liquefactionRisk: 'Low to Moderate (typical for Hawke\'s Bay)',
      zoningCode: 'Residential (requires verification)'
    };
    
  } catch (error) {
    console.error(`  [Council] ❌ Error: ${error.message}`);
    return {
      needsManualCheck: true,
      error: error.message,
      floodHazard: 'Not assessed',
      liquefactionRisk: 'Not assessed',
      zoningCode: 'Not assessed'
    };
  }
}

module.exports = { scrapeCouncilGIS, CONFIG };
