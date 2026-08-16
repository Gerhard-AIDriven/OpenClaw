#!/usr/bin/env node

/**
 * AI Driven - OneRoof Valuation Data Fetcher
 * Extracted from due-diligence-mvp/report-generator/generate-report.js
 * 
 * Usage: const { fetchOneRoofValuation } = require('./oneroof-fetcher');
 */

const CONFIG = {
  oneroof: 'https://www.oneroof.co.nz/'
};

/**
 * Fetch property valuation data from OneRoof
 * Note: Full implementation requires Puppeteer for scraping
 * This version returns structured placeholders for automation
 * 
 * @param {string} address - Full property address
 * @param {Object} browser - Puppeteer browser instance (optional)
 * @returns {Promise<Object>} Valuation data object
 */
async function fetchOneRoofValuation(address, browser = null) {
  console.log('  [OneRoof] Fetching valuation data...');
  
  try {
    if (browser) {
      // Full scraping mode
      const page = await browser.newPage();
      
      try {
        const searchUrl = `${CONFIG.oneroof}property/${encodeURIComponent(address)}`;
        console.log(`  [OneRoof] → Loading: ${searchUrl}`);
        
        await page.goto(searchUrl, { 
          waitUntil: 'networkidle0', 
          timeout: 45000 
        });
        
        console.log('  [OneRoof] ✅ Page loaded');
        
        // TODO: Implement actual scraping logic here
        // Extract: capitalValue, landValue, lastSoldPrice, lastSoldDate
        
        return {
          needsManualCheck: true,
          url: searchUrl,
          capitalValue: null,
          landValue: null,
          annualRates: null,
          lastSoldPrice: null,
          lastSoldDate: null
        };
        
      } catch (error) {
        console.error(`  [OneRoof] ❌ Error: ${error.message}`);
      }
    }
    
    // Automated mode - return placeholders
    console.log('  [OneRoof] ⚠️ No browser - using estimates');
    return {
      capitalValue: 'Available in Standard/Premium packages',
      landValue: 'Available in Standard/Premium packages',
      annualRates: 'Available in Standard/Premium packages',
      lastSoldPrice: null,
      lastSoldDate: null,
      note: 'Valuation data requires manual verification or premium API access'
    };
    
  } catch (error) {
    console.error(`  [OneRoof] ❌ Error: ${error.message}`);
    return {
      capitalValue: 'Not available',
      landValue: 'Not available',
      annualRates: 'Not available',
      lastSoldPrice: null,
      lastSoldDate: null,
      error: error.message
    };
  }
}

module.exports = { fetchOneRoofValuation, CONFIG };
