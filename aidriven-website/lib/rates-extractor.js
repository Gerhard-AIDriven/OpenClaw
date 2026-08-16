#!/usr/bin/env node

/**
 * AI Driven - Napier Council Rates Extractor (Tiered)
 * 
 * Two-tier extraction strategy:
 * - Basic: Capital Value, Land Value, Annual Total (for $49-79 reports)
 * - Full: All council services breakdown (for $149+ reports)
 * 
 * Uses Playwright for browser automation
 */

const { chromium } = require('playwright');

/**
 * Extract rates data from Napier Council property page
 * @param {string} rid - Property RID (e.g., "138159-107977")
 * @param {Object} options - Extraction options
 * @param {'basic'|'full'} options.tier - Extraction depth
 * @param {number} options.timeout - Page load timeout (ms)
 * @returns {Promise<Object>} Rates data object
 */
async function extractRatesData(rid, options = {}) {
  const tier = options.tier || 'full';
  const timeout = options.timeout || 30000;
  
  console.log(`  [RATES] Extracting ${tier} tier data for RID: ${rid}`);
  
  const url = `https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid=${rid}`;
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log(`  [RATES] Loading Napier Council page...`);
    await page.goto(url, { timeout, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for dynamic content
    
    const htmlContent = await page.content();
    
    const result = {
      rid,
      url,
      scrape_timestamp: new Date().toISOString(),
      tier,
      success: false,
      data: {}
    };
    
    // === BASIC TIER EXTRACTION ===
    if (tier === 'basic' || tier === 'full') {
      // Capital Value
      const cvMatch = htmlContent.match(/<td>Capital\s*Value[^>]*>.*?<\/td>\s*<td>([^<]+)<\/td>/i);
      if (cvMatch) {
        const cvStr = cvMatch[1].replace(/[$,]/g, '');
        result.data.capital_value = parseInt(parseFloat(cvStr));
        console.log(`  [RATES] ✓ Capital Value: $${result.data.capital_value.toLocaleString()}`);
      }
      
      // Land Value
      const lvMatch = htmlContent.match(/<td>Land\s*Value[^>]*>.*?<\/td>\s*<td>([^<]+)<\/td>/i);
      if (lvMatch) {
        const lvStr = lvMatch[1].replace(/[$,]/g, '');
        result.data.land_value = parseInt(parseFloat(lvStr));
        console.log(`  [RATES] ✓ Land Value: $${result.data.land_value.toLocaleString()}`);
      }
      
      // Annual Rates (Total Rates Levied)
      const ratesMatch = htmlContent.match(/Total Rates Levied[\s\S]*?<td[^>]*>([\d,]+\.\d+)/i) ||
                         htmlContent.match(/Total Rates Levied<\/strong><\/td>\s*<td[^>]*>([\d,]+\.\d+)/i);
      if (ratesMatch) {
        result.data.annual_rates = parseFloat(ratesMatch[1].replace(/,/g, ''));
        console.log(`  [RATES] ✓ Annual Rates: $${result.data.annual_rates.toLocaleString()}`);
      }
      
      // Calculate improvements value
      if (result.data.capital_value && result.data.land_value) {
        result.data.improvements_value = result.data.capital_value - result.data.land_value;
      }
      
      // Calculate rates as % of CV
      if (result.data.annual_rates && result.data.capital_value) {
        result.data.rates_as_percent_cv = parseFloat(((result.data.annual_rates / result.data.capital_value) * 100).toFixed(3));
      }
    }
    
    // === FULL TIER EXTRACTION ===
    if (tier === 'full') {
      result.data.services = {};
      
      // Extract all rate categories from table
      const servicePatterns = {
        general_rate: /General\s*Rate/i,
        uagc: /UAGC|Uniform\s*Annual\s*General\s*Charge/i,
        water: /Water\s*Supply/i,
        stormwater: /Stormwater/i,
        fire: /Fire\s*Authority/i,
        refuse: /Refuse|Rubish/i,
        sewerage: /Sewerage/i,
        transportation: /Transportation/i,
        recycling: /Recycling/i,
        resilience: /Resilience\s*Rate/i
      };
      
      // Parse table rows for service breakdown
      const rowMatches = htmlContent.matchAll(/<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/gi);
      for (const match of rowMatches) {
        const label = match[1].trim();
        const value = match[2].trim();
        
        // Check if this is a service category
        for (const [key, pattern] of Object.entries(servicePatterns)) {
          if (pattern.test(label)) {
            const numValue = parseFloat(value.replace(/[$,]/g, ''));
            if (!isNaN(numValue)) {
              result.data.services[key] = {
                label,
                amount: numValue,
                formatted: value
              };
            }
          }
        }
      }
      
      const serviceCount = Object.keys(result.data.services).length;
      console.log(`  [RATES] ✓ Full breakdown: ${serviceCount} service categories`);
    }
    
    result.success = Object.keys(result.data).length > 0;
    
    return result;
    
  } catch (error) {
    console.log(`  [RATES] ❌ Error: ${error.message}`);
    return {
      rid,
      url,
      scrape_timestamp: new Date().toISOString(),
      tier,
      success: false,
      error: error.message,
      data: {}
    };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Generate HTML table for report (Basic tier)
 */
function generateBasicRatesHTML(ratesData) {
  if (!ratesData?.success) {
    return `<div style="padding: 20px; background: rgba(255,193,7,0.1); border-radius: 8px;">
      <p style="color: #ffc107; font-weight: 600;">⚠️ Rates data unavailable - manual verification required</p>
    </div>`;
  }
  
  const d = ratesData.data;
  const formatMoney = (val) => val ? `$${val.toLocaleString()}` : 'N/A';
  
  return `
    <div style="margin-top: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
        <thead>
          <tr style="background: rgba(247,147,30,0.1); border-bottom: 2px solid #F7931E;">
            <th style="padding: 12px; text-align: left; color: #F7931E;">Property Value</th>
            <th style="padding: 12px; text-align: right; color: #F7931E;">Amount (NZD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 12px;">Capital Value (CV)</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${formatMoney(d.capital_value)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #333; background: rgba(255,255,255,0.03);">
            <td style="padding: 12px;">Land Value</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${formatMoney(d.land_value)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 12px;">Improvements Value</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${formatMoney(d.improvements_value)}</td>
          </tr>
          <tr style="border-top: 2px solid #F7931E; background: rgba(247,147,30,0.05);">
            <td style="padding: 12px; font-weight: 600; color: #F7931E;">Annual Rates Total</td>
            <td style="padding: 12px; text-align: right; font-weight: 600; color: #F7931E;">${formatMoney(d.annual_rates)}</td>
          </tr>
        </tbody>
      </table>
      ${d.rates_as_percent_cv ? `<p style="font-size: 0.85rem; color: #a0a0a0; margin-top: 15px; font-style: italic;">
        Rates represent ${d.rates_as_percent_cv}% of capital value | Source: Napier City Council
      </p>` : ''}
    </div>
  `;
}

/**
 * Generate HTML table for report (Full tier)
 */
function generateFullRatesHTML(ratesData) {
  const basicHTML = generateBasicRatesHTML(ratesData);
  
  if (!ratesData?.data?.services || Object.keys(ratesData.data.services).length === 0) {
    return basicHTML + `<p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 15px;">Full service breakdown unavailable</p>`;
  }
  
  const services = ratesData.data.services;
  let servicesHTML = `
    <div style="margin-top: 25px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 8px;">
      <h4 style="color: #F7931E; margin-bottom: 15px; font-family: 'Rajdhani', sans-serif;">Council Services Breakdown</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
  `;
  
  const serviceLabels = {
    general_rate: 'General Rate',
    uagc: 'Uniform Annual General Charge (UAGC)',
    water: 'Water Supply',
    stormwater: 'Stormwater',
    fire: 'Fire Authority',
    refuse: 'Refuse Collection',
    sewerage: 'Sewerage',
    transportation: 'Transportation',
    recycling: 'Recycling',
    resilience: 'Resilience Rate'
  };
  
  let total = 0;
  for (const [key, value] of Object.entries(services)) {
    total += value.amount;
    servicesHTML += `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 10px; color: #e0e0e0;">${serviceLabels[key] || key}</td>
        <td style="padding: 10px; text-align: right; color: #f0f0f0;">$${value.amount.toLocaleString()}</td>
      </tr>
    `;
  }
  
  servicesHTML += `
      <tr style="border-top: 2px solid #F7931E; background: rgba(247,147,30,0.1);">
        <td style="padding: 12px; font-weight: 600; color: #F7931E;">Subtotal (Services)</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #F7931E;">$${total.toLocaleString()}</td>
      </tr>
    </table>
  </div>
  `;
  
  return basicHTML + servicesHTML;
}

module.exports = {
  extractRatesData,
  generateBasicRatesHTML,
  generateFullRatesHTML
};
