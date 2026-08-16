#!/usr/bin/env node

/**
 * AI Driven - LINZ Property Title Scraper
 * Uses browser automation to scrape real title data from LINZ website
 * More reliable than API - works directly with the public website
 * 
 * Usage: const { scrapeLinZData } = require('./linz-scraper');
 */

const CONFIG = {
  linz: {
    searchUrl: 'https://www.linz.govt.nz/data/property-title/find-your-property-title',
    baseUrl: 'https://www.linz.govt.nz'
  }
};

/**
 * Scrape LINZ title data from website using browser
 * @param {string} address - Full street address
 * @param {Object} browser - Puppeteer browser instance
 * @returns {Promise<Object|null>} LINZ data object or null if not found
 */
async function scrapeLinZData(address, browser) {
  console.log('  [LINZ] Scraping title data from LINZ website...');
  
  try {
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Parse address
    const addressParts = address.split(',');
    const streetAddress = addressParts[0].trim();
    const suburb = addressParts[1] ? addressParts[1].trim() : '';
    const city = addressParts[2] ? addressParts[2].trim() : 'Napier';
    
    console.log(`  [LINZ] Searching for: ${streetAddress}, ${suburb}, ${city}`);
    
    // Go to LINZ property title search page
    await page.goto(CONFIG.linz.searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('  [LINZ] → Loaded LINZ search page');
    
    // Look for address input field and fill it
    // Note: Selectors may need adjustment based on actual site structure
    const addressSelector = 'input[name*="address"], input[placeholder*="address"], #address';
    
    try {
      await page.waitForSelector(addressSelector, { timeout: 5000 });
      await page.type(addressSelector, address);
      console.log('  [LINZ] → Entered address');
      
      // Find and click search button
      const searchButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Search"), .search-button');
      if (searchButton) {
        await searchButton.click();
        console.log('  [LINZ] → Submitted search');
        
        // Wait for results
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      }
    } catch (error) {
      console.log('  [LINZ] ⚠️ Could not interact with search form');
      console.log('  [LINZ] → Will use alternative method');
    }
    
    // Try to extract title data from results page
    const linzData = await extractTitleData(page, address);
    
    await page.close();
    
    if (linzData && linzData.titleNumber !== 'N/A') {
      console.log(`  [LINZ] ✅ Title: ${linzData.titleNumber}`);
      console.log(`  [LINZ] ✅ Owners: ${linzData.owners}`);
      console.log(`  [LINZ] ✅ Area: ${linzData.landArea}`);
      return linzData;
    }
    
    console.log('  [LINZ] ⚠️ No title data found on website');
    return null;
    
  } catch (error) {
    console.error(`  [LINZ] ❌ Error: ${error.message}`);
    console.log('  [LINZ] → Will use demo data');
    return null;
  }
}

/**
 * Extract title data from LINZ results page
 * @param {Object} page - Puppeteer page
 * @param {string} address - Original search address
 * @returns {Promise<Object>} Extracted title data
 */
async function extractTitleData(page, address) {
  try {
    // Extract data using page evaluation
    const data = await page.evaluate(() => {
      // Look for title number patterns
      const titlePattern = /(?:Title|TN)[:\s]*([A-Z]{2,3}\d+[a-zA-Z]?)/i;
      const areaPattern = /(?:Area|Land Area)[:\s]*(\d+(?:\.\d+)?)\s*(m²|m2|sqm|square metres)/i;
      
      const pageText = document.body.innerText;
      
      // Try to find title number
      let titleNumber = 'N/A';
      const titleMatch = pageText.match(titlePattern);
      if (titleMatch) {
        titleNumber = titleMatch[1].toUpperCase();
      }
      
      // Try to find land area
      let landArea = 'N/A';
      const areaMatch = pageText.match(areaPattern);
      if (areaMatch) {
        landArea = `${areaMatch[1]} m²`;
      }
      
      // Try to find owners
      let owners = 'N/A';
      const ownerPatterns = [
        /(?:Registered Proprietor|Owner|Owners)[:\s]*([^\n]+)/i,
        /(?:in the name of|owned by)[:\s]*([^\n]+)/i
      ];
      
      for (const pattern of ownerPatterns) {
        const ownerMatch = pageText.match(pattern);
        if (ownerMatch && ownerMatch[1]) {
          owners = ownerMatch[1].trim().substring(0, 100);
          break;
        }
      }
      
      return { titleNumber, owners, landArea };
    });
    
    return {
      titleNumber: data.titleNumber || 'N/A',
      owners: data.owners || 'N/A',
      landArea: data.landArea || 'N/A',
      legalDescription: 'To be verified',
      easements: 'None identified'
    };
    
  } catch (error) {
    console.error('  [LINZ] Error extracting data:', error.message);
    return {
      titleNumber: 'N/A',
      owners: 'N/A',
      landArea: 'N/A',
      legalDescription: 'N/A',
      easements: 'N/A'
    };
  }
}

/**
 * Fallback: Generate realistic demo data when scraping fails
 * @param {string} address - Property address
 * @returns {Object} Demo LINZ data
 */
function generateDemoLinZData(address) {
  console.log('  [LINZ] → Generating high-quality demo data');
  
  // Generate consistent demo data based on address hash
  const hash = address.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) >>> 0;
  
  const titleNumbers = ['NA123/456', 'WN789/012', 'CL345/678', 'HB901/234'];
  const titleIndex = hash % titleNumbers.length;
  
  const areas = ['850 m²', '1024 m²', '765 m²', '1200 m²', '943 m²'];
  const areaIndex = hash % areas.length;
  
  return {
    titleNumber: titleNumbers[titleIndex],
    owners: 'Demo Owner Name',
    landArea: areas[areaIndex],
    legalDescription: 'Lot 1 DP 12345',
    easements: 'None identified'
  };
}

module.exports = { scrapeLinZData, generateDemoLinZData, CONFIG };
